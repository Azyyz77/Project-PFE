const { getConnection } = require('../config/database');
const fs = require('fs');
const path = require('path');

async function createMontantTotalTriggers() {
  console.log('🔧 Création des triggers pour montant_total...\n');

  try {
    const pool = await getConnection();
    
    // Lire le fichier SQL
    const sqlFile = path.join(__dirname, '../migrations/create_trigger_update_montant_total.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');
    
    // Séparer les commandes SQL par GO
    const commands = sql
      .split(/\r?\nGO\r?\n/)
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.startsWith('--') && !cmd.startsWith('PRINT'));
    
    console.log(`📄 ${commands.length} commandes SQL à exécuter\n`);
    
    // Exécuter chaque commande
    for (let i = 0; i < commands.length; i++) {
      const command = commands[i];
      if (command.includes('PRINT')) continue;
      
      try {
        await pool.request().query(command);
        console.log(`✅ Commande ${i + 1}/${commands.length} exécutée`);
      } catch (err) {
        if (err.message.includes('already exists') || err.message.includes('does not exist')) {
          console.log(`⚠️  Commande ${i + 1}/${commands.length} ignorée (déjà existe ou n'existe pas)`);
        } else {
          throw err;
        }
      }
    }
    
    console.log('\n✅ Triggers créés avec succès!\n');
    
    // Vérifier les commandes existantes
    console.log('📊 Vérification des commandes existantes:\n');
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
      GROUP BY c.id, c.numero, c.montant_total
      ORDER BY c.date_creation DESC
    `);
    
    if (result.recordset.length === 0) {
      console.log('ℹ️  Aucune commande trouvée');
    } else {
      console.log('Commande              | Lignes | Calculé  | Actuel   | Statut');
      console.log('---------------------|--------|----------|----------|--------');
      result.recordset.forEach(row => {
        const status = row.statut === 'OK' ? '✅' : '❌';
        console.log(
          `${row.numero.padEnd(20)} | ${String(row.nb_lignes).padStart(6)} | ` +
          `${String(row.total_calcule).padStart(8)} | ${String(row.montant_actuel).padStart(8)} | ${status}`
        );
      });
    }
    
    console.log('\n✨ Terminé!\n');
    console.log('💡 Les montants seront maintenant calculés automatiquement:');
    console.log('   - Quand vous ajoutez une ligne');
    console.log('   - Quand vous modifiez une ligne');
    console.log('   - Quand vous supprimez une ligne');
    console.log('');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    console.error('\nDétails:', error);
    process.exit(1);
  }
}

createMontantTotalTriggers();
