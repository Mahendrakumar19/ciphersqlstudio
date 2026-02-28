@echo off
REM CipherSQLStudio Frontend Startup Script
REM This script installs dependencies and starts the frontend development server

echo.
echo ===================================================
echo  CipherSQLStudio Frontend
echo ===================================================
echo.
echo Starting frontend server...
echo.

cd frontend

echo [1/2] Installing dependencies...
call npm install

echo.
echo [2/2] Starting development server...
echo Frontend will run on http://localhost:5173
echo Press Ctrl+C to stop the server
echo.

call npm run dev

pause
