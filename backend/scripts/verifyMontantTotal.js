const { getConnection } = require('../config/database');

async function verifyMontantTotal() {
  console.log('🔍 Vérification des montants totaux...\n');

  try {
    const pool = await getConnection();
    
    // Vérifier les commandes
    const result = await pool.request().query(`
      SELECT 
        c.id,
        c.numero,
        COUNT(l.id) AS nb_lignes,
        ISNULL(SUM(l.prix_total), 0) AS total_calcule,
        c.montant_total AS montant_actuel,
        CASE 
          WHEN ISNULL(SUM(l.prix_total), 0) = c.montant_total THEN 'OK'
          ELSE 'ERREUR'
        END AS statut
      FROM CommandeReparation c
      LEFT JOIN LigneCommande l ON l.commande_id = c.id
      GROUP BY c.id, c.numero, c.montant_total, c.date_creation
      ORDER BY c.date_creation DESC
    `);
    
    if (result.recordset.length === 0) {
      console.log('ℹ️  Aucune commande trouvée\n');
      process.exit(0);
    }
    
    console.log('📊 Résultats:\n');
    console.log('Commande              | Lignes | Calculé  | Actuel   | Statut');
    console.log('---------------------|--------|----------|----------|--------');
    
    let allOk = true;
    result.recordset.forEach(row => {
      const status = row.statut === 'OK' ? '✅' : '❌';
      if (row.statut !== 'OK') allOk = false;
      
      console.log(
        `${row.numero.padEnd(20)} | ${String(row.nb_lignes).padStart(6)} | ` +
        `${String(row.total_calcule).padStart(8)} | ${String(row.montant_actuel).padStart(8)} | ${status}`
      );
    });
    
    console.log('');
    
    if (allOk) {
      console.log('✅ Tous les montants sont corrects!\n');
    } else {
      console.log('⚠️  Certains montants sont incorrects. Recalcul...\n');
      
      // Recalculer
      await pool.request().query(`
        UPDATE CommandeReparation
        SET montant_total = (
          SELECT ISNULL(SUM(prix_total), 0)
          FROM LigneCommande
          WHERE commande_id = CommandeReparation.id
        )
      `);
      
      console.log('✅ Montants recalculés!\n');
      
      // Vérifier à nouveau
      console.log('🔄 Nouvelle vérification...\n');
      const result2 = await pool.request().query(`
        SELECT 
          c.id,
          c.numero,
          COUNT(l.id) AS nb_lignes,
          ISNULL(SUM(l.prix_total), 0) AS total_calcule,
          c.montant_total AS montant_actuel,
          CASE 
            WHEN ISNULL(SUM(l.prix_total), 0) = c.montant_total THEN 'OK'
            ELSE 'ERREUR'
          END AS statut
        FROM CommandeReparation c
        LEFT JOIN LigneCommande l ON l.commande_id = c.id
        GROUP BY c.id, c.numero, c.montant_total, c.date_creation
        ORDER BY c.date_creation DESC
      `);
      
      console.log('Commande              | Lignes | Calculé  | Actuel   | Statut');
      console.log('---------------------|--------|----------|----------|--------');
      
      result2.recordset.forEach(row => {
        const status = row.statut === 'OK' ? '✅' : '❌';
        console.log(
          `${row.numero.padEnd(20)} | ${String(row.nb_lignes).padStart(6)} | ` +
          `${String(row.total_calcule).padStart(8)} | ${String(row.montant_actuel).padStart(8)} | ${status}`
        );
      });
      
      console.log('');
    }
    
    // Afficher les détails de chaque commande
    console.log('📋 Détails des commandes:\n');
    for (const commande of result.recordset) {
      console.log(`Commande: ${commande.numero}`);
      
      const lignes = await pool.request()
        .input('commande_id', commande.id)
        .query(`
          SELECT 
            id, type, quantite, prix_unitaire, prix_total
          FROM LigneCommande
          WHERE commande_id = @commande_id
          ORDER BY id
        `);
      
      if (lignes.recordset.length === 0) {
        console.log('  Aucune ligne\n');
      } else {
        lignes.recordset.forEach(ligne => {
          console.log(
            `  - ${ligne.type}: ${ligne.quantite} × ${ligne.prix_unitaire} = ${ligne.prix_total} TND`
          );
        });
        console.log(`  Total: ${commande.montant_actuel} TND\n`);
      }
    }
    
    console.log('✨ Vérification terminée!\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    console.error('\nDétails:', error);
    process.exit(1);
  }
}

verifyMontantTotal();
