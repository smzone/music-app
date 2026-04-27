@echo off
REM =====================================================================
REM  MySpace Music App - One-Click Launcher (GUI 版入口)
REM  - 检测 pwsh / powershell 可用性
REM  - 使用 -STA 启动 WinForms GUI（start.ps1）
REM  - GUI 加载失败或脚本异常时，保留当前 cmd 窗口显示错误（不交互）
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

REM 选择可用的 PowerShell
set "PS_EXE="
where pwsh >nul 2>nul && set "PS_EXE=pwsh"
if not defined PS_EXE (
    where powershell >nul 2>nul && set "PS_EXE=powershell"
)
if not defined PS_EXE (
    echo [X] 未找到 PowerShell 或 pwsh，请检查系统环境变量
    echo     Windows 10/11 自带 powershell.exe，应在 PATH 中
    echo.
    timeout /t 30 /nobreak >nul 2>&1
    exit /b 10
)

echo [*] 使用 !PS_EXE! 启动图形界面...
echo.

REM -STA: WinForms 要求单线程单元
REM -NoProfile: 跳过 profile 加载，避免第三方 profile 干扰
REM -ExecutionPolicy Bypass: 绕过策略限制
"!PS_EXE!" -STA -NoProfile -NoLogo -ExecutionPolicy Bypass -File "%~dp0start.ps1"
set "ERR=!errorlevel!"

if not "!ERR!"=="0" (
    echo.
    echo  ============================================================
    echo   [!] Launcher exited with code !ERR!
    echo   [>] Log file: %~dp0start.log
    echo   [>] 如果没看到 GUI 窗口，通常原因是：
    echo       1^) PowerShell 被安全软件拦截
    echo       2^) 系统缺少 .NET Framework 4.6+（Win10/11 默认自带）
    echo       3^) start.ps1 文件损坏
    echo   本窗口将在 60 秒后自动关闭，也可自行关闭
    echo  ============================================================
    timeout /t 60 /nobreak >nul 2>&1
)

endlocal & exit /b %ERR%
