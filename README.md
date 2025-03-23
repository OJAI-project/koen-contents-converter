# KoEn Contents Converter

A comprehensive web application that converts Korean content to English, optimized for YouTube content creation.

## Quick Start Guide

### First Time Setup
1. Install Node.js from https://nodejs.org/ (Required only once)
2. Get an OpenAI API key from https://platform.openai.com/
3. Set up Google Cloud:
   - Create a project in Google Cloud Console
   - Enable the Cloud Text-to-Speech API
   - Create a service account and download credentials JSON
   - Place the credentials file in the `server` folder
4. Create a file named `.env` in the `server` folder using `.env.example` as template
5. Add your API keys and credentials:
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   GOOGLE_APPLICATION_CREDENTIALS=path/to/your/google-credentials.json
   ```

### Running the Application

#### On Windows:
- Double-click `start-app.bat`
- The application will open in your default browser automatically

#### On Mac/Linux:
- Double-click `start-app.sh`
  - If it doesn't work, open Terminal and run:
    ```bash
    chmod +x start-app.sh
    ./start-app.sh
    ```
- The application will open in your default browser automatically

### Using the Application

1. Upload Korean Audio:
   - Click "Select Audio File"
   - Choose your Korean audio file
   - Click "Convert"

2. Get English Translation:
   - Wait for Korean text to appear
   - Click "Translate to English"
   - Edit the translation if needed

3. Create YouTube Script:
   - Click "Enhance for YouTube"
   - The text will be optimized for YouTube

4. Generate Audio:
   - Choose voice type:
     * Male (Orus) - Chirp 3 model
     * Female (Kore) - Chirp 3 model
   - Click "Generate Audio"
   - Use the player to preview
   - Click "Download Audio" to save

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

If you see any errors:
1. Check that Node.js is installed
2. Verify your OpenAI API key in the `.env` file
3. Verify your Google Cloud credentials:
   - Make sure the credentials file path is correct in `.env`
   - Ensure the service account has TTS permissions
   - Check that the Cloud Text-to-Speech API is enabled
4. Make sure you have an internet connection
5. Check that no other application is using port 3000

## For Developers

### Manual Installation
```bash
cd server
npm install
```

### Running Manually
```bash
cd server
npm start
```

### Project Structure
- `index.html`: Main application interface
- `app.js`: Frontend JavaScript
- `styles.css`: Application styling
- `server/`: Backend server files
  - `.env`: API key configuration
  - `.env.example`: Template for environment variables
  - `google-credentials.json`: Google Cloud service account key
- `start-app.bat`: Windows startup script
- `start-app.sh`: Mac/Linux startup script

## Notes
- Maximum file size: 25MB
- Internet connection required
- All text boxes are editable
- Generated audio files are temporarily stored
- Uses OpenAI for transcription and text enhancement
- Uses Google Cloud Chirp 3 for high-quality TTS
- Voice selection:
  * Orus: Natural male voice with clear articulation
  * Kore: Natural female voice with professional tone

## Security Notes
- Keep your API keys and credentials secure
- Never commit `.env` or credential files to version control
- The `.gitignore` file is configured to exclude sensitive files