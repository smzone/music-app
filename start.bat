@echo off
REM =====================================================================
REM  MySpace Music App - One-Click GUI Launcher (ASCII only)
REM  Prefer Windows PowerShell 5.1 (powershell.exe) for best WinForms STA
REM  stability; fallback to pwsh.exe only if 5.1 missing.
REM =====================================================================
setlocal EnableDelayedExpansion
cd /d "%~dp0"
title MySpace Music App - Launcher

echo.
echo  ============================================================
echo    MySpace Music App  -  One-Click GUI Launcher
echo    Project: %CD%
echo  ============================================================
echo.

set "PS_EXE="
where powershell >nul 2>nul && set "PS_EXE=powershell"
if not defined PS_EXE (
    where pwsh >nul 2>nul && set "PS_EXE=pwsh"
)
if not defined PS_EXE (
    echo [X] PowerShell not found in PATH.
    echo     Windows 10/11 ships with powershell.exe - please check your PATH.
    echo.
    timeout /t 30 /nobreak >nul 2>&1
    exit /b 10
)

echo [*] Using !PS_EXE! to launch GUI...
echo.

"!PS_EXE!" -STA -NoProfile -NoLogo -ExecutionPolicy Bypass -File "%~dp0start.ps1"
set "ERR=!errorlevel!"

if not "!ERR!"=="0" (
    echo.
    echo  ============================================================
    echo   [!] Launcher exited with code !ERR!
    echo   [i] Log file: %~dp0start.log
    echo   [i] If no GUI window appeared, common causes:
    echo       1^) PowerShell blocked by antivirus
    echo       2^) Missing .NET Framework 4.6+ (Win10/11 ships with it)
    echo       3^) start.ps1 corrupted
    echo   This window will auto-close in 60 seconds.
    echo  ============================================================
    timeout /t 60 /nobreak >nul 2>&1
)

endlocal & exit /b %ERR%
