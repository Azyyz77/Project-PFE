const { getConnection, sql } = require('../config/database');

// Récupérer tous les packages
exports.getAllPackages = async (req, res) => {
  try {
    const pool = await getConnection();
    const result = await pool.request()
      .query(`
        SELECT p.*, 
          (SELECT st.id, st.nom, st.duree_estimee
           FROM Package_SousType pst
           JOIN SousTypeIntervention st ON st.id = pst.sous_type_id
           WHERE pst.package_id = p.id
           FOR JSON PATH) as sous_types
        FROM PackageIntervention p
        ORDER BY p.nom
      `);
    
    const packages = result.recordset.map(pkg => ({
      ...pkg,
      sous_types: pkg.sous_types ? JSON.parse(pkg.sous_types) : []
    }));

    res.json(packages);
  } catch (error) {
    console.error('Erreur lors de la récupération des packages:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Créer un nouveau package
exports.createPackage = async (req, res) => {
  try {
    const { nom, description, prix, duree_estimee, sous_types } = req.body;
    
    if (!nom || !prix) {
      return res.status(400).json({ message: 'Nom et prix sont requis' });
    }

    const pool = await getConnection();
    const transaction = new sql.Transaction(pool);
    
    await transaction.begin();

    try {
      const result = await transaction.request()
        .input('nom', sql.NVarChar(150), nom)
        .input('description', sql.NVarChar(500), description || null)
        .input('prix', sql.Decimal(10, 3), prix)
        .input('duree_estimee', sql.NVarChar(50), duree_estimee || null)
        .query(`
          INSERT INTO PackageIntervention (nom, description, prix, duree_estimee, actif)
          VALUES (@nom, @description, @prix, @duree_estimee, 1);
          SELECT SCOPE_IDENTITY() AS id;
        `);

      const packageId = result.recordset[0].id;

      // Ajouter les sous-types
      if (sous_types && sous_types.length > 0) {
        for (const sousTypeId of sous_types) {
          await transaction.request()
            .input('package_id', sql.BigInt, packageId)
            .input('sous_type_id', sql.BigInt, sousTypeId)
            .query(`
              INSERT INTO Package_SousType (package_id, sous_type_id)
              VALUES (@package_id, @sous_type_id)
            `);
        }
      }

      await transaction.commit();

      res.status(201).json({
        message: 'Package créé avec succès',
        id: packageId
      });
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  } catch (error) {
    console.error('Erreur lors de la création du package:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Mettre à jour un package
exports.updatePackage = async (req, res) => {
  try {
    const { id } = req.params;
    const { nom, description, prix, duree_estimee, actif, sous_types } = req.body;

    const pool = await getConnection();
    const transaction = new sql.Transaction(pool);
    
    await transaction.begin();

    try {
      await transaction.request()
        .input('id', sql.BigInt, id)
        .input('nom', sql.NVarChar(150), nom)
        .input('description', sql.NVarChar(500), description || null)
        .input('prix', sql.Decimal(10, 3), prix)
        .input('duree_estimee', sql.NVarChar(50), duree_estimee || null)
        .input('actif', sql.Bit, actif !== undefined ? actif : true)
        .query(`
          UPDATE PackageIntervention
          SET nom = @nom, description = @description, 
              prix = @prix, duree_estimee = @duree_estimee, actif = @actif
          WHERE id = @id
        `);

      // Supprimer les anciennes associations
      await transaction.request()
        .input('package_id', sql.BigInt, id)
        .query('DELETE FROM Package_SousType WHERE package_id = @package_id');

      // Ajouter les nouvelles associations
      if (sous_types && sous_types.length > 0) {
        for (const sousTypeId of sous_types) {
          await transaction.request()
            .input('package_id', sql.BigInt, id)
            .input('sous_type_id', sql.BigInt, sousTypeId)
            .query(`
              INSERT INTO Package_SousType (package_id, sous_type_id)
              VALUES (@package_id, @sous_type_id)
            `);
        }
      }

      await transaction.commit();

      res.json({ message: 'Package mis à jour avec succès' });
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  } catch (error) {
    console.error('Erreur lors de la mise à jour du package:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Supprimer un package
exports.deletePackage = async (req, res) => {
  try {
    const { id } = req.params;

    const pool = await getConnection();
    const transaction = new sql.Transaction(pool);
    
    await transaction.begin();

    try {
      await transaction.request()
        .input('id', sql.BigInt, id)
        .query('DELETE FROM Package_SousType WHERE package_id = @id');

      await transaction.request()
        .input('id', sql.BigInt, id)
        .query('DELETE FROM PackageIntervention WHERE id = @id');

      await transaction.commit();

      res.json({ message: 'Package supprimé avec succès' });
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  } catch (error) {
    console.error('Erreur lors de la suppression du package:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Suggérer des packages basés sur les sous-types sélectionnés
exports.suggestPackages = async (req, res) => {
  try {
    const { sous_type_ids } = req.body;

    if (!sous_type_ids || sous_type_ids.length === 0) {
      return res.json([]);
    }

    const pool = await getConnection();
    const result = await pool.request()
      .input('sous_type_ids', sql.NVarChar(sql.MAX), sous_type_ids.join(','))
      .query(`
        SELECT DISTINCT p.*, 
          (SELECT st.id, st.nom, st.duree_estimee
           FROM Package_SousType pst
           JOIN SousTypeIntervention st ON st.id = pst.sous_type_id
           WHERE pst.package_id = p.id
           FOR JSON PATH) as sous_types
        FROM PackageIntervention p
        JOIN Package_SousType pst ON pst.package_id = p.id
        WHERE pst.sous_type_id IN (SELECT value FROM STRING_SPLIT(@sous_type_ids, ','))
          AND p.actif = 1
      `);
    
    const packages = result.recordset.map(pkg => ({
      ...pkg,
      sous_types: pkg.sous_types ? JSON.parse(pkg.sous_types) : []
    }));

    res.json(packages);
  } catch (error) {
    console.error('Erreur lors de la suggestion de packages:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};
