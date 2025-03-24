# KoEn Contents Converter

A comprehensive web application that converts Korean content to English, optimized for YouTube content creation.

## Deployment on Vercel

1. Fork or clone this repository
2. Create a new project on Vercel
3. Connect your repository to Vercel
4. Configure environment variables in Vercel:
   - `OPENAI_API_KEY`: Your OpenAI API key
   - `GOOGLE_APPLICATION_CREDENTIALS`: Base64 encoded content of your Google Cloud credentials JSON file

   To encode your Google Cloud credentials:
   ```bash
   base64 -i path/to/your/credentials.json
   ```
   Copy the output and paste it in the Vercel environment variable.

5. Deploy! Vercel will automatically build and deploy your application.

## Local Development

1. Install dependencies:
   ```bash
   # Install frontend dependencies
   cd frontend
   npm install

   # Install backend dependencies
   cd ../api
   npm install
   ```

2. Create `.env` file in the api directory:
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   GOOGLE_APPLICATION_CREDENTIALS=path/to/your/google-credentials.json
   ```

3. Start the development server:
   ```bash
   # Start frontend
   cd frontend
   npm run dev

   # In another terminal, start backend
   cd api
   npm start
   ```

## Features

- Korean speech-to-text conversion using OpenAI Whisper
- Korean to English translation using GPT-3.5
- YouTube-optimized content enhancement
- High-quality text-to-speech using Google Cloud Chirp 3 model
- Choice of male (Orus) or female (Kore) voices

## Supported File Types
- MP3
- MP4
- WAV
- M4A
- WEBM

## Voice Options
Using Google Cloud Text-to-Speech Chirp 3 model:
- Orus (Male): High-quality male voice
- Kore (Female): High-quality female voice

## Troubleshooting

1. Check your API keys and credentials:
   - Verify OpenAI API key
   - Ensure Google Cloud credentials are properly configured
   - Check that required APIs are enabled in Google Cloud Console

2. File upload issues:
   - Maximum file size: 25MB
   - Ensure file format is supported
   - Check network connection

3. Audio generation issues:
   - Verify Google Cloud Text-to-Speech API is enabled
   - Check quota limits
   - Ensure text input is not empty

## Security Notes
- Keep your API keys and credentials secure
- Never commit sensitive files to version control
- Use environment variables for all sensitive data