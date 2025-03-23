@echo off
echo Starting KoEn Contents Converter...

:: Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Error: Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    echo.
    echo Press any key to exit...
    pause >nul
    exit /b 1
)

:: Navigate to the server directory
cd /d "%~dp0server"

:: Check if node_modules exists, if not install dependencies
if not exist "node_modules\" (
    echo Installing dependencies...
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo Error installing dependencies!
        echo.
        echo Press any key to exit...
        pause >nul
        exit /b 1
    )
)

:: Check if .env file exists
if not exist ".env" (
    echo Error: .env file not found!
    echo Please create a .env file in the server directory with your API keys:
    echo OPENAI_API_KEY=your_api_key_here
    echo GOOGLE_APPLICATION_CREDENTIALS=path/to/your/google-credentials.json
    echo.
    echo Press any key to exit...
    pause >nul
    exit /b 1
)

:: Check if Google Cloud credentials exist
for /f "tokens=2 delims==" %%a in ('type .env ^| findstr "GOOGLE_APPLICATION_CREDENTIALS"') do set GOOGLE_CREDS_PATH=%%a
if not exist "%GOOGLE_CREDS_PATH%" (
    echo Error: Google Cloud credentials file not found!
    echo Please ensure your Google Cloud credentials file exists at the path specified in .env
    echo.
    echo Press any key to exit...
    pause >nul
    exit /b 1
)

:: Start the server
echo Starting server...
start /b cmd /c "npm start"

:: Wait for server to start
timeout /t 2 /nobreak >nul

:: Open the application in default browser
start http://localhost:3000

echo Server is running! The application should open in your browser.
echo Press Ctrl+C to stop the server...

:: Keep the window open
pause >nul