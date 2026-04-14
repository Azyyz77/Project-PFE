const sql = require('mssql');
const { getConnection } = require('../config/database');

// Récupérer toutes les plages horaires (admin)
exports.getAllTimeSlots = async (req, res) => {
  try {
    const pool = await getConnection();
    const result = await pool.request()
      .query(`
        SELECT * FROM PlageHoraire
        ORDER BY agence_id, jour_semaine, heure_ouverture
      `);
    
    res.json(result.recordset);
  } catch (error) {
    console.error('Erreur lors de la récupération des plages horaires:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Récupérer les plages horaires d'une agence
exports.getAgencyTimeSlots = async (req, res) => {
  try {
    const { agenceId } = req.params;

    const pool = await getConnection();
    const result = await pool.request()
      .input('agence_id', sql.BigInt, agenceId)
      .query(`
        SELECT * FROM PlageHoraire
        WHERE agence_id = @agence_id
        ORDER BY jour_semaine, heure_ouverture
      `);
    
    res.json(result.recordset);
  } catch (error) {
    console.error('Erreur lors de la récupération des plages horaires:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Créer une plage horaire
exports.createTimeSlot = async (req, res) => {
  try {
    const { agence_id, jour_semaine, heure_ouverture, heure_fermeture, capacite } = req.body;
    
    if (!agence_id || jour_semaine === undefined || !heure_ouverture || !heure_fermeture || !capacite) {
      return res.status(400).json({ message: 'Tous les champs sont requis' });
    }

    const pool = await getConnection();
    const result = await pool.request()
      .input('agence_id', sql.BigInt, agence_id)
      .input('jour_semaine', sql.TinyInt, jour_semaine)
      .input('heure_ouverture', sql.Time, heure_ouverture)
      .input('heure_fermeture', sql.Time, heure_fermeture)
      .input('capacite', sql.Int, capacite)
      .query(`
        INSERT INTO PlageHoraire (agence_id, jour_semaine, heure_ouverture, heure_fermeture, capacite)
        VALUES (@agence_id, @jour_semaine, @heure_ouverture, @heure_fermeture, @capacite);
        SELECT SCOPE_IDENTITY() AS id;
      `);

    res.status(201).json({
      message: 'Plage horaire créée avec succès',
      id: result.recordset[0].id
    });
  } catch (error) {
    console.error('Erreur lors de la création de la plage horaire:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Mettre à jour une plage horaire
exports.updateTimeSlot = async (req, res) => {
  try {
    const { id } = req.params;
    const { jour_semaine, heure_ouverture, heure_fermeture, capacite } = req.body;

    const pool = await getConnection();
    await pool.request()
      .input('id', sql.BigInt, id)
      .input('jour_semaine', sql.TinyInt, jour_semaine)
      .input('heure_ouverture', sql.Time, heure_ouverture)
      .input('heure_fermeture', sql.Time, heure_fermeture)
      .input('capacite', sql.Int, capacite)
      .query(`
        UPDATE PlageHoraire
        SET jour_semaine = @jour_semaine, heure_ouverture = @heure_ouverture,
            heure_fermeture = @heure_fermeture, capacite = @capacite
        WHERE id = @id
      `);

    res.json({ message: 'Plage horaire mise à jour avec succès' });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la plage horaire:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Supprimer une plage horaire
exports.deleteTimeSlot = async (req, res) => {
  try {
    const { id } = req.params;

    const pool = await getConnection();
    await pool.request()
      .input('id', sql.BigInt, id)
      .query('DELETE FROM PlageHoraire WHERE id = @id');

    res.json({ message: 'Plage horaire supprimée avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression de la plage horaire:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Obtenir les créneaux disponibles pour une date et agence
exports.getAvailableSlots = async (req, res) => {
  try {
    const { agenceId, date } = req.query;

    if (!agenceId || !date) {
      return res.status(400).json({ message: 'Agence et date sont requis' });
    }

    const targetDate = new Date(date);
    const dayOfWeek = targetDate.getDay(); // 0 = Dimanche, 1 = Lundi, etc.

    const pool = await getConnection();
    
    // Récupérer les plages horaires pour ce jour
    const plagesResult = await pool.request()
      .input('agence_id', sql.BigInt, agenceId)
      .input('jour_semaine', sql.TinyInt, dayOfWeek)
      .query(`
        SELECT * FROM PlageHoraire
        WHERE agence_id = @agence_id AND jour_semaine = @jour_semaine
      `);

    if (plagesResult.recordset.length === 0) {
      return res.json([]);
    }

    // Récupérer les RDV existants pour cette date
    const rdvResult = await pool.request()
      .input('agence_id', sql.BigInt, agenceId)
      .input('date_debut', sql.DateTime2, new Date(targetDate.setHours(0, 0, 0, 0)))
      .input('date_fin', sql.DateTime2, new Date(targetDate.setHours(23, 59, 59, 999)))
      .query(`
        SELECT CAST(date_heure AS TIME) as heure, COUNT(*) as count
        FROM RendezVous
        WHERE agence_id = @agence_id 
          AND date_heure >= @date_debut 
          AND date_heure <= @date_fin
          AND statut NOT IN ('ANNULE', 'NO_SHOW')
        GROUP BY CAST(date_heure AS TIME)
      `);

    const rdvCounts = {};
    rdvResult.recordset.forEach(rdv => {
      rdvCounts[rdv.heure] = rdv.count;
    });

    // Générer les créneaux disponibles
    const availableSlots = [];
    
    for (const plage of plagesResult.recordset) {
      const startTime = plage.heure_ouverture;
      const endTime = plage.heure_fermeture;
      const capacity = plage.capacite;

      // Générer des créneaux de 30 minutes
      let currentTime = startTime;
      while (currentTime < endTime) {
        const count = rdvCounts[currentTime] || 0;
        if (count < capacity) {
          availableSlots.push({
            time: currentTime,
            available: capacity - count,
            capacity: capacity
          });
        }
        
        // Ajouter 30 minutes
        const [hours, minutes] = currentTime.split(':');
        const totalMinutes = parseInt(hours) * 60 + parseInt(minutes) + 30;
        const newHours = Math.floor(totalMinutes / 60);
        const newMinutes = totalMinutes % 60;
        currentTime = `${String(newHours).padStart(2, '0')}:${String(newMinutes).padStart(2, '0')}:00`;
      }
    }

    res.json(availableSlots);
  } catch (error) {
    console.error('Erreur lors de la récupération des créneaux disponibles:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};
