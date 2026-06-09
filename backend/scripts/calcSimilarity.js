require('dotenv').config();
const axios = require('axios');

const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
const MODEL = 'nomic-embed-text';

async function getEmbedding(text) {
  try {
    const res = await axios.post(
      `${OLLAMA_URL}/api/embeddings`,
      { model: MODEL, prompt: text },
      { timeout: 15000 }
    );
    return res.data.embedding;
  } catch (err) {
    console.error('Erreur embedding:', err.message || err);
    throw err;
  }
}

function dot(a, b) {
  let s = 0;
  for (let i = 0; i < a.length; i++) s += a[i] * b[i];
  return s;
}

function norm(a) {
  return Math.sqrt(dot(a, a));
}

function cosine(a, b) {
  const n1 = norm(a);
  const n2 = norm(b);
  if (n1 === 0 || n2 === 0) return 0;
  return dot(a, b) / (n1 * n2);
}

function bar(sim, width = 24) {
  const filled = Math.round(sim * width);
  return '█'.repeat(filled) + ' '.repeat(width - filled);
}

async function main() {
  const args = process.argv.slice(2);
  const phrases = args.length > 0 ? args : [
    'Quels sont vos agences disponibles ?',
    'Où se trouvent vos agences ?',
    'Combien coute une vidange ?',
    'Prix de la révision',
    'Tesla Model 3'
  ];

  console.log('🧪 Test de similarité cosinus — embeddings via Ollama');
  console.log(`⚙️  Ollama: ${OLLAMA_URL}  | model: ${MODEL}\n`);

  const embeddings = [];
  for (const p of phrases) {
    process.stdout.write(`Génération embedding: "${p}" ... `);
    const e = await getEmbedding(p);
    console.log(`OK (dim=${e.length})`);
    embeddings.push(e);
  }

  console.log('\n📊 Similarité cosinus entre les phrases:');
  console.log('(1.0 = identique, 0.0 = complètement différent)\n');

  for (let i = 0; i < phrases.length; i++) {
    for (let j = i + 1; j < phrases.length; j++) {
      const sim = cosine(embeddings[i], embeddings[j]);
      console.log(`\"${phrases[i]}\"\n  vs "${phrases[j]}"\n  Similarité: ${sim.toFixed(4)} ${bar(sim)}\n`);
    }
  }

  // Also print matrix
  console.log('Matrice (symétrique) :');
  const header = ['Phrases'].concat(phrases.map((p,idx)=>`[${idx+1}]`));
  console.log(header.join(' | '));

  for (let i = 0; i < phrases.length; i++) {
    const row = [`[${i+1}] ${phrases[i].slice(0,30).padEnd(30)}`];
    for (let j = 0; j < phrases.length; j++) {
      const sim = cosine(embeddings[i], embeddings[j]);
      row.push(sim.toFixed(3));
    }
    console.log(row.join(' | '));
  }

  process.exit(0);
}

main().catch(err => { console.error(err); process.exit(1); });
