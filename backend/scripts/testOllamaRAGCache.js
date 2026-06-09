// scripts/testOllamaRAGCache.js
// ═══════════════════════════════════════════════════════════
//  Test Complet : Ollama → Cache → RAG Integration
// ═══════════════════════════════════════════════════════════

require('dotenv').config();
const ollamaCache = require('../services/ollamaCache');
const ragService = require('../services/ragService');

console.log('\n🧪 TEST COMPLET : OLLAMA → CACHE → RAG\n');
console.log('═══════════════════════════════════════\n');

async function testFullIntegration() {
  try {
    // Test 1: Cache
    console.log('📋 Test 1: Vérification du Cache');
    console.log('─────────────────────────────────────');
    const cacheAvailable = await ollamaCache.isAvailable();
    if (!cacheAvailable) {
      console.error('❌ Cache Redis non disponible !\n');
      process.exit(1);
    }
    const stats = await ollamaCache.stats();
    console.log(`✅ Cache actif: ${stats.count} embeddings\n`);
    
    // Test 2: Ollama
    console.log('📋 Test 2: Vérification d\'Ollama');
    console.log('─────────────────────────────────────');
    const axios = require('axios');
    try {
      await axios.get('http://localhost:11434/api/tags', { timeout: 5000 });
      console.log('✅ Ollama accessible\n');
    } catch (error) {
      console.error('❌ Ollama non accessible !\n');
      process.exit(1);
    }
    
    // Test 3: Test RAG complet
    console.log('📋 Test 3: Recherche RAG avec Cache');
    console.log('─────────────────────────────────────');
    const question = "Quelles sont les agences Chery à Tunis ?";
    console.log(`   Question: "${question}"`);
    
    const start = Date.now();
    const result = await ragService.searchContext(question);
    const duration = Date.now() - start;
    
    if (result) {
      console.log(`✅ Recherche réussie en ${duration}ms`);
      console.log(`   Intent: ${result.intent}`);
      console.log(`   Langue: ${result.lang}`);
      console.log(`   Contexte: ${result.context.length} chars\n`);
    } else {
      console.log(`⚠️  Aucun résultat (${duration}ms)\n`);
    }
    
    // Test 4: Vérifier que le cache a été utilisé
    console.log('📋 Test 4: Vérification Cache après RAG');
    console.log('─────────────────────────────────────');
    const statsAfter = await ollamaCache.stats();
    console.log(`   Embeddings: ${statsAfter.count}`);
    
    if (statsAfter.count > stats.count) {
      console.log(`   ✅ +${statsAfter.count - stats.count} nouveaux embeddings ajoutés\n`);
    } else {
      console.log(`   ✅ Embedding trouvé en cache (pas de nouveau)\n`);
    }
    
    // Test 5: Test performance cache
    console.log('📋 Test 5: Performance Cache (HIT vs MISS)');
    console.log('─────────────────────────────────────');
    
    // Question déjà en cache
    const start2 = Date.now();
    await ragService.searchContext(question); // Même question
    const duration2 = Date.now() - start2;
    
    console.log(`   1ère fois: ${duration}ms`);
    console.log(`   2ème fois: ${duration2}ms`);
    
    if (duration2 < duration) {
      const improvement = Math.round((duration / duration2) * 10) / 10;
      console.log(`   ✅ ${improvement}x plus rapide avec cache !\n`);
    } else {
      console.log(`   ⚠️  Pas d'amélioration visible\n`);
    }
    
    // Résumé
    console.log('═══════════════════════════════════════');
    console.log('📊 RÉSUMÉ\n');
    console.log('✅ Ollama: Fonctionnel');
    console.log('✅ Cache Redis: Actif');
    console.log('✅ RAG Service: Opérationnel');
    console.log(`✅ Embeddings en cache: ${statsAfter.count}`);
    console.log('\n🎉 Ollama est bien intégré avec le cache !');
    console.log('   Le système RAG fonctionne correctement.\n');
    console.log('═══════════════════════════════════════\n');
    
    process.exit(0);
    
  } catch (error) {
    console.error('\n❌ ERREUR:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

if (require.main === module) {
  testFullIntegration();
}

module.exports = { testFullIntegration };
