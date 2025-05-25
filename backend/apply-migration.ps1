#!/usr/bin/env pwsh

Write-Host "🔧 Application de la migration JWT Authentication..." -ForegroundColor Green

# Configuration de la base de données
$ServerName = "localhost"
$DatabaseName = "AxiaLivraison"
$ScriptPath = "Scripts/AddJWTAuthentication.sql"

Write-Host "📋 Configuration:" -ForegroundColor Yellow
Write-Host "   Serveur: $ServerName" -ForegroundColor White
Write-Host "   Base de données: $DatabaseName" -ForegroundColor White
Write-Host "   Script: $ScriptPath" -ForegroundColor White

# Vérifier si le script SQL existe
if (-not (Test-Path $ScriptPath)) {
    Write-Host "❌ Erreur: Le script SQL n'existe pas à l'emplacement: $ScriptPath" -ForegroundColor Red
    exit 1
}

Write-Host "`n🚀 Tentative d'application de la migration..." -ForegroundColor Yellow

try {
    # Méthode 1: Utiliser sqlcmd si disponible
    $sqlcmdPath = Get-Command sqlcmd -ErrorAction SilentlyContinue
    if ($sqlcmdPath) {
        Write-Host "   Utilisation de sqlcmd..." -ForegroundColor Cyan
        $result = sqlcmd -S $ServerName -d $DatabaseName -i $ScriptPath -E
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Migration appliquée avec succès via sqlcmd!" -ForegroundColor Green
            Write-Host $result -ForegroundColor White
        } else {
            Write-Host "❌ Erreur lors de l'exécution avec sqlcmd" -ForegroundColor Red
            Write-Host $result -ForegroundColor Red
        }
    } else {
        Write-Host "   sqlcmd non trouvé, tentative avec Invoke-Sqlcmd..." -ForegroundColor Cyan
        
        # Méthode 2: Utiliser Invoke-Sqlcmd si le module SqlServer est installé
        try {
            Import-Module SqlServer -ErrorAction Stop
            $scriptContent = Get-Content $ScriptPath -Raw
            Invoke-Sqlcmd -ServerInstance $ServerName -Database $DatabaseName -Query $scriptContent
            Write-Host "✅ Migration appliquée avec succès via Invoke-Sqlcmd!" -ForegroundColor Green
        } catch {
            Write-Host "❌ Module SqlServer non disponible" -ForegroundColor Red
            Write-Host "💡 Solutions alternatives:" -ForegroundColor Yellow
            Write-Host "   1. Installez SQL Server Management Studio" -ForegroundColor White
            Write-Host "   2. Ouvrez le script Scripts/AddJWTAuthentication.sql" -ForegroundColor White
            Write-Host "   3. Exécutez-le manuellement dans SSMS" -ForegroundColor White
            Write-Host "   4. Ou installez le module PowerShell SqlServer:" -ForegroundColor White
            Write-Host "      Install-Module -Name SqlServer -Force" -ForegroundColor Cyan
        }
    }
} catch {
    Write-Host "❌ Erreur lors de l'application de la migration:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
}

Write-Host "`n📖 Instructions manuelles:" -ForegroundColor Yellow
Write-Host "Si la migration automatique a échoué, suivez ces étapes:" -ForegroundColor White
Write-Host "1. Ouvrez SQL Server Management Studio" -ForegroundColor White
Write-Host "2. Connectez-vous à votre serveur SQL" -ForegroundColor White
Write-Host "3. Sélectionnez la base de données 'AxiaLivraison'" -ForegroundColor White
Write-Host "4. Ouvrez le fichier 'Scripts/AddJWTAuthentication.sql'" -ForegroundColor White
Write-Host "5. Exécutez le script (F5)" -ForegroundColor White
Write-Host "6. Redémarrez votre API backend" -ForegroundColor White

Write-Host "`n🔄 Après la migration:" -ForegroundColor Yellow
Write-Host "1. Redémarrez l'API backend" -ForegroundColor White
Write-Host "2. Testez la connexion avec vos identifiants" -ForegroundColor White
Write-Host "3. Vérifiez que vous recevez des tokens JWT" -ForegroundColor White

Write-Host "`n✨ Migration terminée!" -ForegroundColor Green
