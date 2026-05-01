/**
 * Script de test pour le système d'information
 * Vérifie l'état de la base de données et teste les API
 */

const sql = require('mssql');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_NAME,
  options: {
    encrypt: true,
    trustServerCertificate: true,
    enableArithAbort: true
  }
};

async function testInformationSystem() {
  console.log('='.repeat(80));
  console.log('TEST DU SYSTÈME D\'INFORMATION');
  console.log('='.repeat(80));
  console.log('');

  try {
    // Connexion à la base de données
    console.log('📡 Connexion à la base de données...');
    const pool = await sql.connect(config);
    console.log('✅ Connecté à:', config.database);
    console.log('');

    // Test 1: Vérifier l'existence des tables
    console.log('1️⃣  VÉRIFICATION DES TABLES');
    console.log('-'.repeat(80));
    
    const tables = ['SectionInformation', 'ContenuInformation', 'DocumentTelecharge'];
    for (const table of tables) {
      const result = await pool.request().query(`
        SELECT COUNT(*) as count 
        FROM INFORMATION_SCHEMA.TABLES 
        WHERE TABLE_NAME = '${table}'
      `);
      
      if (result.recordset[0].count > 0) {
        console.log(`✅ Table ${table} existe`);
      } else {
        console.log(`❌ Table ${table} n'existe pas`);
      }
    }
    console.log('');

    // Test 2: Vérifier l'existence de la vue
    console.log('2️⃣  VÉRIFICATION DE LA VUE');
    console.log('-'.repeat(80));
    
    const viewResult = await pool.request().query(`
      SELECT COUNT(*) as count 
      FROM INFORMATION_SCHEMA.VIEWS 
      WHERE TABLE_NAME = 'VueSectionsInformation'
    `);
    
    if (viewResult.recordset[0].count > 0) {
      console.log('✅ Vue VueSectionsInformation existe');
    } else {
      console.log('❌ Vue VueSectionsInformation n\'existe pas');
    }
    console.log('');

    // Test 3: Compter les enregistrements
    console.log('3️⃣  COMPTAGE DES ENREGISTREMENTS');
    console.log('-'.repeat(80));
    
    try {
      const sectionsCount = await pool.request().query('SELECT COUNT(*) as count FROM SectionInformation');
      console.log(`📊 Sections: ${sectionsCount.recordset[0].count}`);
      
      const contentsCount = await pool.request().query('SELECT COUNT(*) as count FROM ContenuInformation');
      console.log(`📊 Contenus: ${contentsCount.recordset[0].count}`);
      
      const documentsCount = await pool.request().query('SELECT COUNT(*) as count FROM DocumentTelecharge');
      console.log(`📊 Documents: ${documentsCount.recordset[0].count}`);
    } catch (error) {
      console.log('❌ Erreur lors du comptage:', error.message);
    }
    console.log('');

    // Test 4: Afficher les sections
    console.log('4️⃣  LISTE DES SECTIONS');
    console.log('-'.repeat(80));
    
    try {
      const sections = await pool.request().query(`
        SELECT id, titre, slug, icone, ordre, actif 
        FROM SectionInformation 
        ORDER BY ordre
      `);
      
      if (sections.recordset.length > 0) {
        sections.recordset.forEach(section => {
          const status = section.actif ? '✅' : '❌';
          console.log(`${status} [${section.ordre}] ${section.titre} (${section.slug}) - Icône: ${section.icone || 'Aucune'}`);
        });
      } else {
        console.log('⚠️  Aucune section trouvée');
      }
    } catch (error) {
      console.log('❌ Erreur lors de la récupération des sections:', error.message);
    }
    console.log('');

    // Test 5: Afficher les contenus
    console.log('5️⃣  LISTE DES CONTENUS');
    console.log('-'.repeat(80));
    
    try {
      const contents = await pool.request().query(`
        SELECT c.id, c.titre, s.titre as section_titre, c.ordre, c.actif
        FROM ContenuInformation c
        INNER JOIN SectionInformation s ON c.section_id = s.id
        ORDER BY s.ordre, c.ordre
      `);
      
      if (contents.recordset.length > 0) {
        contents.recordset.forEach(content => {
          const status = content.actif ? '✅' : '❌';
          console.log(`${status} ${content.titre} (Section: ${content.section_titre})`);
        });
      } else {
        console.log('⚠️  Aucun contenu trouvé');
      }
    } catch (error) {
      console.log('❌ Erreur lors de la récupération des contenus:', error.message);
    }
    console.log('');

    // Test 6: Afficher les documents
    console.log('6️⃣  LISTE DES DOCUMENTS');
    console.log('-'.repeat(80));
    
    try {
      const documents = await pool.request().query(`
        SELECT d.id, d.titre, s.titre as section_titre, d.nom_fichier, d.actif
        FROM DocumentTelecharge d
        LEFT JOIN SectionInformation s ON d.section_id = s.id
        ORDER BY s.ordre, d.titre
      `);
      
      if (documents.recordset.length > 0) {
        documents.recordset.forEach(doc => {
          const status = doc.actif ? '✅' : '❌';
          console.log(`${status} ${doc.titre} (${doc.nom_fichier}) - Section: ${doc.section_titre || 'Général'}`);
        });
      } else {
        console.log('⚠️  Aucun document trouvé');
        console.log('💡 Exécutez le script fix_information_documents.sql pour insérer les documents');
      }
    } catch (error) {
      console.log('❌ Erreur lors de la récupération des documents:', error.message);
    }
    console.log('');

    // Test 7: Tester la vue
    console.log('7️⃣  TEST DE LA VUE');
    console.log('-'.repeat(80));
    
    try {
      const viewData = await pool.request().query(`
        SELECT * FROM VueSectionsInformation ORDER BY ordre
      `);
      
      if (viewData.recordset.length > 0) {
        console.log('✅ Vue fonctionne correctement');
        viewData.recordset.forEach(section => {
          console.log(`   ${section.titre}: ${section.nombre_contenus} contenu(s), ${section.nombre_documents} document(s)`);
        });
      } else {
        console.log('⚠️  Vue vide');
      }
    } catch (error) {
      console.log('❌ Erreur lors du test de la vue:', error.message);
    }
    console.log('');

    // Résumé
    console.log('='.repeat(80));
    console.log('📋 RÉSUMÉ');
    console.log('='.repeat(80));
    
    const sectionsCount = await pool.request().query('SELECT COUNT(*) as count FROM SectionInformation');
    const contentsCount = await pool.request().query('SELECT COUNT(*) as count FROM ContenuInformation');
    const documentsCount = await pool.request().query('SELECT COUNT(*) as count FROM DocumentTelecharge');
    
    const totalSections = sectionsCount.recordset[0].count;
    const totalContents = contentsCount.recordset[0].count;
    const totalDocuments = documentsCount.recordset[0].count;
    
    console.log(`✅ Sections: ${totalSections}/5 attendues`);
    console.log(`✅ Contenus: ${totalContents} (minimum 2 attendus)`);
    console.log(`${totalDocuments >= 4 ? '✅' : '⚠️ '} Documents: ${totalDocuments}/4 attendus`);
    console.log('');
    
    if (totalDocuments < 4) {
      console.log('⚠️  ATTENTION: Documents manquants!');
      console.log('💡 Solution: Exécutez le script suivant dans SQL Server Management Studio:');
      console.log('   backend/migrations/fix_information_documents.sql');
      console.log('');
    }
    
    if (totalSections === 5 && totalContents >= 2 && totalDocuments >= 4) {
      console.log('🎉 SYSTÈME D\'INFORMATION COMPLÈTEMENT CONFIGURÉ!');
    } else {
      console.log('⚠️  Configuration incomplète - Vérifiez les migrations');
    }
    
    console.log('='.repeat(80));

    await pool.close();
    
  } catch (error) {
    console.error('❌ ERREUR:', error.message);
    console.error('');
    console.error('Détails:', error);
    process.exit(1);
  }
}

// Exécuter le test
testInformationSystem()
  .then(() => {
    console.log('');
    console.log('✅ Test terminé avec succès');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Test échoué:', error);
    process.exit(1);
  });
