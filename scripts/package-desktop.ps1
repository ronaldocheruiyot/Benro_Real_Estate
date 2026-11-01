# Build an installable Windows .exe for BENRO (downloaded-app style)
$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

Write-Host "==> Building frontend (dist/)..." -ForegroundColor Cyan
npm run frontend:build
if ($LASTEXITCODE -ne 0) { throw "Frontend build failed" }

Write-Host "==> Ensuring backend dependencies..." -ForegroundColor Cyan
npm install --prefix backend --omit=dev
if ($LASTEXITCODE -ne 0) { throw "Backend install failed" }

# Ship a safe default env inside the packaged backend folder copy source
$envExample = Join-Path $root "backend\.env.example"
$envTarget = Join-Path $root "backend\.env.desktop"
@"
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/benro_real_estate
JWT_SECRET=benro_desktop_jwt_secret_change_me
JWT_EXPIRES_IN=7d
CLIENT_ORIGIN=*
UPLOAD_DIR=uploads
"@ | Set-Content -Path $envTarget -Encoding UTF8

Write-Host "==> Installing desktop packager..." -ForegroundColor Cyan
npm install --prefix desktop
if ($LASTEXITCODE -ne 0) { throw "Desktop install failed" }

Write-Host "==> Creating Windows installer / portable .exe..." -ForegroundColor Cyan
$env:CSC_IDENTITY_AUTO_DISCOVERY = "false"
npm run dist --prefix desktop
if ($LASTEXITCODE -ne 0) { throw "electron-builder failed" }

$release = Join-Path $root "desktop\dist-installer"
Write-Host ""
Write-Host "Done. Installer / portable app is in:" -ForegroundColor Green
Write-Host "  $release"
Get-ChildItem $release -Filter "*.exe" | ForEach-Object { Write-Host "  -> $($_.FullName)" -ForegroundColor Yellow }
Write-Host ""
Write-Host "Install that .exe like any downloaded Windows app (Desktop + Start Menu shortcuts)."
Write-Host "Requires MongoDB running on this PC for data."
