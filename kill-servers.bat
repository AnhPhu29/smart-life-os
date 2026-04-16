@echo off
REM Smart Life OS - Kill Running Servers
REM This script terminates all Node.js servers running on ports 3000 and 8080

echo.
echo ============================================
echo   Smart Life OS - Kill Servers
echo ============================================
echo.

REM Kill process on port 8080 (Backend)
echo [INFO] Checking for processes on port 8080 (Backend)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8080') do (
    taskkill /PID %%a /F >nul 2>&1
    if errorlevel 0 (
        echo [SUCCESS] Killed process on port 8080
    )
)

REM Kill process on port 3000 (Frontend)
echo [INFO] Checking for processes on port 3000 (Frontend)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000') do (
    taskkill /PID %%a /F >nul 2>&1
    if errorlevel 0 (
        echo [SUCCESS] Killed process on port 3000
    )
)

echo.
echo ============================================
echo [DONE] All servers stopped
echo ============================================
echo.
pause
