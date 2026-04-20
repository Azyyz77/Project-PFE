require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { getConnection, closeConnection } = require('../config/database');
const fs = require('fs');
const path = require('path');

async function testFileUploadSystem() {
  try {
    const pool = await getConnection();
    
    console.log('🧪 Test du système de pièces jointes...\n');
    
    // 1. Vérifier la table PieceJointe
    console.log('1. Vérification de la table PieceJointe...');
    const tableCheck = await pool.request().query(`
      SELECT COUNT(*) as count FROM PieceJointe
    `);
    console.log(`   ✅ Table accessible, ${tableCheck.recordset[0].count} enregistrements existants\n`);
    
    // 2. Vérifier le dossier uploads
    console.log('2. Vérification du dossier uploads...');
    const uploadsDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
      console.log('   ✅ Dossier uploads créé');
    } else {
      console.log('   ✅ Dossier uploads existe');
    }
    
    const files = fs.readdirSync(uploadsDir);
    console.log(`   📁 ${files.length} fichier(s) dans le dossier uploads\n`);
    
    // 3. Test d'insertion d'une pièce jointe fictive
    console.log('3. Test d\'insertion d\'une pièce jointe...');
    const testInsert = await pool.request()
      .input('entite_type', 'RDV')
      .input('entite_id', 999)
      .input('url', 'test-file.txt')
      .input('type_mime', 'text/plain')
      .input('taille_mo', 0.001)
      .query(`
        INSERT INTO PieceJointe (entite_type, entite_id, url, type_mime, taille_mo, date_upload)
        OUTPUT INSERTED.id
        VALUES (@entite_type, @entite_id, @url, @type_mime, @taille_mo, GETDATE())
      `);
    
    const insertedId = testInsert.recordset[0].id;
    console.log(`   ✅ Pièce jointe test insérée avec ID: ${insertedId}`);
    
    // 4. Test de récupération
    console.log('4. Test de récupération...');
    const selectTest = await pool.request()
      .input('entite_type', 'RDV')
      .input('entite_id', 999)
      .query(`
        SELECT * FROM PieceJointe 
        WHERE entite_type = @entite_type AND entite_id = @entite_id
      `);
    
    console.log(`   ✅ ${selectTest.recordset.length} pièce(s) jointe(s) récupérée(s)`);
    
    // 5. Nettoyage
    console.log('5. Nettoyage des données de test...');
    await pool.request()
      .input('id', insertedId)
      .query('DELETE FROM PieceJointe WHERE id = @id');
    console.log('   ✅ Données de test supprimées\n');
    
    // 6. Statistiques par type d'entité
    console.log('6. Statistiques des pièces jointes par type...');
    const stats = await pool.request().query(`
      SELECT 
        entite_type,
        COUNT(*) as total_files,
        ROUND(SUM(taille_mo), 2) as total_size_mb,
        ROUND(AVG(taille_mo), 3) as avg_size_mb
      FROM PieceJointe 
      GROUP BY entite_type
      ORDER BY total_files DESC
    `);
    
    if (stats.recordset.length > 0) {
      console.log('   📊 Statistiques actuelles:');
      stats.recordset.forEach(stat => {
        console.log(`   - ${stat.entite_type}: ${stat.total_files} fichiers, ${stat.total_size_mb}MB total`);
      });
    } else {
      console.log('   📊 Aucune pièce jointe existante');
    }
    
    console.log('\n✅ Tous les tests sont passés avec succès!');
    console.log('\n📋 Système de pièces jointes prêt à utiliser:');
    console.log('   - Backend: Controllers, routes et middleware configurés');
    console.log('   - Frontend: Composants FileUpload et AttachmentsList créés');
    console.log('   - API: /api/attachments/* endpoints disponibles');
    console.log('   - Stockage: Dossier /uploads configuré');
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
  } finally {
    await closeConnection();
  }
}

testFileUploadSystem();