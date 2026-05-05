const { getConnection, sql } = require('../config/database');

// Récupérer toutes les plages horaires (admin)
exports.getAllTimeSlots = async (req, res) => {
  try {
    const pool = await getConnection();
    const result = await pool.request()
      .query(`
        SELECT 
          id,
          agence_id,
          jour_semaine,
          CONVERT(VARCHAR(8), heure_ouverture, 108) as heure_ouverture,
          CONVERT(VARCHAR(8), heure_fermeture, 108) as heure_fermeture,
          capacite
        FROM PlageHoraire
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
        SELECT 
          id,
          agence_id,
          jour_semaine,
          CONVERT(VARCHAR(8), heure_ouverture, 108) as heure_ouverture,
          CONVERT(VARCHAR(8), heure_fermeture, 108) as heure_fermeture,
          capacite
        FROM PlageHoraire
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
    let { agence_id, jour_semaine, heure_ouverture, heure_fermeture, capacite } = req.body;
    
    // Validation
    if (!agence_id || jour_semaine === undefined || !heure_ouverture || !heure_fermeture || !capacite) {
      return res.status(400).json({ 
        message: 'Tous les champs sont requis',
        missing: {
          agence_id: !agence_id,
          jour_semaine: jour_semaine === undefined,
          heure_ouverture: !heure_ouverture,
          heure_fermeture: !heure_fermeture,
          capacite: !capacite
        }
      });
    }

    // Convertir jour_semaine: JavaScript (0-6) → Database (1-7)
    // JavaScript: 0=Sunday, 1=Monday, ..., 6=Saturday
    // Database: 1=Monday, 2=Tuesday, ..., 7=Sunday
    // Conversion: 0→7, 1→1, 2→2, ..., 6→6
    if (jour_semaine === 0) {
      jour_semaine = 7; // Dimanche: 0 → 7
    }

    // Normaliser le format des heures (ajouter :00 si nécessaire)
    // Input HTML type="time" envoie "HH:mm", SQL Server attend "HH:mm:ss"
    if (heure_ouverture && !heure_ouverture.includes(':00')) {
      heure_ouverture = heure_ouverture + ':00';
    }
    if (heure_fermeture && !heure_fermeture.includes(':00')) {
      heure_fermeture = heure_fermeture + ':00';
    }

    // Valider que heure_ouverture < heure_fermeture
    if (heure_ouverture >= heure_fermeture) {
      return res.status(400).json({ 
        message: 'L\'heure d\'ouverture doit être avant l\'heure de fermeture',
        error: 'INVALID_TIME_RANGE',
        details: { heure_ouverture, heure_fermeture }
      });
    }

    console.log('[TimeSlot] Creating with:', { agence_id, jour_semaine, heure_ouverture, heure_fermeture, capacite });

    const pool = await getConnection();
    const result = await pool.request()
      .input('agence_id', sql.BigInt, agence_id)
      .input('jour_semaine', sql.TinyInt, jour_semaine)
      .input('heure_ouverture', sql.VarChar(8), heure_ouverture)  // Utiliser VarChar au lieu de Time
      .input('heure_fermeture', sql.VarChar(8), heure_fermeture)  // Utiliser VarChar au lieu de Time
      .input('capacite', sql.Int, capacite)
      .query(`
        INSERT INTO PlageHoraire (agence_id, jour_semaine, heure_ouverture, heure_fermeture, capacite)
        VALUES (@agence_id, @jour_semaine, CAST(@heure_ouverture AS TIME), CAST(@heure_fermeture AS TIME), @capacite);
        SELECT SCOPE_IDENTITY() AS id;
      `);

    res.status(201).json({
      message: 'Plage horaire créée avec succès',
      id: result.recordset[0].id
    });
  } catch (error) {
    console.error('Erreur lors de la création de la plage horaire:', error);
    res.status(500).json({ 
      message: 'Erreur serveur',
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Mettre à jour une plage horaire
exports.updateTimeSlot = async (req, res) => {
  try {
    const { id } = req.params;
    let { jour_semaine, heure_ouverture, heure_fermeture, capacite } = req.body;

    console.log('[TimeSlot] Update received:', { id, jour_semaine, heure_ouverture, heure_fermeture, capacite });

    // Validation
    if (jour_semaine === undefined || !heure_ouverture || !heure_fermeture || !capacite) {
      return res.status(400).json({ 
        message: 'Tous les champs sont requis',
        missing: {
          jour_semaine: jour_semaine === undefined,
          heure_ouverture: !heure_ouverture,
          heure_fermeture: !heure_fermeture,
          capacite: !capacite
        }
      });
    }

    // Convertir jour_semaine: JavaScript (0-6) → Database (1-7)
    // JavaScript: 0=Sunday, 1=Monday, ..., 6=Saturday
    // Database: 1=Monday, 2=Tuesday, ..., 7=Sunday
    // Conversion: 0→7, 1→1, 2→2, ..., 6→6
    if (jour_semaine === 0) {
      jour_semaine = 7; // Dimanche: 0 → 7
    }

    // Normaliser le format des heures (ajouter :00 si nécessaire)
    // Input HTML type="time" envoie "HH:mm", SQL Server attend "HH:mm:ss"
    if (heure_ouverture && !heure_ouverture.includes(':00')) {
      heure_ouverture = heure_ouverture + ':00';
    }
    if (heure_fermeture && !heure_fermeture.includes(':00')) {
      heure_fermeture = heure_fermeture + ':00';
    }

    // Valider que heure_ouverture < heure_fermeture
    if (heure_ouverture >= heure_fermeture) {
      return res.status(400).json({ 
        message: 'L\'heure d\'ouverture doit être avant l\'heure de fermeture',
        error: 'INVALID_TIME_RANGE',
        details: { heure_ouverture, heure_fermeture }
      });
    }

    console.log('[TimeSlot] Updating with:', { id, jour_semaine, heure_ouverture, heure_fermeture, capacite });

    const pool = await getConnection();
    
    // Vérifier que la plage horaire existe
    const checkResult = await pool.request()
      .input('id', sql.BigInt, id)
      .query('SELECT id FROM PlageHoraire WHERE id = @id');

    if (checkResult.recordset.length === 0) {
      return res.status(404).json({ message: 'Plage horaire introuvable' });
    }

    // Mettre à jour
    await pool.request()
      .input('id', sql.BigInt, id)
      .input('jour_semaine', sql.TinyInt, jour_semaine)
      .input('heure_ouverture', sql.VarChar(8), heure_ouverture)  // Utiliser VarChar au lieu de Time
      .input('heure_fermeture', sql.VarChar(8), heure_fermeture)  // Utiliser VarChar au lieu de Time
      .input('capacite', sql.Int, capacite)
      .query(`
        UPDATE PlageHoraire
        SET jour_semaine = @jour_semaine, 
            heure_ouverture = CAST(@heure_ouverture AS TIME),
            heure_fermeture = CAST(@heure_fermeture AS TIME), 
            capacite = @capacite
        WHERE id = @id
      `);

    res.json({ message: 'Plage horaire mise à jour avec succès' });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la plage horaire:', error);
    res.status(500).json({ 
      message: 'Erreur serveur',
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
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
    
    // Convertir jour_semaine: JavaScript (0-6) → Database (1-7)
    // JavaScript: 0=Sunday, 1=Monday, ..., 6=Saturday
    // Database: 1=Monday, 2=Tuesday, ..., 7=Sunday
    const dbDayOfWeek = dayOfWeek === 0 ? 7 : dayOfWeek;

    const pool = await getConnection();
    
    // Récupérer les plages horaires pour ce jour
    const plagesResult = await pool.request()
      .input('agence_id', sql.BigInt, agenceId)
      .input('jour_semaine', sql.TinyInt, dbDayOfWeek)
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
