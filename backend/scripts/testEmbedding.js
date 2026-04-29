// scripts/testEmbedding.js
require('dotenv').config();
const axios = require('axios');

const OLLAMA_URL = 'http://localhost:11434';

async function getEmbedding(text) {
  const res = await axios.post(`${OLLAMA_URL}/api/embeddings`, {
    model: 'nomic-embed-text',
    prompt: text
  });
  return res.data.embedding;
}

function cosineSimilarity(a, b) {
  const dot = a.reduce((sum, ai, i) => sum + ai * b[i], 0);
  const normA = Math.sqrt(a.reduce((sum, ai) => sum + ai * ai, 0));
  const normB = Math.sqrt(b.reduce((sum, bi) => sum + bi * bi, 0));
  return dot / (normA * normB);
}

async function main() {
  console.log('🧪 Test de vectorisation Ollama\n');

  const phrases = [
    "Quels sont vos agences disponibles ?",
    "Où se trouvent vos agences ?",
    "Combien coute une vidange ?",
    "Prix de la révision",
    "Tesla Model 3",
  ];

  console.log('📐 Génération des embeddings...\n');
  const embeddings = [];
  for (const phrase of phrases) {
    const emb = await getEmbedding(phrase);
    embeddings.push(emb);
    console.log(`✅ "${phrase}"`);
    console.log(`   Dimensions: ${emb.length}`);
    console.log(`   10 premiers chiffres: [${emb.slice(0, 10).map(n => n.toFixed(3)).join(', ')}]\n`);
  }

  console.log('\n📊 Similarité cosinus entre les phrases:');
  console.log('(1.0 = identique, 0.0 = complètement différent)\n');

  for (let i = 0; i < phrases.length; i++) {
    for (let j = i + 1; j < phrases.length; j++) {
      const sim = cosineSimilarity(embeddings[i], embeddings[j]);
      const bar = '█'.repeat(Math.round(sim * 20));
      console.log(`"${phrases[i].substring(0, 30)}"`);
      console.log(`  vs "${phrases[j].substring(0, 30)}"`);
      console.log(`  Similarité: ${sim.toFixed(4)} ${bar}\n`);
    }
  }
}

main().catch(console.error);