// scripts/warmupCache.js
// ═══════════════════════════════════════════════════════════
//  Script de préchauffage du cache Ollama
//  Génère et met en cache les embeddings des questions courantes
// ═══════════════════════════════════════════════════════════

// Charger les variables d'environnement
require('dotenv').config();

const ollamaCache = require('../services/ollamaCache');
const axios = require('axios');

// ═══════════════════════════════════════════════════════════
//  QUESTIONS COURANTES À METTRE EN CACHE
// ═══════════════════════════════════════════════════════════

const COMMON_QUESTIONS = [
  // Questions sur les agences
  "Quelles sont les agences Chery à Tunis ?",
  "Où se trouve l'agence Chery la plus proche ?",
  "Quels sont les horaires d'ouverture des agences ?",
  "Comment contacter une agence Chery ?",
  "Liste des agences Chery en Tunisie",
  
  // Questions sur les véhicules
  "Quels sont les modèles Chery disponibles ?",
  "Quel est le prix de la Tiggo 8 ?",
  "Caractéristiques techniques de la Tiggo 7",
  "Consommation carburant des véhicules Chery",
  "Différence entre Tiggo 4 et Tiggo 7",
  "Chery Tiggo 8 Pro Max prix",
  "Arrizo 5 fiche technique",
  
  // Questions sur les services
  "Comment prendre un rendez-vous ?",
  "Quels sont les services d'entretien disponibles ?",
  "Prix de la révision complète",
  "Durée de garantie des véhicules Chery",
  "Pièces de rechange originales Chery",
  "Service après-vente Chery",
  
  // Questions sur les rendez-vous
  "Comment annuler un rendez-vous ?",
  "Modifier mon rendez-vous",
  "Créneaux disponibles pour rendez-vous",
  "Documents nécessaires pour rendez-vous",
  
  // Questions sur la maintenance
  "Quand faire la vidange ?",
  "Fréquence d'entretien recommandée",
  "Prix des interventions courantes",
  "Durée d'une révision complète",
  "Vérification technique périodique",
  
  // Questions sur les promotions
  "Promotions en cours",
  "Offres spéciales Chery",
  "Réductions pour véhicules neufs",
  "Programme de fidélité",
  
  // Questions sur le financement
  "Options de financement disponibles",
  "Crédit auto Chery",
  "Leasing véhicules Chery",
  "Comment financer l'achat d'un véhicule",
  
  // Questions techniques
  "Voyant moteur allumé que faire",
  "Problème de démarrage",
  "Bruit anormal au freinage",
  "Climatisation ne fonctionne pas",
  "Consommation excessive de carburant",
  
  // Questions administratives
  "Documents nécessaires pour immatriculation",
  "Procédure de garantie",
  "Comment obtenir une facture",
  "Suivi de commande de pièces",
  
  // Questions générales
  "Historique de la marque Chery",
  "Chery en Tunisie depuis quand",
  "Pays d'origine des véhicules Chery",
  "Certifications et normes de sécurité"
];

// ═══════════════════════════════════════════════════════════
//  FONCTIONS
// ═══════════════════════════════════════════════════════════

/**
 * Génère un embedding avec Ollama
 */
async function generateEmbedding(text) {
  try {
    const response = await axios.post('http://localhost:11434/api/embeddings', {
      model: 'nomic-embed-text',
      prompt: text
    }, {
      timeout: 30000 // 30 secondes
    });
    
    return response.data.embedding;
  } catch (error) {
    throw new Error(`Ollama error: ${error.message}`);
  }
}

/**
 * Vérifie si Ollama est disponible
 */
async function checkOllama() {
  try {
    await axios.get('http://localhost:11434/api/tags', { timeout: 5000 });
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Préchauffage du cache
 */
async function warmupCache() {
  console.log('\n🔥 PRÉCHAUFFAGE DU CACHE OLLAMA\n');
  console.log('═══════════════════════════════════════\n');
  
  // Vérifier Ollama
  console.log('🔍 Vérification de Ollama...');
  const ollamaAvailable = await checkOllama();
  
  if (!ollamaAvailable) {
    console.error('❌ Ollama n\'est pas accessible sur http://localhost:11434');
    console.error('   Veuillez démarrer Ollama avant de lancer ce script.');
    process.exit(1);
  }
  console.log('✅ Ollama est disponible\n');
  
  // Vérifier le cache
  const cacheAvailable = await ollamaCache.isAvailable();
  if (!cacheAvailable) {
    console.error('❌ Redis n\'est pas disponible');
    console.error('   Veuillez démarrer Redis avant de lancer ce script.');
    process.exit(1);
  }
  console.log('✅ Redis est disponible\n');
  
  // Statistiques initiales
  const statsInitial = await ollamaCache.stats();
  console.log(`📊 Cache initial: ${statsInitial.count} embeddings\n`);
  
  // Traitement des questions
  let successCount = 0;
  let skipCount = 0;
  let errorCount = 0;
  const startTime = Date.now();
  
  console.log(`🚀 Traitement de ${COMMON_QUESTIONS.length} questions...\n`);
  
  for (let i = 0; i < COMMON_QUESTIONS.length; i++) {
    const question = COMMON_QUESTIONS[i];
    const progress = `[${i + 1}/${COMMON_QUESTIONS.length}]`;
    
    try {
      // Vérifier si déjà en cache
      const cached = await ollamaCache.get(question);
      
      if (cached) {
        console.log(`${progress} ⏭️  SKIP - "${question.substring(0, 50)}..."`);
        skipCount++;
        continue;
      }
      
      // Générer l'embedding
      console.log(`${progress} 🔄 GEN  - "${question.substring(0, 50)}..."`);
      const embedding = await generateEmbedding(question);
      
      // Sauvegarder dans le cache
      await ollamaCache.set(question, embedding);
      console.log(`${progress} ✅ DONE - ${embedding.length} dimensions`);
      successCount++;
      
      // Petite pause pour ne pas surcharger Ollama
      if (i < COMMON_QUESTIONS.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
    } catch (error) {
      console.error(`${progress} ❌ ERROR - ${error.message}`);
      errorCount++;
    }
  }
  
  // Statistiques finales
  const duration = ((Date.now() - startTime) / 1000).toFixed(1);
  const statsFinal = await ollamaCache.stats();
  
  console.log('\n═══════════════════════════════════════');
  console.log('📊 RÉSUMÉ DU PRÉCHAUFFAGE\n');
  console.log(`   Total questions:    ${COMMON_QUESTIONS.length}`);
  console.log(`   ✅ Générés:         ${successCount}`);
  console.log(`   ⏭️  Déjà en cache:   ${skipCount}`);
  console.log(`   ❌ Erreurs:         ${errorCount}`);
  console.log(`   ⏱️  Durée:           ${duration}s`);
  console.log(`   📦 Cache final:     ${statsFinal.count} embeddings`);
  console.log(`   📈 Ajout:           +${statsFinal.count - statsInitial.count}`);
  console.log('\n═══════════════════════════════════════');
  
  if (successCount > 0) {
    console.log('\n🎉 Cache préchauffé avec succès !');
    console.log('   Les prochaines requêtes de ces questions seront ~200x plus rapides\n');
  }
  
  process.exit(errorCount > 0 ? 1 : 0);
}

// ═══════════════════════════════════════════════════════════
//  EXÉCUTION
// ═══════════════════════════════════════════════════════════

if (require.main === module) {
  warmupCache().catch(error => {
    console.error('\n❌ Erreur fatale:', error);
    process.exit(1);
  });
}

module.exports = { warmupCache, COMMON_QUESTIONS };
