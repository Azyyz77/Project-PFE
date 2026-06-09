// scripts/testCacheIntegration.js
// Test d'intégration complet : RAG + Cache + Ollama

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { searchContext, ollamaCache } = require('../services/ragService');

async function testIntegration() {
  console.log('\n🧪 TEST D\'INTÉGRATION : RAG + CACHE OLLAMA\n');
  console.log('═══════════════════════════════════════════════\n');

  try {
    // Étape 1 : Vider le cache pour démarrer proprement
    console.log('🗑️  Étape 1: Nettoyage du cache');
    const cleared = await ollamaCache.clear();
    console.log(`✅ ${cleared} embeddings supprimés\n`);

    // Étape 2 : Première question (MISS attendu)
    console.log('❓ Étape 2: Première question (Cache MISS attendu)');
    const question1 = 'Quelles sont les agences Chery à Tunis ?';
    console.log('Question:', question1);
    
    console.time('⏱️  Temps avec MISS');
    const result1 = await searchContext(question1);
    console.timeEnd('⏱️  Temps avec MISS');
    
    if (result1) {
      console.log('✅ Contexte récupéré:', result1.context.substring(0, 200), '...');
      console.log('Intent détecté:', result1.intent);
      console.log('Langue détectée:', result1.lang);
    }
    console.log('');

    // Étape 3 : Même question (HIT attendu)
    console.log('❓ Étape 3: Même question (Cache HIT attendu)');
    console.log('Question:', question1);
    
    console.time('⏱️  Temps avec HIT');
    const result2 = await searchContext(question1);
    console.timeEnd('⏱️  Temps avec HIT');
    
    if (result2) {
      console.log('✅ Contexte récupéré depuis cache');
    }
    console.log('');

    // Étape 4 : Question similaire (MISS car texte différent)
    console.log('❓ Étape 4: Question similaire (Cache MISS car texte différent)');
    const question2 = 'Où se trouvent les garages Chery à Tunis ?';
    console.log('Question:', question2);
    
    console.time('⏱️  Temps avec MISS');
    const result3 = await searchContext(question2);
    console.timeEnd('⏱️  Temps avec MISS');
    
    if (result3) {
      console.log('✅ Contexte récupéré');
      console.log('Intent détecté:', result3.intent);
    }
    console.log('');

    // Étape 5 : Statistiques finales
    console.log('📊 Étape 5: Statistiques finales du cache');
    const stats = await ollamaCache.stats();
    console.log('Statistiques:');
    console.log('  - Enabled:', stats.enabled);
    console.log('  - Entrées:', stats.count);
    console.log('  - TTL:', stats.ttl, 'secondes');
    console.log('  - Préfixe:', stats.prefix);
    console.log('');

    // Étape 6 : Test avec question en arabe
    console.log('❓ Étape 6: Question en arabe (Test de normalisation)');
    const question3 = 'وين فروع شيري في تونس؟';
    console.log('Question:', question3);
    
    console.time('⏱️  Temps');
    const result4 = await searchContext(question3);
    console.timeEnd('⏱️  Temps');
    
    if (result4) {
      console.log('✅ Contexte récupéré');
      console.log('Intent détecté:', result4.intent);
      console.log('Langue détectée:', result4.lang);
    }
    console.log('');

    // Résumé
    console.log('═══════════════════════════════════════════════');
    console.log('✅ Test d\'intégration terminé avec succès');
    console.log('');
    console.log('📝 Observations attendues:');
    console.log('  - 1ère question: temps plus long (appel Ollama)');
    console.log('  - 2ème question: ~200x plus rapide (cache hit)');
    console.log('  - 3ème question: temps normal (nouveau texte)');
    console.log('  - Cache final: plusieurs embeddings stockés');
    console.log('');

  } catch (error) {
    console.error('\n❌ ERREUR PENDANT LE TEST:', error.message);
    console.error(error.stack);
  } finally {
    process.exit(0);
  }
}

// Lancer le test
testIntegration();
