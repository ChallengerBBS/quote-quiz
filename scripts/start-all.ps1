$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

# 1. Open BE window (applies migrations then starts the API)
Write-Host "Opening backend window..."
$BeProc = Start-Process pwsh -ArgumentList "-NoExit", "-File", "$ScriptDir\start-be.ps1" -PassThru

# 2. Poll backend health (up to 90 s)
Write-Host "Waiting for backend to be ready..."
$retries = 45
while ($true) {
    try {
        $null = Invoke-WebRequest -Uri 'http://localhost:5000/health' -UseBasicParsing -TimeoutSec 2 -ErrorAction Stop
        break
    } catch {
        $retries--
        if ($retries -eq 0) {
            Write-Host "ERROR: Backend did not become healthy within 90 seconds."
            exit 1
        }
        if ($BeProc.HasExited) {
            Write-Host "ERROR: Backend window was closed before the backend became ready."
            exit 1
        }
        Write-Host "  Backend not ready, retrying in 2s..."
        Start-Sleep -Seconds 2
    }
}
Write-Host "Backend is ready."

# 3. Open FE window
Write-Host "Opening frontend window..."
$FeProc = Start-Process pwsh -ArgumentList "-NoExit", "-File", "$ScriptDir\start-fe.ps1" -PassThru

Write-Host "All services started. You can close this window."
