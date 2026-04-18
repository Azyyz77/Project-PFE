/**
 * Script pour tester la requête des problèmes prédéfinis
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const { getConnection } = require('../config/database');

async function testQuery() {
  try {
    console.log('🔄 Connexion à la base de données...');
    const pool = await getConnection();
    console.log('✅ Connecté\n');

    // Test 1: Vérifier le nom exact de la table
    console.log('📋 Test 1: Vérifier les tables disponibles...');
    const tables = await pool.request().query(`
      SELECT TABLE_NAME, TABLE_SCHEMA
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_NAME LIKE '%Probleme%'
      ORDER BY TABLE_NAME
    `);
    
    console.log('Tables trouvées:');
    tables.recordset.forEach(t => {
      console.log(`   - [${t.TABLE_SCHEMA}].[${t.TABLE_NAME}]`);
    });

    // Test 2: Essayer différentes variantes du nom
    const variants = [
      'ProblemePredéfini',
      'ProblemePrédefini',
      'ProblemePredéfini',
      'ProblemePredefini',
      '[ProblemePredéfini]',
      '[dbo].[ProblemePredéfini]'
    ];

    console.log('\n📋 Test 2: Essayer différentes variantes...');
    for (const variant of variants) {
      try {
        const result = await pool.request().query(`SELECT COUNT(*) as count FROM ${variant}`);
        console.log(`   ✅ ${variant}: ${result.recordset[0].count} enregistrements`);
      } catch (err) {
        console.log(`   ❌ ${variant}: ${err.message.split('\n')[0]}`);
      }
    }

    // Test 3: Lire quelques enregistrements
    console.log('\n📋 Test 3: Lire les premiers problèmes...');
    try {
      const problems = await pool.request().query(`
        SELECT TOP 5 id, nom, categorie 
        FROM [dbo].[ProblemePredéfini]
        ORDER BY id
      `);
      
      console.log('Premiers problèmes:');
      problems.recordset.forEach(p => {
        console.log(`   ${p.id}. ${p.nom} (${p.categorie})`);
      });
    } catch (err) {
      console.error('   ❌ Erreur:', err.message);
    }

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Erreur:', error);
    process.exit(1);
  }
}

testQuery();
