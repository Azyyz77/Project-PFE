/**
 * Test race condition sur la réservation de créneaux.
 * Lance N requêtes simultanées sur le même créneau et vérifie que
 * seule 1 réussit (ou au plus `capacite` réussites).
 *
 * Usage:
 *   node scripts/testRaceCondition.js <token> <agenceId> <date> <vehiculeId>
 *
 * Exemple:
 *   node scripts/testRaceCondition.js "eyJ..." 1 2026-06-10 3
 */

const https = require('https');
const http = require('http');

const [,, TOKEN, AGENCE_ID, DATE, VEHICULE_ID] = process.argv;

if (!TOKEN || !AGENCE_ID || !DATE || !VEHICULE_ID) {
  console.error('Usage: node testRaceCondition.js <token> <agenceId> <date> <vehiculeId>');
  console.error('Exemple: node testRaceCondition.js "eyJ..." 1 2026-06-10 3');
  process.exit(1);
}

const BASE_URL = process.env.API_URL || 'http://localhost:5000';
const CONCURRENT_REQUESTS = 5; // Nombre de clients simultanés
const HEURE_TEST = '09:00:00';  // Créneau à tester

function makeRequest(clientNum) {
  return new Promise((resolve) => {
    const body = JSON.stringify({
      vehicule_id: parseInt(VEHICULE_ID),
      agence_id: parseInt(AGENCE_ID),
      date_heure: `${DATE}T${HEURE_TEST}`,
      description: `Test race condition - client ${clientNum}`,
      duree_estimee: 60,
      sous_type_ids: [],
      package_ids: []
    });

    const url = new URL(`${BASE_URL}/api/appointments`);
    const lib = url.protocol === 'https:' ? https : http;

    const options = {
      hostname: url.hostname,
      port: url.port || (url.protocol === 'https:' ? 443 : 80),
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Length': Buffer.byteLength(body)
      }
    };

    const req = lib.request(options, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
          resolve({ clientNum, status: res.statusCode, body: JSON.parse(data) });
        } catch {
          resolve({ clientNum, status: res.statusCode, body: data });
        }
      });
    });

    req.on('error', (err) => {
      resolve({ clientNum, status: 'ERROR', body: err.message });
    });

    req.write(body);
    req.end();
  });
}

async function run() {
  console.log(`\n=== Test Race Condition ===`);
  console.log(`Créneau: ${DATE}T${HEURE_TEST} | Agence: ${AGENCE_ID} | Véhicule: ${VEHICULE_ID}`);
  console.log(`Lancement de ${CONCURRENT_REQUESTS} requêtes simultanées...\n`);

  // Lancer toutes les requêtes en parallèle (simultanément)
  const promises = Array.from({ length: CONCURRENT_REQUESTS }, (_, i) => makeRequest(i + 1));
  const results = await Promise.all(promises);

  // Analyser les résultats
  const successes = results.filter(r => r.status === 201);
  const conflicts  = results.filter(r => r.status === 409);
  const errors     = results.filter(r => r.status !== 201 && r.status !== 409);

  console.log('--- Résultats ---');
  results.forEach(r => {
    const icon = r.status === 201 ? '✅' : r.status === 409 ? '🚫' : '❌';
    const msg  = r.status === 201
      ? `RDV créé (id=${r.body?.appointment?.id})`
      : r.body?.error || r.body?.message || JSON.stringify(r.body).slice(0, 80);
    console.log(`  Client ${r.clientNum}: ${icon} HTTP ${r.status} — ${msg}`);
  });

  console.log('\n--- Bilan ---');
  console.log(`  Succès (201): ${successes.length}`);
  console.log(`  Créneau plein (409): ${conflicts.length}`);
  console.log(`  Autres erreurs: ${errors.length}`);

  if (successes.length <= 1) {
    console.log('\n✅ PASS — La race condition est correctement bloquée.');
  } else {
    console.log(`\n❌ FAIL — ${successes.length} RDV créés sur le même créneau ! Race condition non protégée.`);
    console.log('   IDs créés:', successes.map(r => r.body?.appointment?.id).join(', '));
  }
}

run().catch(console.error);
