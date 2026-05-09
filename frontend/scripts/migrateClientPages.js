/**
 * Script pour migrer automatiquement les pages client vers le nouveau design
 * Usage: node frontend/scripts/migrateClientPages.js
 */

const fs = require('fs');
const path = require('path');

const clientPagesDir = path.join(__dirname, '../app/client');

// Pages à migrer (par priorité)
const pagesToMigrate = [
  'dashboard/page.tsx',
  'vehicles/page.tsx',
  'repair-orders/page.tsx',
  'invoices/page.tsx',
  'rendez-vous/page.tsx',
  'profile/page.tsx',
  'complaints/page.tsx',
  'documents/page.tsx',
  'feedback/page.tsx',
  'catalog/page.tsx',
  'promotions/page.tsx',
  'vehicle-history/page.tsx',
  'chatbot/page.tsx',
  'assistance/page.tsx',
  'informations/page.tsx',
];

function migratePage(pagePath) {
  const fullPath = path.join(clientPagesDir, pagePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  Page non trouvée: ${pagePath}`);
    return false;
  }

  let content = fs.readFileSync(fullPath, 'utf-8');
  let modified = false;

  // 1. Ajouter les imports des composants client si pas déjà présents
  if (!content.includes('@/components/client')) {
    const importStatement = `import {
  ClientPageWrapper,
  ClientPageHeader,
  ClientButton,
  ClientCard,
  ClientLoadingState,
  ClientErrorState,
  ClientEmptyState,
} from '@/components/client';\n`;
    
    // Insérer après les autres imports
    const lastImportIndex = content.lastIndexOf('import ');
    if (lastImportIndex !== -1) {
      const endOfLine = content.indexOf('\n', lastImportIndex);
      content = content.slice(0, endOfLine + 1) + importStatement + content.slice(endOfLine + 1);
      modified = true;
    }
  }

  // 2. Remplacer les fonds non-standard
  const backgroundReplacements = [
    { from: /className="[^"]*bg-gray-900[^"]*"/g, to: (match) => match.replace('bg-gray-900', 'bg-slate-950') },
    { from: /className="[^"]*bg-gray-800[^"]*"/g, to: (match) => match.replace('bg-gray-800', 'bg-slate-900') },
    { from: /className="[^"]*bg-slate-800[^"]*"/g, to: (match) => match.replace('bg-slate-800', 'bg-slate-900') },
  ];

  backgroundReplacements.forEach(({ from, to }) => {
    if (from.test(content)) {
      content = content.replace(from, to);
      modified = true;
    }
  });

  // 3. Remplacer les boutons non-bleus par des boutons bleus
  const buttonReplacements = [
    { from: /className="[^"]*bg-green-[56]00[^"]*"/g, to: (match) => match.replace(/bg-green-[56]00/, 'bg-blue-600') },
    { from: /className="[^"]*bg-red-[56]00[^"]*"/g, to: (match) => match.replace(/bg-red-[56]00/, 'bg-blue-600') },
    { from: /className="[^"]*bg-purple-[56]00[^"]*"/g, to: (match) => match.replace(/bg-purple-[56]00/, 'bg-blue-600') },
    { from: /hover:bg-green-[67]00/g, to: 'hover:bg-blue-700' },
    { from: /hover:bg-red-[67]00/g, to: 'hover:bg-blue-700' },
    { from: /hover:bg-purple-[67]00/g, to: 'hover:bg-blue-700' },
  ];

  buttonReplacements.forEach(({ from, to }) => {
    if (from.test(content)) {
      content = content.replace(from, to);
      modified = true;
    }
  });

  if (modified) {
    // Créer un backup
    const backupPath = fullPath + '.backup';
    fs.writeFileSync(backupPath, fs.readFileSync(fullPath));
    
    // Écrire le nouveau contenu
    fs.writeFileSync(fullPath, content);
    console.log(`✅ Migré: ${pagePath}`);
    console.log(`   Backup créé: ${pagePath}.backup`);
    return true;
  } else {
    console.log(`ℹ️  Aucune modification nécessaire: ${pagePath}`);
    return false;
  }
}

function main() {
  console.log('🚀 Migration des pages client vers le nouveau design\n');
  console.log('='.repeat(60));
  
  let migratedCount = 0;
  let skippedCount = 0;
  let notFoundCount = 0;

  pagesToMigrate.forEach((pagePath, index) => {
    console.log(`\n[${index + 1}/${pagesToMigrate.length}] ${pagePath}`);
    
    const fullPath = path.join(clientPagesDir, pagePath);
    if (!fs.existsSync(fullPath)) {
      console.log(`   ⚠️  Fichier non trouvé`);
      notFoundCount++;
      return;
    }

    const result = migratePage(pagePath);
    if (result) {
      migratedCount++;
    } else {
      skippedCount++;
    }
  });

  console.log('\n' + '='.repeat(60));
  console.log('\n📊 RÉSUMÉ:');
  console.log(`   Pages migrées: ${migratedCount}`);
  console.log(`   Pages ignorées: ${skippedCount}`);
  console.log(`   Pages non trouvées: ${notFoundCount}`);
  console.log(`   Total: ${pagesToMigrate.length}`);
  
  console.log('\n💡 PROCHAINES ÉTAPES:');
  console.log('   1. Vérifier les pages migrées');
  console.log('   2. Tester sur mobile, tablette, desktop');
  console.log('   3. Relancer l\'analyse: node frontend/scripts/analyzeClientPages.js');
  console.log('   4. Si problème, restaurer depuis les .backup\n');
}

main();
