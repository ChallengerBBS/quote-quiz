$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$Compose = Join-Path $ScriptDir '..\docker-compose.yml'

# 1. Start DB and wait until healthy (inline — fast, no window needed yet)
Write-Host "Starting PostgreSQL..."
& "$ScriptDir\start-db.ps1"
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

# 2. Open DB window (keeps the container alive; closing it stops PostgreSQL)
Write-Host "Opening database window..."
$DbProc = Start-Process pwsh -ArgumentList "-NoExit", "-File", "$ScriptDir\start-db.ps1", "-KeepAlive" -PassThru

# 3. Open BE window (DB is already up, so skip the DB step inside start-be)
Write-Host "Opening backend window..."
$BeProc = Start-Process pwsh -ArgumentList "-NoExit", "-File", "$ScriptDir\start-be.ps1", "-SkipDb" -PassThru

# 4. Poll backend health (up to 90 s)
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

# 5. Open FE window
Write-Host "Opening frontend window..."
$FeProc = Start-Process pwsh -ArgumentList "-NoExit", "-File", "$ScriptDir\start-fe.ps1" -PassThru

Write-Host "All services started. You can close this window."
