/**
 * Script pour tester l'endpoint des statistiques de revenus
 * et voir l'erreur SQL exacte
 */

const { getConnection, sql } = require('../config/database');

async function testRevenueEndpoint() {
  console.log('🔍 Test de l\'endpoint des statistiques de revenus...\n');

  try {
    const pool = await getConnection();
    console.log('✅ Connexion à la base de données réussie\n');

    // Test 1: Vérifier que les tables existent
    console.log('📋 Test 1: Vérification des tables...');
    const tablesResult = await pool.request().query(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_NAME IN ('Facture', 'CommandeReparation', 'LigneCommandeReparation', 'Agence')
      ORDER BY TABLE_NAME
    `);
    
    console.log('Tables trouvées:', tablesResult.recordset.map(r => r.TABLE_NAME));
    
    if (tablesResult.recordset.length < 4) {
      console.log('❌ Certaines tables sont manquantes!');
      return;
    }
    console.log('✅ Toutes les tables existent\n');

    // Test 2: Vérifier les colonnes de Facture
    console.log('📋 Test 2: Vérification des colonnes de Facture...');
    const factureColumnsResult = await pool.request().query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'Facture'
      ORDER BY COLUMN_NAME
    `);
    
    const factureColumns = factureColumnsResult.recordset.map(r => r.COLUMN_NAME);
    console.log('Colonnes de Facture:', factureColumns.join(', '));
    
    const requiredColumns = ['montant_ttc', 'montant_ht', 'montant_tva', 'date_emission', 'commande_id'];
    const missingColumns = requiredColumns.filter(col => !factureColumns.includes(col));
    
    if (missingColumns.length > 0) {
      console.log('❌ Colonnes manquantes:', missingColumns.join(', '));
      return;
    }
    console.log('✅ Toutes les colonnes nécessaires existent\n');

    // Test 3: Vérifier agence_id dans CommandeReparation
    console.log('📋 Test 3: Vérification de agence_id dans CommandeReparation...');
    const commandeColumnsResult = await pool.request().query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'CommandeReparation' AND COLUMN_NAME = 'agence_id'
    `);
    
    if (commandeColumnsResult.recordset.length === 0) {
      console.log('❌ Colonne agence_id manquante dans CommandeReparation');
      return;
    }
    console.log('✅ Colonne agence_id existe\n');

    // Test 4: Exécuter la requête de revenus globaux
    console.log('📋 Test 4: Exécution de la requête de revenus...');
    const revenueResult = await pool.request().query(`
      SELECT 
        COUNT(f.id) AS total_factures,
        SUM(ISNULL(f.montant_ttc, 0)) AS revenu_total,
        AVG(ISNULL(f.montant_ttc, 0)) AS revenu_moyen,
        MIN(ISNULL(f.montant_ttc, 0)) AS revenu_min,
        MAX(ISNULL(f.montant_ttc, 0)) AS revenu_max,
        SUM(CASE WHEN f.statut = 'PAYEE' THEN ISNULL(f.montant_ttc, 0) ELSE 0 END) AS revenu_paye,
        SUM(CASE WHEN f.statut IN ('EMISE', 'ENVOYEE') THEN ISNULL(f.montant_ttc, 0) ELSE 0 END) AS revenu_impaye
      FROM Facture f
      LEFT JOIN CommandeReparation c ON f.commande_id = c.id
    `);

    console.log('✅ Requête exécutée avec succès!');
    console.log('\n📊 Résultats:');
    console.log(JSON.stringify(revenueResult.recordset[0], null, 2));
    console.log('\n');

    // Test 5: Revenus par agence
    console.log('📋 Test 5: Revenus par agence...');
    const revenueByAgencyResult = await pool.request().query(`
      SELECT 
        ag.id AS agence_id,
        ag.nom AS agence_nom,
        COUNT(f.id) AS total_factures,
        SUM(ISNULL(f.montant_ttc, 0)) AS revenu_total
      FROM Agence ag
      LEFT JOIN CommandeReparation c ON c.agence_id = ag.id
      LEFT JOIN Facture f ON f.commande_id = c.id
      GROUP BY ag.id, ag.nom
      HAVING COUNT(f.id) > 0
      ORDER BY revenu_total DESC
    `);

    console.log('✅ Requête par agence exécutée avec succès!');
    console.log('\n📊 Résultats par agence:');
    console.log(JSON.stringify(revenueByAgencyResult.recordset, null, 2));
    console.log('\n');

    console.log('✅✅✅ TOUS LES TESTS RÉUSSIS! ✅✅✅');
    console.log('\nLe backend devrait fonctionner correctement.');
    console.log('Si l\'erreur persiste, vérifiez:');
    console.log('1. Que le backend est bien redémarré');
    console.log('2. Les logs du backend pour voir l\'erreur exacte');
    console.log('3. Que vous êtes connecté à la bonne base de données (STA_SAV_DB)');

  } catch (error) {
    console.error('\n❌ ERREUR:', error.message);
    console.error('\nDétails:', error);
    
    if (error.message.includes('Invalid object name')) {
      console.log('\n💡 Solution: Une table est manquante ou mal nommée.');
      console.log('   Vérifiez que les tables Facture, CommandeReparation, et Agence existent.');
    } else if (error.message.includes('Invalid column name')) {
      console.log('\n💡 Solution: Une colonne est manquante.');
      console.log('   Exécutez: backend/migrations/add_taux_tva_simple.sql');
    }
  } finally {
    process.exit();
  }
}

// Exécuter le test
testRevenueEndpoint();
