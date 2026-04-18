/**
 * Script d'initialisation des permissions par défaut
 * 
 * Ce script initialise les permissions par défaut pour tous les rôles:
 * - CLIENT (11 permissions)
 * - AGENT (14 permissions)
 * - ADMIN (48 permissions)
 * - DIRECTION (12 permissions)
 * 
 * Usage: node backend/scripts/initializePermissions.js
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const { getConnection, sql } = require('../config/database');

async function initializePermissions() {
  console.log('🚀 Initialisation des permissions par défaut...\n');

  try {
    const pool = await getConnection();

    // Récupérer tous les rôles
    const rolesResult = await pool.request().query('SELECT id, nom FROM Role');
    const roles = rolesResult.recordset;

    console.log(`📋 Rôles trouvés: ${roles.map(r => r.nom).join(', ')}\n`);

    let totalCreated = 0;
    let totalSkipped = 0;

    // Initialiser les permissions pour chaque rôle
    for (const role of roles) {
      console.log(`\n🔧 Initialisation des permissions pour: ${role.nom}`);
      console.log('─'.repeat(50));

      const defaultPermissions = getDefaultPermissions(role.nom);

      if (defaultPermissions.length === 0) {
        console.log(`⚠️  Aucune permission par défaut définie pour ${role.nom}`);
        continue;
      }

      let created = 0;
      let skipped = 0;

      for (const perm of defaultPermissions) {
        try {
          // Vérifier si la permission existe déjà
          const exists = await pool.request()
            .input('role_id', sql.BigInt, role.id)
            .input('module', sql.NVarChar(50), perm.module)
            .input('action', sql.NVarChar(20), perm.action)
            .query(`
              SELECT id FROM Permission 
              WHERE role_id = @role_id 
                AND module = @module 
                AND action = @action
            `);

          if (exists.recordset.length === 0) {
            // Créer la permission
            await pool.request()
              .input('role_id', sql.BigInt, role.id)
              .input('module', sql.NVarChar(50), perm.module)
              .input('action', sql.NVarChar(20), perm.action)
              .query(`
                INSERT INTO Permission (role_id, module, action, actif)
                VALUES (@role_id, @module, @action, 1)
              `);
            created++;
            console.log(`  ✅ ${perm.module}.${perm.action}`);
          } else {
            skipped++;
            console.log(`  ⏭️  ${perm.module}.${perm.action} (existe déjà)`);
          }
        } catch (err) {
          console.error(`  ❌ Erreur pour ${perm.module}.${perm.action}:`, err.message);
        }
      }

      console.log(`\n  📊 ${role.nom}: ${created} créées, ${skipped} ignorées`);
      totalCreated += created;
      totalSkipped += skipped;
    }

    console.log('\n' + '═'.repeat(50));
    console.log(`\n✅ Initialisation terminée!`);
    console.log(`   Total créées: ${totalCreated}`);
    console.log(`   Total ignorées: ${totalSkipped}`);
    console.log(`   Total: ${totalCreated + totalSkipped}\n`);

  } catch (error) {
    console.error('\n❌ Erreur lors de l\'initialisation:', error);
    process.exit(1);
  }

  process.exit(0);
}

/**
 * Retourne les permissions par défaut selon le rôle
 */
function getDefaultPermissions(roleName) {
  switch (roleName) {
    case 'CLIENT':
      return [
        { module: 'VEHICLES', action: 'CREATE' },
        { module: 'VEHICLES', action: 'READ' },
        { module: 'VEHICLES', action: 'UPDATE' },
        { module: 'APPOINTMENTS', action: 'CREATE' },
        { module: 'APPOINTMENTS', action: 'READ' },
        { module: 'APPOINTMENTS', action: 'UPDATE' },
        { module: 'COMPLAINTS', action: 'CREATE' },
        { module: 'COMPLAINTS', action: 'READ' },
        { module: 'DOCUMENTS', action: 'READ' },
        { module: 'CATALOG', action: 'READ' },
        { module: 'PROMOTIONS', action: 'READ' }
      ];

    case 'AGENT':
      return [
        { module: 'VEHICLES', action: 'READ' },
        { module: 'VEHICLES', action: 'VALIDATE' },
        { module: 'APPOINTMENTS', action: 'READ' },
        { module: 'APPOINTMENTS', action: 'UPDATE' },
        { module: 'APPOINTMENTS', action: 'VALIDATE' },
        { module: 'INTERVENTIONS', action: 'CREATE' },
        { module: 'INTERVENTIONS', action: 'READ' },
        { module: 'INTERVENTIONS', action: 'UPDATE' },
        { module: 'COMPLAINTS', action: 'READ' },
        { module: 'COMPLAINTS', action: 'UPDATE' },
        { module: 'DOCUMENTS', action: 'CREATE' },
        { module: 'DOCUMENTS', action: 'READ' },
        { module: 'CATALOG', action: 'READ' },
        { module: 'REPORTS', action: 'READ' }
      ];

    case 'ADMIN':
      return [
        { module: 'USERS', action: 'CREATE' },
        { module: 'USERS', action: 'READ' },
        { module: 'USERS', action: 'UPDATE' },
        { module: 'USERS', action: 'DELETE' },
        { module: 'VEHICLES', action: 'READ' },
        { module: 'VEHICLES', action: 'VALIDATE' },
        { module: 'APPOINTMENTS', action: 'READ' },
        { module: 'APPOINTMENTS', action: 'UPDATE' },
        { module: 'APPOINTMENTS', action: 'DELETE' },
        { module: 'INTERVENTIONS', action: 'CREATE' },
        { module: 'INTERVENTIONS', action: 'READ' },
        { module: 'INTERVENTIONS', action: 'UPDATE' },
        { module: 'INTERVENTIONS', action: 'DELETE' },
        { module: 'COMPLAINTS', action: 'READ' },
        { module: 'COMPLAINTS', action: 'UPDATE' },
        { module: 'CATALOG', action: 'CREATE' },
        { module: 'CATALOG', action: 'READ' },
        { module: 'CATALOG', action: 'UPDATE' },
        { module: 'CATALOG', action: 'DELETE' },
        { module: 'PACKAGES', action: 'CREATE' },
        { module: 'PACKAGES', action: 'READ' },
        { module: 'PACKAGES', action: 'UPDATE' },
        { module: 'PACKAGES', action: 'DELETE' },
        { module: 'PROMOTIONS', action: 'CREATE' },
        { module: 'PROMOTIONS', action: 'READ' },
        { module: 'PROMOTIONS', action: 'UPDATE' },
        { module: 'PROMOTIONS', action: 'DELETE' },
        { module: 'DOCUMENTS', action: 'CREATE' },
        { module: 'DOCUMENTS', action: 'READ' },
        { module: 'DOCUMENTS', action: 'UPDATE' },
        { module: 'DOCUMENTS', action: 'DELETE' },
        { module: 'NOTIFICATIONS', action: 'CREATE' },
        { module: 'NOTIFICATIONS', action: 'READ' },
        { module: 'REPORTS', action: 'READ' },
        { module: 'REPORTS', action: 'EXPORT' },
        { module: 'SETTINGS', action: 'READ' },
        { module: 'SETTINGS', action: 'UPDATE' },
        { module: 'PERMISSIONS', action: 'CREATE' },
        { module: 'PERMISSIONS', action: 'READ' },
        { module: 'PERMISSIONS', action: 'UPDATE' },
        { module: 'PERMISSIONS', action: 'DELETE' },
        { module: 'AGENCIES', action: 'CREATE' },
        { module: 'AGENCIES', action: 'READ' },
        { module: 'AGENCIES', action: 'UPDATE' },
        { module: 'AGENCIES', action: 'DELETE' },
        { module: 'TIMESLOTS', action: 'CREATE' },
        { module: 'TIMESLOTS', action: 'READ' },
        { module: 'TIMESLOTS', action: 'UPDATE' },
        { module: 'TIMESLOTS', action: 'DELETE' }
      ];

    case 'DIRECTION':
      return [
        { module: 'USERS', action: 'READ' },
        { module: 'VEHICLES', action: 'READ' },
        { module: 'APPOINTMENTS', action: 'READ' },
        { module: 'INTERVENTIONS', action: 'READ' },
        { module: 'COMPLAINTS', action: 'READ' },
        { module: 'CATALOG', action: 'READ' },
        { module: 'PACKAGES', action: 'READ' },
        { module: 'PROMOTIONS', action: 'READ' },
        { module: 'DOCUMENTS', action: 'READ' },
        { module: 'REPORTS', action: 'READ' },
        { module: 'REPORTS', action: 'EXPORT' },
        { module: 'AGENCIES', action: 'READ' }
      ];

    default:
      return [];
  }
}

// Exécuter le script
initializePermissions();
