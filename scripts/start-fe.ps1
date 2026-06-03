$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$FrontendDir = Join-Path $ScriptDir '..\frontend'

Write-Host "Checking for backend on http://localhost:5000..."
$deadline = (Get-Date).AddSeconds(30)
$backendReady = $false
while ((Get-Date) -lt $deadline) {
    try {
        $null = Invoke-WebRequest -Uri 'http://localhost:5000/health' -UseBasicParsing -TimeoutSec 2 -ErrorAction Stop
        $backendReady = $true
        break
    } catch {
        Write-Host "  Backend not ready, retrying in 2s..."
        Start-Sleep -Seconds 2
    }
}
if (-not $backendReady) {
    Write-Host "Warning: backend not detected - starting frontend anyway."
}

Push-Location $FrontendDir

if (-not (Test-Path 'node_modules')) {
    Write-Host "Installing frontend dependencies..."
    npm install
    if ($LASTEXITCODE -ne 0) {
        Pop-Location
        Write-Host "`nnpm install failed. Press Enter to close..."
        $null = Read-Host
        exit $LASTEXITCODE
    }
}

Write-Host "Starting frontend on http://localhost:3000..."
npm start
Pop-Location

Write-Host "`nFrontend stopped. Press Enter to close this window..."
$null = Read-Host
