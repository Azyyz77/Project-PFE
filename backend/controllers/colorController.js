const { getConnection, sql } = require('../config/database');

// Récupérer toutes les couleurs
exports.getAllColors = async (req, res) => {
  try {
    const pool = await getConnection();
    const result = await pool.request()
      .query('SELECT * FROM Couleur ORDER BY nom');
    
    res.json(result.recordset);
  } catch (error) {
    console.error('Erreur lors de la récupération des couleurs:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Créer une nouvelle couleur
exports.createColor = async (req, res) => {
  try {
    const { nom, code_hex } = req.body;
    
    if (!nom) {
      return res.status(400).json({ message: 'Le nom est requis' });
    }

    const pool = await getConnection();

    const duplicateCheck = await pool.request()
      .input('nom', sql.NVarChar(50), nom)
      .query(`
        SELECT COUNT(*) AS count
        FROM Couleur
        WHERE LOWER(LTRIM(RTRIM(nom))) = LOWER(LTRIM(RTRIM(@nom)))
      `);

    if (duplicateCheck.recordset[0].count > 0) {
      return res.status(400).json({ message: 'Cette couleur existe deja' });
    }

    const result = await pool.request()
      .input('nom', sql.NVarChar(50), nom)
      .input('code_hex', sql.VarChar(7), code_hex || null)
      .query(`
        INSERT INTO Couleur (nom, code_hex, actif)
        VALUES (@nom, @code_hex, 1);
        SELECT SCOPE_IDENTITY() AS id;
      `);

    res.status(201).json({
      message: 'Couleur créée avec succès',
      id: result.recordset[0].id
    });
  } catch (error) {
    console.error('Erreur lors de la création de la couleur:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Mettre à jour une couleur
exports.updateColor = async (req, res) => {
  try {
    const { id } = req.params;
    const { nom, code_hex, actif } = req.body;

    const pool = await getConnection();

    if (nom) {
      const duplicateCheck = await pool.request()
        .input('id', sql.BigInt, id)
        .input('nom', sql.NVarChar(50), nom)
        .query(`
          SELECT COUNT(*) AS count
          FROM Couleur
          WHERE id <> @id
            AND LOWER(LTRIM(RTRIM(nom))) = LOWER(LTRIM(RTRIM(@nom)))
        `);

      if (duplicateCheck.recordset[0].count > 0) {
        return res.status(400).json({ message: 'Cette couleur existe deja' });
      }
    }

    await pool.request()
      .input('id', sql.BigInt, id)
      .input('nom', sql.NVarChar(50), nom)
      .input('code_hex', sql.VarChar(7), code_hex || null)
      .input('actif', sql.Bit, actif !== undefined ? actif : true)
      .query(`
        UPDATE Couleur
        SET nom = @nom, code_hex = @code_hex, actif = @actif
        WHERE id = @id
      `);

    res.json({ message: 'Couleur mise à jour avec succès' });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la couleur:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Supprimer une couleur
exports.deleteColor = async (req, res) => {
  try {
    const { id } = req.params;

    const pool = await getConnection();
    await pool.request()
      .input('id', sql.BigInt, id)
      .query('DELETE FROM Couleur WHERE id = @id');

    res.json({ message: 'Couleur supprimée avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression de la couleur:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};
