param(
    [Parameter(Mandatory = $true)][string]$Installer,
    [Parameter(Mandatory = $true)][string]$Version,
    [Parameter(Mandatory = $true)][string]$Out
)

# Run only on an ephemeral GitHub Windows runner. All app state is isolated.
$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest
if (-not $IsWindows -or $env:GITHUB_ACTIONS -ne 'true') {
    throw 'This installation smoke test requires a disposable GitHub Actions Windows runner.'
}
$Installer = (Resolve-Path -LiteralPath $Installer).Path
$Out = [System.IO.Path]::GetFullPath($Out)
if (Test-Path -LiteralPath $Out) {
    if (@(Get-ChildItem -LiteralPath $Out -Force).Count -gt 0) { throw 'The evidence directory must be empty.' }
} else { New-Item -ItemType Directory -Path $Out | Out-Null }

$scratch = Join-Path ([System.IO.Path]::GetTempPath()) ('t3zh-installed-smoke-' + [guid]::NewGuid().ToString('N'))
$installDirectory = Join-Path $scratch 'app'
$stateDirectory = Join-Path $scratch 'state'
$roamingDirectory = Join-Path $scratch 'roaming'
$localDirectory = Join-Path $scratch 'local'
foreach ($directory in @($scratch, $stateDirectory, $roamingDirectory, $localDirectory)) {
    New-Item -ItemType Directory -Path $directory -Force | Out-Null
}
$tracked = [System.Collections.Generic.List[object]]::new()
$report = [ordered]@{
    passed = $false
    version = $Version
    installer_sha256 = (Get-FileHash -Algorithm SHA256 -LiteralPath $Installer).Hash.ToLowerInvariant()
    installed = $false
    installed_metadata = $null
    server_version = $null
    backend_ready = $false
    backend_platform = $null
    frontend_http = $false
    desktop_window = $false
    electron_profile_isolated = $false
    server_state_isolated = $false
    fatal_patterns = @()
    cleanup = $false
    wsl_runtime_execution = 'Not exercised: the hosted Windows runner has no configured WSL distro.'
}
$started = [System.Diagnostics.Stopwatch]::StartNew()
$exitCode = 1

function Start-OwnedProcess {
    param([string]$Executable, [string[]]$Arguments, [bool]$AsNode = $false, [string]$RawArguments = '')
    $info = [System.Diagnostics.ProcessStartInfo]::new()
    $info.FileName = $Executable
    $info.UseShellExecute = $false
    $info.RedirectStandardOutput = $true
    $info.RedirectStandardError = $true
    $info.WorkingDirectory = $scratch
    if ($RawArguments) { $info.Arguments = $RawArguments }
    else { foreach ($argument in $Arguments) { $info.ArgumentList.Add($argument) } }
    foreach ($key in @('ELECTRON_RUN_AS_NODE', 'ELECTRON_NO_ASAR', 'NODE_OPTIONS', 'NODE_PATH',
        'T3CODE_DEV_AUTH_TOKEN', 'VITE_DEV_SERVER_URL', 'T3CODE_DESKTOP_UPDATE_REPOSITORY')) {
        [void]$info.Environment.Remove($key)
    }
    $info.Environment['T3CODE_HOME'] = $stateDirectory
    $info.Environment['APPDATA'] = $roamingDirectory
    $info.Environment['LOCALAPPDATA'] = $localDirectory
    $info.Environment['T3CODE_DISABLE_AUTO_UPDATE'] = '1'
    $info.Environment['ELECTRON_ENABLE_LOGGING'] = '1'
    $info.Environment['T3CODE_PORT'] = [string]$script:smokePort
    if ($AsNode) { $info.Environment['ELECTRON_RUN_AS_NODE'] = '1' }
    $process = [System.Diagnostics.Process]::new()
    $process.StartInfo = $info
    if (-not $process.Start()) { throw 'Could not start a smoke-test process.' }
    $entry = @{
        Process = $process
        Started = $process.StartTime.ToUniversalTime().Ticks
        Stdout = $process.StandardOutput.ReadToEndAsync()
        Stderr = $process.StandardError.ReadToEndAsync()
    }
    $tracked.Add($entry)
    return $entry
}

function Stop-OwnedProcess {
    param($Entry)
    $process = $Entry.Process
    $process.Refresh()
    if (-not $process.HasExited) {
        if ($process.StartTime.ToUniversalTime().Ticks -ne $Entry.Started) { throw 'Process identity changed; refusing to stop it.' }
        $process.Kill($true)
        if (-not $process.WaitForExit(20000)) { throw 'Smoke-test process did not stop.' }
    }
}

function Wait-OwnedProcess {
    param($Entry, [int]$TimeoutSeconds)
    if (-not $Entry.Process.WaitForExit($TimeoutSeconds * 1000)) {
        Stop-OwnedProcess $Entry
        throw 'Smoke-test child process timed out.'
    }
    if ($Entry.Process.ExitCode -ne 0) { throw "Smoke-test child exited with code $($Entry.Process.ExitCode)." }
    return Read-CapturedStream $Entry.Stdout
}

function Read-CapturedStream {
    param($StreamTask)
    if (-not $StreamTask.Wait(30000)) { throw 'Timed out draining a smoke-test output pipe.' }
    return $StreamTask.GetAwaiter().GetResult()
}

try {
    $listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Loopback, 0)
    $listener.Start()
    $script:smokePort = $listener.LocalEndpoint.Port
    $listener.Stop()

    # NSIS requires /D to be the final argument, without enclosing quotes.
    if ($installDirectory.Contains('"')) { throw 'Unexpected quotation mark in temporary path.' }
    $install = Start-OwnedProcess -Executable $Installer -Arguments @() -RawArguments ('/S /D=' + $installDirectory)
    [void](Wait-OwnedProcess $install 300)
    $executables = @(Get-ChildItem -LiteralPath $installDirectory -File -Filter 'T3 Code*.exe')
    if ($executables.Count -ne 1) { throw 'The installer did not create exactly one T3 Code executable.' }
    $executable = $executables[0].FullName
    $resources = Join-Path $installDirectory 'resources'
    foreach ($relative in @('app.asar', 'server.asar', 'T3-Code-LICENSE.txt', 'wsl-runtime.tar.gz', 'wsl-runtime.tar.gz.sha256')) {
        if (-not (Test-Path -LiteralPath (Join-Path $resources $relative) -PathType Leaf)) {
            throw "Installed resource is missing: $relative"
        }
    }
    if (-not (Test-Path -LiteralPath (Join-Path $installDirectory 'locales/zh-CN.pak') -PathType Leaf)) {
        throw 'Installed Chromium Chinese locale is missing.'
    }
    if (Test-Path -LiteralPath (Join-Path $resources 'app-update.yml')) { throw 'An unintended update feed was packaged.' }
    $report.installed = $true

    $probeCode = 'console.log(JSON.stringify({version:require(process.argv[1]).version,platform:process.platform,arch:process.arch}))'
    $probe = Start-OwnedProcess -Executable $executable -AsNode $true -Arguments @(
        '--no-global-search-paths', '-e', $probeCode, (Join-Path $resources 'app.asar/package.json'))
    $metadata = (Wait-OwnedProcess $probe 30).Trim() | ConvertFrom-Json
    if ($metadata.version -ne $Version -or $metadata.platform -ne 'win32' -or $metadata.arch -ne 'x64') {
        throw 'Installed application version or architecture is incorrect.'
    }
    $report.installed_metadata = $metadata

    $serverProbe = Start-OwnedProcess -Executable $executable -AsNode $true -Arguments @(
        '--no-global-search-paths', (Join-Path $resources 'server.asar/apps/server/dist/bin.mjs'), '--version')
    $serverVersion = (Wait-OwnedProcess $serverProbe 45).Trim()
    if ($serverVersion -ne "t3 v$Version") { throw 'Installed server version does not match the application.' }
    $report.server_version = $serverVersion

    $app = Start-OwnedProcess -Executable $executable -Arguments @('--enable-logging')
    $origin = "http://127.0.0.1:$script:smokePort"
    $readyDeadline = [DateTime]::UtcNow.AddSeconds(180)
    while ([DateTime]::UtcNow -lt $readyDeadline) {
        $app.Process.Refresh()
        if ($app.Process.HasExited) { throw 'Installed desktop exited before its backend became ready.' }
        try {
            $descriptor = Invoke-RestMethod -Uri "$origin/.well-known/t3/environment" -TimeoutSec 3 -NoProxy
        } catch { Start-Sleep -Milliseconds 500; continue }
        if ($descriptor.serverVersion -ne $Version) { throw 'Running desktop backend has the wrong version.' }
        if ($descriptor.platform.os -notin @('windows', 'win32') -or $descriptor.platform.arch -ne 'x64') {
            throw 'The running backend is not native Windows x64.'
        }
        $report.backend_ready = $true
        $report.backend_platform = @{ os = $descriptor.platform.os; arch = $descriptor.platform.arch }
        break
    }
    if (-not $report.backend_ready) { throw 'Installed desktop backend did not become ready within 180 seconds.' }
    $page = Invoke-WebRequest -Uri "$origin/" -TimeoutSec 10 -NoProxy
    if ($page.StatusCode -ne 200 -or $page.Content -notmatch '(?i)<html') { throw 'Bundled frontend was not served.' }
    $report.frontend_http = $true
    Start-Sleep -Seconds 8
    $app.Process.Refresh()
    if ($app.Process.HasExited) { throw 'Installed desktop exited during the stability check.' }
    $report.desktop_window = $app.Process.MainWindowHandle -ne [IntPtr]::Zero
    if (-not $report.desktop_window) { throw 'Installed desktop did not create a native application window.' }
    # v0.1.0 explicitly sets Electron userData from DesktopConfig.APPDATA.
    $report.electron_profile_isolated = Test-Path -LiteralPath (Join-Path $roamingDirectory 't3code-v2') -PathType Container
    $report.server_state_isolated = Test-Path -LiteralPath (Join-Path $stateDirectory 'userdata/statev2.sqlite') -PathType Leaf
    if (-not $report.electron_profile_isolated -or -not $report.server_state_isolated) {
        throw 'The installed application did not use the expected isolated profile and state.'
    }
    Stop-OwnedProcess $app
    $output = (Read-CapturedStream $app.Stdout) + "`n" + (Read-CapturedStream $app.Stderr)
    foreach ($pattern in @('Cannot find module', 'MODULE_NOT_FOUND', 'ERR_DLOPEN_FAILED',
        'Uncaught TypeError', 'Uncaught ReferenceError', 'Uncaught Error')) {
        if ($output.Contains($pattern)) { $report.fatal_patterns += $pattern }
    }
    if ($report.fatal_patterns.Count -gt 0) { throw 'Fatal module or runtime errors occurred in the installed application.' }
    $report.passed = $true
    $exitCode = 0
} catch {
    $report['error'] = $_.Exception.Message.Replace($scratch, '<smoke-temp>')
    Write-Host ('Windows installed smoke failed: ' + $report.error)
} finally {
    try {
        foreach ($entry in $tracked) { Stop-OwnedProcess $entry }
        for ($attempt = 0; $attempt -lt 20; $attempt++) {
            try { Remove-Item -LiteralPath $scratch -Recurse -Force; break }
            catch { if ($attempt -eq 19) { throw }; Start-Sleep -Milliseconds 500 }
        }
        $report.cleanup = $true
    } catch {
        $report.passed = $false
        $report['cleanup_error'] = $_.Exception.Message.Replace($scratch, '<smoke-temp>')
        $exitCode = 1
    }
    $report['seconds'] = [Math]::Round($started.Elapsed.TotalSeconds, 2)
    $report | ConvertTo-Json -Depth 8 | Set-Content -LiteralPath (Join-Path $Out 'smoke.json') -Encoding utf8NoBOM
    # Raw app output and T3/Electron state are intentionally not exported: startup output can contain pairing credentials.
    Write-Host ("Windows installed smoke: passed={0}; backend={1}; window={2}; cleanup={3}" -f
        $report.passed, $report.backend_ready, $report.desktop_window, $report.cleanup)
}
exit $exitCode
