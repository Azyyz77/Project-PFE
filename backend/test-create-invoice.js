const { getConnection, sql } = require('./config/database');

async function testCreateInvoice() {
  try {
    console.log('═══════════════════════════════════════════════════════════');
    console.log('           Test de Création de Facture');
    console.log('═══════════════════════════════════════════════════════════\n');
    
    const pool = await getConnection();
    
    // 1. Trouver une commande TERMINEE sans facture
    console.log('📋 Étape 1: Recherche d\'une commande TERMINEE sans facture...');
    const commande = await pool.request().query(`
      SELECT TOP 1 
        c.id, 
        c.numero, 
        c.montant_total,
        c.statut
      FROM CommandeReparation c
      LEFT JOIN Facture f ON f.commande_id = c.id
      WHERE c.statut = 'TERMINEE' AND f.id IS NULL
      ORDER BY c.id DESC
    `);
    
    if (commande.recordset.length === 0) {
      console.log('❌ Aucune commande TERMINEE sans facture trouvée\n');
      console.log('💡 Pour tester:');
      console.log('   1. Créez une commande depuis un RDV');
      console.log('   2. Ajoutez des lignes');
      console.log('   3. Changez le statut: BROUILLON → EN_COURS → TERMINEE');
      console.log('   4. Relancez ce test\n');
      return;
    }
    
    const cmd = commande.recordset[0];
    console.log('✅ Commande trouvée:');
    console.log(`   - Numéro: ${cmd.numero}`);
    console.log(`   - Statut: ${cmd.statut}`);
    console.log(`   - Montant: ${cmd.montant_total} TND\n`);
    
    // 2. Créer la facture
    console.log('📋 Étape 2: Création de la facture...');
    const result = await pool.request()
      .input('commande_id', sql.BigInt, cmd.id)
      .input('montant_ttc', sql.Decimal(10, 2), cmd.montant_total || 0)
      .query(`
        INSERT INTO Facture (commande_id, montant_ttc, statut)
        VALUES (@commande_id, @montant_ttc, 'EMISE');
        
        SELECT SCOPE_IDENTITY() AS id;
      `);
    
    const factureId = result.recordset[0].id;
    console.log(`✅ Facture insérée avec ID: ${factureId}\n`);
    
    // 3. Récupérer la facture créée
    console.log('📋 Étape 3: Récupération des détails de la facture...');
    const facture = await pool.request()
      .input('id', sql.BigInt, factureId)
      .query(`
        SELECT 
          f.*,
          c.numero AS commande_numero
        FROM Facture f
        JOIN CommandeReparation c ON c.id = f.commande_id
        WHERE f.id = @id
      `);
    
    const fact = facture.recordset[0];
    
    console.log('✅ Facture créée avec succès!');
    console.log('');
    console.log('📄 DÉTAILS DE LA FACTURE:');
    console.log(`   - ID: ${fact.id}`);
    console.log(`   - Numéro: ${fact.numero}`);
    console.log(`   - Commande: ${fact.commande_numero}`);
    console.log(`   - Montant TTC: ${fact.montant_ttc} TND`);
    console.log(`   - Statut: ${fact.statut}`);
    console.log(`   - Date émission: ${fact.date_emission}`);
    console.log('');
    
    // 4. Vérifier que la commande est passée à FACTUREE
    console.log('📋 Étape 4: Vérification du statut de la commande...');
    const commandeUpdated = await pool.request()
      .input('id', sql.BigInt, cmd.id)
      .query(`SELECT statut FROM CommandeReparation WHERE id = @id`);
    
    const newStatut = commandeUpdated.recordset[0].statut;
    console.log(`✅ Statut de la commande: ${newStatut}`);
    
    if (newStatut === 'FACTUREE') {
      console.log('✅ La commande a bien été mise à jour à FACTUREE\n');
    } else {
      console.log(`⚠️  ATTENTION: La commande est toujours à ${newStatut}\n`);
    }
    
    // 5. Afficher toutes les factures
    console.log('📋 Étape 5: Liste de toutes les factures...');
    const allFactures = await pool.request().query(`
      SELECT 
        f.id,
        f.numero,
        c.numero AS commande_numero,
        f.montant_ttc,
        f.statut,
        f.date_emission
      FROM Facture f
      JOIN CommandeReparation c ON c.id = f.commande_id
      ORDER BY f.id DESC
    `);
    
    console.log('');
    console.log('TOUTES LES FACTURES:');
    allFactures.recordset.forEach((f, index) => {
      console.log(`${index + 1}. ${f.numero} - Commande: ${f.commande_numero} - ${f.montant_ttc} TND - ${f.statut}`);
    });
    
    console.log('');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('✅ Test réussi!');
    console.log('═══════════════════════════════════════════════════════════');
    
  } catch (error) {
    console.log('');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('❌ Erreur lors du test:');
    console.log('═══════════════════════════════════════════════════════════');
    console.error('Status:', error.number || 'N/A');
    console.error('Message:', error.message);
    
    if (error.message.includes('UNIQUE KEY constraint')) {
      console.log('');
      console.log('💡 SOLUTION:');
      console.log('   Le trigger pour générer le numéro de facture n\'est pas créé.');
      console.log('   Exécutez le script SQL:');
      console.log('   backend/migrations/create_facture_numero_trigger.sql');
      console.log('   dans SQL Server Management Studio (SSMS)');
    }
  } finally {
    process.exit(0);
  }
}

testCreateInvoice();
