#!/usr/bin/env pwsh

Write-Host "Testing JWT Authentication Implementation..." -ForegroundColor Green

# Test 1: Check if all required files exist
Write-Host "`nChecking required files..." -ForegroundColor Yellow

$requiredFiles = @(
    "Models/Utilisateur.cs",
    "Models/RefreshToken.cs", 
    "Models/BlacklistedToken.cs",
    "Services/IJwtService.cs",
    "Services/JwtService.cs",
    "Services/TokenCleanupService.cs",
    "DTO/AuthResponseDTO.cs",
    "DTO/RefreshTokenDTO.cs",
    "DTO/RegisterClientDTO.cs",
    "Controllers/AuthentificationController.cs",
    "Middleware/JwtBlacklistMiddleware.cs"
)

$missingFiles = @()
foreach ($file in $requiredFiles) {
    if (Test-Path $file) {
        Write-Host "✓ $file" -ForegroundColor Green
    } else {
        Write-Host "✗ $file" -ForegroundColor Red
        $missingFiles += $file
    }
}

if ($missingFiles.Count -eq 0) {
    Write-Host "`nAll required files are present!" -ForegroundColor Green
} else {
    Write-Host "`nMissing files:" -ForegroundColor Red
    $missingFiles | ForEach-Object { Write-Host "  - $_" -ForegroundColor Red }
}

# Test 2: Try to restore packages
Write-Host "`nRestoring NuGet packages..." -ForegroundColor Yellow
try {
    $restoreResult = dotnet restore 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Package restore successful" -ForegroundColor Green
    } else {
        Write-Host "✗ Package restore failed:" -ForegroundColor Red
        Write-Host $restoreResult -ForegroundColor Red
    }
} catch {
    Write-Host "✗ Error during package restore: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: Try to build
Write-Host "`nBuilding project..." -ForegroundColor Yellow
try {
    $buildResult = dotnet build --no-restore 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Build successful!" -ForegroundColor Green
        Write-Host "`n🎉 JWT Authentication implementation is ready!" -ForegroundColor Green
    } else {
        Write-Host "✗ Build failed:" -ForegroundColor Red
        Write-Host $buildResult -ForegroundColor Red
    }
} catch {
    Write-Host "✗ Error during build: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`nTest completed." -ForegroundColor Cyan
