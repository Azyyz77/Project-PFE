// services/ragService.js
const { Pool } = require('pg');
const { getConnection } = require('../config/database');
const axios = require('axios');

let pgPool = null;
let ragAvailable = false;

// Initialiser le pool PostgreSQL seulement si configuré
try {
  if (process.env.PG_URL) {
    pgPool = new Pool({
      connectionString: process.env.PG_URL
    });
    ragAvailable = true;
    console.log('[RAG Service] PostgreSQL configuré');
  } else {
    console.log('[RAG Service] PostgreSQL non configuré (PG_URL manquant)');
  }
} catch (error) {
  console.error('[RAG Service] Erreur initialisation PostgreSQL:', error.message);
  ragAvailable = false;
}

const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';

// ── Obtenir embedding depuis Ollama ──
async function getEmbedding(text) {
  if (!process.env.OLLAMA_URL && OLLAMA_URL === 'http://localhost:11434') {
    throw new Error('Ollama non configuré');
  }
  
  const res = await axios.post(`${OLLAMA_URL}/api/embeddings`, {
    model: 'nomic-embed-text',
    prompt: text
  }, {
    timeout: 5000 // 5 secondes timeout
  });
  return res.data.embedding;
}

// ── Découper texte en chunks ──
function splitIntoChunks(text, size = 400) {
  const parts = text.split(/(?<=[.!?\n])\s+/);
  const chunks = [];
  let current = '';
  for (const p of parts) {
    if ((current + p).length > size) {
      if (current.trim()) chunks.push(current.trim());
      current = p;
    } else {
      current += ' ' + p;
    }
  }
  if (current.trim()) chunks.push(current.trim());
  return chunks;
}

// ── Ingérer un document dans pgvector ──
async function ingestDocument(text, source, metadata = {}) {
  await pgPool.query('DELETE FROM documents WHERE source = $1', [source]);
  const chunks = splitIntoChunks(text);
  for (const chunk of chunks) {
    const embedding = await getEmbedding(chunk);
    await pgPool.query(
      `INSERT INTO documents (content, embedding, source, metadata)
       VALUES ($1, $2, $3, $4)`,
      [chunk, JSON.stringify(embedding), source, JSON.stringify(metadata)]
    );
  }
  console.log(`✅ Ingéré: ${source} (${chunks.length} chunks)`);
}

// ── Synchroniser les données SQL Server vers pgvector ──
async function syncSQLServerData() {
  try {
    console.log('🔄 Synchronisation SQL Server → pgvector...');
    const db = await getConnection();

    // 1. Services / Interventions
    const interventions = await db.request().query(`
      SELECT id, nom, description, prix, duree_estimee_min, actif
      FROM InterventionCatalog
      WHERE actif = 1
    `);
    for (const row of interventions.recordset) {
      const text = `Service: ${row.nom}. Description: ${row.description || 'Non défini'}. Prix: ${row.prix || 'Non défini'} TND. Durée estimée: ${row.duree_estimee_min || '?'} minutes.`;
      await ingestDocument(text, `intervention_${row.id}`, { type: 'service' });
    }

    // 2. Agences
    const agences = await db.request().query(`
      SELECT id, nom, ville, telephone, adresse
      FROM Agence
    `);
    for (const row of agences.recordset) {
      const text = `Agence STA Chery "${row.nom}" - Ville: ${row.ville} - Adresse: ${row.adresse} - Téléphone: ${row.telephone}.`;
      await ingestDocument(text, `agence_${row.id}`, { type: 'agence' });
    }

    // 3. Packages
    const packages = await db.request().query(`
      SELECT id, nom, description, prix, duree_estimee, actif
      FROM PackageIntervention
      WHERE actif = 1
    `);
    for (const row of packages.recordset) {
      const text = `Package: ${row.nom}. Description: ${row.description || ''}. Prix: ${row.prix || 'Non défini'} TND. Durée: ${row.duree_estimee || '?'} minutes.`;
      await ingestDocument(text, `package_${row.id}`, { type: 'package' });
    }

    // 4. Promotions actives
    const promotions = await db.request().query(`
      SELECT id, titre, description, date_debut, date_fin, actif
      FROM Promotion
      WHERE actif = 1 AND date_fin >= GETDATE()
    `);
    for (const row of promotions.recordset) {
      const text = `Promotion: ${row.titre}. Description: ${row.description || ''}. Valable du ${row.date_debut} au ${row.date_fin}.`;
      await ingestDocument(text, `promotion_${row.id}`, { type: 'promotion' });
    }

    // 5. Statuts RDV
    const statuts = await db.request().query(`
      SELECT code, libelle FROM StatutRDV
    `);
    for (const row of statuts.recordset) {
      const text = `Statut de rendez-vous possible: ${row.libelle} (code: ${row.code}).`;
      await ingestDocument(text, `statutrdv_${row.code}`, { type: 'statut' });
    }

    console.log('✅ Synchronisation terminée !');
  } catch (err) {
    console.error('❌ Erreur sync:', err.message);
  }
}

// ── Chercher le contexte pertinent pour une question ──
async function searchContext(question) {
  // Vérifier si RAG est disponible
  if (!ragAvailable || !pgPool) {
    console.log('[RAG Service] Service non disponible');
    return null;
  }

  try {
    const qVector = await getEmbedding(question);

    // Détecter le type de question
    const q = question.toLowerCase();
    let typeFilter = null;
    if (q.includes('agence') || q.includes('ville') || q.includes('adresse') || q.includes('telephone') || q.includes('contact')) {
      typeFilter = 'agence';
    } else if (q.includes('package') || q.includes('pack') || q.includes('forfait') || q.includes('révision') || q.includes('vidange')) {
      typeFilter = 'package';
    } else if (q.includes('service') || q.includes('intervention') || q.includes('réparation') || q.includes('maintenance')) {
      typeFilter = 'service';
    } else if (q.includes('promotion') || q.includes('offre') || q.includes('réduction') || q.includes('remise')) {
      typeFilter = 'promotion';
    } else if (q.includes('statut') || q.includes('rendez-vous') || q.includes('rdv')) {
      typeFilter = 'statut';
    }

    let rows;
    if (typeFilter) {
      // Recherche filtrée par type
      console.log(`🎯 Recherche filtrée par type: ${typeFilter}`);
      const result = await pgPool.query(
        `SELECT content, source, 1 - (embedding <=> $1) AS similarity
         FROM documents
         WHERE metadata->>'type' = $2
         ORDER BY embedding <=> $1
         LIMIT 10`,
        [JSON.stringify(qVector), typeFilter]
      );
      rows = result.rows;
    } else {
      // Recherche générale
      const result = await pgPool.query(
        `SELECT content, source, 1 - (embedding <=> $1) AS similarity
         FROM documents
         ORDER BY embedding <=> $1
         LIMIT 5`,
        [JSON.stringify(qVector)]
      );
      rows = result.rows;
    }

    console.log('🔍 Résultats RAG:');
    rows.forEach(r => console.log(`  - ${r.source}: ${r.similarity.toFixed(3)} → ${r.content.substring(0, 60)}...`));

    const relevant = rows.filter(r => r.similarity > 0.1);
    if (relevant.length === 0) {
      console.log('⚠️ Aucun résultat pertinent trouvé');
      return null;
    }

    console.log(`✅ ${relevant.length} résultats pertinents trouvés`);
    return relevant.map(r => r.content).join('\n\n---\n\n');
  } catch (err) {
    console.error('❌ Erreur recherche contexte:', err.message);
    return null;
  }
}

module.exports = { syncSQLServerData, searchContext, ingestDocument };