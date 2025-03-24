import { TextToSpeechClient } from '@google-cloud/text-to-speech';
import multer from 'multer';
import { config } from 'dotenv';
import fetch from 'node-fetch';
import FormData from 'form-data';
import fs from 'fs';
import { join } from 'path';
import os from 'os';

config();

// Initialize Google Cloud TTS client with credentials from environment variable
const ttsClient = new TextToSpeechClient({
    credentials: JSON.parse(Buffer.from(process.env.GOOGLE_APPLICATION_CREDENTIALS, 'base64').toString())
});

// Configure multer for memory storage
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 25 * 1024 * 1024 // 25MB limit
    }
});

// Helper function to handle multer in serverless environment
const runMiddleware = (req, res, fn) => {
    return new Promise((resolve, reject) => {
        fn(req, res, (result) => {
            if (result instanceof Error) {
                return reject(result);
            }
            return resolve(result);
        });
    });
};

export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const path = req.url.split('/api/')[1];

    try {
        switch (path) {
            case 'convert':
                return await handleConvert(req, res);
            case 'translate':
                return await handleTranslate(req, res);
            case 'enhance':
                return await handleEnhance(req, res);
            case 'tts':
                return await handleTTS(req, res);
            default:
                return res.status(404).json({ error: 'Not found' });
        }
    } catch (error) {
        console.error('API Error:', error);
        return res.status(500).json({
            error: 'Server error',
            details: error.message
        });
    }
}

async function handleConvert(req, res) {
    if (!process.env.OPENAI_API_KEY) {
        throw new Error('OpenAI API key not configured');
    }

    try {
        // Handle file upload
        await runMiddleware(req, res, upload.single('file'));

        if (!req.file) {
            return res.status(400).json({ error: 'No audio file provided' });
        }

        // Create form data for OpenAI API
        const form = new FormData();
        form.append('file', req.file.buffer, {
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

        if (!response.ok) {
            const errorData = await response.text();
            throw new Error(`OpenAI API error: ${response.status} - ${errorData}`);
        }

        const data = await response.json();
        return res.json({ text: data.text });

    } catch (error) {
        console.error('Conversion Error:', error);
        return res.status(500).json({
            error: 'Conversion error',
            details: error.message
        });
    }
}

async function handleTranslate(req, res) {
    if (!process.env.OPENAI_API_KEY) {
        throw new Error('OpenAI API key not configured');
    }

    const { text } = req.body;
    if (!text) {
        return res.status(400).json({ error: 'No text provided for translation' });
    }

    try {
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
            throw new Error(`Translation API error: ${response.status}`);
        }

        const data = await response.json();
        return res.json({ translation: data.choices[0].message.content.trim() });

    } catch (error) {
        console.error('Translation Error:', error);
        return res.status(500).json({
            error: 'Translation error',
            details: error.message
        });
    }
}

async function handleEnhance(req, res) {
    if (!process.env.OPENAI_API_KEY) {
        throw new Error('OpenAI API key not configured');
    }

    const { text } = req.body;
    if (!text) {
        return res.status(400).json({ error: 'No text provided for enhancement' });
    }

    try {
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
            throw new Error(`Enhancement API error: ${response.status}`);
        }

        const data = await response.json();
        return res.json({ enhanced: data.choices[0].message.content.trim() });

    } catch (error) {
        console.error('Enhancement Error:', error);
        return res.status(500).json({
            error: 'Enhancement error',
            details: error.message
        });
    }
}

async function handleTTS(req, res) {
    const { text, voice } = req.body;
    if (!text) {
        return res.status(400).json({ error: 'No text provided for TTS' });
    }

    if (!voice || !['orus', 'kore'].includes(voice)) {
        return res.status(400).json({ error: 'Invalid voice selection' });
    }

    try {
        // Configure the voice based on selection
        const request = {
            input: { text },
            voice: {
                languageCode: 'en-US',
                name: voice === 'orus' ? 'en-US-Neural2-D' : 'en-US-Neural2-F',
                model: 'chirp-3'
            },
            audioConfig: {
                audioEncoding: 'MP3',
                pitch: 0,
                speakingRate: 1
            }
        };

        // Perform the text-to-speech request
        const [response] = await ttsClient.synthesizeSpeech(request);

        // Set appropriate headers
        res.setHeader('Content-Type', 'audio/mpeg');
        res.setHeader('Content-Disposition', `attachment; filename="tts-${Date.now()}.mp3"`);

        // Send the audio content directly
        return res.send(Buffer.from(response.audioContent));

    } catch (error) {
        console.error('TTS Error:', error);
        return res.status(500).json({
            error: 'TTS error',
            details: error.message
        });
    }
}