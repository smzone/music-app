@echo off
title MySpace Music App - Dev Server
color 0A

echo.
echo  ========================================
echo    MySpace Music App - Dev Server
echo  ========================================
echo.

cd /d "%~dp0"

if not exist "node_modules" (
    echo [!] node_modules not found, installing...
    echo.
    call npm install --registry https://registry.npmmirror.com -v --no-input --timeout 60 --retries 5
    if errorlevel 1 (
        echo [x] Install failed, check network
        exit /b 1
    )
    echo.
    echo [ok] Dependencies installed
    echo.
)

for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":5174 " ^| findstr "LISTENING"') do (
    echo [!] Port 5174 in use (PID: %%a), killing...
    taskkill /PID %%a /F >nul 2>&1
    timeout /t 1 /nobreak >nul
)

echo [*] Starting dev server on http://localhost:5174/
echo [*] Press Ctrl+C to stop
echo.

start "" http://localhost:5174/
call npx vite --host --port 5174
