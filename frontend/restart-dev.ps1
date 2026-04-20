# Script pour redémarrer proprement l'environnement de développement

Write-Host "🧹 Nettoyage de l'environnement de développement..." -ForegroundColor Yellow

# Arrêter tous les processus Node.js
Write-Host "1. Arrêt des processus Node.js..." -ForegroundColor Cyan
Stop-Process -Name "node" -Force -ErrorAction SilentlyContinue

# Supprimer les caches
Write-Host "2. Suppression des caches..." -ForegroundColor Cyan
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force node_modules/.cache -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force $env:TEMP\next-* -ErrorAction SilentlyContinue

# Nettoyer le cache npm
Write-Host "3. Nettoyage du cache npm..." -ForegroundColor Cyan
npm cache clean --force

# Attendre un peu
Write-Host "4. Attente de 3 secondes..." -ForegroundColor Cyan
Start-Sleep -Seconds 3

# Redémarrer le serveur de développement
Write-Host "5. Redémarrage du serveur de développement..." -ForegroundColor Green
Write-Host "   Vous pouvez maintenant exécuter: npm run dev" -ForegroundColor Green

Write-Host "✅ Nettoyage terminé!" -ForegroundColor Green
Write-Host "💡 Conseil: Attendez que le serveur backend soit démarré avant de lancer le frontend" -ForegroundColor Yellow