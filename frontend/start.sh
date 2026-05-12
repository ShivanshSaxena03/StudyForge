#!/bin/bash
# StudyForge Backend Startup Script

echo "✦ StudyForge Backend"
echo "===================="

cd "$(dirname "$0")"

# Check for .env
if [ ! -f ".env" ]; then
  echo "⚠️  No .env found. Creating from example..."
  cp .env.example .env
  echo "❗ Please edit .env and add your GEMINI_API_KEY, then run again."
  exit 1
fi

# Load .env
export $(grep -v '^#' .env | xargs)

# Check API key
if [ -z "$GEMINI_API_KEY" ] || [ "$GEMINI_API_KEY" = "your_gemini_api_key_here" ]; then
  echo "❗ Please set GEMINI_API_KEY in .env"
  echo "   Get a free key at: https://aistudio.google.com/app/apikey"
  exit 1
fi

# Check venv
if [ ! -d "venv" ]; then
  echo "📦 Creating virtual environment..."
  python3 -m venv venv
fi

source venv/bin/activate 2>/dev/null || source venv/Scripts/activate 2>/dev/null

# Install deps
echo "📦 Installing dependencies..."
pip install -r requirements.txt -q

echo ""
echo "🚀 Starting backend at http://localhost:8000"
echo "📖 API docs at http://localhost:8000/docs"
echo ""

uvicorn main:app --reload --port 8000
