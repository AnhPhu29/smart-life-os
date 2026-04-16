@echo off
REM Smart Life OS - Install Dependencies
REM This script installs npm packages for both frontend and backend

echo.
echo ============================================
echo   Smart Life OS - Install Dependencies
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

echo [INFO] Node.js version:
node --version

echo [INFO] npm version:
npm --version

echo.
echo [INFO] Installing Backend dependencies...
cd backend
npm install
if errorlevel 1 (
    echo [ERROR] Failed to install backend dependencies
    pause
    exit /b 1
)
cd ..

echo.
echo [INFO] Installing Frontend dependencies...
cd frontend
npm install
if errorlevel 1 (
    echo [ERROR] Failed to install frontend dependencies
    pause
    exit /b 1
)
cd ..

echo.
echo ============================================
echo [SUCCESS] All dependencies installed!
echo ============================================
echo.
echo Next, run one of these commands:
echo   - run.bat        (Start servers and open browser)
echo   - run-dev.bat    (Start servers without browser)
echo.
pause
