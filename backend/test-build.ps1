#!/usr/bin/env pwsh

Write-Host "🔧 Test de compilation du projet JWT..." -ForegroundColor Green

Write-Host "`n📋 Vérification des fichiers modifiés..." -ForegroundColor Yellow

$modifiedFiles = @(
    "Controllers/AuthentificationController.cs",
    "Models/Utilisateur.cs", 
    "Data/ApplicationDbContext.cs",
    "Services/JwtService.cs",
    "Program.cs"
)

foreach ($file in $modifiedFiles) {
    if (Test-Path $file) {
        Write-Host "✅ $file" -ForegroundColor Green
    } else {
        Write-Host "❌ $file" -ForegroundColor Red
    }
}

Write-Host "`n🔨 Tentative de compilation..." -ForegroundColor Yellow

try {
    # Nettoyer le projet
    Write-Host "   Nettoyage du projet..." -ForegroundColor Cyan
    dotnet clean > $null 2>&1
    
    # Restaurer les packages
    Write-Host "   Restauration des packages..." -ForegroundColor Cyan
    $restoreOutput = dotnet restore 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ Packages restaurés avec succès" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Erreur lors de la restauration:" -ForegroundColor Red
        Write-Host $restoreOutput -ForegroundColor Red
        exit 1
    }
    
    # Compiler le projet
    Write-Host "   Compilation du projet..." -ForegroundColor Cyan
    $buildOutput = dotnet build --no-restore 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "`n🎉 COMPILATION RÉUSSIE!" -ForegroundColor Green
        Write-Host "✅ L'authentification JWT est prête à être testée!" -ForegroundColor Green
        
        Write-Host "`n🚀 Prochaines étapes:" -ForegroundColor Yellow
        Write-Host "1. Démarrez l'API: dotnet run" -ForegroundColor White
        Write-Host "2. Testez la connexion avec khalilF/khalil123" -ForegroundColor White
        Write-Host "3. Vérifiez que vous recevez un token JWT" -ForegroundColor White
        
    } else {
        Write-Host "`n❌ ERREURS DE COMPILATION:" -ForegroundColor Red
        Write-Host $buildOutput -ForegroundColor Red
        
        Write-Host "`n🔍 Erreurs communes et solutions:" -ForegroundColor Yellow
        Write-Host "- Si 'RefreshTokens' non trouvé: Vérifiez ApplicationDbContext.cs" -ForegroundColor White
        Write-Host "- Si 'DateCreation' non trouvé: Vérifiez Utilisateur.cs" -ForegroundColor White
        Write-Host "- Si erreurs de namespace: Vérifiez les using statements" -ForegroundColor White
    }
    
} catch {
    Write-Host "`n❌ ERREUR LORS DE LA COMPILATION:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
}

Write-Host "`n📖 Aide:" -ForegroundColor Cyan
Write-Host "Si des erreurs persistent, consultez QUICK_FIX_GUIDE.md" -ForegroundColor White
