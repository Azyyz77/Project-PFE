/**
 * CONTROLLER: Planning Controller
 * Uses VW_PlanningRDV database view
 */

const { getConnection } = require('../config/database');

class PlanningController {

  /**
   * GET /api/agent/planning
   * Returns the planning grid for an agency over a date range.
   * Query params: agenceId, dateDebut, dateFin
   */
  static async getPlanning(req, res) {
    const { agenceId, dateDebut, dateFin } = req.query;

    if (!dateDebut || !dateFin) {
      return res.status(400).json({ error: 'Les paramètres dateDebut et dateFin sont requis.' });
    }

    try {
      const pool = await getConnection();

      let query = `
        SELECT
          rdv_id,
          client_nom,
          client_prenom,
          client_telephone,
          vehicule_immatriculation,
          vehicule_marque,
          vehicule_modele,
          agence_id,
          agence_nom,
          agence_ville,
          date_heure,
          statut,
          description,
          duree_estimee,
          type_intervention,
          sous_type_intervention,
          agent_id,
          agent_nom,
          agent_prenom
        FROM VW_PlanningRDV
        WHERE date_heure >= @dateDebut
          AND date_heure < DATEADD(day, 1, CAST(@dateFin AS date))
      `;

      const params = [
        { name: 'dateDebut', value: dateDebut },
        { name: 'dateFin', value: dateFin },
      ];

      if (agenceId) {
        query += ' AND agence_id = @agenceId';
        params.push({ name: 'agenceId', value: parseInt(agenceId) });
      }

      query += ' ORDER BY date_heure ASC';

      const request = pool.request();
      params.forEach(p => request.input(p.name, p.value));
      const result = await request.query(query);

      res.json({
        success: true,
        count: result.recordset.length,
        data: result.recordset,
      });
    } catch (err) {
      console.error('[PlanningController.getPlanning]', err);
      res.status(500).json({ error: err.message });
    }
  }

  /**
   * GET /api/agent/planning/agent/:agentId
   * Returns all RDV for a specific agent on a given date.
   * Query params: date (YYYY-MM-DD)
   */
  static async getAgentPlanning(req, res) {
    const { agentId } = req.params;
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ error: 'Le paramètre date est requis (YYYY-MM-DD).' });
    }

    try {
      const pool = await getConnection();

      const query = `
        SELECT
          rdv_id,
          client_nom,
          client_prenom,
          client_telephone,
          vehicule_immatriculation,
          vehicule_marque,
          vehicule_modele,
          agence_id,
          agence_nom,
          agence_ville,
          date_heure,
          statut,
          description,
          duree_estimee,
          type_intervention,
          sous_type_intervention,
          agent_id,
          agent_nom,
          agent_prenom
        FROM VW_PlanningRDV
        WHERE agent_id = @agentId
          AND CAST(date_heure AS date) = CAST(@date AS date)
        ORDER BY date_heure ASC
      `;

      const result = await pool.request()
        .input('agentId', parseInt(agentId))
        .input('date', date)
        .query(query);

      res.json({
        success: true,
        count: result.recordset.length,
        data: result.recordset,
      });
    } catch (err) {
      console.error('[PlanningController.getAgentPlanning]', err);
      res.status(500).json({ error: err.message });
    }
  }

  /**
   * PUT /api/agent/planning/rdv/:id/move
   * Reschedules a RDV to a new date/time.
   * Body: { newDateTime: "YYYY-MM-DDTHH:mm:ss" }
   */
  static async updateSlot(req, res) {
    const { id } = req.params;
    const { newDateTime } = req.body;

    if (!newDateTime) {
      return res.status(400).json({ error: 'Le champ newDateTime est requis.' });
    }

    // Prevent moving to a past date
    if (new Date(newDateTime) < new Date()) {
      return res.status(400).json({ error: 'Impossible de déplacer un rendez-vous dans le passé.' });
    }

    try {
      const pool = await getConnection();

      // Check the RDV exists and is in a movable state
      const checkResult = await pool.request()
        .input('id', parseInt(id))
        .query(`
          SELECT id, statut
          FROM RendezVous
          WHERE id = @id
        `);

      if (checkResult.recordset.length === 0) {
        return res.status(404).json({ error: 'Rendez-vous introuvable.' });
      }

      const rdv = checkResult.recordset[0];
      const nonMovable = ['TERMINE', 'ANNULE', 'NO_SHOW'];
      if (nonMovable.includes(rdv.statut)) {
        return res.status(400).json({
          error: `Impossible de déplacer un rendez-vous avec le statut "${rdv.statut}".`,
        });
      }

      await pool.request()
        .input('id', parseInt(id))
        .input('newDateTime', newDateTime)
        .query(`
          UPDATE RendezVous
          SET date_heure = @newDateTime,
              date_modification = GETDATE()
          WHERE id = @id
        `);

      res.json({
        success: true,
        message: 'Rendez-vous déplacé avec succès.',
        appointmentId: parseInt(id),
        newDateTime,
      });
    } catch (err) {
      console.error('[PlanningController.updateSlot]', err);
      res.status(500).json({ error: err.message });
    }
  }

  /**
   * GET /api/agent/planning/agencies
   * Returns the list of agencies (for filter dropdown).
   */
  static async getAgencies(req, res) {
    try {
      const pool = await getConnection();
      const result = await pool.request().query(`
        SELECT id, nom, ville, telephone, adresse
        FROM Agence
        ORDER BY ville, nom
      `);
      res.json({ success: true, count: result.recordset.length, data: result.recordset });
    } catch (err) {
      console.error('[PlanningController.getAgencies]', err);
      res.status(500).json({ error: err.message });
    }
  }
}

module.exports = PlanningController;
