// scripts/addToCache.js
// ═══════════════════════════════════════════════════════════
//  Script pour ajouter rapidement des questions au cache
//  Usage: node scripts/addToCache.js "Ma question à mettre en cache"
// ═══════════════════════════════════════════════════════════

// Charger les variables d'environnement
require('dotenv').config();

const ollamaCache = require('../services/ollamaCache');
const axios = require('axios');

/**
 * Génère un embedding avec Ollama
 */
async function generateEmbedding(text) {
  try {
    const response = await axios.post('http://localhost:11434/api/embeddings', {
      model: 'nomic-embed-text',
      prompt: text
    }, {
      timeout: 30000
    });
    
    return response.data.embedding;
  } catch (error) {
    throw new Error(`Ollama error: ${error.message}`);
  }
}

/**
 * Ajoute une question au cache
 */
async function addToCache(question) {
  console.log('\n🔄 Ajout au cache...\n');
  
  try {
    // Vérifier si déjà en cache
    const cached = await ollamaCache.get(question);
    
    if (cached) {
      console.log('⏭️  Cette question est déjà en cache');
      console.log(`   Dimensions: ${cached.length}`);
      console.log(`   ✅ Rien à faire\n`);
      return;
    }
    
    // Générer l'embedding
    console.log(`📝 Question: "${question}"`);
    console.log('🤖 Génération avec Ollama...');
    const embedding = await generateEmbedding(question);
    
    // Sauvegarder
    await ollamaCache.set(question, embedding);
    
    console.log(`✅ Embedding généré et mis en cache`);
    console.log(`   Dimensions: ${embedding.length}`);
    console.log(`   Clé: ${ollamaCache.generateKey(question)}`);
    
    // Stats
    const stats = await ollamaCache.stats();
    console.log(`\n📊 Total en cache: ${stats.count} embeddings\n`);
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
}

// ═══════════════════════════════════════════════════════════
//  EXÉCUTION
// ═══════════════════════════════════════════════════════════

if (require.main === module) {
  const question = process.argv.slice(2).join(' ');
  
  if (!question) {
    console.error('\n❌ Usage: node scripts/addToCache.js "Votre question ici"\n');
    process.exit(1);
  }
  
  addToCache(question).catch(error => {
    console.error('\n❌ Erreur fatale:', error);
    process.exit(1);
  });
}

module.exports = { addToCache };
