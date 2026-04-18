/**
 * Script de test pour vérifier l'historique véhicule
 * Usage: node test-vehicle-history.js
 */

// Charger les variables d'environnement
require('dotenv').config();

const { getConnection, sql } = require('./config/database');

async function testVehicleHistory() {
  try {
    console.log('🔍 Test de l\'historique véhicule...\n');

    const pool = await getConnection();

    // Test 1: Vérifier la structure de la table Vehicule
    console.log('1️⃣ Vérification de la structure de la table Vehicule:');
    const columnsResult = await pool.request().query(`
      SELECT COLUMN_NAME, DATA_TYPE 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'Vehicule' 
      AND COLUMN_NAME IN ('client_id', 'utilisateur_id')
    `);
    console.log('Colonnes trouvées:', columnsResult.recordset);

    // Test 2: Récupérer un véhicule avec client_id
    console.log('\n2️⃣ Test de requête avec client_id:');
    const vehicleResult = await pool.request().query(`
      SELECT TOP 1 
        v.id, 
        v.client_id, 
        v.immatriculation,
        m.nom as marque,
        mo.nom as modele
      FROM Vehicule v
      LEFT JOIN Version ve ON ve.id = v.version_id
      LEFT JOIN Modele mo ON mo.id = ve.modele_id
      LEFT JOIN Marque m ON m.id = mo.marque_id
    `);
    
    if (vehicleResult.recordset.length > 0) {
      console.log('✅ Véhicule trouvé:', vehicleResult.recordset[0]);
    } else {
      console.log('⚠️ Aucun véhicule dans la base');
    }

    // Test 3: Vérifier les rendez-vous
    console.log('\n3️⃣ Test de requête RendezVous:');
    const rdvResult = await pool.request().query(`
      SELECT TOP 1 
        r.id,
        r.vehicule_id,
        r.date_heure,
        CAST(r.date_heure AS DATE) as date,
        FORMAT(r.date_heure, 'HH:mm') as heure,
        r.statut
      FROM RendezVous r
    `);
    
    if (rdvResult.recordset.length > 0) {
      console.log('✅ Rendez-vous trouvé:', rdvResult.recordset[0]);
    } else {
      console.log('⚠️ Aucun rendez-vous dans la base');
    }

    console.log('\n✅ Tests terminés avec succès!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur lors des tests:', error.message);
    process.exit(1);
  }
}

testVehicleHistory();
