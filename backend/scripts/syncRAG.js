// scripts/syncRAG.js
// Script pour synchroniser les données SQL Server vers la base vectorielle RAG

require('dotenv').config();
const { syncSQLServerData } = require('../services/ragService');

async function runSync() {
  console.log('═══════════════════════════════════════════════');
  console.log('   SYNCHRONISATION RAG - SQL Server → pgvector');
  console.log('═══════════════════════════════════════════════\n');

  // Vérifier les prérequis
  console.log('🔍 Vérification des prérequis...\n');
  
  const requiredEnvVars = ['PG_URL', 'OLLAMA_URL', 'DB_SERVER'];
  const missing = requiredEnvVars.filter(v => !process.env[v]);
  
  if (missing.length > 0) {
    console.error('❌ Variables d\'environnement manquantes:');
    missing.forEach(v => console.error(`   - ${v}`));
    console.error('\n📝 Vérifiez votre fichier .env');
    process.exit(1);
  }

  console.log('✅ Toutes les variables d\'environnement sont configurées\n');
  console.log(`   PostgreSQL: ${process.env.PG_URL.split('@')[1]}`);
  console.log(`   Ollama:     ${process.env.OLLAMA_URL}`);
  console.log(`   Redis:      ${process.env.REDIS_HOST}:${process.env.REDIS_PORT || 6379}`);
  console.log(`   SQL Server: ${process.env.DB_SERVER}\n`);

  try {
    console.log('⏳ Démarrage de la synchronisation...\n');
    const startTime = Date.now();

    const result = await syncSQLServerData();

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    
    console.log('═══════════════════════════════════════════════');
    console.log('✨ SYNCHRONISATION RÉUSSIE ✨');
    console.log('═══════════════════════════════════════════════');
    console.log(`📊 Documents ingérés:  ${result.totalDocs}`);
    console.log(`⏱️  Durée:              ${duration} secondes`);
    console.log(`💾 Base vectorielle:   Mise à jour`);
    console.log('═══════════════════════════════════════════════\n');
    
    console.log('📝 Prochaines étapes:');
    console.log('  1. Testez le chatbot avec des questions variées');
    console.log('  2. Vérifiez le cache Redis: node scripts/warmupCache.js');
    console.log('  3. Consultez les stats: curl http://localhost:5000/api/cache/stats\n');

    process.exit(0);
  } catch (error) {
    console.error('\n═══════════════════════════════════════════════');
    console.error('❌ ERREUR LORS DE LA SYNCHRONISATION');
    console.error('═══════════════════════════════════════════════');
    console.error(`Message: ${error.message}`);
    console.error(`\nDétails:\n${error.stack}\n`);
    
    console.error('🔧 Solutions possibles:');
    console.error('  1. Vérifiez que PostgreSQL est démarré');
    console.error('  2. Vérifiez que SQL Server est accessible');
    console.error('  3. Vérifiez que Ollama est en cours d\'exécution');
    console.error('  4. Vérifiez que Redis est démarré');
    console.error('  5. Consultez les logs pour plus de détails\n');
    
    process.exit(1);
  }
}

// Gestion gracieuse de l'arrêt
process.on('SIGINT', () => {
  console.log('\n\n⚠️  Arrêt de la synchronisation...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n\n⚠️  Arrêt de la synchronisation...');
  process.exit(0);
});

// Exécuter
runSync();
