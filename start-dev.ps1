#requires -Version 5.1

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Invoke-Step {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Name,
        [Parameter(Mandatory = $true)]
        [scriptblock]$Action
    )

    Write-Host ""
    Write-Host "==> $Name"
    & $Action
}

function Invoke-NativeCommand {
    param(
        [Parameter(Mandatory = $true)]
        [string]$WorkingDirectory,
        [Parameter(Mandatory = $true)]
        [string]$Command,
        [string[]]$Arguments = @()
    )

    Push-Location -LiteralPath $WorkingDirectory
    try {
        $display = if ($Arguments.Count -gt 0) {
            "$Command " + ($Arguments -join " ")
        } else {
            $Command
        }
        Write-Host "[run] $display"
        & $Command @Arguments
        if ($LASTEXITCODE -ne 0) {
            throw "Command failed (exit code $LASTEXITCODE): $display"
        }
    } finally {
        Pop-Location
    }
}

$repoRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$frontendDir = Join-Path $repoRoot "frontend"
$backendDir = Join-Path $repoRoot "backend"
$backendJarRelative = "target/backend-0.0.1-SNAPSHOT.jar"
$backendJar = Join-Path $backendDir $backendJarRelative
$backendLog = Join-Path $backendDir "backend.log"

if (-not (Test-Path -LiteralPath $frontendDir)) {
    throw "frontend directory not found: $frontendDir"
}
if (-not (Test-Path -LiteralPath $backendDir)) {
    throw "backend directory not found: $backendDir"
}

Write-Host "TwinOps local startup"
Write-Host "repo: $repoRoot"

Invoke-Step -Name "Build backend package" -Action {
    Invoke-NativeCommand -WorkingDirectory $backendDir -Command "mvn" -Arguments @("-DskipTests", "package")
}

if (-not (Test-Path -LiteralPath $backendJar)) {
    throw "Backend jar not found after build: $backendJarRelative"
}

Invoke-Step -Name "Start backend in background" -Action {
    $backendCommand = "java -jar $backendJarRelative > backend.log 2>&1"
    Write-Host "[run] $backendCommand"
    $backendProcess = Start-Process `
        -FilePath "cmd.exe" `
        -ArgumentList "/c", $backendCommand `
        -WorkingDirectory $backendDir `
        -PassThru `
        -WindowStyle Hidden

    Start-Sleep -Seconds 1
    if ($backendProcess.HasExited) {
        throw "Backend process exited immediately. Check backend.log for details."
    }

    Write-Host "Backend PID: $($backendProcess.Id)"
    Write-Host "Backend log: $backendLog"
}

Invoke-Step -Name "Install frontend dependencies" -Action {
    Invoke-NativeCommand -WorkingDirectory $frontendDir -Command "npm" -Arguments @("install")
}

Invoke-Step -Name "Build frontend assets" -Action {
    Invoke-NativeCommand -WorkingDirectory $frontendDir -Command "npm" -Arguments @("run", "build")
}

Invoke-Step -Name "Start frontend dev server (foreground)" -Action {
    Write-Host "[run] npm run dev"
    Write-Host "Press Ctrl+C to stop frontend. Backend keeps running in background."
    Invoke-NativeCommand -WorkingDirectory $frontendDir -Command "npm" -Arguments @("run", "dev")
}
