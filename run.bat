@echo off
REM Smart Life OS - Run Script
REM This script starts both backend and frontend servers

echo.
echo ========================================
echo   Smart Life OS - Development Server
echo ========================================
echo.

REM Check if .env file exists
if not exist ".env" (
    echo [ERROR] .env file not found!
    echo Please create .env file from .env.example
    echo.
    pause
    exit /b 1
)

echo [INFO] Starting backend server...
start cmd /k "cd backend && npm run dev"

echo [INFO] Waiting 3 seconds before starting frontend...
timeout /t 3 /nobreak

echo [INFO] Starting frontend server...
start cmd /k "cd frontend && npm run dev"

echo.
echo ========================================
echo [SUCCESS] Servers started!
echo.
echo Frontend:  http://localhost:3000
echo Backend:   http://localhost:8080/api/v1
echo.
echo Close this window to stop the servers.
echo ========================================
echo.

pause
