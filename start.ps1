# =====================================================================
# MySpace Music App - GUI Launcher (PowerShell + WinForms)
# 特性：
#   - WinForms 图形界面，不会闪退
#   - 6 步状态指示（彩色 ○ ⟳ ✓ ✗）
#   - 实时日志（文件中转，避免 UI 跨线程问题）
#   - 启动 / 停止 / 浏览器 / 目录 / 清空日志 / 退出 按钮
#   - 自动镜像 / 自动修复依赖（两级重试）/ 自动释放端口
#   - 关闭窗口自动 kill vite 进程
# =====================================================================

# --- UTF-8 输出，避免中文乱码 ---
try {
    [Console]::OutputEncoding = [System.Text.Encoding]::UTF8
    $OutputEncoding            = [System.Text.Encoding]::UTF8
} catch {}

# --- 加载 WinForms ---
try {
    Add-Type -AssemblyName System.Windows.Forms -ErrorAction Stop
    Add-Type -AssemblyName System.Drawing       -ErrorAction Stop
    [System.Windows.Forms.Application]::EnableVisualStyles()
    [System.Windows.Forms.Application]::SetCompatibleTextRenderingDefault($false)
    # 重要：强制将 UI 线程异常交由 ThreadException 处理，避免静默崩溃
    [System.Windows.Forms.Application]::SetUnhandledExceptionMode(
        [System.Windows.Forms.UnhandledExceptionMode]::CatchException
    )
} catch {
    Write-Host "[X] WinForms 加载失败: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "    请确认系统已安装 .NET Framework 4.6+"          -ForegroundColor Yellow
    exit 20
}

# =====================================================================
# 全局配置
# =====================================================================
$script:ProjectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $script:ProjectRoot

$script:VitePort   = 5174
$script:Registry   = 'https://registry.npmmirror.com'
$script:Url        = "http://localhost:$($script:VitePort)/"
$script:LogFile    = Join-Path $script:ProjectRoot 'start.log'
$script:ViteProc   = $null
$script:IsRunning  = $false
$script:LogTail    = 0

# 重置日志文件
$bootHeader = "==== MySpace Music App · Launcher · $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') ===="
$bootHeader | Out-File -FilePath $script:LogFile -Encoding UTF8 -Force

# =====================================================================
# 颜色 / 字体
# =====================================================================
$ColBg       = [System.Drawing.Color]::FromArgb(22,22,26)
$ColPanelBg  = [System.Drawing.Color]::FromArgb(30,30,36)
$ColLogBg    = [System.Drawing.Color]::FromArgb(12,12,16)
$ColAccent   = [System.Drawing.Color]::FromArgb(29,185,84)
$ColAccentHv = [System.Drawing.Color]::FromArgb(40,200,100)
$ColTextDim  = [System.Drawing.Color]::FromArgb(170,170,180)
$ColTextLine = [System.Drawing.Color]::FromArgb(220,220,225)
$ColWarn     = [System.Drawing.Color]::FromArgb(255,200,0)
$ColErr      = [System.Drawing.Color]::FromArgb(255,90,90)
$ColBtnGray  = [System.Drawing.Color]::FromArgb(55,55,62)
$ColBtnRed   = [System.Drawing.Color]::FromArgb(200,60,60)

$FontUI      = New-Object System.Drawing.Font('Microsoft YaHei UI', 9)
$FontUIBold  = New-Object System.Drawing.Font('Microsoft YaHei UI', 10, [System.Drawing.FontStyle]::Bold)
$FontTitle   = New-Object System.Drawing.Font('Microsoft YaHei UI', 15, [System.Drawing.FontStyle]::Bold)
$FontStep    = New-Object System.Drawing.Font('Microsoft YaHei UI', 10)
$FontMono    = New-Object System.Drawing.Font('Consolas', 9)
$FontMonoSm  = New-Object System.Drawing.Font('Consolas', 8.5)

# =====================================================================
# 主窗体
# =====================================================================
$form = New-Object System.Windows.Forms.Form
$form.Text          = 'MySpace Music App · 一键启动器'
$form.StartPosition = 'CenterScreen'
$form.ClientSize    = New-Object System.Drawing.Size(820, 560)
$form.MinimumSize   = New-Object System.Drawing.Size(760, 520)
$form.BackColor     = $ColBg
$form.ForeColor     = [System.Drawing.Color]::White
$form.Font          = $FontUI

# Banner
$banner = New-Object System.Windows.Forms.Label
$banner.Text      = "MySpace Music App  ·  One-Click Launcher"
$banner.Font      = $FontTitle
$banner.ForeColor = $ColAccent
$banner.Location  = New-Object System.Drawing.Point(18, 14)
$banner.AutoSize  = $true
$form.Controls.Add($banner)

$pathLabel = New-Object System.Windows.Forms.Label
$pathLabel.Text      = "Project: $($script:ProjectRoot)"
$pathLabel.Font      = $FontMonoSm
$pathLabel.ForeColor = $ColTextDim
$pathLabel.Location  = New-Object System.Drawing.Point(20, 50)
$pathLabel.AutoSize  = $true
$form.Controls.Add($pathLabel)

$sep = New-Object System.Windows.Forms.Panel
$sep.BackColor = [System.Drawing.Color]::FromArgb(60,60,70)
$sep.Location  = New-Object System.Drawing.Point(16, 76)
$sep.Size      = New-Object System.Drawing.Size(788, 1)
$sep.Anchor    = 'Top,Left,Right'
$form.Controls.Add($sep)

# ---- 步骤面板（左） ----
$stepsBox = New-Object System.Windows.Forms.GroupBox
$stepsBox.Text      = ' 启动步骤 '
$stepsBox.ForeColor = $ColAccent
$stepsBox.Font      = $FontUIBold
$stepsBox.Location  = New-Object System.Drawing.Point(16, 86)
$stepsBox.Size      = New-Object System.Drawing.Size(310, 380)
$stepsBox.Anchor    = 'Top,Bottom,Left'
$form.Controls.Add($stepsBox)

$script:StepDefs = @(
    @{ key='node'; text='Node.js / npm 环境' }
    @{ key='pkg';  text='项目文件校验'      }
    @{ key='reg';  text='npm 镜像配置'      }
    @{ key='deps'; text='依赖完整性检查'    }
    @{ key='port'; text='端口 5174 释放'    }
    @{ key='vite'; text='Vite Dev Server'   }
)
$script:StepLabels = @{}
$yy = 30
foreach ($s in $script:StepDefs) {
    $l = New-Object System.Windows.Forms.Label
    $l.Text      = "  ○   $($s.text)"
    $l.Font      = $FontStep
    $l.ForeColor = $ColTextLine
    $l.Location  = New-Object System.Drawing.Point(14, $yy)
    $l.Size      = New-Object System.Drawing.Size(282, 28)
    $stepsBox.Controls.Add($l)
    $script:StepLabels[$s.key] = $l
    $yy += 32
}

# 状态栏
$script:statusLabel = New-Object System.Windows.Forms.Label
$script:statusLabel.Text      = '就绪，正在准备自动启动...'
$script:statusLabel.Font      = $FontUIBold
$script:statusLabel.ForeColor = $ColTextDim
$script:statusLabel.Location  = New-Object System.Drawing.Point(14, 240)
$script:statusLabel.Size      = New-Object System.Drawing.Size(282, 24)
$stepsBox.Controls.Add($script:statusLabel)

# URL 链接
$script:urlLabel = New-Object System.Windows.Forms.LinkLabel
$script:urlLabel.Text          = $script:Url
$script:urlLabel.Font          = New-Object System.Drawing.Font('Consolas', 11, [System.Drawing.FontStyle]::Bold)
$script:urlLabel.LinkColor     = $ColAccent
$script:urlLabel.ActiveLinkColor = $ColAccentHv
$script:urlLabel.Location      = New-Object System.Drawing.Point(14, 270)
$script:urlLabel.Size          = New-Object System.Drawing.Size(282, 24)
$script:urlLabel.Visible       = $false
$script:urlLabel.Add_LinkClicked({ try { Start-Process $script:Url } catch {} })
$stepsBox.Controls.Add($script:urlLabel)

$tipLabel = New-Object System.Windows.Forms.Label
$tipLabel.Text      = "提示：首次启动会自动安装依赖`r`n失败可点击 [重试]，会自动深度清理重装"
$tipLabel.Font      = $FontUI
$tipLabel.ForeColor = $ColTextDim
$tipLabel.Location  = New-Object System.Drawing.Point(14, 320)
$tipLabel.Size      = New-Object System.Drawing.Size(282, 50)
$stepsBox.Controls.Add($tipLabel)

# ---- 日志面板（右） ----
$script:logBox = New-Object System.Windows.Forms.RichTextBox
$script:logBox.Location    = New-Object System.Drawing.Point(338, 86)
$script:logBox.Size        = New-Object System.Drawing.Size(466, 380)
$script:logBox.BackColor   = $ColLogBg
$script:logBox.ForeColor   = [System.Drawing.Color]::FromArgb(220,220,220)
$script:logBox.Font        = $FontMono
$script:logBox.ReadOnly    = $true
$script:logBox.DetectUrls  = $false
$script:logBox.BorderStyle = 'FixedSingle'
$script:logBox.WordWrap    = $false
$script:logBox.ScrollBars  = 'Both'
$script:logBox.Anchor      = 'Top,Bottom,Left,Right'
$form.Controls.Add($script:logBox)

# ---- 按钮栏 ----
$btnY = 484

function New-FlatButton {
    param(
        [string]$Text, [int]$X, [int]$W,
        [System.Drawing.Color]$Bg, [System.Drawing.Color]$Fg,
        [bool]$Bold = $false
    )
    $b = New-Object System.Windows.Forms.Button
    $b.Text                       = $Text
    $b.Location                   = New-Object System.Drawing.Point($X, $btnY)
    $b.Size                       = New-Object System.Drawing.Size($W, 40)
    $b.BackColor                  = $Bg
    $b.ForeColor                  = $Fg
    $b.FlatStyle                  = 'Flat'
    $b.FlatAppearance.BorderSize  = 0
    $b.Font = if ($Bold) { New-Object System.Drawing.Font('Microsoft YaHei UI', 10, [System.Drawing.FontStyle]::Bold) }
              else       { New-Object System.Drawing.Font('Microsoft YaHei UI', 10) }
    $b.Cursor                     = 'Hand'
    return $b
}

$script:btnStart   = New-FlatButton '> 启动'      16  120 $ColAccent  ([System.Drawing.Color]::Black) $true
$script:btnStop    = New-FlatButton '■ 停止'      144 100 $ColBtnGray ([System.Drawing.Color]::White) $false
$script:btnOpen    = New-FlatButton '🌐 浏览器'    254 110 $ColBtnGray ([System.Drawing.Color]::White) $false
$script:btnFolder  = New-FlatButton '📂 项目目录'  374 110 $ColBtnGray ([System.Drawing.Color]::White) $false
$script:btnClear   = New-FlatButton '🗑 清空日志'  494 110 $ColBtnGray ([System.Drawing.Color]::White) $false
$script:btnExit    = New-FlatButton '✕ 退出'      688 116 $ColBtnRed  ([System.Drawing.Color]::White) $true

$script:btnStop.Enabled = $false
$script:btnStart.Anchor  = 'Bottom,Left'
$script:btnStop.Anchor   = 'Bottom,Left'
$script:btnOpen.Anchor   = 'Bottom,Left'
$script:btnFolder.Anchor = 'Bottom,Left'
$script:btnClear.Anchor  = 'Bottom,Left'
$script:btnExit.Anchor   = 'Bottom,Right'

$form.Controls.AddRange(@($script:btnStart,$script:btnStop,$script:btnOpen,$script:btnFolder,$script:btnClear,$script:btnExit))

# =====================================================================
# 辅助函数
# =====================================================================
function Write-Log {
    param([string]$Line, [string]$Level = 'INFO')
    $ts  = Get-Date -Format 'HH:mm:ss'
    $row = "[$ts] [$Level] $Line"
    try { Add-Content -Path $script:LogFile -Value $row -Encoding UTF8 -ErrorAction SilentlyContinue } catch {}
}

function Set-Step {
    param([string]$Key, [string]$Status, [string]$Detail = '')
    $prefix = switch ($Status) {
        'pending' { '  ○   ' }
        'running' { '  ⟳   ' }
        'ok'      { '  ✓   ' }
        'fail'    { '  ✗   ' }
        default   { '  ·   ' }
    }
    $color = switch ($Status) {
        'pending' { $ColTextLine }
        'running' { $ColWarn }
        'ok'      { $ColAccent }
        'fail'    { $ColErr }
        default   { [System.Drawing.Color]::White }
    }
    $def  = $script:StepDefs | Where-Object { $_.key -eq $Key } | Select-Object -First 1
    $text = "$prefix$($def.text)"
    if ($Detail) { $text += "  ·  $Detail" }
    $script:StepLabels[$Key].Text      = $text
    $script:StepLabels[$Key].ForeColor = $color
    $script:StepLabels[$Key].Refresh()
}

function Set-Status {
    param([string]$Text, [System.Drawing.Color]$Color = $ColTextDim)
    $script:statusLabel.Text      = $Text
    $script:statusLabel.ForeColor = $Color
    $script:statusLabel.Refresh()
}

# 子进程执行器（异步事件 + DoEvents 防 UI 卡死）
function Invoke-Exe {
    param(
        [string]$Exe,
        [string[]]$ArgList,
        [switch]$Background
    )
    $argStr = ($ArgList | ForEach-Object {
        if ($_ -match '[\s"]') { '"' + ($_ -replace '"','\"') + '"' } else { $_ }
    }) -join ' '

    Write-Log ">> $Exe $argStr" 'CMD'

    $psi = New-Object System.Diagnostics.ProcessStartInfo
    $psi.FileName              = $Exe
    $psi.Arguments             = $argStr
    $psi.UseShellExecute       = $false
    $psi.CreateNoWindow        = $true
    $psi.RedirectStandardOutput= $true
    $psi.RedirectStandardError = $true
    $psi.WorkingDirectory      = $script:ProjectRoot
    try {
        $psi.StandardOutputEncoding = [System.Text.Encoding]::UTF8
        $psi.StandardErrorEncoding  = [System.Text.Encoding]::UTF8
    } catch {}

    $p = New-Object System.Diagnostics.Process
    $p.StartInfo = $psi

    $handler = {
        param($s, $e)
        if ($null -ne $e -and $null -ne $e.Data) {
            try { Add-Content -Path $script:LogFile -Value $e.Data -Encoding UTF8 -ErrorAction SilentlyContinue } catch {}
        }
    }
    $p.add_OutputDataReceived($handler)
    $p.add_ErrorDataReceived($handler)

    try {
        [void]$p.Start()
        $p.BeginOutputReadLine()
        $p.BeginErrorReadLine()
    } catch {
        Write-Log "进程启动失败: $($_.Exception.Message)" 'ERR'
        return -1
    }

    if ($Background) { return $p }

    while (-not $p.HasExited) {
        [System.Windows.Forms.Application]::DoEvents()
        Start-Sleep -Milliseconds 40
    }
    return $p.ExitCode
}

# 端口释放（统一走 netstat，避免 Get-NetTCPConnection 在某些环境慢/卡）
function Clear-Port {
    param([int]$Port)
    $count = 0
    Write-Log "扫描端口 $Port ..." 'PORT'
    try {
        $raw  = & netstat -ano 2>$null
        $pat  = ":{0}\b" -f $Port
        $hits = $raw | Where-Object { $_ -match $pat -and $_ -match 'LISTENING' }
        $pids = @{}
        foreach ($ln in $hits) {
            $tokens = -split $ln
            $pidStr = $tokens[-1]
            if ($pidStr -match '^\d+$') { $pids[$pidStr] = $true }
        }
        foreach ($pidStr in $pids.Keys) {
            try {
                Stop-Process -Id ([int]$pidStr) -Force -ErrorAction Stop
                Write-Log "结束进程 PID=$pidStr" 'PORT'
                $count++
            } catch {
                Write-Log "结束 PID=$pidStr 失败: $($_.Exception.Message)" 'WARN'
            }
        }
    } catch {
        Write-Log "扫描端口异常: $($_.Exception.Message)" 'WARN'
    }
    Write-Log "端口扫描完成，已释放 $count 个" 'PORT'
    return $count
}

# =====================================================================
# 启动 / 停止
# =====================================================================
function Start-Launcher {
    if ($script:IsRunning) { return }
    $script:IsRunning          = $true
    $script:btnStart.Enabled   = $false
    $script:btnStop.Enabled    = $true
    $script:urlLabel.Visible   = $false

    foreach ($k in @('node','pkg','reg','deps','port','vite')) { Set-Step $k 'pending' }
    Set-Status '启动中...' $ColWarn

    # ---- Step 1: Node ----
    Set-Step 'node' 'running'
    Write-Log '========== 步骤 1/6 · 检测 Node.js / npm =========='
    $nodeVer = $null; $npmVer = $null
    try { $nodeVer = (& node --version) 2>$null } catch {}
    try { $npmVer  = (& npm  --version) 2>$null } catch {}
    if (-not $nodeVer -or -not $npmVer) {
        Set-Step 'node' 'fail' '未安装'
        Write-Log '[X] 未检测到 Node.js / npm。请安装 Node 18+：https://nodejs.org/' 'ERR'
        Set-Status '启动失败：缺少 Node.js' $ColErr
        $script:btnStart.Enabled = $true; $script:btnStop.Enabled = $false
        $script:IsRunning = $false
        return
    }
    Set-Step 'node' 'ok' $nodeVer
    Write-Log "Node $nodeVer · npm $npmVer"

    # ---- Step 2: package.json ----
    Set-Step 'pkg' 'running'
    Write-Log '========== 步骤 2/6 · 校验项目文件 =========='
    if (-not (Test-Path 'package.json')) {
        Set-Step 'pkg' 'fail' '缺失'
        Write-Log "[X] 当前目录无 package.json: $($script:ProjectRoot)" 'ERR'
        Set-Status '启动失败：缺少 package.json' $ColErr
        $script:btnStart.Enabled = $true; $script:btnStop.Enabled = $false
        $script:IsRunning = $false
        return
    }
    Set-Step 'pkg' 'ok'
    Write-Log 'package.json 有效'

    # ---- Step 3: registry ----
    Set-Step 'reg' 'running'
    Write-Log '========== 步骤 3/6 · 配置 npm 镜像 =========='
    [void](Invoke-Exe -Exe 'npm.cmd' -ArgList @('config','set','registry',$script:Registry))
    Set-Step 'reg' 'ok' 'npmmirror'

    # ---- Step 4: deps ----
    Set-Step 'deps' 'running'
    Write-Log '========== 步骤 4/6 · 依赖完整性检查 =========='
    $viteOk  = Test-Path (Join-Path 'node_modules' 'vite\package.json')
    $reactOk = Test-Path (Join-Path 'node_modules' 'react\package.json')
    if (-not $viteOk -or -not $reactOk) {
        Write-Log 'node_modules 不完整，执行 npm install...' 'WARN'
        Set-Step 'deps' 'running' '安装中（首次较慢）'
        $installArgs = @(
            'install',
            '--registry', $script:Registry,
            '--fetch-timeout=600000',
            '--fetch-retries=5',
            '--fetch-retry-maxtimeout=120000',
            '--loglevel=info',
            '--no-audit',
            '--no-fund'
        )
        $code = Invoke-Exe -Exe 'npm.cmd' -ArgList $installArgs
        if ($code -ne 0) {
            Write-Log "npm install 失败 (code=$code)，深度清理后重试..." 'WARN'
            Set-Step 'deps' 'running' '深度修复中'
            try {
                if (Test-Path 'node_modules') { Remove-Item 'node_modules' -Recurse -Force -ErrorAction SilentlyContinue }
                if (Test-Path 'package-lock.json') { Remove-Item 'package-lock.json' -Force -ErrorAction SilentlyContinue }
            } catch {}
            [void](Invoke-Exe -Exe 'npm.cmd' -ArgList @('cache','clean','--force'))
            $code = Invoke-Exe -Exe 'npm.cmd' -ArgList $installArgs
        }
        $viteOk = Test-Path (Join-Path 'node_modules' 'vite\package.json')
        if ($code -ne 0 -or -not $viteOk) {
            Set-Step 'deps' 'fail'
            Write-Log '[X] 依赖安装失败。检查网络/磁盘/防火墙' 'ERR'
            Set-Status '启动失败：依赖安装失败' $ColErr
            $script:btnStart.Enabled = $true; $script:btnStop.Enabled = $false
            $script:IsRunning = $false
            return
        }
        Set-Step 'deps' 'ok' '已安装'
    } else {
        Set-Step 'deps' 'ok' '已就绪'
        Write-Log 'node_modules 完整，跳过安装'
    }

    # ---- Step 5: port ----
    Set-Step 'port' 'running'
    Write-Log "========== 步骤 5/6 · 释放端口 $($script:VitePort) =========="
    $killed = Clear-Port -Port $script:VitePort
    if ($killed -gt 0) {
        Set-Step 'port' 'ok' "释放 $killed 个进程"
    } else {
        Set-Step 'port' 'ok' '空闲'
    }

    # ---- Step 6: Vite ----
    Set-Step 'vite' 'running'
    Write-Log "========== 步骤 6/6 · 启动 Vite =========="

    # 优先用 node 直接启动 vite.js 以便干净 kill
    $viteJs = Join-Path $script:ProjectRoot 'node_modules\vite\bin\vite.js'
    if (Test-Path $viteJs) {
        $script:ViteProc = Invoke-Exe -Exe 'node' `
            -ArgList @($viteJs, '--host', '--port', "$($script:VitePort)") `
            -Background
    } else {
        # 兜底用 npx
        $script:ViteProc = Invoke-Exe -Exe 'npx.cmd' `
            -ArgList @('vite', '--host', '--port', "$($script:VitePort)") `
            -Background
    }

    if ($script:ViteProc -is [System.Diagnostics.Process]) {
        Set-Step 'vite' 'ok' "PID=$($script:ViteProc.Id)"
        Set-Status '✓ Vite 服务已运行' $ColAccent
        $script:urlLabel.Visible = $true
        # 后台延时打开浏览器（用 Timer，避免 Start-Job 在 STA 下不稳定）
        $browserTimer = New-Object System.Windows.Forms.Timer
        $browserTimer.Interval = 3000
        $browserTimer.add_Tick({
            param($s,$e)
            try { $s.Stop(); $s.Dispose() } catch {}
            try { Start-Process $script:Url } catch {}
        })
        $browserTimer.Start()
    } else {
        Set-Step 'vite' 'fail'
        Set-Status 'Vite 启动失败' $ColErr
        Write-Log '[X] Vite 进程未能启动' 'ERR'
        $script:btnStart.Enabled = $true; $script:btnStop.Enabled = $false
        $script:IsRunning = $false
    }
}

function Stop-Launcher {
    Write-Log '正在停止 Vite 进程...'
    if ($script:ViteProc -is [System.Diagnostics.Process] -and -not $script:ViteProc.HasExited) {
        try { $script:ViteProc.Kill($true) } catch {
            try { $script:ViteProc.Kill() } catch {}
        }
    }
    # 兜底再次释放端口（杀掉残余 node 进程）
    [void](Clear-Port -Port $script:VitePort)

    $script:ViteProc  = $null
    $script:IsRunning = $false
    Set-Step 'vite' 'pending' '已停止'
    Set-Status '已停止。可重新点击 [启动]' $ColTextDim
    $script:urlLabel.Visible = $false
    $script:btnStart.Enabled = $true
    $script:btnStop.Enabled  = $false
    Write-Log 'Vite 已停止'
}

# =====================================================================
# 日志 Timer：轮询日志文件，追加到 RichTextBox
# =====================================================================
$script:logTimer = New-Object System.Windows.Forms.Timer
$script:logTimer.Interval = 250
$script:logTimer.Add_Tick({
    try {
        if (-not (Test-Path $script:LogFile)) { return }
        $fi = Get-Item $script:LogFile
        if ($fi.Length -le $script:LogTail) { return }
        $fs = [System.IO.File]::Open($script:LogFile, 'Open', 'Read', 'ReadWrite')
        try {
            [void]$fs.Seek($script:LogTail, 'Begin')
            $sr = New-Object System.IO.StreamReader($fs, [System.Text.Encoding]::UTF8)
            $new = $sr.ReadToEnd()
            $sr.Close()
        } finally {
            $fs.Close()
        }
        $script:LogTail = $fi.Length
        if ($new -and $script:logBox) {
            $script:logBox.AppendText($new)
            $script:logBox.SelectionStart = $script:logBox.Text.Length
            $script:logBox.ScrollToCaret()
        }
    } catch {}
})
$script:logTimer.Start()

# =====================================================================
# 按钮事件
# =====================================================================
$script:btnStart.Add_Click({
    try { Start-Launcher } catch {
        Write-Log "[CRASH] $($_.Exception.Message)" 'ERR'
        Write-Log $_.ScriptStackTrace 'ERR'
    }
})
$script:btnStop.Add_Click({
    try { Stop-Launcher } catch {
        Write-Log "[CRASH-STOP] $($_.Exception.Message)" 'ERR'
    }
})
$script:btnOpen.Add_Click({   try { Start-Process $script:Url } catch {} })
$script:btnFolder.Add_Click({ try { Start-Process 'explorer.exe' -ArgumentList $script:ProjectRoot } catch {} })
$script:btnClear.Add_Click({
    try { $script:logBox.Clear() } catch {}
    try {
        $script:LogTail = (Get-Item $script:LogFile).Length
    } catch { $script:LogTail = 0 }
})
$script:btnExit.Add_Click({ $script:form.Close() })

$script:form = $form
$form.Add_FormClosing({
    try { Stop-Launcher } catch {}
    try { $script:logTimer.Stop() } catch {}
})

$form.Add_Shown({
    Write-Log '启动器 GUI 已就绪。'
    Write-Log "项目目录: $($script:ProjectRoot)"
    Write-Log "PowerShell 版本: $($PSVersionTable.PSVersion)"
    Write-Log '即将自动开始启动流程（也可点击 [启动] 重新执行）...'
    # 用 Timer 延时调度，避开 Shown 回调内长时间阻塞
    $script:autoStartTimer = New-Object System.Windows.Forms.Timer
    $script:autoStartTimer.Interval = 600
    $script:autoStartTimer.Add_Tick({
        param($s,$e)
        try { $s.Stop(); $s.Dispose() } catch {}
        try { Start-Launcher } catch {
            Write-Log "[CRASH] Start-Launcher 异常: $($_.Exception.Message)" 'ERR'
            Write-Log $_.ScriptStackTrace 'ERR'
        }
    })
    $script:autoStartTimer.Start()
})

# 全局未处理异常兜底，写入日志
try {
    [System.Windows.Forms.Application]::add_ThreadException({
        param($s, $e)
        try {
            Add-Content -Path $script:LogFile -Value "[FATAL][UI] $($e.Exception.GetType().FullName): $($e.Exception.Message)" -Encoding UTF8
            Add-Content -Path $script:LogFile -Value $e.Exception.StackTrace -Encoding UTF8
        } catch {}
    })
} catch {}

[AppDomain]::CurrentDomain.add_UnhandledException({
    param($s, $e)
    try {
        $ex = $e.ExceptionObject
        Add-Content -Path $script:LogFile -Value "[FATAL][AppDomain] $($ex.GetType().FullName): $($ex.Message)" -Encoding UTF8
        Add-Content -Path $script:LogFile -Value $ex.StackTrace -Encoding UTF8
    } catch {}
})

# =====================================================================
# 启动消息循环（顶层 try-catch 捕获并写入日志，绝不静默崩溃）
# =====================================================================
try {
    [System.Windows.Forms.Application]::Run($form)
    exit 0
} catch {
    try {
        Add-Content -Path $script:LogFile -Value "[FATAL][Run] $($_.Exception.GetType().FullName): $($_.Exception.Message)" -Encoding UTF8
        Add-Content -Path $script:LogFile -Value $_.ScriptStackTrace -Encoding UTF8
    } catch {}
    exit 99
}
