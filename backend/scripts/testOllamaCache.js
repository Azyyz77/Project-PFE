// scripts/testOllamaCache.js
// Script de test pour vérifier le cache Ollama

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const ollamaCache = require('../services/ollamaCache');
const { getConnection } = require('../config/database');

async function testCache() {
  console.log('\n🧪 TEST DU CACHE OLLAMA\n');
  console.log('═══════════════════════════════════════\n');

  try {
    // Test 1: Stats initiales
    console.log('📊 Test 1: Statistiques initiales');
    const initialStats = await ollamaCache.stats();
    console.log('Stats:', JSON.stringify(initialStats, null, 2));

    // Test 2: Simulation d'embedding
    console.log('\n💾 Test 2: Sauvegarde d\'un embedding');
    const testText = 'Quelles sont les agences Chery à Tunis ?';
    const fakeEmbedding = Array.from({ length: 768 }, () => Math.random());
    
    await ollamaCache.set(testText, fakeEmbedding);
    console.log('✅ Embedding sauvegardé');

    // Test 3: Récupération (cache HIT)
    console.log('\n🔍 Test 3: Récupération depuis le cache');
    const retrieved = await ollamaCache.get(testText);
    
    if (retrieved && Array.isArray(retrieved) && retrieved.length === 768) {
      console.log('✅ Cache HIT - Embedding récupéré avec succès');
      console.log('Taille:', retrieved.length, 'dimensions');
      console.log('Premiers éléments:', retrieved.slice(0, 5).map(n => n.toFixed(4)));
    } else {
      console.log('❌ Erreur de récupération');
    }

    // Test 4: Cache MISS
    console.log('\n❌ Test 4: Cache MISS (texte inexistant)');
    const missed = await ollamaCache.get('Texte qui n\'existe pas dans le cache');
    console.log('Résultat:', missed === null ? '✅ NULL (attendu)' : '❌ Inattendu');

    // Test 5: Stats finales
    console.log('\n📊 Test 5: Statistiques finales');
    const finalStats = await ollamaCache.stats();
    console.log('Stats:', JSON.stringify(finalStats, null, 2));

    // Test 6: Génération de clé (hash)
    console.log('\n🔑 Test 6: Génération de clés');
    const key1 = ollamaCache.generateKey(testText);
    const key2 = ollamaCache.generateKey(testText.toUpperCase()); // Doit être identique (case-insensitive)
    console.log('Clé 1:', key1);
    console.log('Clé 2:', key2);
    console.log('Identiques:', key1 === key2 ? '✅ OUI' : '❌ NON');

    // Cleanup optionnel
    console.log('\n🗑️  Voulez-vous vider le cache de test ? (Commentez pour garder)');
    // await ollamaCache.clear();

    console.log('\n═══════════════════════════════════════');
    console.log('✅ Tests terminés avec succès\n');

  } catch (error) {
    console.error('\n❌ ERREUR PENDANT LES TESTS:', error.message);
    console.error(error.stack);
  } finally {
    process.exit(0);
  }
}

// Lancer le test
testCache();
