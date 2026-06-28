@echo off
echo.
echo ╔══════════════════════════════════════════════════════════╗
echo ║          TalentLens AI — Starting Backend               ║
echo ╚══════════════════════════════════════════════════════════╝
echo.

cd /d "%~dp0backend"

if not exist ".env" (
    echo ⚠️  No .env file found. Copying from .env.example...
    copy .env.example .env
    echo.
    echo ⚠️  IMPORTANT: Edit backend\.env and add your GEMINI_API_KEY
    echo    Get a free key at: https://aistudio.google.com
    echo.
)

echo 📦 Checking Python environment...
python --version 2>nul || (echo ❌ Python not found. Install from python.org && pause && exit /b 1)

echo.
echo 📦 Installing dependencies (first time may take a few minutes)...
pip install -r requirements.txt -q

echo.
echo 🚀 Starting TalentLens AI Backend on http://localhost:8000
echo    API Docs: http://localhost:8000/docs
echo    Press Ctrl+C to stop
echo.

python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
