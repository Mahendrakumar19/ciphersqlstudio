@echo off
REM CipherSQLStudio Backend Startup Script
REM This script installs dependencies and starts the backend development server

echo.
echo ===================================================
echo  CipherSQLStudio Backend
echo ===================================================
echo.
echo Starting backend server...
echo.

cd backend

echo [1/3] Installing dependencies...
call npm install

echo.
echo [2/3] Seeding MongoDB with assignments...
echo Please ensure MongoDB is running and configured in .env
echo.

echo [3/3] Starting development server...
echo Backend will run on http://localhost:5000
echo Press Ctrl+C to stop the server
echo.

call npm run dev

pause
