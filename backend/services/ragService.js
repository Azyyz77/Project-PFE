// services/ragService.js
// ═══════════════════════════════════════════════════════════
//  RAG Service — Graph + Vector Search pour Chery Tunisie
//  Stack : pgvector + Ollama (nomic-embed-text) + SQL Server
// ═══════════════════════════════════════════════════════════

const { Pool } = require('pg');
const { getConnection } = require('../config/database');
const axios = require('axios');
const ollamaCache = require('./ollamaCache');

// ─────────────────────────────────────────────
//  Initialisation PostgreSQL
// ─────────────────────────────────────────────
let pgPool = null;
let ragAvailable = false;
let _ragReadyPromise = null;

if (process.env.PG_URL) {
  pgPool = new Pool({ connectionString: process.env.PG_URL });
  _ragReadyPromise = pgPool.query('SELECT 1')
    .then(() => {
      ragAvailable = true;
      console.log('[RAG] ✅ PostgreSQL connecté');
    })
    .catch(err => {
      ragAvailable = false;
      pgPool = null;
      _ragReadyPromise = null;
      console.error('[RAG] ❌ PostgreSQL inaccessible:', err.message);
    });
} else {
  console.log('[RAG] ⚠️  PG_URL manquant — RAG désactivé');
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
    'planifier', 'statut', 'créneau', 'créneaux', 'creneau', 'creneaux',
    'disponible', 'disponibles', 'disponibilité', 'dispo', 'slot',
    'موعد', 'نحجز', 'حجز', 'وقتاش', 'ميعاد', 'وقت'
  ],
  commande: [
    'commande', 'réparation', 'facture', 'facturée', 'statut commande',
    'montant', 'numéro', 'suivi', 'suivre', 'avancement', 'état commande',
    'فاتورة', 'كوموند', 'تتبع'
  ],
  information: [
    'garantie', 'assurance', 'document', 'requis', 'entretien',
    'information', 'معلومة', 'ضمان', 'contenu'
  ],
  probleme: [
    'problème', 'panne', 'bruit', 'voyant', 'solution', 'défaut',
    'مشكلة', 'عطب', 'ضو', 'solution'
  ],
  vehicule: [
    'voiture', 'véhicule', 'modèle', 'marque', 'version', 'chery',
    'كرهبة', 'كرهبتي', 'سيارة'
  ]
};

function detectIntent(question) {
  const q = question.toLowerCase();
  for (const [intent, keywords] of Object.entries(INTENT_KEYWORDS)) {
    if (keywords.some(kw => q.includes(kw))) return intent;
  }
  return 'general';
}

// ─────────────────────────────────────────────
//  Embedding via Ollama (avec cache Redis)
// ─────────────────────────────────────────────
async function getEmbedding(text) {
  try {
    // 1. Vérifier le cache d'abord
    const cached = await ollamaCache.get(text);
    if (cached) {
      return cached;
    }

    // 2. Générer l'embedding via Ollama
    const res = await axios.post(
      `${OLLAMA_URL}/api/embeddings`,
      { model: 'nomic-embed-text', prompt: text },
      { timeout: 15000 }
    );
    
    const embedding = res.data.embedding;

    // 3. Sauvegarder dans le cache
    await ollamaCache.set(text, embedding);

    return embedding;
  } catch (err) {
    console.error('[RAG] ❌ Erreur Ollama embedding:', err.message);
    throw new Error('Ollama indisponible');
  }
}

// ─────────────────────────────────────────────
//  Formater une valeur time SQL Server (retournée comme Date)
// ─────────────────────────────────────────────
function formatTime(val) {
  if (!val) return '';
  if (val instanceof Date) return val.toTimeString().substring(0, 5);
  return String(val).substring(0, 5);
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
       VALUES ($1, $2::vector, $3, $4)`,
      [chunk, JSON.stringify(embedding), source, JSON.stringify(metadata)]
    );
  }
  console.log(`✅ Ingéré: ${source} (${chunks.length} chunks)`);
}

// ─────────────────────────────────────────────
//  Recherche vectorielle dans pgvector
// ─────────────────────────────────────────────
async function vectorSearch(question, intent, limit = 12) {
  const qVector = await getEmbedding(question);

  // Recherche 100% sémantique (Vrai RAG) sur toute la base vectorielle
  const { rows } = await pgPool.query(
    `SELECT content, source, metadata,
            1 - (embedding <=> $1::vector) AS similarity
     FROM documents
     ORDER BY embedding <=> $1::vector
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

      // Promotions véhicules actives
      const promoVeh = await db.request().query(`
        SELECT pv.titre, pv.description, pv.prix_original, pv.prix_promotion,
               pv.pourcentage_reduction, pv.date_fin, pv.conditions,
               m.nom AS marque, mo.nom AS modele
        FROM PromotionVehicule pv
        LEFT JOIN Marque m  ON pv.marque_id  = m.id
        LEFT JOIN Modele mo ON pv.modele_id  = mo.id
        WHERE pv.actif = 1 AND pv.date_fin >= GETDATE()
      `);
      if (promoVeh.recordset.length > 0) {
        lines.push('\n=== Promotions Véhicules ===');
        promoVeh.recordset.forEach(pv => {
          const fin   = new Date(pv.date_fin).toLocaleDateString('fr-TN');
          const remise = pv.pourcentage_reduction ? `-${pv.pourcentage_reduction}%` : '';
          const modele = pv.marque && pv.modele ? ` (${pv.marque} ${pv.modele})` : '';
          lines.push(`• ${pv.titre}${modele} — ${pv.prix_promotion} TND ${remise} (jusqu'au ${fin})`);
          if (pv.description) lines.push(`  ${pv.description}`);
          if (pv.conditions) lines.push(`  Conditions: ${pv.conditions}`);
        });
      }
    }

    // Horaires agences (PlageHoraire)
    if (intent === 'agence' || intent === 'rdv' || intent === 'general') {
      const joursMap = { 1:'Lundi', 2:'Mardi', 3:'Mercredi', 4:'Jeudi', 5:'Vendredi', 6:'Samedi', 0:'Dimanche' };
      const horaires = await db.request().query(`
        SELECT a.nom AS agence, ph.jour_semaine, ph.heure_ouverture, ph.heure_fermeture
        FROM PlageHoraire ph
        JOIN Agence a ON ph.agence_id = a.id
        ORDER BY a.nom, ph.jour_semaine
      `);
      if (horaires.recordset.length > 0) {
        const grouped = {};
        horaires.recordset.forEach(h => {
          if (!grouped[h.agence]) grouped[h.agence] = [];
          const ouv = formatTime(h.heure_ouverture);
          const fer = formatTime(h.heure_fermeture);
          grouped[h.agence].push(`${joursMap[h.jour_semaine] || h.jour_semaine}: ${ouv}-${fer}`);
        });
        lines.push('\n=== Horaires des Agences ===');
        Object.entries(grouped).forEach(([agence, creneaux]) => {
          lines.push(`• ${agence}: ${creneaux.join(' | ')}`);
        });
      }
    }

    // Historique client si connecté
    if (clientId) {
      const sql = require('mssql');

      // Derniers RDV
      const rdvs = await db.request()
        .input('id', sql.BigInt, clientId)
        .query(`
          SELECT TOP 3
            r.date_rdv, r.statut,
            a.nom AS agence, p.nom AS package_nom
          FROM RendezVous r
          LEFT JOIN Agence a              ON r.agence_id  = a.id
          LEFT JOIN PackageIntervention p ON r.package_id = p.id
          WHERE r.client_id = @id
          ORDER BY r.date_rdv DESC
        `);
      if (rdvs.recordset.length > 0) {
        lines.push('\n=== Vos Derniers RDV ===');
        rdvs.recordset.forEach(r => {
          const date = new Date(r.date_rdv).toLocaleDateString('fr-TN');
          lines.push(`• ${date} — ${r.statut} — ${r.agence || '?'} — ${r.package_nom || 'Sans package'}`);
        });
      }

      // Commandes en cours + factures
      if (intent === 'commande' || intent === 'general') {
        const commandes = await db.request()
          .input('cid', sql.BigInt, clientId)
          .query(`
            SELECT TOP 3
              cr.numero, cr.statut, cr.montant_total, cr.date_creation,
              f.numero AS facture_num, f.montant_ttc, f.statut AS facture_statut
            FROM CommandeReparation cr
            LEFT JOIN Facture f ON f.commande_id = cr.id
            WHERE cr.client_id = @cid
            ORDER BY cr.date_creation DESC
          `);
        if (commandes.recordset.length > 0) {
          lines.push('\n=== Vos Commandes de Réparation ===');
          commandes.recordset.forEach(c => {
            const date = new Date(c.date_creation).toLocaleDateString('fr-TN');
            const montant = c.montant_total ? `${c.montant_total} TND` : 'Devis en cours';
            lines.push(`• Commande ${c.numero} — ${c.statut} — ${montant} (${date})`);
            if (c.facture_num) {
              lines.push(`  Facture ${c.facture_num} — ${c.montant_ttc} TND TTC — ${c.facture_statut}`);
            }
          });
        }
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
    commande:  'Donne les informations sur la commande (statut, montant) en te basant sur le numéro.',
    information: 'Donne les informations demandées (garantie, documents...) présentées dans la base.',
    probleme:  'Aide le client avec son problème technique en donnant la solution recommandée.',
    vehicule:  'Cite les modèles et versions de véhicules supportés.',
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
  // Si la connexion PG est encore en cours, attendre qu'elle se résolve
  if (!ragAvailable && _ragReadyPromise) {
    await _ragReadyPromise;
  }
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
    let totalDocs = 0;

    // 1. Agences
    console.log('  📍 Synchronisation des agences...');
    const agences = await db.request().query(`
      SELECT id, nom, ville, telephone, adresse, email FROM Agence
    `);
    for (const row of agences.recordset) {
      const email = row.email ? ` | Email: ${row.email}` : '';
      const text = `Agence STA Chery "${row.nom}"\nVille: ${row.ville}\nAdresse: ${row.adresse}\nTéléphone: ${row.telephone}${email}\n\nCette agence est située à ${row.ville} et offre tous les services d'entretien et de réparation pour les véhicules Chery.`;
      await ingestDocument(text, `agence_${row.id}`, { type: 'agence', ville: row.ville, nom: row.nom });
      totalDocs++;
    }
    console.log(`  ✅ ${agences.recordset.length} agences ingérées`);

    // 2. Packages d'intervention
    console.log('  📦 Synchronisation des packages...');
    const packages = await db.request().query(`
      SELECT id, nom, description, prix, duree_estimee, actif
      FROM PackageIntervention WHERE actif = 1
    `);
    for (const row of packages.recordset) {
      const desc = row.description || 'Forfait complet d\'entretien';
      const prix = row.prix ? `${row.prix} TND` : 'Prix sur devis';
      const duree = row.duree_estimee ? `${row.duree_estimee} minutes` : 'Durée variable';
      const text = `Package d'entretien: ${row.nom}\n\nDescription: ${desc}\nPrix: ${prix}\nDurée estimée: ${duree}\n\nCe package est disponible dans toutes nos agences. Prenez rendez-vous en ligne pour en bénéficier.`;
      await ingestDocument(text, `package_${row.id}`, { type: 'package', nom: row.nom });
      totalDocs++;
    }
    console.log(`  ✅ ${packages.recordset.length} packages ingérés`);

    // 3. Catalogue d'interventions
    console.log('  🔧 Synchronisation du catalogue d\'interventions...');
    const interventions = await db.request().query(`
      SELECT id, nom, description, prix, duree_estimee_min, actif
      FROM InterventionCatalog WHERE actif = 1
    `);
    for (const row of interventions.recordset) {
      const desc = row.description || 'Service d\'entretien professionnel';
      const prix = row.prix ? `${row.prix} TND` : 'Prix sur devis';
      const duree = row.duree_estimee_min ? `${row.duree_estimee_min} minutes` : 'Durée variable';
      const text = `Service: ${row.nom}\n\nDescription: ${desc}\nPrix: ${prix}\nDurée estimée: ${duree}\n\nCe service est réalisé par nos techniciens certifiés Chery avec des pièces d'origine.`;
      await ingestDocument(text, `intervention_${row.id}`, { type: 'service', nom: row.nom });
      totalDocs++;
    }
    console.log(`  ✅ ${interventions.recordset.length} services ingérés`);

    // 4. Promotions actives
    console.log('  🎁 Synchronisation des promotions...');
    const promotions = await db.request().query(`
      SELECT id, titre, description, date_debut, date_fin
      FROM Promotion
      WHERE actif = 1 AND date_fin >= GETDATE()
    `);
    for (const row of promotions.recordset) {
      const debut = new Date(row.date_debut).toLocaleDateString('fr-FR');
      const fin = new Date(row.date_fin).toLocaleDateString('fr-FR');
      const desc = row.description || 'Offre spéciale limitée';
      const text = `🎁 PROMOTION ACTIVE: ${row.titre}\n\n${desc}\n\nPériode de validité: Du ${debut} au ${fin}\n\nProfitez de cette offre en prenant rendez-vous dans l'une de nos agences.`;
      await ingestDocument(text, `promotion_${row.id}`, { type: 'promotion', titre: row.titre });
      totalDocs++;
    }
    console.log(`  ✅ ${promotions.recordset.length} promotions ingérées`);

    // 5. Informations importantes (Garantie, Assurance, Documents requis, etc.)
    console.log('  ℹ️  Synchronisation des informations...');
    const informations = await db.request().query(`
      SELECT s.id as section_id, s.titre as section_titre,
             c.id as contenu_id, c.titre as contenu_titre, c.contenu
      FROM SectionInformation s
      JOIN ContenuInformation c ON s.id = c.section_id
      WHERE s.actif = 1 AND c.actif = 1
      ORDER BY s.ordre, c.ordre
    `);
    for (const row of informations.recordset) {
      const text = `${row.section_titre}: ${row.contenu_titre}\n\n${row.contenu}\n\nSection: ${row.section_titre}`;
      await ingestDocument(text, `info_${row.section_id}_${row.contenu_id}`, { 
        type: 'information', 
        section: row.section_titre,
        titre: row.contenu_titre
      });
      totalDocs++;
    }
    console.log(`  ✅ ${informations.recordset.length} contenus d'information ingérés`);

    // 6. Problèmes prédéfinis avec solutions
    console.log('  🔍 Synchronisation des problèmes techniques...');
    const problemes = await db.request().query(`
      SELECT id, nom, description, solution, categorie
      FROM ProblemePredefini WHERE actif = 1
    `);
    for (const row of problemes.recordset) {
      const desc = row.description || 'Problème technique courant';
      const solution = row.solution || 'Contactez l\'agence pour un diagnostic complet';
      const cat = row.categorie ? `Catégorie: ${row.categorie}\n\n` : '';
      const text = `⚠️ PROBLÈME TECHNIQUE: ${row.nom}\n\n${cat}Description: ${desc}\n\n💡 Solution recommandée:\n${solution}`;
      await ingestDocument(text, `probleme_${row.id}`, {
        type: 'probleme',
        categorie: row.categorie,
        nom: row.nom
      });
      totalDocs++;
    }
    console.log(`  ✅ ${problemes.recordset.length} problèmes techniques ingérés`);

    // 7. Véhicules supportés (Marques, Modèles, Versions)
    console.log('  🚗 Synchronisation des véhicules supportés...');
    const vehicules = await db.request().query(`
      SELECT m.nom as marque, m.logo_url,
             mo.nom as modele, mo.annee_debut, mo.annee_fin,
             v.nom as version, v.motorisation, v.transmission
      FROM Marque m
      JOIN Modele mo ON m.id = mo.marque_id
      JOIN Version v ON mo.id = v.modele_id
      WHERE m.actif = 1 AND mo.actif = 1 AND v.actif = 1
      ORDER BY m.nom, mo.nom, v.nom
    `);
    const vehiculeMap = new Map();
    for (const row of vehicules.recordset) {
      const key = `${row.marque}_${row.modele}`;
      if (!vehiculeMap.has(key)) {
        vehiculeMap.set(key, {
          marque: row.marque,
          modele: row.modele,
          annee_debut: row.annee_debut,
          annee_fin: row.annee_fin,
          versions: []
        });
      }
      vehiculeMap.get(key).versions.push({
        nom: row.version,
        motorisation: row.motorisation,
        transmission: row.transmission
      });
    }

    for (const [key, data] of vehiculeMap.entries()) {
      const periode = data.annee_fin 
        ? `${data.annee_debut} - ${data.annee_fin}` 
        : `depuis ${data.annee_debut}`;
      const versionsText = data.versions.map(v => {
        const motor = v.motorisation ? ` | ${v.motorisation}` : '';
        const trans = v.transmission ? ` | ${v.transmission}` : '';
        return `  - ${v.nom}${motor}${trans}`;
      }).join('\n');
      
      const text = `🚗 Véhicule supporté: ${data.marque} ${data.modele}\n\nPériode: ${periode}\n\nVersions disponibles:\n${versionsText}\n\nTous les services d'entretien et de réparation sont disponibles pour ce véhicule dans nos agences STA Chery.`;
      await ingestDocument(text, `vehicule_${key}`, { 
        type: 'vehicule',
        marque: data.marque,
        modele: data.modele
      });
      totalDocs++;
    }
    console.log(`  ✅ ${vehiculeMap.size} modèles de véhicules ingérés`);

    // 8. Horaires par agence (PlageHoraire)
    console.log('  ⏰ Synchronisation des horaires par agence...');
    const joursMap = { 1:'Lundi', 2:'Mardi', 3:'Mercredi', 4:'Jeudi', 5:'Vendredi', 6:'Samedi', 0:'Dimanche' };
    const plages = await db.request().query(`
      SELECT a.id AS agence_id, a.nom AS agence_nom, a.ville,
             ph.jour_semaine, ph.heure_ouverture, ph.heure_fermeture
      FROM PlageHoraire ph
      JOIN Agence a ON ph.agence_id = a.id
      ORDER BY a.id, ph.jour_semaine
    `);
    const agenceHorairesMap = new Map();
    for (const row of plages.recordset) {
      if (!agenceHorairesMap.has(row.agence_id)) {
        agenceHorairesMap.set(row.agence_id, { nom: row.agence_nom, ville: row.ville, jours: [] });
      }
      const ouv = formatTime(row.heure_ouverture);
      const fer = formatTime(row.heure_fermeture);
      agenceHorairesMap.get(row.agence_id).jours.push(
        `${joursMap[row.jour_semaine] || row.jour_semaine}: ${ouv} - ${fer}`
      );
    }
    for (const [agId, data] of agenceHorairesMap.entries()) {
      const text = `Créneaux disponibles — Horaires de l'agence "${data.nom}" (${data.ville}):\n${data.jours.join('\n')}\nPrenez rendez-vous en ligne pour réserver un créneau disponible. Disponibilité : du lundi au vendredi.`;
      await ingestDocument(text, `horaires_agence_${agId}`, { type: 'horaires', agence: data.nom, ville: data.ville });
      totalDocs++;
    }
    console.log(`  ✅ ${agenceHorairesMap.size} agences avec horaires ingérées`);

    // 9. Types et sous-types d'interventions
    console.log('  🔩 Synchronisation des types d\'interventions...');
    const types = await db.request().query(`
      SELECT t.id, t.nom AS type_nom, t.delai_moyen,
             s.nom AS sous_type_nom, s.duree_estimee
      FROM TypeIntervention t
      LEFT JOIN SousTypeIntervention s ON s.type_intervention_id = t.id
      ORDER BY t.nom, s.nom
    `);
    const typeMap = new Map();
    for (const row of types.recordset) {
      if (!typeMap.has(row.id)) {
        typeMap.set(row.id, { nom: row.type_nom, delai: row.delai_moyen, sous: [] });
      }
      if (row.sous_type_nom) {
        typeMap.get(row.id).sous.push(
          row.duree_estimee ? `${row.sous_type_nom} (${row.duree_estimee} min)` : row.sous_type_nom
        );
      }
    }
    for (const [tid, data] of typeMap.entries()) {
      const delai = data.delai ? `Délai moyen: ${data.delai} jours\n` : '';
      const sousText = data.sous.length > 0 ? `\nPrestations incluses:\n${data.sous.map(s => `  - ${s}`).join('\n')}` : '';
      const text = `Type d'intervention: ${data.nom}\n\n${delai}${sousText}\n\nCe type d'intervention est disponible dans toutes nos agences STA Chery.`;
      await ingestDocument(text, `type_intervention_${tid}`, { type: 'service', nom: data.nom });
      totalDocs++;
    }
    console.log(`  ✅ ${typeMap.size} types d'interventions ingérés`);

    // 10. Promotions véhicules actives
    console.log('  🚘 Synchronisation des promotions véhicules...');
    const promoVeh = await db.request().query(`
      SELECT pv.id, pv.titre, pv.description, pv.prix_original, pv.prix_promotion,
             pv.pourcentage_reduction, pv.date_debut, pv.date_fin,
             pv.conditions, pv.stock_disponible,
             m.nom AS marque, mo.nom AS modele, v.nom AS version
      FROM PromotionVehicule pv
      LEFT JOIN Marque m  ON pv.marque_id  = m.id
      LEFT JOIN Modele mo ON pv.modele_id  = mo.id
      LEFT JOIN Version v ON pv.version_id = v.id
      WHERE pv.actif = 1 AND pv.date_fin >= GETDATE()
    `);
    for (const row of promoVeh.recordset) {
      const debut  = new Date(row.date_debut).toLocaleDateString('fr-FR');
      const fin    = new Date(row.date_fin).toLocaleDateString('fr-FR');
      const remise = row.pourcentage_reduction ? `${row.pourcentage_reduction}%` : 'Prix réduit';
      const modele = [row.marque, row.modele, row.version].filter(Boolean).join(' ');
      const stock  = row.stock_disponible ? `\nStock disponible: ${row.stock_disponible} véhicules` : '';
      const cond   = row.conditions ? `\nConditions: ${row.conditions}` : '';
      const desc   = row.description || '';
      const text   = `🚘 PROMOTION VÉHICULE: ${row.titre}\n\nVéhicule: ${modele || 'Tous modèles'}\nRéduction: ${remise} — Prix promo: ${row.prix_promotion} TND (au lieu de ${row.prix_original} TND)\n${desc}\nPériode: Du ${debut} au ${fin}${stock}${cond}\n\nContactez l'une de nos agences pour profiter de cette offre.`;
      await ingestDocument(text, `promo_vehicule_${row.id}`, { type: 'promotion', titre: row.titre, marque: row.marque });
      totalDocs++;
    }
    console.log(`  ✅ ${promoVeh.recordset.length} promotions véhicules ingérées`);

    // 11. FAQ depuis la base de données (+ FAQs système de secours)
    console.log('  📋 Synchronisation des FAQs...');
    let faqCount = 0;
    try {
      const faqRows = await db.request().query(`
        SELECT id, question, reponse, categorie FROM FAQ
        WHERE actif = 1
        ORDER BY ordre, id
      `);
      for (const row of faqRows.recordset) {
        const cat  = row.categorie ? `Catégorie: ${row.categorie}\n\n` : '';
        const text = `Question fréquente: ${row.question}\n\n${cat}Réponse: ${row.reponse}`;
        await ingestDocument(text, `faq_${row.id}`, { type: 'faq', categorie: row.categorie });
        faqCount++;
        totalDocs++;
      }
      console.log(`  ✅ ${faqCount} FAQs depuis la base ingérées`);
    } catch (err) {
      // Table FAQ pas encore créée — utiliser les FAQs système codées en dur
      console.log('  ⚠️  Table FAQ absente — utilisation des FAQs système');
      const faqSystem = [
        { q: 'Quels sont les statuts possibles pour un rendez-vous?', a: 'PLANIFIE (créé), CONFIRME (validé), EN_COURS (intervention), TERMINE (fini), ANNULE.' },
        { q: 'Comment valider mon véhicule?', a: 'Fournissez carte grise, carnet d\'entretien et certificat d\'assurance. Un agent validera ou rejettera avec un motif.' },
        { q: 'Quels sont les statuts d\'une commande de réparation?', a: 'Brouillon, Devis, Validée, En cours, Terminée, Facturée, Annulée.' },
      ];
      for (const [i, faq] of faqSystem.entries()) {
        const text = `Question fréquente: ${faq.q}\n\nRéponse: ${faq.a}`;
        await ingestDocument(text, `faq_system_${i}`, { type: 'faq' });
        totalDocs++;
        faqCount++;
      }
    }
    console.log(`  ✅ ${faqCount} FAQs ingérées au total`);

    console.log(`\n🎉 Synchronisation terminée avec succès!`);
    console.log(`📊 Total: ${totalDocs} documents ingérés dans la base vectorielle\n`);
    
    return { success: true, totalDocs };
  } catch (err) {
    console.error('❌ Erreur sync:', err.message);
    console.error('Stack:', err.stack);
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
  ollamaCache, // Exposer le cache
};