const { getConnection, sql } = require('./config/database');

async function testPDFGeneration() {
  try {
    console.log('🧪 Test de génération PDF\n');
    
    const pool = await getConnection();
    
    // Récupérer une facture
    const result = await pool.request().query(`
      SELECT TOP 1 
        f.id,
        f.numero,
        f.montant_ttc,
        f.statut
      FROM Facture f
      ORDER BY f.id DESC
    `);
    
    if (result.recordset.length === 0) {
      console.log('❌ Aucune facture trouvée');
      return;
    }
    
    const facture = result.recordset[0];
    console.log('✅ Facture trouvée:', facture.numero);
    console.log('   ID:', facture.id);
    console.log('   Montant:', facture.montant_ttc, 'TND');
    console.log('   Statut:', facture.statut);
    
    // Tester l'endpoint
    console.log('\n📋 Test de l\'endpoint PDF...');
    console.log('URL:', `http://localhost:3000/api/invoices/${facture.id}/pdf`);
    console.log('\n⚠️  Pour tester:');
    console.log('1. Assurez-vous que le backend est démarré');
    console.log('2. Utilisez Postman ou curl avec un token valide');
    console.log('3. Ou testez directement dans l\'interface');
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    console.error(error);
  } finally {
    process.exit(0);
  }
}

testPDFGeneration();
