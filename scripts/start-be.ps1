param([switch]$SkipDb)

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$BackendDir = Join-Path $ScriptDir '..\backend'

if (-not $SkipDb) {
    & "$ScriptDir\start-db.ps1"
    if ($LASTEXITCODE -ne 0) {
        Write-Host "`nPress Enter to close..."
        $null = Read-Host
        exit $LASTEXITCODE
    }
}

Write-Host "Applying EF Core migrations..."
Push-Location $BackendDir
dotnet ef database update --project QuoteQuiz.API --startup-project QuoteQuiz.API
if ($LASTEXITCODE -ne 0) {
    Pop-Location
    Write-Host "`nMigrations failed. Press Enter to close..."
    $null = Read-Host
    exit $LASTEXITCODE
}

Write-Host "Starting backend on http://localhost:5000..."
dotnet run --project QuoteQuiz.API --urls "http://localhost:5000"
Pop-Location

Write-Host "`nBackend stopped. Press Enter to close this window..."
$null = Read-Host
