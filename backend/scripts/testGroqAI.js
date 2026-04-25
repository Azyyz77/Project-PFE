/**
 * Script de test pour vérifier l'intégration Groq AI
 */

require('dotenv').config();
const aiAssistantService = require('../services/aiAssistantService');

async function testGroqAI() {
  console.log('🧪 Test de l\'intégration Groq AI\n');
  console.log('Configuration:');
  console.log('- Groq API Key:', process.env.GROQ_API_KEY ? '✓ Configurée' : '✗ Manquante');
  console.log('- Groq Model:', process.env.GROQ_MODEL || 'llama-3.3-70b-versatile');
  console.log('');

  const testQuestions = [
    {
      question: 'Bonjour, comment puis-je prendre un rendez-vous?',
      context: { userType: 'client', userName: 'Test User' }
    },
    {
      question: 'Quels sont les modèles Chery disponibles?',
      context: { userType: 'client' }
    },
    {
      question: 'Quelle est la garantie sur les véhicules Chery?',
      context: { userType: 'client' }
    }
  ];

  for (let i = 0; i < testQuestions.length; i++) {
    const { question, context } = testQuestions[i];
    
    console.log(`\n📝 Test ${i + 1}/${testQuestions.length}`);
    console.log(`Question: ${question}`);
    console.log('Contexte:', JSON.stringify(context));
    console.log('---');

    try {
      const startTime = Date.now();
      const response = await aiAssistantService.getResponse(question, context);
      const duration = Date.now() - startTime;

      console.log('✅ Réponse reçue en', duration, 'ms');
      console.log('Réponse:', response.substring(0, 200) + (response.length > 200 ? '...' : ''));
    } catch (error) {
      console.error('❌ Erreur:', error.message);
      if (error.response) {
        console.error('Status:', error.response.status);
        console.error('Data:', error.response.data);
      }
    }
  }

  console.log('\n✅ Tests terminés');
}

// Exécuter les tests
testGroqAI().catch(error => {
  console.error('❌ Erreur fatale:', error);
  process.exit(1);
});
