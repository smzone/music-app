@echo off
REM =====================================================================
REM  MySpace Music App - One-Click Launcher (Windows / PowerShell 驱动)
REM  仅作为 PS1 主脚本的入口，所有复杂逻辑都在 start.ps1 中
REM =====================================================================
chcp 65001 >nul 2>&1
title MySpace Music App - One-Click Launcher
cd /d "%~dp0"

REM 优先 pwsh（PowerShell 7+），回退到 Windows 自带 powershell.exe
where pwsh >nul 2>&1
if %errorlevel%==0 (
    pwsh -NoProfile -ExecutionPolicy Bypass -File "%~dp0start.ps1" %*
) else (
    powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0start.ps1" %*
)

REM 仅在 PowerShell 脚本以非 0 退出时延时，让用户看清错误（不交互）
if errorlevel 1 (
    echo.
    echo [!] 启动流程以错误码 %errorlevel% 结束。窗口将在 20 秒后关闭。
    timeout /t 20 /nobreak >nul 2>&1
)
exit /b %errorlevel%
