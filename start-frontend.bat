@echo off
echo.
echo ==============================================
echo           TalentLens AI - Starting Frontend
echo ==============================================
echo.

cd /d "%~dp0frontend"

if not exist ".env.local" (
    echo No .env.local file found. Copying from .env.example...
    copy .env.example .env.local
)

if not exist "node_modules" (
    echo Installing npm packages (first time may take a few minutes)...
    npm install
)

echo.
echo Starting TalentLens AI Frontend on http://localhost:3000
echo Press Ctrl+C to stop
echo.

call npm run dev
pause
