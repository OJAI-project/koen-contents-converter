#!/bin/bash

# Make the script executable
chmod +x "$0"

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

echo "Starting KoEn Contents Converter..."

# Check if Node.js is installed
if ! command_exists node; then
    echo "Error: Node.js is not installed!"
    echo "Please install Node.js from https://nodejs.org/"
    echo "Press any key to exit..."
    read -n 1
    exit 1
fi

# Navigate to the server directory
cd "$(dirname "$0")/server"

# Check if node_modules exists, if not install dependencies
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        echo "Error installing dependencies!"
        echo "Press any key to exit..."
        read -n 1
        exit 1
    fi
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "Error: .env file not found!"
    echo "Please create a .env file in the server directory with your API keys:"
    echo "OPENAI_API_KEY=your_api_key_here"
    echo "GOOGLE_APPLICATION_CREDENTIALS=path/to/your/google-credentials.json"
    echo "Press any key to exit..."
    read -n 1
    exit 1
fi

# Check if Google Cloud credentials exist
GOOGLE_CREDS_PATH=$(grep GOOGLE_APPLICATION_CREDENTIALS .env | cut -d '=' -f2)
if [ ! -f "$GOOGLE_CREDS_PATH" ]; then
    echo "Error: Google Cloud credentials file not found!"
    echo "Please ensure your Google Cloud credentials file exists at the path specified in .env"
    echo "Press any key to exit..."
    read -n 1
    exit 1
fi

# Start the server
echo "Starting server..."
npm start &
SERVER_PID=$!

# Wait for server to start
sleep 2

# Open the application in default browser
if command_exists open; then
    # macOS
    open "http://localhost:3000"
elif command_exists xdg-open; then
    # Linux
    xdg-open "http://localhost:3000"
fi

echo "Server is running! The application should open in your browser."
echo "Press Ctrl+C to stop the server..."

# Wait for Ctrl+C
wait $SERVER_PID