/**
 * Script pour mettre à jour les utilisateurs existants
 * Définit telephone_verifie = 0 pour les utilisateurs existants
 */

const { getConnection, sql } = require('../config/database');

async function updateExistingUsers() {
  try {
    console.log('🔄 Mise à jour des utilisateurs existants...\n');

    const pool = await getConnection();

    // Vérifier d'abord l'état actuel
    console.log('1. État actuel de la base...');
    const currentState = await pool.request().query(`
      SELECT 
        COUNT(*) as total_users,
        SUM(CASE WHEN telephone_verifie = 1 THEN 1 ELSE 0 END) as verified_users,
        SUM(CASE WHEN telephone_verifie = 0 THEN 1 ELSE 0 END) as unverified_users,
        SUM(CASE WHEN telephone_verifie IS NULL THEN 1 ELSE 0 END) as null_users
      FROM Utilisateur
      WHERE actif = 1
    `);

    const stats = currentState.recordset[0];
    console.log(`   Total utilisateurs actifs: ${stats.total_users}`);
    console.log(`   Vérifiés (1): ${stats.verified_users}`);
    console.log(`   Non vérifiés (0): ${stats.unverified_users}`);
    console.log(`   NULL: ${stats.null_users}`);

    if (stats.null_users === 0) {
      console.log('\n✅ Aucune mise à jour nécessaire - tous les utilisateurs ont une valeur définie');
      return;
    }

    // Mise à jour des utilisateurs avec telephone_verifie = NULL
    console.log('\n2. Mise à jour des utilisateurs...');
    const updateResult = await pool.request().query(`
      UPDATE Utilisateur 
      SET telephone_verifie = 0 
      WHERE telephone_verifie IS NULL
    `);

    console.log(`✅ ${updateResult.rowsAffected[0]} utilisateurs mis à jour`);

    // Vérifier l'état après mise à jour
    console.log('\n3. État après mise à jour...');
    const newState = await pool.request().query(`
      SELECT 
        COUNT(*) as total_users,
        SUM(CASE WHEN telephone_verifie = 1 THEN 1 ELSE 0 END) as verified_users,
        SUM(CASE WHEN telephone_verifie = 0 THEN 1 ELSE 0 END) as unverified_users,
        SUM(CASE WHEN telephone_verifie IS NULL THEN 1 ELSE 0 END) as null_users
      FROM Utilisateur
      WHERE actif = 1
    `);

    const newStats = newState.recordset[0];
    console.log(`   Total utilisateurs actifs: ${newStats.total_users}`);
    console.log(`   Vérifiés (1): ${newStats.verified_users}`);
    console.log(`   Non vérifiés (0): ${newStats.unverified_users}`);
    console.log(`   NULL: ${newStats.null_users}`);

    // Optionnel: Marquer les agents/admins comme vérifiés automatiquement
    console.log('\n4. Vérification automatique des agents/admins...');
    const autoVerifyResult = await pool.request().query(`
      UPDATE u 
      SET telephone_verifie = 1 
      FROM Utilisateur u
      INNER JOIN Role r ON r.id = u.role_id
      WHERE r.nom IN ('AGENT', 'ADMIN', 'DIRECTION')
      AND u.telephone_verifie = 0
      AND u.actif = 1
    `);

    console.log(`✅ ${autoVerifyResult.rowsAffected[0]} agents/admins automatiquement vérifiés`);

    // État final
    console.log('\n5. État final...');
    const finalState = await pool.request().query(`
      SELECT 
        r.nom as role_nom,
        COUNT(*) as total_users,
        SUM(CASE WHEN u.telephone_verifie = 1 THEN 1 ELSE 0 END) as verified_users,
        SUM(CASE WHEN u.telephone_verifie = 0 THEN 1 ELSE 0 END) as unverified_users
      FROM Utilisateur u
      LEFT JOIN Role r ON r.id = u.role_id
      WHERE u.actif = 1
      GROUP BY r.nom
      ORDER BY r.nom
    `);

    console.log('📊 Répartition finale par rôle:');
    finalState.recordset.forEach(stat => {
      console.log(`   ${stat.role_nom || 'SANS_ROLE'}:`);
      console.log(`     Total: ${stat.total_users}`);
      console.log(`     Vérifiés: ${stat.verified_users}`);
      console.log(`     Non vérifiés: ${stat.unverified_users}`);
    });

    console.log('\n✅ Mise à jour terminée avec succès!');

  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour:', error);
    process.exit(1);
  }
}

// Exécuter la mise à jour si le script est appelé directement
if (require.main === module) {
  updateExistingUsers()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('Erreur fatale:', error);
      process.exit(1);
    });
}

module.exports = { updateExistingUsers };