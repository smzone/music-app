# =====================================================================
# MySpace Music App - One-Click Launcher (PowerShell)
# 功能：
#   1. 自动检测 Node.js / npm 环境，缺失时给出明确安装指引
#   2. 自动校验 package.json、node_modules 完整性
#   3. 自动配置 npm 镜像源（npmmirror）避免网络超时
#   4. 依赖缺失/损坏时自动 npm install，失败后自动深度清理 (清缓存+删lock+重装) 重试
#   5. 自动释放 Vite 端口占用（含兄弟端口）
#   6. 后台延时 3s 打开浏览器，前台启动 Vite Dev Server
# 特性：
#   - 全流程流式日志，带时间戳与颜色，不阻塞交互
#   - 自动修复：两级重试（常规 install → 深度清理 + install）
#   - 非交互：失败时打印清晰原因并以非 0 退出，由 start.bat 延时展示
# =====================================================================

$ErrorActionPreference = 'Continue'

# 统一使用 UTF-8 输出，避免中文日志乱码
try {
    [Console]::OutputEncoding = [System.Text.Encoding]::UTF8
    $OutputEncoding = [System.Text.Encoding]::UTF8
} catch {}

$ProjectRoot    = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $ProjectRoot

# ==================== 可配置参数 ====================
$VitePort        = 5174
$MirrorRegistry  = 'https://registry.npmmirror.com'
$FetchTimeoutMs  = 600000   # 10 分钟单次下载超时
$FetchRetries    = 5        # 下载重试次数
# ====================================================

# -------- 日志辅助函数（带时间戳 + 颜色） --------
function Write-Log {
    param(
        [string]$Message,
        [string]$Tag    = 'INFO',
        [ConsoleColor]$Color = 'Cyan'
    )
    $ts = Get-Date -Format 'HH:mm:ss'
    Write-Host ("[{0}] " -f $ts) -NoNewline -ForegroundColor DarkGray
    Write-Host ("[{0,-4}] " -f $Tag) -NoNewline -ForegroundColor $Color
    Write-Host $Message
}
function Log-Step { param([string]$m) Write-Log -Message $m -Tag '>'   -Color Cyan }
function Log-Ok   { param([string]$m) Write-Log -Message $m -Tag 'OK'  -Color Green }
function Log-Warn { param([string]$m) Write-Log -Message $m -Tag '!'   -Color Yellow }
function Log-Err  { param([string]$m) Write-Log -Message $m -Tag 'X'   -Color Red }

# -------- Banner --------
Write-Host ''
Write-Host '  ============================================================' -ForegroundColor Cyan
Write-Host '    MySpace Music App  ·  One-Click Launcher' -ForegroundColor Cyan
Write-Host ('    项目目录: {0}' -f $ProjectRoot) -ForegroundColor DarkGray
Write-Host ('    启动端口: {0}' -f $VitePort) -ForegroundColor DarkGray
Write-Host '  ============================================================' -ForegroundColor Cyan
Write-Host ''

# =====================================================================
# 步骤 1/6 · 检测 Node.js / npm
# =====================================================================
Log-Step '步骤 1/6 · 检测 Node.js / npm 运行环境'
$nodeVer = $null; $npmVer = $null
try { $nodeVer = (& node --version) 2>$null } catch {}
try { $npmVer  = (& npm  --version) 2>$null } catch {}

if (-not $nodeVer) {
    Log-Err '未检测到 Node.js！请先安装 Node.js 18 LTS 或更高版本'
    Write-Host '        官网:  https://nodejs.org/' -ForegroundColor Yellow
    Write-Host '        推荐:  winget install OpenJS.NodeJS.LTS' -ForegroundColor Yellow
    Write-Host '              或使用 nvm-windows 管理多版本' -ForegroundColor Yellow
    exit 10
}
if (-not $npmVer) {
    Log-Err 'Node.js 已安装，但 npm 不可用。请重装 Node.js（包含 npm）'
    exit 11
}
# 简单校验 Node 版本（建议 >= 18）
$major = 0
if ($nodeVer -match 'v(\d+)\.') { $major = [int]$Matches[1] }
if ($major -gt 0 -and $major -lt 18) {
    Log-Warn ("Node 版本过低 ({0})，建议升级到 18+ 以获得最佳兼容性" -f $nodeVer)
}
Log-Ok ("Node {0}  ·  npm {1}" -f $nodeVer, $npmVer)

# =====================================================================
# 步骤 2/6 · 校验项目文件
# =====================================================================
Log-Step '步骤 2/6 · 校验项目结构'
if (-not (Test-Path 'package.json')) {
    Log-Err ("当前目录不存在 package.json: {0}" -f $ProjectRoot)
    Log-Err '请将 start.bat / start.ps1 放在项目根目录内再运行'
    exit 20
}
$pkg = $null
try { $pkg = Get-Content 'package.json' -Raw | ConvertFrom-Json } catch {
    Log-Err "package.json 解析失败: $_"
    exit 21
}
Log-Ok ("project = {0}  ·  scripts.dev = {1}" -f $pkg.name, $pkg.scripts.dev)

# =====================================================================
# 步骤 3/6 · 配置 npm 镜像源
# =====================================================================
Log-Step '步骤 3/6 · 配置 npm 镜像源（加速国内下载）'
try {
    $currentReg = (& npm config get registry) 2>$null
    if ($currentReg -ne $MirrorRegistry) {
        & npm config set registry $MirrorRegistry 2>&1 | Out-Null
        Log-Ok ("registry 已切换: {0}" -f $MirrorRegistry)
    } else {
        Log-Ok ("registry = {0}" -f $MirrorRegistry)
    }
} catch {
    Log-Warn "无法设置 npm 镜像（可忽略）: $_"
}

# =====================================================================
# 步骤 4/6 · 检查 / 安装 依赖
# =====================================================================
Log-Step '步骤 4/6 · 检查依赖 node_modules'

function Test-DepsHealthy {
    if (-not (Test-Path 'node_modules')) { return $false }
    # 关键二进制必须存在
    $viteBin = Join-Path 'node_modules' '.bin\vite.cmd'
    $vitePkg = Join-Path 'node_modules' 'vite\package.json'
    if (-not (Test-Path $viteBin) -and -not (Test-Path $vitePkg)) { return $false }
    # React 必须存在
    if (-not (Test-Path (Join-Path 'node_modules' 'react\package.json'))) { return $false }
    return $true
}

function Invoke-NpmInstall {
    param([switch]$DeepClean)

    if ($DeepClean) {
        Log-Warn '执行深度清理：node_modules / package-lock.json / npm cache'
        if (Test-Path 'node_modules') {
            Remove-Item 'node_modules' -Recurse -Force -ErrorAction SilentlyContinue
        }
        if (Test-Path 'package-lock.json') {
            Remove-Item 'package-lock.json' -Force -ErrorAction SilentlyContinue
        }
        & npm cache clean --force 2>&1 | Out-Null
        Log-Ok '清理完成'
    }

    $npmArgs = @(
        'install',
        '--registry', $MirrorRegistry,
        ("--fetch-timeout={0}"         -f $FetchTimeoutMs),
        ("--fetch-retries={0}"         -f $FetchRetries),
        '--fetch-retry-maxtimeout=120000',
        '--loglevel=info',
        '--no-audit',
        '--no-fund',
        '--progress=true'
    )

    Log-Step ('npm {0}' -f ($npmArgs -join ' '))
    Write-Host ('  ─── npm install 流式日志开始 ───') -ForegroundColor DarkGray

    # 直接运行，流式输出到当前终端
    & npm @npmArgs
    $code = $LASTEXITCODE

    Write-Host ('  ─── npm install 流式日志结束（exit={0}） ───' -f $code) -ForegroundColor DarkGray
    return $code
}

$depsHealthy = Test-DepsHealthy
if ($depsHealthy) {
    Log-Ok 'node_modules 完整（vite / react 已就位），跳过安装'
} else {
    if (Test-Path 'node_modules') {
        Log-Warn 'node_modules 存在但不完整，将重新安装'
    } else {
        Log-Warn 'node_modules 不存在，执行首次安装'
    }

    # 第一次：常规安装
    $code = Invoke-NpmInstall
    if ($code -ne 0) {
        Log-Warn ("首次 npm install 失败（code={0}），触发自动修复流程" -f $code)
        # 第二次：深度清理后重装
        $code = Invoke-NpmInstall -DeepClean
    }

    if ($code -ne 0) {
        Log-Err '依赖安装失败（已重试 2 轮）'
        Write-Host '排查建议：' -ForegroundColor Yellow
        Write-Host '  1. 检查网络（能否访问 https://registry.npmmirror.com）' -ForegroundColor Yellow
        Write-Host '  2. 检查磁盘剩余空间（建议 >2GB）'                          -ForegroundColor Yellow
        Write-Host '  3. 关闭杀软/防火墙对 node.exe 的拦截'                      -ForegroundColor Yellow
        Write-Host '  4. 尝试手动执行：npm install --verbose'                     -ForegroundColor Yellow
        exit 40
    }

    if (-not (Test-DepsHealthy)) {
        Log-Err 'npm install 已完成但关键依赖仍缺失，请手动排查'
        exit 41
    }
    Log-Ok '依赖安装完成且完整'
}

# =====================================================================
# 步骤 5/6 · 释放端口占用
# =====================================================================
Log-Step ('步骤 5/6 · 检查并释放端口 {0}' -f $VitePort)

function Clear-Port {
    param([int]$Port)
    $killed = @()
    try {
        $conns = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
    } catch { $conns = $null }

    if ($null -ne $conns -and $conns.Count -gt 0) {
        foreach ($c in $conns) {
            $procId = $c.OwningProcess
            if ($procId -eq 0 -or $procId -eq $PID) { continue }
            try {
                $procInfo = Get-Process -Id $procId -ErrorAction Stop
                Log-Warn ("端口 {0} 被占用 → PID={1} · {2}，正在终止" -f $Port, $procId, $procInfo.ProcessName)
                Stop-Process -Id $procId -Force -ErrorAction Stop
                $killed += $procId
                Start-Sleep -Milliseconds 400
            } catch {
                Log-Warn ("无法结束 PID {0}: {1}" -f $procId, $_.Exception.Message)
            }
        }
        return $killed
    }

    # 回退到 netstat（某些低权限/特殊网络下 Get-NetTCPConnection 可能失败）
    $lines = & netstat -ano -p tcp 2>$null | Select-String -Pattern (":{0}\b" -f $Port) | Select-String 'LISTENING'
    foreach ($ln in $lines) {
        $tokens = -split $ln.Line
        $pidFromLine = $tokens[-1]
        if ($pidFromLine -match '^\d+$') {
            Log-Warn ("端口 {0} 占用（netstat） → PID={1}，正在终止" -f $Port, $pidFromLine)
            try {
                Stop-Process -Id ([int]$pidFromLine) -Force -ErrorAction Stop
                $killed += ([int]$pidFromLine)
                Start-Sleep -Milliseconds 400
            } catch {
                Log-Warn ("taskkill 失败: {0}" -f $_.Exception.Message)
            }
        }
    }
    return $killed
}

$killedPids = Clear-Port -Port $VitePort
if ($killedPids.Count -gt 0) {
    Log-Ok ("端口 {0} 已释放（结束 {1} 个进程）" -f $VitePort, $killedPids.Count)
} else {
    Log-Ok ("端口 {0} 空闲" -f $VitePort)
}

# =====================================================================
# 步骤 6/6 · 启动 Vite Dev Server
# =====================================================================
Log-Step '步骤 6/6 · 启动 Vite Dev Server'
$url = ("http://localhost:{0}/" -f $VitePort)

Write-Host ''
Write-Host ('  🚀 本地访问：{0}' -f $url)                    -ForegroundColor Green
Write-Host  '  🌐 局域网访问：http://<本机 IPv4>:5174/'        -ForegroundColor DarkGreen
Write-Host  '  🛑 停止服务：Ctrl + C（或直接关闭窗口）'        -ForegroundColor DarkGray
Write-Host ''

# 后台延时 3 秒后打开浏览器（失败静默）
Start-Job -Name 'auto-open-browser' -ScriptBlock {
    param($u)
    Start-Sleep -Seconds 3
    try { Start-Process $u } catch {}
} -ArgumentList $url | Out-Null

# 前台阻塞运行 Vite（直接透传信号，Ctrl+C 能正常退出）
$viteArgs = @('vite', '--host', '--port', "$VitePort")
Log-Step ('npx {0}' -f ($viteArgs -join ' '))
Write-Host ('  ─── vite 流式日志开始 ───') -ForegroundColor DarkGray

& npx @viteArgs
$viteExit = $LASTEXITCODE

Write-Host ''
Write-Host ('  ─── vite 进程结束（exit={0}） ───' -f $viteExit) -ForegroundColor DarkGray

# 清理后台 job
Get-Job -Name 'auto-open-browser' -ErrorAction SilentlyContinue | Remove-Job -Force -ErrorAction SilentlyContinue

# Vite 正常退出（Ctrl+C）返回 0 或 130 等都视为成功
if ($viteExit -ne 0 -and $viteExit -ne 130 -and $null -ne $viteExit) {
    Log-Err ("Vite 异常退出（code={0}）" -f $viteExit)
    exit $viteExit
}
Log-Ok '已正常关闭。再见 👋'
exit 0
