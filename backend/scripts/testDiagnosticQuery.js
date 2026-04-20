require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { getConnection, closeConnection } = require('../config/database');

async function testDiagnosticQuery() {
  try {
    const pool = await getConnection();
    
    console.log('🧪 Test de la requête diagnostics...\n');
    
    // Test de la requête corrigée
    console.log('1. Test de la requête avec date_heure...');
    const result = await pool.request().query(`
      SELECT TOP 1
        d.id,
        d.rdv_id,
        d.agent_id,
        d.observations_generales,
        d.recommandations,
        d.date_creation,
        d.date_modification,
        a.nom + ' ' + a.prenom AS agent_nom,
        r.date_heure,
        r.statut AS rdv_statut,
        c.nom + ' ' + c.prenom AS client_nom,
        v.immatriculation,
        m.nom AS marque,
        mo.nom AS modele
      FROM Diagnostic d
      JOIN Utilisateur a ON a.id = d.agent_id
      JOIN RendezVous r ON r.id = d.rdv_id
      JOIN Utilisateur c ON c.id = r.client_id
      LEFT JOIN Vehicule v ON v.id = r.vehicule_id
      LEFT JOIN Version ve ON ve.id = v.version_id
      LEFT JOIN Modele mo ON mo.id = ve.modele_id
      LEFT JOIN Marque m ON m.id = mo.marque_id
    `);
    
    if (result.recordset.length > 0) {
      console.log('   ✅ Requête réussie!');
      console.log('   📊 Colonnes récupérées:', Object.keys(result.recordset[0]));
      console.log('   📅 date_heure:', result.recordset[0].date_heure);
    } else {
      console.log('   ⚠️  Aucun diagnostic trouvé (normal si pas de données)');
    }
    
    console.log('\n2. Vérification des tables...');
    
    // Vérifier les tables
    const tables = await pool.request().query(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_NAME IN ('Diagnostic', 'RendezVous', 'Utilisateur', 'Vehicule')
      ORDER BY TABLE_NAME
    `);
    
    console.log('   📋 Tables disponibles:', tables.recordset.map(t => t.TABLE_NAME));
    
    // Compter les enregistrements
    const counts = await pool.request().query(`
      SELECT 
        (SELECT COUNT(*) FROM Diagnostic) as diagnostics,
        (SELECT COUNT(*) FROM RendezVous) as rendez_vous,
        (SELECT COUNT(*) FROM Utilisateur) as utilisateurs
    `);
    
    console.log('   📊 Nombre d\'enregistrements:');
    console.log('     - Diagnostics:', counts.recordset[0].diagnostics);
    console.log('     - Rendez-vous:', counts.recordset[0].rendez_vous);
    console.log('     - Utilisateurs:', counts.recordset[0].utilisateurs);
    
    console.log('\n✅ Test terminé avec succès!');
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
    if (error.message.includes('date_rdv')) {
      console.error('⚠️  Il reste des références à date_rdv dans le code!');
    }
  } finally {
    await closeConnection();
  }
}

testDiagnosticQuery();