# KoEn Contents Converter

A comprehensive web application that converts Korean content to English, optimized for YouTube content creation.

## Features

1. Speech-to-Text:
   - Upload Korean audio files (up to 25MB)
   - Convert Korean speech to text
   - Editable Korean text output

2. Translation:
   - Accurate Korean to English translation
   - Maintains original meaning and nuance
   - Editable translation output

3. YouTube Enhancement:
   - Convert translations to YouTube-friendly scripts
   - Natural, daily-use English
   - Motivational tone where appropriate
   - No emojis or academic terms
   - Fully editable enhanced text

4. Text-to-Speech:
   - Generate audio from enhanced scripts
   - Choice of voices:
     * Male (Alloy)
     * Female (Nova)
   - Built-in audio player
   - Download option for generated audio

## Setup

1. Clone the repository
2. Install frontend dependencies:
```bash
cd korean-stt
```

3. Install backend dependencies:
```bash
cd server
npm install
```

4. Configure the OpenAI API key:
   - Open `server/.env`
   - Add your OpenAI API key: `OPENAI_API_KEY=your_api_key_here`

## Running the Application

1. Start the backend server:
```bash
cd server
npm start
```
The server will run on http://localhost:3000

2. Open the frontend:
   - Open `index.html` in your web browser
   - Or serve it using a local server

## Usage

1. Click "Select Audio File" to choose a Korean audio file
2. Click "Convert" to transcribe the audio to Korean text
3. Click "Translate to English" to get the English translation
4. Click "Enhance for YouTube" to create a YouTube-ready script
5. Select a voice (Male/Female)
6. Click "Generate Audio" to create the audio file
7. Use the audio player to preview or click "Download Audio" to save

## Supported Audio Formats

- MP3
- MP4
- MPEG
- MPGA
- M4A
- WAV
- WEBM

## Notes

- Maximum file size: 25MB
- Internet connection required for API communication
- All text boxes are editable for fine-tuning content
- Generated audio files are temporarily stored on the server