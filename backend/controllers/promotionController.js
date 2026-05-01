const { getConnection, sql } = require('../config/database');

// Récupérer toutes les promotions actives
exports.getActivePromotions = async (req, res) => {
  try {
    const pool = await getConnection();
    const result = await pool.request()
      .query(`
        SELECT * FROM Promotion
        WHERE actif = 1 
          AND date_debut <= GETDATE() 
          AND date_fin >= GETDATE()
        ORDER BY date_creation DESC
      `);
    
    res.json(result.recordset);
  } catch (error) {
    console.error('Erreur lors de la récupération des promotions:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Récupérer toutes les promotions (admin)
exports.getAllPromotions = async (req, res) => {
  try {
    const pool = await getConnection();
    const result = await pool.request()
      .query(`
        SELECT * FROM Promotion
        ORDER BY date_creation DESC
      `);
    
    res.json(result.recordset);
  } catch (error) {
    console.error('Erreur lors de la récupération des promotions:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Créer une promotion
exports.createPromotion = async (req, res) => {
  try {
    const { titre, description, image_url, date_debut, date_fin } = req.body;
    const admin_id = req.user.id; // Get admin ID from authenticated user
    
    if (!titre || !date_debut || !date_fin) {
      return res.status(400).json({ message: 'Titre, date de début et date de fin sont requis' });
    }

    // Validate dates
    const startDate = new Date(date_debut);
    const endDate = new Date(date_fin);
    
    if (endDate <= startDate) {
      return res.status(400).json({ message: 'La date de fin doit être après la date de début' });
    }

    const pool = await getConnection();
    const result = await pool.request()
      .input('admin_id', sql.BigInt, admin_id)
      .input('titre', sql.NVarChar(200), titre)
      .input('description', sql.NVarChar(sql.MAX), description || null)
      .input('image_url', sql.NVarChar(500), image_url || null)
      .input('date_debut', sql.DateTime2, startDate)
      .input('date_fin', sql.DateTime2, endDate)
      .query(`
        INSERT INTO Promotion (admin_id, titre, description, image_url, date_debut, date_fin, actif, date_creation)
        VALUES (@admin_id, @titre, @description, @image_url, @date_debut, @date_fin, 1, GETDATE());
        SELECT SCOPE_IDENTITY() AS id;
      `);

    res.status(201).json({
      message: 'Promotion créée avec succès',
      id: result.recordset[0].id
    });
  } catch (error) {
    console.error('Erreur lors de la création de la promotion:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Mettre à jour une promotion
exports.updatePromotion = async (req, res) => {
  try {
    const { id } = req.params;
    const { titre, description, image_url, date_debut, date_fin, actif } = req.body;

    // Validate dates
    const startDate = new Date(date_debut);
    const endDate = new Date(date_fin);
    
    if (endDate <= startDate) {
      return res.status(400).json({ message: 'La date de fin doit être après la date de début' });
    }

    const pool = await getConnection();
    await pool.request()
      .input('id', sql.BigInt, id)
      .input('titre', sql.NVarChar(200), titre)
      .input('description', sql.NVarChar(sql.MAX), description || null)
      .input('image_url', sql.NVarChar(500), image_url || null)
      .input('date_debut', sql.DateTime2, startDate)
      .input('date_fin', sql.DateTime2, endDate)
      .input('actif', sql.Bit, actif !== undefined ? actif : true)
      .query(`
        UPDATE Promotion
        SET titre = @titre, description = @description, image_url = @image_url,
            date_debut = @date_debut, date_fin = @date_fin, actif = @actif
        WHERE id = @id
      `);

    res.json({ message: 'Promotion mise à jour avec succès' });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la promotion:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Supprimer une promotion
exports.deletePromotion = async (req, res) => {
  try {
    const { id } = req.params;

    const pool = await getConnection();
    await pool.request()
      .input('id', sql.BigInt, id)
      .query('DELETE FROM Promotion WHERE id = @id');

    res.json({ message: 'Promotion supprimée avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression de la promotion:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};
