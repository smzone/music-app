@echo off
chcp 65001 >nul 2>&1
title MySpace Music App - 开发服务器
color 0A

echo.
echo  ╔═══════════════════════════════════════════╗
echo  ║   MySpace Music App - 一键启动开发服务器  ║
echo  ╚═══════════════════════════════════════════╝
echo.

cd /d "%~dp0"

:: 检查 node_modules 是否存在
if not exist "node_modules" (
    echo [!] 未检测到 node_modules，正在安装依赖...
    echo.
    call npm install --registry https://registry.npmmirror.com -v --no-input --timeout 60 --retries 5
    if errorlevel 1 (
        echo [x] 依赖安装失败，请检查网络连接
        exit /b 1
    )
    echo.
    echo [√] 依赖安装完成
    echo.
)

:: 检查端口 5174 是否被占用
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":5174 " ^| findstr "LISTENING"') do (
    echo [!] 端口 5174 已被占用 (PID: %%a)，正在关闭旧进程...
    taskkill /PID %%a /F >nul 2>&1
    timeout /t 1 /nobreak >nul
)

echo [*] 正在启动开发服务器...
echo [*] 启动后将自动打开浏览器访问 http://localhost:5174/
echo [*] 按 Ctrl+C 可停止服务器
echo.

:: 启动 vite 开发服务器并自动打开浏览器
start "" http://localhost:5174/
call npx vite --host --port 5174
