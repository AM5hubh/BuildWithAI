@echo off
REM Quick Start Script for BuildWithAi (Windows)
REM This script helps set up and run the application

echo.
echo 🚀 BuildWithAi - Quick Start Setup
echo ==================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed. Please install Node.js 18+ first.
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo ✅ Node.js found: %NODE_VERSION%
echo.

REM Check if .env file exists
if not exist .env (
    echo 📝 Creating .env file from .env.example...
    copy .env.example .env >nul
    echo ⚠️  Please edit .env and add your Google Client ID and other settings
    echo.
)

REM Check if backend\.env file exists
if not exist backend\.env (
    echo 📝 Creating backend\.env file from backend\.env.example...
    copy backend\.env.example backend\.env >nul
    echo ⚠️  Please edit backend\.env with your credentials
    echo.
)

REM Install dependencies
echo 📦 Installing dependencies...
call npm install

if errorlevel 1 (
    echo ❌ Failed to install dependencies
    exit /b 1
)

echo ✅ Dependencies installed successfully
echo.

REM Print instructions
echo 📋 Setup Complete!
echo ==================================
echo.
echo Next Steps:
echo.
echo 1. Configure environment variables:
echo    - Edit .env with VITE_GOOGLE_CLIENT_ID
echo    - Edit backend\.env with GOOGLE_CLIENT_ID
echo    - Set JWT_SECRET and MONGODB_URI
echo.
echo 2. Start MongoDB:
echo    - Local: mongod
echo    - OR use MongoDB Atlas (cloud)
echo.
echo 3. Run the application in two terminals:
echo.
echo    Terminal 1 - Backend Server:
echo    npm run server
echo.
echo    Terminal 2 - Frontend Development:
echo    npm run dev
echo.
echo 4. Open http://localhost:5173 in your browser
echo.
echo 📖 For detailed setup instructions, see:
echo    - AUTH_SETUP.md
echo    - IMPLEMENTATION_CHECKLIST.md
echo.
echo 🔑 Get Google OAuth credentials:
echo    https://console.cloud.google.com/
echo.
echo 🗄️  Set up MongoDB:
echo    Local: https://docs.mongodb.com/manual/installation/
echo    Cloud: https://www.mongodb.com/cloud/atlas
echo.
pause
