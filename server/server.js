import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { config } from 'dotenv';
import fetch from 'node-fetch';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';
import path from 'path';
import FormData from 'form-data';

// Load environment variables
config();

const app = express();
const port = 3000;

// Configure CORS
app.use(cors());
app.use(express.json());

// Get directory paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = dirname(__dirname);

// Ensure uploads directory exists
const uploadDir = join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = ['audio/mpeg', 'audio/mp4', 'audio/wav', 'audio/webm', 'audio/m4a'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only audio files are allowed.'));
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 25 * 1024 * 1024 // 25MB limit
    }
});

// Serve static files from project root
app.use(express.static(projectRoot));
app.use('/audio', express.static(join(__dirname, 'audio')));

// Ensure audio directory exists
const audioDir = join(__dirname, 'audio');
if (!fs.existsSync(audioDir)) {
    fs.mkdirSync(audioDir);
}

// Health check endpoint
app.get('/health', (req, res) => {
    if (!process.env.OPENAI_API_KEY) {
        res.status(500).json({
            status: 'error',
            message: 'OpenAI API key not configured'
        });
        return;
    }
    res.json({ status: 'ok' });
});

// Text to Speech endpoint
app.post('/tts', async (req, res) => {
    try {
        if (!process.env.OPENAI_API_KEY) {
            throw new Error('OpenAI API key not configured');
        }

        const { text, voice } = req.body;
        if (!text) {
            return res.status(400).json({ error: 'No text provided for TTS' });
        }

        if (!voice || !['alloy', 'nova'].includes(voice)) {
            return res.status(400).json({ error: 'Invalid voice selection' });
        }

        const response = await fetch('https://api.openai.com/v1/audio/speech', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'tts-1',
                voice: voice,
                input: text
            })
        });

        if (!response.ok) {
            const errorData = await response.text();
            console.error('OpenAI TTS API Error:', errorData);
            throw new Error(`TTS API error: ${response.status}`);
        }

        // Generate unique filename
        const filename = `tts-${Date.now()}.mp3`;
        const filepath = join(audioDir, filename);

        // Save the audio file
        const buffer = await response.arrayBuffer();
        fs.writeFileSync(filepath, Buffer.from(buffer));

        // Return the audio file URL
        res.json({
            audioUrl: `/audio/${filename}`,
            filename: filename
        });

    } catch (error) {
        console.error('TTS Error:', error);
        res.status(500).json({
            error: 'TTS error',
            details: error.message
        });
    }
});

// Translation endpoint
app.post('/translate', async (req, res) => {
    try {
        if (!process.env.OPENAI_API_KEY) {
            throw new Error('OpenAI API key not configured');
        }

        const { text } = req.body;
        if (!text) {
            return res.status(400).json({ error: 'No text provided for translation' });
        }

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo",
                messages: [
                    {
                        role: "system",
                        content: "You are a Korean to English translator. Translate the given Korean text to English accurately while maintaining the original meaning and nuance. Only respond with the translation, no additional text."
                    },
                    {
                        role: "user",
                        content: text
                    }
                ]
            })
        });

        if (!response.ok) {
            const errorData = await response.text();
            console.error('OpenAI Translation API Error:', errorData);
            throw new Error(`Translation API error: ${response.status}`);
        }

        const data = await response.json();
        res.json({ translation: data.choices[0].message.content.trim() });

    } catch (error) {
        console.error('Translation Error:', error);
        res.status(500).json({
            error: 'Translation error',
            details: error.message
        });
    }
});

// Enhance text for YouTube endpoint
app.post('/enhance', async (req, res) => {
    try {
        if (!process.env.OPENAI_API_KEY) {
            throw new Error('OpenAI API key not configured');
        }

        const { text } = req.body;
        if (!text) {
            return res.status(400).json({ error: 'No text provided for enhancement' });
        }

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo",
                messages: [
                    {
                        role: "system",
                        content: "You are a YouTube script editor. Enhance the given English text to be more engaging and natural for YouTube. Use natural, daily-use English. Avoid academic terms. Be motivational when possible. Do not use emojis. Only respond with the enhanced text, no additional commentary."
                    },
                    {
                        role: "user",
                        content: text
                    }
                ]
            })
        });

        if (!response.ok) {
            const errorData = await response.text();
            console.error('OpenAI Enhancement API Error:', errorData);
            throw new Error(`Enhancement API error: ${response.status}`);
        }

        const data = await response.json();
        res.json({ enhanced: data.choices[0].message.content.trim() });

    } catch (error) {
        console.error('Enhancement Error:', error);
        res.status(500).json({
            error: 'Enhancement error',
            details: error.message
        });
    }
});

// Conversion endpoint
app.post('/convert', upload.single('file'), async (req, res) => {
    try {
        if (!process.env.OPENAI_API_KEY) {
            throw new Error('OpenAI API key not configured');
        }

        if (!req.file) {
            return res.status(400).json({ error: 'No audio file provided' });
        }

        console.log('Processing file:', req.file.originalname);

        // Create form data
        const form = new FormData();

        // Append the file with proper filename and content-type
        form.append('file', fs.createReadStream(req.file.path), {
            filename: req.file.originalname,
            contentType: req.file.mimetype
        });

        form.append('model', 'whisper-1');
        form.append('language', 'ko');

        // Make the API request
        const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                ...form.getHeaders()
            },
            body: form
        });

        // Log response details for debugging
        console.log('OpenAI API Response Status:', response.status);

        if (!response.ok) {
            const errorData = await response.text();
            console.error('OpenAI API Error:', errorData);
            throw new Error(`OpenAI API error: ${response.status} - ${errorData}`);
        }

        const data = await response.json();

        // Clean up the uploaded file
        fs.unlinkSync(req.file.path);

        res.json({ text: data.text });

    } catch (error) {
        console.error('Server Error:', error);

        // Clean up file if it exists
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }

        res.status(500).json({
            error: 'Server error',
            details: error.message
        });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Global Error Handler:', err);

    // Clean up file if it exists
    if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
    }

    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                error: 'File too large',
                details: 'Maximum file size is 25MB'
            });
        }
        return res.status(400).json({
            error: 'File upload error',
            details: err.message
        });
    }

    res.status(500).json({
        error: 'Server error',
        details: err.message
    });
});

// Start server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
    if (!process.env.OPENAI_API_KEY) {
        console.warn('Warning: OpenAI API key not configured in .env file');
    }
});