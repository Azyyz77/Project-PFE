/**
 * Script de test pour l'endpoint des statistiques de revenus
 * Vérifie la structure des tables et teste la requête
 */

const { getConnection, sql } = require('../config/database');

async function testRevenueStats() {
  try {
    console.log('🔍 Test des statistiques de revenus...\n');

    const pool = await getConnection();

    // 1. Vérifier l'existence des tables
    console.log('1️⃣  Vérification des tables...');
    const tablesResult = await pool.request().query(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_NAME IN ('Facture', 'CommandeReparation', 'LigneCommandeReparation', 'Agence')
      ORDER BY TABLE_NAME
    `);
    console.log('Tables trouvées:', tablesResult.recordset.map(r => r.TABLE_NAME));

    // 2. Vérifier les colonnes de Facture
    console.log('\n2️⃣  Colonnes de la table Facture:');
    const factureColumnsResult = await pool.request().query(`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = 'Facture'
      ORDER BY ORDINAL_POSITION
    `);
    console.table(factureColumnsResult.recordset);

    // 3. Vérifier les colonnes de CommandeReparation
    console.log('\n3️⃣  Colonnes de la table CommandeReparation:');
    const commandeColumnsResult = await pool.request().query(`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = 'CommandeReparation'
      ORDER BY ORDINAL_POSITION
    `);
    console.table(commandeColumnsResult.recordset);

    // 4. Compter les données
    console.log('\n4️⃣  Nombre d\'enregistrements:');
    const countResult = await pool.request().query(`
      SELECT 
        (SELECT COUNT(*) FROM Facture) AS nb_factures,
        (SELECT COUNT(*) FROM CommandeReparation) AS nb_commandes,
        (SELECT COUNT(*) FROM LigneCommandeReparation) AS nb_lignes,
        (SELECT COUNT(*) FROM Agence) AS nb_agences
    `);
    console.table(countResult.recordset);

    // 5. Tester la requête de revenus globaux
    console.log('\n5️⃣  Test de la requête de revenus globaux:');
    try {
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
      console.log('✅ Requête réussie!');
      console.table(revenueResult.recordset);
    } catch (error) {
      console.error('❌ Erreur dans la requête:', error.message);
      
      // Vérifier si la colonne montant_ttc existe
      const checkMontantTTC = await pool.request().query(`
        SELECT COLUMN_NAME
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_NAME = 'Facture' AND COLUMN_NAME = 'montant_ttc'
      `);
      
      if (checkMontantTTC.recordset.length === 0) {
        console.log('\n⚠️  La colonne montant_ttc n\'existe pas dans Facture');
        console.log('Colonnes disponibles:');
        const availableColumns = await pool.request().query(`
          SELECT COLUMN_NAME
          FROM INFORMATION_SCHEMA.COLUMNS
          WHERE TABLE_NAME = 'Facture'
          ORDER BY ORDINAL_POSITION
        `);
        console.log(availableColumns.recordset.map(r => r.COLUMN_NAME).join(', '));
      }
    }

    // 6. Afficher quelques exemples de factures
    console.log('\n6️⃣  Exemples de factures (5 premières):');
    const sampleFactures = await pool.request().query(`
      SELECT TOP 5 * FROM Facture ORDER BY id DESC
    `);
    if (sampleFactures.recordset.length > 0) {
      console.table(sampleFactures.recordset);
    } else {
      console.log('⚠️  Aucune facture trouvée');
    }

    console.log('\n✅ Test terminé!');

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    process.exit(0);
  }
}

// Exécuter le test
testRevenueStats();
