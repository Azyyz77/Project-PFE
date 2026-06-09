// scripts/testRAGComplete.js
// Test complet du système RAG après synchronisation

require('dotenv').config();
const { searchContext } = require('../services/ragService');

const TEST_QUESTIONS = [
  // Questions sur les agences
  { q: 'Quelles sont vos agences disponibles?', category: 'Agences' },
  { q: 'Donnez-moi l\'adresse de l\'agence de Tunis', category: 'Agences' },
  { q: 'Quel est le numéro de téléphone de l\'agence de Sfax?', category: 'Agences' },
  
  // Questions sur les packages
  { q: 'Quels sont les packages d\'entretien disponibles?', category: 'Packages' },
  { q: 'Combien coûte une révision complète?', category: 'Packages' },
  { q: 'Quelle est la durée d\'une vidange simple?', category: 'Packages' },
  
  // Questions sur les services
  { q: 'Quels services proposez-vous?', category: 'Services' },
  { q: 'Proposez-vous un diagnostic électronique?', category: 'Services' },
  { q: 'Combien coûte le contrôle des freins?', category: 'Services' },
  
  // Questions sur les promotions
  { q: 'Avez-vous des promotions en cours?', category: 'Promotions' },
  { q: 'Y a-t-il des offres spéciales ce mois-ci?', category: 'Promotions' },
  
  // Questions sur les véhicules
  { q: 'Quels modèles Chery sont supportés?', category: 'Véhicules' },
  { q: 'Travaillez-vous sur le Tiggo 7 Pro?', category: 'Véhicules' },
  { q: 'Quelles versions du Tiggo 4 Pro acceptez-vous?', category: 'Véhicules' },
  
  // Questions sur les problèmes
  { q: 'Ma voiture fait un bruit bizarre au freinage', category: 'Problèmes' },
  { q: 'Le voyant moteur s\'est allumé', category: 'Problèmes' },
  { q: 'Comment résoudre un problème de démarrage?', category: 'Problèmes' },
  
  // Questions sur les informations
  { q: 'Quels documents dois-je fournir?', category: 'Informations' },
  { q: 'Comment fonctionne la garantie?', category: 'Informations' },
  { q: 'Quelle est votre politique d\'assurance?', category: 'Informations' },
  
  // Questions en arabe tunisien
  { q: 'وين الفروع متاعكم؟', category: 'Arabe' },
  { q: 'شحال تكلفة الفيدانج؟', category: 'Arabe' },
];

async function testRAG() {
  console.log('═══════════════════════════════════════════════');
  console.log('   TEST COMPLET DU SYSTÈME RAG');
  console.log('═══════════════════════════════════════════════\n');

  let successCount = 0;
  let failCount = 0;
  const results = [];

  for (let i = 0; i < TEST_QUESTIONS.length; i++) {
    const { q, category } = TEST_QUESTIONS[i];
    console.log(`\n[${i + 1}/${TEST_QUESTIONS.length}] 📝 ${category}: ${q}`);
    console.log('─'.repeat(60));

    try {
      const startTime = Date.now();
      const result = await searchContext(q, null);
      const duration = Date.now() - startTime;

      if (result && result.context) {
        console.log(`✅ Succès (${duration}ms)`);
        console.log(`   Intent détecté: ${result.intent}`);
        console.log(`   Langue: ${result.lang}`);
        console.log(`   Contexte trouvé: ${result.context.length} caractères`);
        
        // Afficher un aperçu du contexte
        const preview = result.context.substring(0, 150).replace(/\n/g, ' ');
        console.log(`   Aperçu: ${preview}...`);
        
        successCount++;
        results.push({
          question: q,
          category,
          success: true,
          duration,
          intent: result.intent,
          contextLength: result.context.length
        });
      } else {
        console.log('⚠️  Aucun contexte trouvé');
        failCount++;
        results.push({
          question: q,
          category,
          success: false,
          duration,
          reason: 'Pas de contexte'
        });
      }
    } catch (error) {
      console.log(`❌ Erreur: ${error.message}`);
      failCount++;
      results.push({
        question: q,
        category,
        success: false,
        error: error.message
      });
    }
  }

  // Résumé
  console.log('\n\n═══════════════════════════════════════════════');
  console.log('   RÉSULTATS DU TEST');
  console.log('═══════════════════════════════════════════════\n');

  const totalTests = TEST_QUESTIONS.length;
  const successRate = ((successCount / totalTests) * 100).toFixed(1);

  console.log(`📊 Tests exécutés:     ${totalTests}`);
  console.log(`✅ Succès:             ${successCount} (${successRate}%)`);
  console.log(`❌ Échecs:             ${failCount}`);

  // Statistiques par catégorie
  console.log('\n📈 Résultats par catégorie:\n');
  const categories = {};
  results.forEach(r => {
    if (!categories[r.category]) {
      categories[r.category] = { total: 0, success: 0 };
    }
    categories[r.category].total++;
    if (r.success) categories[r.category].success++;
  });

  Object.entries(categories).forEach(([cat, stats]) => {
    const rate = ((stats.success / stats.total) * 100).toFixed(0);
    const bar = '█'.repeat(Math.floor(rate / 5));
    console.log(`  ${cat.padEnd(15)} ${bar.padEnd(20)} ${rate}% (${stats.success}/${stats.total})`);
  });

  // Temps de réponse
  const durations = results
    .filter(r => r.success && r.duration)
    .map(r => r.duration);
  
  if (durations.length > 0) {
    const avgDuration = (durations.reduce((a, b) => a + b, 0) / durations.length).toFixed(0);
    const minDuration = Math.min(...durations);
    const maxDuration = Math.max(...durations);

    console.log('\n⏱️  Temps de réponse:\n');
    console.log(`  Moyen:    ${avgDuration}ms`);
    console.log(`  Minimum:  ${minDuration}ms`);
    console.log(`  Maximum:  ${maxDuration}ms`);
  }

  // Recommandations
  console.log('\n💡 Recommandations:\n');
  if (successRate < 70) {
    console.log('  ⚠️  Taux de succès faible. Vérifiez:');
    console.log('     - Que la synchronisation SQL Server a bien fonctionné');
    console.log('     - Que les embeddings sont correctement générés');
    console.log('     - Que le cache Redis est préchauffé');
  } else if (successRate < 90) {
    console.log('  ✅ Taux de succès correct. Améliorations possibles:');
    console.log('     - Ajouter plus de documents détaillés');
    console.log('     - Enrichir les descriptions des services');
    console.log('     - Ajouter des synonymes et variations');
  } else {
    console.log('  🎉 Excellent taux de succès!');
    console.log('     - Le système RAG fonctionne très bien');
    console.log('     - Continuez à enrichir la base de connaissances');
  }

  if (durations.length > 0) {
    const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length;
    if (avgDuration > 500) {
      console.log('\n  ⚠️  Temps de réponse élevé. Optimisations:');
      console.log('     - Préchauffez le cache: node scripts/warmupCache.js');
      console.log('     - Vérifiez la connexion à Ollama');
      console.log('     - Optimisez les index PostgreSQL');
    } else if (avgDuration < 50) {
      console.log('\n  ⚡ Performances excellentes (cache très efficace)');
    }
  }

  console.log('\n═══════════════════════════════════════════════\n');

  // Échecs détaillés
  const failures = results.filter(r => !r.success);
  if (failures.length > 0) {
    console.log('❌ Questions échouées:\n');
    failures.forEach((f, i) => {
      console.log(`  ${i + 1}. [${f.category}] ${f.question}`);
      if (f.reason) console.log(`     Raison: ${f.reason}`);
      if (f.error) console.log(`     Erreur: ${f.error}`);
    });
    console.log();
  }

  process.exit(failures.length > 0 ? 1 : 0);
}

// Exécuter
testRAG().catch(err => {
  console.error('\n❌ Erreur fatale:', err);
  process.exit(1);
});
