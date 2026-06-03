param([switch]$KeepAlive)

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$Compose = Join-Path $ScriptDir '..\docker-compose.yml'

Write-Host "Starting PostgreSQL container..."
docker-compose -f $Compose up -d
if ($LASTEXITCODE -ne 0) {
    if ($KeepAlive) { Write-Host "`nPress Enter to close..."; $null = Read-Host }
    exit $LASTEXITCODE
}

Write-Host "Waiting for PostgreSQL to be healthy..."
while ($true) {
    docker-compose -f $Compose exec -T postgres pg_isready -U quotequiz -d quotequiz 2>$null | Out-Null
    if ($LASTEXITCODE -eq 0) { break }
    Write-Host "  PostgreSQL not ready, retrying in 2s..."
    Start-Sleep -Seconds 2
}

Write-Host "PostgreSQL is ready."

if ($KeepAlive) {
    $global:_dbComposeFile = $Compose
    Register-EngineEvent -SourceIdentifier PowerShell.Exiting -Action {
        docker-compose -f $global:_dbComposeFile down
    } | Out-Null

    Write-Host "PostgreSQL is running. Press Enter to stop the database and close this window..."
    $null = Read-Host

    Write-Host "Stopping PostgreSQL..."
    docker-compose -f $Compose down
}
