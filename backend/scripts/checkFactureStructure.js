const { getConnection, sql } = require('../config/database');

async function checkFactureStructure() {
  try {
    console.log('🔍 Vérification de la structure de la table Facture...\n');
    
    const pool = await getConnection();
    
    // 1. Structure de la table
    console.log('=== COLONNES DE LA TABLE FACTURE ===');
    const columns = await pool.request().query(`
      SELECT 
        c.name AS column_name,
        t.name AS data_type,
        c.max_length,
        c.is_nullable,
        c.is_identity
      FROM sys.columns c
      JOIN sys.types t ON c.user_type_id = t.user_type_id
      WHERE c.object_id = OBJECT_ID('Facture')
      ORDER BY c.column_id
    `);
    console.table(columns.recordset);
    
    // 2. Contraintes UNIQUE
    console.log('\n=== CONTRAINTES UNIQUE ===');
    const constraints = await pool.request().query(`
      SELECT 
        i.name AS constraint_name,
        COL_NAME(ic.object_id, ic.column_id) AS column_name,
        i.is_unique,
        i.is_primary_key
      FROM sys.indexes i
      JOIN sys.index_columns ic ON i.object_id = ic.object_id AND i.index_id = ic.index_id
      WHERE i.object_id = OBJECT_ID('Facture')
        AND (i.is_unique = 1 OR i.is_primary_key = 1)
      ORDER BY i.name, ic.key_ordinal
    `);
    console.table(constraints.recordset);
    
    // 3. Données existantes
    console.log('\n=== DONNÉES EXISTANTES ===');
    const data = await pool.request().query(`SELECT * FROM Facture`);
    console.table(data.recordset);
    
    // 4. Vérifier les commandes sans facture
    console.log('\n=== COMMANDES SANS FACTURE ===');
    const commandesSansFact = await pool.request().query(`
      SELECT 
        c.id,
        c.numero,
        c.statut,
        c.montant_total,
        CASE WHEN f.id IS NULL THEN 'NON' ELSE 'OUI' END AS a_facture
      FROM CommandeReparation c
      LEFT JOIN Facture f ON f.commande_id = c.id
      ORDER BY c.id
    `);
    console.table(commandesSansFact.recordset);
    
    console.log('\n✅ Vérification terminée!');
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    console.error(error);
  } finally {
    process.exit(0);
  }
}

checkFactureStructure();
