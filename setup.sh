#!/bin/bash
# Quick Start Script for BuildWithAi
# This script helps set up and run the application

echo "🚀 BuildWithAi - Quick Start Setup"
echo "=================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

echo "✅ Node.js found: $(node --version)"
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from .env.example..."
    cp .env.example .env
    echo "⚠️  Please edit .env and add your Google Client ID and other settings"
    echo ""
fi

# Check if backend/.env file exists
if [ ! -f backend/.env ]; then
    echo "📝 Creating backend/.env file from backend/.env.example..."
    cp backend/.env.example backend/.env
    echo "⚠️  Please edit backend/.env with your credentials"
    echo ""
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed successfully"
echo ""

# Print instructions
echo "📋 Setup Complete!"
echo "=================================="
echo ""
echo "Next Steps:"
echo ""
echo "1. Configure environment variables:"
echo "   - Edit .env with VITE_GOOGLE_CLIENT_ID"
echo "   - Edit backend/.env with GOOGLE_CLIENT_ID"
echo "   - Set JWT_SECRET and MONGODB_URI"
echo ""
echo "2. Start MongoDB:"
echo "   - Local: mongod"
echo "   - OR use MongoDB Atlas (cloud)"
echo ""
echo "3. Run the application in two terminals:"
echo ""
echo "   Terminal 1 - Backend Server:"
echo "   $ npm run server"
echo ""
echo "   Terminal 2 - Frontend Development:"
echo "   $ npm run dev"
echo ""
echo "4. Open http://localhost:5173 in your browser"
echo ""
echo "📖 For detailed setup instructions, see:"
echo "   - AUTH_SETUP.md"
echo "   - IMPLEMENTATION_CHECKLIST.md"
echo ""
echo "🔑 Get Google OAuth credentials:"
echo "   https://console.cloud.google.com/"
echo ""
echo "🗄️  Set up MongoDB:"
echo "   Local: https://docs.mongodb.com/manual/installation/"
echo "   Cloud: https://www.mongodb.com/cloud/atlas"
echo ""
