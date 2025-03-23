import { TextToSpeechClient } from '@google-cloud/text-to-speech';
import { config } from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
config();

async function verifyCredentials() {
    console.log('Verifying Google Cloud credentials...');

    // Check if GOOGLE_APPLICATION_CREDENTIALS is set
    const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
    if (!credentialsPath) {
        console.error('Error: GOOGLE_APPLICATION_CREDENTIALS not set in .env file');
        return false;
    }

    console.log('Credentials path:', credentialsPath);

    // Check if the credentials file exists
    if (!fs.existsSync(credentialsPath)) {
        console.error('Error: Google Cloud credentials file not found at:', credentialsPath);
        return false;
    }

    try {
        // Try to read and parse the credentials file
        const credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));
        console.log('Credentials file format:', credentials.type === 'service_account' ? 'Valid' : 'Invalid');

        // Try to initialize the client
        const client = new TextToSpeechClient();

        // Try a simple API call
        const [voices] = await client.listVoices({});
        console.log('Successfully connected to Google Cloud TTS API');
        console.log('Available voices:', voices.voices.length);

        // Test specific voices we need
        const requiredVoices = ['en-US-Neural2-D', 'en-US-Neural2-F'];
        const availableVoices = voices.voices.map(voice => voice.name);

        for (const voice of requiredVoices) {
            if (!availableVoices.includes(voice)) {
                console.error(`Warning: Required voice ${voice} not found`);
            } else {
                console.log(`Required voice ${voice} is available`);
            }
        }

        return true;
    } catch (error) {
        console.error('Error verifying credentials:', error);
        return false;
    }
}

// Run the verification
verifyCredentials().then(success => {
    if (success) {
        console.log('✅ Google Cloud credentials verification successful');
    } else {
        console.log('❌ Google Cloud credentials verification failed');
    }
    process.exit(success ? 0 : 1);
});