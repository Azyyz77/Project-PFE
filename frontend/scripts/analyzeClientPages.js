/**
 * Script pour analyser les pages client et identifier celles qui nécessitent une mise à jour
 */

const fs = require('fs');
const path = require('path');

const clientPagesDir = path.join(__dirname, '../app/client');

function getAllPages(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      getAllPages(filePath, fileList);
    } else if (file === 'page.tsx') {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

function analyzePage(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const relativePath = path.relative(clientPagesDir, filePath);
  
  const checks = {
    hasClientPageWrapper: content.includes('ClientPageWrapper'),
    hasClientPageHeader: content.includes('ClientPageHeader'),
    hasClientButton: content.includes('ClientButton'),
    hasClientCard: content.includes('ClientCard'),
    hasLoadingState: content.includes('ClientLoadingState') || content.includes('Chargement'),
    hasErrorState: content.includes('ClientErrorState') || content.includes('error'),
    hasEmptyState: content.includes('ClientEmptyState') || content.includes('Aucun'),
    usesClientTheme: content.includes('clientTheme') || content.includes('clientClasses'),
    hasResponsiveClasses: content.includes('sm:') || content.includes('md:') || content.includes('lg:'),
    hasBlueButtons: content.includes('bg-blue-') || content.includes('blue-'),
    hasSlate950Background: content.includes('bg-slate-950'),
  };
  
  const score = Object.values(checks).filter(Boolean).length;
  const total = Object.keys(checks).length;
  const percentage = Math.round((score / total) * 100);
  
  return {
    path: relativePath,
    checks,
    score,
    total,
    percentage,
    needsUpdate: percentage < 80,
  };
}

function generateReport() {
  console.log('🔍 Analyse des pages client...\n');
  
  const pages = getAllPages(clientPagesDir);
  const results = pages.map(analyzePage);
  
  // Trier par pourcentage (les plus faibles en premier)
  results.sort((a, b) => a.percentage - b.percentage);
  
  console.log('📊 RAPPORT D\'ANALYSE\n');
  console.log('='.repeat(80));
  
  // Pages nécessitant une mise à jour
  const needsUpdate = results.filter(r => r.needsUpdate);
  console.log(`\n🔴 Pages nécessitant une mise à jour (${needsUpdate.length}/${results.length}):\n`);
  
  needsUpdate.forEach(result => {
    console.log(`\n📄 ${result.path}`);
    console.log(`   Score: ${result.score}/${result.total} (${result.percentage}%)`);
    console.log('   Manquant:');
    Object.entries(result.checks).forEach(([check, passed]) => {
      if (!passed) {
        console.log(`   ❌ ${check}`);
      }
    });
  });
  
  // Pages conformes
  const compliant = results.filter(r => !r.needsUpdate);
  if (compliant.length > 0) {
    console.log(`\n\n✅ Pages conformes (${compliant.length}/${results.length}):\n`);
    compliant.forEach(result => {
      console.log(`   ${result.path} - ${result.percentage}%`);
    });
  }
  
  // Statistiques globales
  const avgScore = Math.round(results.reduce((sum, r) => sum + r.percentage, 0) / results.length);
  console.log('\n' + '='.repeat(80));
  console.log(`\n📈 STATISTIQUES GLOBALES:`);
  console.log(`   Total de pages: ${results.length}`);
  console.log(`   Pages conformes: ${compliant.length} (${Math.round((compliant.length / results.length) * 100)}%)`);
  console.log(`   Pages à mettre à jour: ${needsUpdate.length} (${Math.round((needsUpdate.length / results.length) * 100)}%)`);
  console.log(`   Score moyen: ${avgScore}%`);
  
  // Recommandations
  console.log(`\n\n💡 RECOMMANDATIONS:\n`);
  console.log('1. Commencez par les pages avec le score le plus faible');
  console.log('2. Utilisez le guide CLIENT_DESIGN_SYSTEM.md pour la migration');
  console.log('3. Testez chaque page sur mobile, tablette et desktop après migration');
  console.log('4. Vérifiez que tous les boutons principaux sont bleus');
  console.log('5. Assurez-vous que le fond est bg-slate-950\n');
  
  // Sauvegarder le rapport
  const reportPath = path.join(__dirname, '../CLIENT_PAGES_ANALYSIS.json');
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
  console.log(`📝 Rapport détaillé sauvegardé dans: ${reportPath}\n`);
}

generateReport();
