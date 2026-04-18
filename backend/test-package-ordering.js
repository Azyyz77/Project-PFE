/**
 * Script de test pour vérifier la commande de packages dans les RDV
 * Usage: node test-package-ordering.js
 */

// Charger les variables d'environnement
require('dotenv').config();

const { getConnection, sql } = require('./config/database');

async function testPackageOrdering() {
  try {
    console.log('🔍 Test de la commande de packages dans RDV...\n');

    const pool = await getConnection();

    // Test 1: Vérifier la structure de la table PackageIntervention
    console.log('1️⃣ Vérification de la table PackageIntervention:');
    const packagesResult = await pool.request().query(`
      SELECT TOP 5
        id,
        nom,
        description,
        prix,
        actif
      FROM PackageIntervention
      WHERE actif = 1
      ORDER BY nom
    `);
    
    if (packagesResult.recordset.length > 0) {
      console.log(`✅ ${packagesResult.recordset.length} packages actifs trouvés:`);
      packagesResult.recordset.forEach(pkg => {
        console.log(`   - ${pkg.nom}: ${pkg.prix} TND`);
      });
    } else {
      console.log('⚠️ Aucun package actif dans la base');
      console.log('💡 Conseil: Insérer des packages de test dans PackageIntervention');
    }

    // Test 2: Vérifier la structure de la table RDV_Package
    console.log('\n2️⃣ Vérification de la table RDV_Package:');
    const rdvPackagesResult = await pool.request().query(`
      SELECT TOP 5
        rp.rdv_id,
        rp.package_id,
        rp.quantite,
        rp.prix_unitaire,
        p.nom as package_nom
      FROM RDV_Package rp
      JOIN PackageIntervention p ON p.id = rp.package_id
      ORDER BY rp.rdv_id DESC
    `);
    
    if (rdvPackagesResult.recordset.length > 0) {
      console.log(`✅ ${rdvPackagesResult.recordset.length} packages commandés trouvés:`);
      rdvPackagesResult.recordset.forEach(rp => {
        console.log(`   - RDV #${rp.rdv_id}: ${rp.package_nom} x${rp.quantite} = ${rp.prix_unitaire * rp.quantite} TND`);
      });
    } else {
      console.log('⚠️ Aucun package commandé pour l\'instant');
    }

    // Test 3: Vérifier qu'on peut récupérer les packages d'un RDV
    console.log('\n3️⃣ Test de récupération des packages pour un RDV:');
    const testRdvResult = await pool.request().query(`
      SELECT TOP 1 id FROM RendezVous ORDER BY id DESC
    `);

    if (testRdvResult.recordset.length > 0) {
      const rdvId = testRdvResult.recordset[0].id;
      
      const packagesForRdv = await pool.request()
        .input('rdv_id', sql.BigInt, rdvId)
        .query(`
          SELECT 
            rp.package_id as id,
            p.nom,
            rp.prix_unitaire as prix,
            rp.quantite,
            p.description
          FROM RDV_Package rp
          JOIN PackageIntervention p ON p.id = rp.package_id
          WHERE rp.rdv_id = @rdv_id
        `);

      if (packagesForRdv.recordset.length > 0) {
        console.log(`✅ RDV #${rdvId} a ${packagesForRdv.recordset.length} package(s):`);
        let total = 0;
        packagesForRdv.recordset.forEach(pkg => {
          const subtotal = pkg.prix * pkg.quantite;
          total += subtotal;
          console.log(`   - ${pkg.nom}: ${pkg.prix} x ${pkg.quantite} = ${subtotal} TND`);
        });
        console.log(`   📊 Prix total: ${total.toFixed(3)} TND`);
      } else {
        console.log(`⚠️ RDV #${rdvId} n'a pas de packages`);
      }
    } else {
      console.log('⚠️ Aucun RDV dans la base');
    }

    // Test 4: Simuler le calcul du prix total
    console.log('\n4️⃣ Simulation du calcul de prix total:');
    const samplePackages = await pool.request().query(`
      SELECT TOP 3 id, nom, prix
      FROM PackageIntervention
      WHERE actif = 1
    `);

    if (samplePackages.recordset.length > 0) {
      let simulatedTotal = 0;
      console.log('📦 Packages sélectionnés:');
      samplePackages.recordset.forEach(pkg => {
        simulatedTotal += parseFloat(pkg.prix);
        console.log(`   - ${pkg.nom}: ${pkg.prix} TND`);
      });
      console.log(`   💰 Prix total estimé: ${simulatedTotal.toFixed(3)} TND`);
    }

    console.log('\n✅ Tests terminés avec succès!');
    console.log('\n📝 Prochaines étapes:');
    console.log('   1. Redémarrer le serveur backend (Ctrl+C puis npm start)');
    console.log('   2. Tester l\'endpoint: GET /api/appointments/packages');
    console.log('   3. Créer un RDV avec package_ids');
    console.log('   4. Vérifier que les packages sont bien enregistrés');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur lors des tests:', error.message);
    console.error('\n💡 Vérifiez que:');
    console.error('   - Le serveur SQL est démarré');
    console.error('   - Les tables PackageIntervention et RDV_Package existent');
    console.error('   - Le fichier .env contient les bonnes informations');
    process.exit(1);
  }
}

testPackageOrdering();
