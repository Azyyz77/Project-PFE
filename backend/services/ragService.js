// services/ragService.js
// ═══════════════════════════════════════════════════════════
//  RAG Service — Graph + Vector Search pour Chery Tunisie
//  Stack : pgvector + Ollama (nomic-embed-text) + SQL Server
// ═══════════════════════════════════════════════════════════

const { Pool } = require('pg');
const { getConnection } = require('../config/database');
const axios = require('axios');

// ─────────────────────────────────────────────
//  Initialisation PostgreSQL
// ─────────────────────────────────────────────
let pgPool = null;
let ragAvailable = false;

try {
  if (process.env.PG_URL) {
    pgPool = new Pool({ connectionString: process.env.PG_URL });
    ragAvailable = true;
    console.log('[RAG] ✅ PostgreSQL connecté');
  } else {
    console.log('[RAG] ⚠️  PG_URL manquant — RAG désactivé');
  }
} catch (err) {
  console.error('[RAG] ❌ Erreur PostgreSQL:', err.message);
  ragAvailable = false;
}

const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';

// ─────────────────────────────────────────────
//  Détection de langue (FR / Arabe tunisien)
// ─────────────────────────────────────────────
function detectLanguage(text) {
  return /[\u0600-\u06FF]/.test(text) ? 'ar' : 'fr';
}

// ─────────────────────────────────────────────
//  Détection d'intention
// ─────────────────────────────────────────────
const INTENT_KEYWORDS = {
  agence: [
    'agence', 'ville', 'adresse', 'telephone', 'contact',
    'horaire', 'ouvert', 'localisation', 'où', 'tunis',
    'sfax', 'sousse', 'bizerte', 'monastir',
    'وين', 'عنوان', 'تلفون', 'فرع'
  ],
  package: [
    'package', 'pack', 'forfait', 'révision', 'vidange',
    'entretien', 'freinage', 'pneumatique', 'pneu',
    'باكاج', 'فيدانج', 'صيانة'
  ],
  service: [
    'service', 'intervention', 'réparation', 'maintenance',
    'diagnostic', 'panne', 'problème',
    'خدمة', 'إصلاح', 'تصليح'
  ],
  promotion: [
    'promotion', 'offre', 'réduction', 'remise', 'promo',
    'discount', 'solde',
    'برومو', 'تخفيض', 'عرض'
  ],
  rdv: [
    'rendez-vous', 'rdv', 'réserver', 'prendre', 'appointment',
    'planifier', 'statut',
    'موعد', 'نحجز', 'حجز', 'وقتاش'
  ],
};

function detectIntent(question) {
  const q = question.toLowerCase();
  for (const [intent, keywords] of Object.entries(INTENT_KEYWORDS)) {
    if (keywords.some(kw => q.includes(kw))) return intent;
  }
  return 'general';
}

// ─────────────────────────────────────────────
//  Embedding via Ollama
// ─────────────────────────────────────────────
async function getEmbedding(text) {
  try {
    const res = await axios.post(
      `${OLLAMA_URL}/api/embeddings`,
      { model: 'nomic-embed-text', prompt: text },
      { timeout: 8000 }
    );
    return res.data.embedding;
  } catch (err) {
    console.error('[RAG] ❌ Erreur Ollama embedding:', err.message);
    throw new Error('Ollama indisponible');
  }
}

// ─────────────────────────────────────────────
//  Découpage en chunks
// ─────────────────────────────────────────────
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
  return chunks.length > 0 ? chunks : [text.trim()];
}

// ─────────────────────────────────────────────
//  Ingestion d'un document dans pgvector
// ─────────────────────────────────────────────
async function ingestDocument(text, source, metadata = {}) {
  if (!pgPool) throw new Error('pgPool non initialisé');
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

// ─────────────────────────────────────────────
//  Recherche vectorielle dans pgvector
// ─────────────────────────────────────────────
async function vectorSearch(question, intent, limit = 8) {
  const qVector = await getEmbedding(question);

  // Si on a un intent précis → filtrer par type ET prendre plus de résultats
  if (intent !== 'general') {
    const { rows } = await pgPool.query(
      `SELECT content, source, metadata,
              1 - (embedding <=> $1) AS similarity
       FROM documents
       WHERE metadata->>'type' = $2
       ORDER BY embedding <=> $1
       LIMIT $3`,
      [JSON.stringify(qVector), intent, limit]
    );
    if (rows.length > 0) {
      console.log(`[RAG] 🎯 Filtre type="${intent}" → ${rows.length} résultats`);
      return rows;
    }
    console.log(`[RAG] ⚠️  Aucun résultat avec filtre "${intent}", passage en général`);
  }

  // Recherche générale sans filtre
  const { rows } = await pgPool.query(
    `SELECT content, source, metadata,
            1 - (embedding <=> $1) AS similarity
     FROM documents
     ORDER BY embedding <=> $1
     LIMIT $2`,
    [JSON.stringify(qVector), limit]
  );
  return rows;
}

// ─────────────────────────────────────────────
//  Contexte Graph depuis SQL Server
// ─────────────────────────────────────────────
async function getGraphContext(intent, clientId = null) {
  try {
    const db = await getConnection();
    const lines = [];

    // Toujours récupérer les agences si la question concerne les agences
    if (intent === 'agence' || intent === 'general') {
      const agences = await db.request().query(`
        SELECT nom, ville, adresse, telephone FROM Agence
      `);
      if (agences.recordset.length > 0) {
        lines.push('=== Nos Agences ===');
        agences.recordset.forEach(a => {
          lines.push(`• ${a.nom} | ${a.ville} | ${a.adresse} | Tél: ${a.telephone}`);
        });
      }
    }

    // Packages + promotions actives
    if (intent === 'package' || intent === 'promotion' || intent === 'general') {
      const packages = await db.request().query(`
        SELECT p.nom, p.description, p.prix,
               pr.titre AS promo_titre, pr.date_fin
        FROM PackageIntervention p
        LEFT JOIN Promotion pr
          ON pr.actif = 1 AND pr.date_fin >= GETDATE()
        WHERE p.actif = 1
      `);
      if (packages.recordset.length > 0) {
        lines.push('\n=== Packages Disponibles ===');
        packages.recordset.forEach(p => {
          const promo = p.promo_titre
            ? ` ✨ Promo: ${p.promo_titre} (jusqu'au ${new Date(p.date_fin).toLocaleDateString('fr-TN')})`
            : '';
          lines.push(`• ${p.nom} — ${p.prix} TND${promo}`);
          if (p.description) lines.push(`  ${p.description}`);
        });
      }
    }

    // Historique client si connecté
    if (clientId) {
      const rdvs = await db.request()
        .input('id', clientId)
        .query(`
          SELECT TOP 3
            r.date_rdv, r.statut,
            a.nom AS agence, p.nom AS package_nom
          FROM RendezVous r
          LEFT JOIN Agence a ON r.agence_id = a.id
          LEFT JOIN PackageIntervention p ON r.package_id = p.id
          WHERE r.client_id = @id
          ORDER BY r.date_rdv DESC
        `);
      if (rdvs.recordset.length > 0) {
        lines.push('\n=== Vos Derniers RDV ===');
        rdvs.recordset.forEach(r => {
          const date = new Date(r.date_rdv).toLocaleDateString('fr-TN');
          lines.push(`• ${date} — ${r.statut} — ${r.agence} — ${r.package_nom}`);
        });
      }
    }

    return lines.join('\n');
  } catch (err) {
    console.error('[RAG] ⚠️  Graph context error:', err.message);
    return '';
  }
}

// ─────────────────────────────────────────────
//  Formater la réponse selon la langue
// ─────────────────────────────────────────────
function buildSystemPrompt(context, intent, lang) {
  const langInstruction = lang === 'ar'
    ? 'Réponds OBLIGATOIREMENT en arabe tunisien (darija). Utilise des mots simples.'
    : 'Réponds en français de façon claire et professionnelle.';

  const intentGuide = {
    agence:    'Liste toutes les agences avec leurs coordonnées complètes.',
    package:   'Présente les packages avec prix et description. Mentionne les promotions actives.',
    service:   'Explique les services disponibles avec tarifs.',
    promotion: 'Mets en avant les offres et réductions actives.',
    rdv:       'Aide le client à prendre ou vérifier son rendez-vous.',
    general:   'Réponds de façon complète et utile.',
  };

  return `Tu es l'assistant officiel SAV de Chery Tunisie (STA).

${langInstruction}

RÈGLE ABSOLUE : Utilise UNIQUEMENT les données ci-dessous pour répondre.
Si l'information est présente dans les données, tu DOIS la fournir.
Ne dis JAMAIS "je n'ai pas cette information" si les données contiennent la réponse.

Consigne spécifique : ${intentGuide[intent] || intentGuide.general}

════════════════════════════════
DONNÉES DU SYSTÈME :
${context}
════════════════════════════════

Règles de présentation :
- Utilise des listes à puces pour plusieurs éléments
- Sois concis mais complet
- Termine toujours par une invitation à poser d'autres questions`;
}

// ─────────────────────────────────────────────
//  Fonction principale : searchContext
// ─────────────────────────────────────────────
async function searchContext(question, clientId = null) {
  if (!ragAvailable || !pgPool) {
    console.log('[RAG] Service non disponible');
    return null;
  }

  try {
    const intent = detectIntent(question);
    const lang   = detectLanguage(question);
    console.log(`[RAG] 🔎 Intent: ${intent} | Langue: ${lang}`);

    // 1. Recherche vectorielle
    const vectors = await vectorSearch(question, intent);
    console.log('[RAG] Scores de similarité:');
    vectors.forEach(r =>
      console.log(`  ${r.source}: ${Number(r.similarity).toFixed(3)}`)
    );

    // 2. Contexte Graph (SQL Server direct)
    const graphText = await getGraphContext(intent, clientId);

    // 3. Fusion — Graph en priorité + vecteurs en complément
    const vectorText = vectors
      .filter(r => r.similarity > 0.05)
      .map(r => r.content)
      .join('\n\n');

    const fullContext = [
      graphText  ? `[DONNÉES TEMPS RÉEL]\n${graphText}`        : '',
      vectorText ? `[BASE DE CONNAISSANCE]\n${vectorText}`      : '',
    ].filter(Boolean).join('\n\n');

    if (!fullContext.trim()) {
      console.log('[RAG] ⚠️  Contexte vide');
      return null;
    }

    console.log('[RAG] ✅ Contexte prêt (' + fullContext.length + ' chars)');
    console.log('[RAG] Aperçu:', fullContext.substring(0, 200));

    // 4. Retourner contexte + métadonnées pour le prompt
    return {
      context:      fullContext,
      systemPrompt: buildSystemPrompt(fullContext, intent, lang),
      intent,
      lang,
    };

  } catch (err) {
    console.error('[RAG] ❌ Erreur searchContext:', err.message);
    return null;
  }
}

// ─────────────────────────────────────────────
//  Synchronisation SQL Server → pgvector
// ─────────────────────────────────────────────
async function syncSQLServerData() {
  try {
    console.log('🔄 Synchronisation SQL Server → pgvector...');
    const db = await getConnection();

    // 1. Agences
    const agences = await db.request().query(`
      SELECT id, nom, ville, telephone, adresse FROM Agence
    `);
    for (const row of agences.recordset) {
      const text = `Agence STA Chery "${row.nom}" - Ville: ${row.ville} - Adresse: ${row.adresse} - Téléphone: ${row.telephone}.`;
      await ingestDocument(text, `agence_${row.id}`, { type: 'agence', ville: row.ville });
    }
    console.log(`✅ ${agences.recordset.length} agences ingérées`);

    // 2. Packages
    const packages = await db.request().query(`
      SELECT id, nom, description, prix, duree_estimee, actif
      FROM PackageIntervention WHERE actif = 1
    `);
    for (const row of packages.recordset) {
      const text = `Package: ${row.nom}. Description: ${row.description || ''}. Prix: ${row.prix || 'Non défini'} TND. Durée: ${row.duree_estimee || '?'} minutes.`;
      await ingestDocument(text, `package_${row.id}`, { type: 'package' });
    }
    console.log(`✅ ${packages.recordset.length} packages ingérés`);

    // 3. Services / Interventions
    const interventions = await db.request().query(`
      SELECT id, nom, description, prix, duree_estimee_min, actif
      FROM InterventionCatalog WHERE actif = 1
    `);
    for (const row of interventions.recordset) {
      const text = `Service: ${row.nom}. Description: ${row.description || 'Non défini'}. Prix: ${row.prix || 'Non défini'} TND. Durée: ${row.duree_estimee_min || '?'} minutes.`;
      await ingestDocument(text, `intervention_${row.id}`, { type: 'service' });
    }
    console.log(`✅ ${interventions.recordset.length} services ingérés`);

    // 4. Promotions actives
    const promotions = await db.request().query(`
      SELECT id, titre, description, date_debut, date_fin
      FROM Promotion
      WHERE actif = 1 AND date_fin >= GETDATE()
    `);
    for (const row of promotions.recordset) {
      const debut = new Date(row.date_debut).toLocaleDateString('fr-TN');
      const fin   = new Date(row.date_fin).toLocaleDateString('fr-TN');
      const text  = `Promotion: ${row.titre}. ${row.description || ''}. Valable du ${debut} au ${fin}.`;
      await ingestDocument(text, `promotion_${row.id}`, { type: 'promotion' });
    }
    console.log(`✅ ${promotions.recordset.length} promotions ingérées`);

    // 5. Statuts RDV
    const statuts = await db.request().query(`
      SELECT code, libelle FROM StatutRDV
    `);
    for (const row of statuts.recordset) {
      const text = `Statut de rendez-vous possible: ${row.libelle} (code: ${row.code}).`;
      await ingestDocument(text, `statutrdv_${row.code}`, { type: 'statut' });
    }
    console.log(`✅ ${statuts.recordset.length} statuts ingérés`);

    console.log('\n🎉 Synchronisation terminée !');
  } catch (err) {
    console.error('❌ Erreur sync:', err.message);
    throw err;
  }
}

// ─────────────────────────────────────────────
//  Auto-apprentissage depuis les feedbacks
// ─────────────────────────────────────────────
async function learnFromFeedbacks() {
  if (!pgPool) return;
  try {
    const { rows } = await pgPool.query(`
      SELECT question, correction FROM chat_feedback
      WHERE rating = -1
        AND correction IS NOT NULL
        AND processed = false
    `);
    for (const row of rows) {
      const text = `Question fréquente: ${row.question}\nRéponse correcte: ${row.correction}`;
      await ingestDocument(text, `feedback_${Date.now()}`, { type: 'feedback' });
      await pgPool.query(
        `UPDATE chat_feedback SET processed = true WHERE question = $1`,
        [row.question]
      );
    }
    if (rows.length > 0)
      console.log(`[RAG] 🧠 ${rows.length} corrections apprises`);
  } catch (err) {
    console.error('[RAG] Erreur apprentissage feedbacks:', err.message);
  }
}

module.exports = {
  searchContext,
  syncSQLServerData,
  ingestDocument,
  learnFromFeedbacks,
  detectIntent,
  detectLanguage,
};