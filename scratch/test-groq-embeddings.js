const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
const MODEL = process.env.OLLAMA_EMBEDDING_MODEL || 'nomic-embed-text';

async function testEmbeddings() {
  try {
    console.log('Sending embedding request to Ollama...');
    const response = await fetch(`${OLLAMA_URL}/api/embeddings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: MODEL,
        prompt: 'Test message for STA SAV Chery RAG system'
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(JSON.stringify(data));
    }

    console.log('✅ Success! Dimension:', data.embedding.length);
    console.log('Aperçu:', data.embedding.slice(0, 5));
  } catch (err) {
    console.error('❌ Failed:', err.message);
  }
}

testEmbeddings();
