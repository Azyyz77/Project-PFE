const { getConnection, sql } = require('./config/database');

async function testInvoicesMy() {
  try {
    console.log('🔍 Test de la route /invoices/my...\n');
    
    const pool = await getConnection();
    const clientId = 3; // ID du client de test
    
    console.log('📊 Test 1: Vérifier la structure de la table Facture');
    const structureResult = await pool.request().query(`
      SELECT 
        COLUMN_NAME,
        DATA_TYPE,
        IS_NULLABLE
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = 'Facture'
      ORDER BY ORDINAL_POSITION
    `);
    
    console.log('Colonnes de la table Facture:');
    structureResult.recordset.forEach(col => {
      console.log(`  - ${col.COLUMN_NAME} (${col.DATA_TYPE}) ${col.IS_NULLABLE === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });
    
    console.log('\n📊 Test 2: Requête simplifiée sans date_echeance');
    try {
      const simpleResult = await pool.request()
        .input('client_id', sql.BigInt, clientId)
        .query(`
          SELECT 
            f.id,
            f.numero,
            f.statut,
            f.montant_ttc,
            f.date_emission,
            f.date_paiement
          FROM Facture f
          JOIN CommandeReparation c ON c.id = f.commande_id
          WHERE c.client_id = @client_id
        `);
      
      console.log(`✅ Requête simplifiée OK - ${simpleResult.recordset.length} factures trouvées`);
      if (simpleResult.recordset.length > 0) {
        console.log('Première facture:', JSON.stringify(simpleResult.recordset[0], null, 2));
      }
    } catch (error) {
      console.error('❌ Erreur requête simplifiée:', error.message);
    }
    
    console.log('\n📊 Test 3: Requête complète avec date_echeance');
    try {
      const fullResult = await pool.request()
        .input('client_id', sql.BigInt, clientId)
        .query(`
          SELECT 
            f.id,
            f.numero,
            f.statut AS statut_paiement,
            f.montant_ttc,
            f.date_emission,
            f.date_echeance,
            f.date_paiement,
            c.numero AS commande_numero,
            v.immatriculation AS vehicule_immatriculation,
            ag.nom AS agence_nom
          FROM Facture f
          JOIN CommandeReparation c ON c.id = f.commande_id
          JOIN Vehicule v ON v.id = c.vehicule_id
          JOIN Agence ag ON ag.id = c.agence_id
          WHERE c.client_id = @client_id
          ORDER BY f.date_emission DESC
        `);
      
      console.log(`✅ Requête complète OK - ${fullResult.recordset.length} factures trouvées`);
      if (fullResult.recordset.length > 0) {
        console.log('Première facture:', JSON.stringify(fullResult.recordset[0], null, 2));
      }
    } catch (error) {
      console.error('❌ Erreur requête complète:', error.message);
      console.error('Détails:', error);
    }
    
    console.log('\n✅ Tests terminés');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

testInvoicesMy();
