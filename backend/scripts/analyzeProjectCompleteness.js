/**
 * Script d'analyse de complétude du projet PFE
 * Identifie les tables non utilisées et les fonctionnalités manquantes
 */

const { getConnection, sql } = require('../config/database');
const fs = require('fs');
const path = require('path');

async function analyzeProject() {
  console.log('============================================================================');
  console.log('ANALYSE DE COMPLÉTUDE DU PROJET PFE');
  console.log('============================================================================');
  console.log('');

  try {
    const pool = await getConnection();
    
    // ========================================================================
    // 1. LISTER TOUTES LES TABLES
    // ========================================================================
    console.log('📊 1. EXTRACTION DES TABLES DE LA BASE DE DONNÉES');
    console.log('----------------------------------------------------------------------------');
    
    const tablesResult = await pool.request().query(`
      SELECT 
        t.name AS table_name,
        (SELECT COUNT(*) FROM sys.columns c WHERE c.object_id = t.object_id) AS column_count,
        (SELECT COUNT(*) 
         FROM sys.foreign_keys fk 
         WHERE fk.parent_object_id = t.object_id) AS fk_count
      FROM sys.tables t
      WHERE t.is_ms_shipped = 0
      ORDER BY t.name
    `);
    
    const allTables = tablesResult.recordset.map(t => t.table_name);
    console.log(`   ✅ ${allTables.length} tables trouvées\n`);

    // ========================================================================
    // 2. ANALYSER LES CONTROLLERS
    // ========================================================================
    console.log('📁 2. ANALYSE DES CONTROLLERS BACKEND');
    console.log('----------------------------------------------------------------------------');
    
    const controllersDir = path.join(__dirname, '../controllers');
    const controllerFiles = fs.readdirSync(controllersDir).filter(f => f.endsWith('.js'));
    
    console.log(`   ✅ ${controllerFiles.length} controllers trouvés`);
    
    // Extraire les tables mentionnées dans les controllers
    const tablesInControllers = new Set();
    for (const file of controllerFiles) {
      const content = fs.readFileSync(path.join(controllersDir, file), 'utf8');
      
      // Rechercher les noms de tables dans les requêtes SQL
      allTables.forEach(table => {
        if (content.includes(table)) {
          tablesInControllers.add(table);
        }
      });
    }
    
    console.log(`   ✅ ${tablesInControllers.size} tables utilisées dans les controllers\n`);

    // ========================================================================
    // 3. ANALYSER LES ROUTES
    // ========================================================================
    console.log('🛣️  3. ANALYSE DES ROUTES BACKEND');
    console.log('----------------------------------------------------------------------------');
    
    const routesDir = path.join(__dirname, '../routes');
    const routeFiles = fs.readdirSync(routesDir).filter(f => f.endsWith('.js'));
    
    console.log(`   ✅ ${routeFiles.length} fichiers de routes trouvés\n`);

    // ========================================================================
    // 4. IDENTIFIER LES TABLES NON UTILISÉES
    // ========================================================================
    console.log('❌ 4. TABLES NON UTILISÉES DANS LE BACKEND');
    console.log('----------------------------------------------------------------------------');
    
    const unusedTables = allTables.filter(t => !tablesInControllers.has(t));
    
    if (unusedTables.length === 0) {
      console.log('   ✅ Toutes les tables sont utilisées!\n');
    } else {
      console.log(`   ⚠️  ${unusedTables.length} tables NON utilisées:\n`);
      unusedTables.forEach((table, index) => {
        console.log(`   ${index + 1}. ${table}`);
      });
      console.log('');
    }

    // ========================================================================
    // 5. ANALYSER LES VUES
    // ========================================================================
    console.log('👁️  5. ANALYSE DES VUES');
    console.log('----------------------------------------------------------------------------');
    
    const viewsResult = await pool.request().query(`
      SELECT v.name AS view_name
      FROM sys.views v
      WHERE v.is_ms_shipped = 0
      ORDER BY v.name
    `);
    
    const allViews = viewsResult.recordset.map(v => v.view_name);
    console.log(`   ✅ ${allViews.length} vues trouvées`);
    
    const viewsInControllers = new Set();
    for (const file of controllerFiles) {
      const content = fs.readFileSync(path.join(controllersDir, file), 'utf8');
      allViews.forEach(view => {
        if (content.includes(view)) {
          viewsInControllers.add(view);
        }
      });
    }
    
    const unusedViews = allViews.filter(v => !viewsInControllers.has(v));
    if (unusedViews.length > 0) {
      console.log(`   ⚠️  ${unusedViews.length} vues NON utilisées:`);
      unusedViews.forEach(view => console.log(`      - ${view}`));
    }
    console.log('');

    // ========================================================================
    // 6. ANALYSER LES PAGES FRONTEND
    // ========================================================================
    console.log('🎨 6. ANALYSE DES PAGES FRONTEND');
    console.log('----------------------------------------------------------------------------');
    
    const frontendAppDir = path.join(__dirname, '../../frontend/app');
    let pageCount = 0;
    
    function countPages(dir) {
      if (!fs.existsSync(dir)) return;
      const items = fs.readdirSync(dir);
      items.forEach(item => {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
          countPages(fullPath);
        } else if (item === 'page.tsx' || item === 'page.ts') {
          pageCount++;
        }
      });
    }
    
    countPages(frontendAppDir);
    console.log(`   ✅ ${pageCount} pages frontend trouvées\n`);

    // ========================================================================
    // 7. GÉNÉRER LE RAPPORT
    // ========================================================================
    console.log('📝 7. GÉNÉRATION DU RAPPORT D\'ANALYSE');
    console.log('----------------------------------------------------------------------------');
    
    const report = {
      date: new Date().toISOString(),
      database: {
        total_tables: allTables.length,
        used_tables: tablesInControllers.size,
        unused_tables: unusedTables.length,
        total_views: allViews.length,
        unused_views: unusedViews.length
      },
      backend: {
        controllers: controllerFiles.length,
        routes: routeFiles.length
      },
      frontend: {
        pages: pageCount
      },
      unused_tables: unusedTables,
      unused_views: unusedViews,
      all_tables: allTables,
      used_tables: Array.from(tablesInControllers)
    };

    // Sauvegarder le rapport JSON
    const reportPath = path.join(__dirname, '../../docs/analysis_report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');
    console.log(`   ✅ Rapport JSON: ${reportPath}\n`);

    // ========================================================================
    // 8. GÉNÉRER LE RAPPORT MARKDOWN
    // ========================================================================
    let markdown = '# Rapport d\'Analyse de Complétude du Projet PFE\n\n';
    markdown += `**Date**: ${new Date().toLocaleString('fr-FR')}\n\n`;
    markdown += '---\n\n';
    
    markdown += '## 📊 Résumé\n\n';
    markdown += '| Catégorie | Total | Utilisés | Non Utilisés | Taux d\'Utilisation |\n';
    markdown += '|-----------|-------|----------|--------------|--------------------|\n';
    markdown += `| Tables | ${allTables.length} | ${tablesInControllers.size} | ${unusedTables.length} | ${Math.round((tablesInControllers.size / allTables.length) * 100)}% |\n`;
    markdown += `| Vues | ${allViews.length} | ${viewsInControllers.size} | ${unusedViews.length} | ${allViews.length > 0 ? Math.round((viewsInControllers.size / allViews.length) * 100) : 0}% |\n`;
    markdown += `| Controllers | ${controllerFiles.length} | - | - | - |\n`;
    markdown += `| Routes | ${routeFiles.length} | - | - | - |\n`;
    markdown += `| Pages Frontend | ${pageCount} | - | - | - |\n\n`;
    
    markdown += '---\n\n';
    
    if (unusedTables.length > 0) {
      markdown += '## ❌ Tables Non Utilisées\n\n';
      markdown += `**Total**: ${unusedTables.length} tables\n\n`;
      unusedTables.forEach((table, index) => {
        markdown += `${index + 1}. **${table}**\n`;
      });
      markdown += '\n---\n\n';
    }
    
    if (unusedViews.length > 0) {
      markdown += '## 👁️ Vues Non Utilisées\n\n';
      unusedViews.forEach(view => {
        markdown += `- ${view}\n`;
      });
      markdown += '\n---\n\n';
    }
    
    markdown += '## ✅ Tables Utilisées\n\n';
    markdown += `**Total**: ${tablesInControllers.size} tables\n\n`;
    Array.from(tablesInControllers).sort().forEach((table, index) => {
      markdown += `${index + 1}. ${table}\n`;
    });
    markdown += '\n---\n\n';
    
    markdown += '## 📋 Recommandations\n\n';
    
    if (unusedTables.length > 0) {
      markdown += '### Tables Non Utilisées\n\n';
      markdown += 'Les tables suivantes ne sont pas utilisées dans le backend:\n\n';
      unusedTables.forEach(table => {
        markdown += `- **${table}**: Créer un controller et des routes pour cette table\n`;
      });
      markdown += '\n';
    }
    
    markdown += '### Actions Recommandées\n\n';
    markdown += '1. ✅ Créer des controllers pour les tables non utilisées\n';
    markdown += '2. ✅ Créer des routes API pour chaque controller\n';
    markdown += '3. ✅ Créer des pages frontend pour gérer ces entités\n';
    markdown += '4. ✅ Ajouter des tests pour les nouvelles fonctionnalités\n';
    markdown += '5. ✅ Documenter les nouvelles API\n\n';

    const mdPath = path.join(__dirname, '../../docs/ANALYSIS_REPORT.md');
    fs.writeFileSync(mdPath, markdown, 'utf8');
    console.log(`   ✅ Rapport Markdown: ${mdPath}\n`);

    // ========================================================================
    // 9. AFFICHER LE RÉSUMÉ
    // ========================================================================
    console.log('============================================================================');
    console.log('📈 RÉSUMÉ DE L\'ANALYSE');
    console.log('============================================================================');
    console.log('');
    console.log(`📊 Base de Données:`);
    console.log(`   - Tables totales: ${allTables.length}`);
    console.log(`   - Tables utilisées: ${tablesInControllers.size} (${Math.round((tablesInControllers.size / allTables.length) * 100)}%)`);
    console.log(`   - Tables NON utilisées: ${unusedTables.length}`);
    console.log(`   - Vues totales: ${allViews.length}`);
    console.log(`   - Vues NON utilisées: ${unusedViews.length}`);
    console.log('');
    console.log(`🔧 Backend:`);
    console.log(`   - Controllers: ${controllerFiles.length}`);
    console.log(`   - Routes: ${routeFiles.length}`);
    console.log('');
    console.log(`🎨 Frontend:`);
    console.log(`   - Pages: ${pageCount}`);
    console.log('');
    
    if (unusedTables.length > 0) {
      console.log(`⚠️  ATTENTION: ${unusedTables.length} tables ne sont pas utilisées!`);
      console.log('');
      console.log('💡 Recommandation: Créer des controllers et routes pour:');
      unusedTables.slice(0, 5).forEach(table => {
        console.log(`   - ${table}`);
      });
      if (unusedTables.length > 5) {
        console.log(`   ... et ${unusedTables.length - 5} autres`);
      }
    } else {
      console.log('✅ Toutes les tables sont utilisées!');
    }
    
    console.log('');
    console.log('============================================================================');
    console.log('✅ ANALYSE TERMINÉE');
    console.log('============================================================================');
    console.log('');
    console.log('📁 Fichiers générés:');
    console.log(`   - ${reportPath}`);
    console.log(`   - ${mdPath}`);
    console.log('');

  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

// Exécuter l'analyse
analyzeProject()
  .then(() => {
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Erreur fatale:', error);
    process.exit(1);
  });
