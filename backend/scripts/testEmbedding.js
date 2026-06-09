require('dotenv').config();
const { searchContext } = require('../services/ragService');

async function runTest() {
  console.log('🔍 Test de la recherche sémantique (RAG)...');
  
  // Tu peux modifier la question ici pour tester différents cas
  const question = "Quels sont les modèles de voitures Chery que vous avez ?";
  
  console.log(`Question posée : "${question}"\n`);
  
  try {
    const result = await searchContext(question);
    
    if (result) {
      console.log('\n✅ CONTEXTE TROUVÉ PAR LE RAG (pgvector + SQL Server) :\n');
      console.log('======================================================');
      console.log(result.context);
      console.log('======================================================');
      
      console.log('\n🧠 PROMPT SYSTÈME GÉNÉRÉ POUR GROQ :\n');
      console.log(result.systemPrompt);
    } else {
      console.log('\n⚠️ Aucun contexte pertinent trouvé.');
    }
  } catch (error) {
    console.error('❌ Erreur lors du test :', error);
  } finally {
    process.exit(0);
  }
}

runTest();