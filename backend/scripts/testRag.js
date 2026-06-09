require('dotenv').config();
const { searchContext } = require('../services/ragService');

// Questions à tester
const tests = [
  "Quels sont vos agences disponibles ?",
  "Où se trouvent vos agences ?",
  "Combien coute une vidange ?",
  "Prix de la révision",
  "Tesla Model 3"
];

async function runTests() {
  console.log('🧪 Test du RAG et de la similarité (Recherche sémantique)\n');
  
  for (const question of tests) {
    console.log(`\n======================================================`);
    console.log(`🔎 Question : "${question}"`);
    console.log(`======================================================`);

    try {
      // searchContext fait déjà vectorSearch et récupère les meilleurs résultats
      const result = await searchContext(question);
      
      if (result && result.context) {
        // Afficher les chunks que le système a trouvé (les plus similaires)
        console.log(`\n✅ CONTEXTE TROUVÉ (Ce qui sera envoyé à l'IA) :\n`);
        console.log(result.context);
      } else {
        console.log(`\n⚠️ Aucun contexte pertinent trouvé pour cette question.`);
      }
    } catch (error) {
       console.error(`\n❌ Erreur pour la question "${question}":`, error.message);
    }
  }
  
  process.exit(0);
}

runTests();