const { getConnection, sql } = require('../config/database');

const addVehicle = async (req, res) => {
  try {
    const {
      registration_number, vin, carte_grise_code,
      brand, model, version, color, year, mileage
    } = req.body;

    const user_id = req.user.id;

    if (!registration_number || !vin || !carte_grise_code || !model || !version || !year) {
      return res.status(400).json({
        error: 'Champs requis manquants',
        required: ['registration_number', 'vin', 'carte_grise_code', 'model', 'version', 'year']
      });
    }

    const pool = await getConnection();

    const checkResult = await pool.request()
      .input('registration_number', sql.VarChar, registration_number)
      .query('SELECT id FROM Vehicles WHERE registration_number = @registration_number');

    if (checkResult.recordset.length > 0) {
      return res.status(409).json({ error: 'Ce numéro d\'immatriculation existe déjà' });
    }

    const vehicleBrand = brand || 'CHERY';

    const insertQuery = `
      INSERT INTO Vehicles (
        user_id, registration_number, vin, carte_grise_code,
        brand, model, version, color, year, mileage, created_at
      )
      OUTPUT INSERTED.id, INSERTED.user_id, INSERTED.registration_number, INSERTED.vin,
             INSERTED.carte_grise_code, INSERTED.brand, INSERTED.model, INSERTED.version,
             INSERTED.color, INSERTED.year, INSERTED.mileage, INSERTED.created_at
      VALUES (
        @user_id, @registration_number, @vin, @carte_grise_code,
        @brand, @model, @version, @color, @year, @mileage, GETDATE()
      )
    `;

    const result = await pool.request()
      .input('user_id', sql.Int, user_id)
      .input('registration_number', sql.VarChar, registration_number)
      .input('vin', sql.VarChar, vin)
      .input('carte_grise_code', sql.VarChar, carte_grise_code)
      .input('brand', sql.VarChar, vehicleBrand)
      .input('model', sql.VarChar, model)
      .input('version', sql.VarChar, version)
      .input('color', sql.VarChar, color || null)
      .input('year', sql.Int, year)
      .input('mileage', sql.Int, mileage || 0)
      .query(insertQuery);

    res.status(201).json({
      message: 'Véhicule ajouté avec succès',
      vehicle: result.recordset[0]
    });
  } catch (error) {
    console.error('Erreur lors de l\'ajout du véhicule:', error);
    res.status(500).json({ error: 'Erreur lors de l\'ajout du véhicule', message: error.message });
  }
};

const getVehiclesByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    if (req.user.id !== parseInt(userId) &&
        req.user.role !== 'ADMIN' &&
        req.user.role !== 'AGENT_SAV' &&
        req.user.role !== 'RESPONSABLE_ATELIER') {
      return res.status(403).json({
        error: 'Accès non autorisé',
        message: 'Vous ne pouvez voir que vos propres véhicules'
      });
    }

    const pool = await getConnection();

    const result = await pool.request()
      .input('userId', sql.Int, userId)
      .query(`
        SELECT
          v.id, v.user_id, v.registration_number, v.vin, v.carte_grise_code,
          v.brand, v.model, v.version, v.color, v.year, v.mileage, v.created_at,
          u.first_name, u.last_name, u.email
        FROM Vehicles v
        INNER JOIN Users u ON v.user_id = u.id
        WHERE v.user_id = @userId
        ORDER BY v.created_at DESC
      `);

    res.json({ count: result.recordset.length, vehicles: result.recordset });
  } catch (error) {
    console.error('Erreur lors de la récupération des véhicules:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des véhicules', message: error.message });
  }
};

const getVehicleById = async (req, res) => {
  try {
    const { id } = req.params;

    const pool = await getConnection();

    const result = await pool.request()
      .input('id', sql.Int, id)
      .query(`
        SELECT
          v.id, v.user_id, v.registration_number, v.vin, v.carte_grise_code,
          v.brand, v.model, v.version, v.color, v.year, v.mileage, v.created_at,
          u.first_name, u.last_name, u.email, u.phone
        FROM Vehicles v
        INNER JOIN Users u ON v.user_id = u.id
        WHERE v.id = @id
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Véhicule non trouvé' });
    }

    const vehicle = result.recordset[0];

    if (vehicle.user_id !== req.user.id &&
        req.user.role !== 'ADMIN' &&
        req.user.role !== 'AGENT_SAV' &&
        req.user.role !== 'RESPONSABLE_ATELIER') {
      return res.status(403).json({ error: 'Accès non autorisé' });
    }

    res.json({ vehicle });
  } catch (error) {
    console.error('Erreur lors de la récupération du véhicule:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération du véhicule', message: error.message });
  }
};

const updateMileage = async (req, res) => {
  try {
    const { id } = req.params;
    const { mileage } = req.body;

    if (!mileage || mileage < 0) {
      return res.status(400).json({
        error: 'Kilométrage invalide',
        message: 'Le kilométrage doit être un nombre positif'
      });
    }

    const pool = await getConnection();

    const checkResult = await pool.request()
      .input('id', sql.Int, id)
      .query('SELECT user_id FROM Vehicles WHERE id = @id');

    if (checkResult.recordset.length === 0) {
      return res.status(404).json({ error: 'Véhicule non trouvé' });
    }

    const vehicle = checkResult.recordset[0];

    if (vehicle.user_id !== req.user.id &&
        req.user.role !== 'ADMIN' &&
        req.user.role !== 'AGENT_SAV' &&
        req.user.role !== 'RESPONSABLE_ATELIER') {
      return res.status(403).json({ error: 'Accès non autorisé' });
    }

    await pool.request()
      .input('id', sql.Int, id)
      .input('mileage', sql.Int, mileage)
      .query('UPDATE Vehicles SET mileage = @mileage WHERE id = @id');

    res.json({
      message: 'Kilométrage mis à jour avec succès',
      vehicle_id: parseInt(id),
      new_mileage: mileage
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du kilométrage:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour du kilométrage', message: error.message });
  }
};

module.exports = { addVehicle, getVehiclesByUser, getVehicleById, updateMileage };
