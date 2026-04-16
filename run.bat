@echo off
REM Smart Life OS - Development Server Launcher
REM This script starts both frontend and backend servers

echo.
echo ============================================
echo   Smart Life OS - Development Server
echo ============================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo [INFO] Node.js found: 
node --version

REM Start backend in a new window
echo.
echo [INFO] Starting Backend Server (http://localhost:8080)...
start "Smart Life OS - Backend" cmd /k "cd backend && npm start"

REM Wait for backend to start
timeout /t 3 /nobreak

REM Start frontend in a new window
echo [INFO] Starting Frontend Server (http://localhost:3000)...
start "Smart Life OS - Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo ============================================
echo [SUCCESS] Both servers started!
echo.
echo Frontend:  http://localhost:3000
echo Backend:   http://localhost:8080
echo.
echo Press Ctrl+C in either window to stop the servers
echo ============================================
echo.

REM Open browser automatically (optional)
timeout /t 5 /nobreak
echo [INFO] Opening browser...
start http://localhost:3000

echo.
echo All servers are running. Close this window when done.
pause
