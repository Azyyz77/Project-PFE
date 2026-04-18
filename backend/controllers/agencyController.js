/**
 * CONTROLLER: Agency Management (Admin)
 * Gestion des agences Chery
 */

const { getConnection, sql } = require('../config/database');

class AgencyController {
  /**
   * GET /api/admin/agencies
   * Liste toutes les agences
   */
  static async getAgencies(req, res) {
    try {
      const pool = await getConnection();
      
      const result = await pool.request().query(`
        SELECT 
          id,
          nom,
          ville,
          telephone,
          adresse
        FROM Agence
        ORDER BY ville, nom
      `);

      res.json({
        success: true,
        count: result.recordset.length,
        agencies: result.recordset
      });
    } catch (error) {
      console.error('[AgencyController.getAgencies] Error:', error);
      res.status(500).json({ 
        error: 'Erreur lors de la récupération des agences',
        message: error.message 
      });
    }
  }

  /**
   * GET /api/admin/agencies/:id
   * Détails d'une agence
   */
  static async getAgency(req, res) {
    try {
      const { id } = req.params;
      const pool = await getConnection();

      const result = await pool.request()
        .input('id', sql.BigInt, id)
        .query(`
          SELECT 
            id,
            nom,
            ville,
            telephone,
            adresse
          FROM Agence
          WHERE id = @id
        `);

      if (result.recordset.length === 0) {
        return res.status(404).json({ error: 'Agence non trouvée' });
      }

      res.json({
        success: true,
        agency: result.recordset[0]
      });
    } catch (error) {
      console.error('[AgencyController.getAgency] Error:', error);
      res.status(500).json({ 
        error: 'Erreur lors de la récupération de l\'agence',
        message: error.message 
      });
    }
  }

  /**
   * POST /api/admin/agencies
   * Créer une nouvelle agence
   */
  static async createAgency(req, res) {
    try {
      const { nom, ville, telephone, adresse } = req.body;

      // Validation
      if (!nom || !ville) {
        return res.status(400).json({ 
          error: 'Les champs nom et ville sont requis' 
        });
      }

      const pool = await getConnection();

      // Vérifier si une agence avec le même nom existe déjà
      const checkResult = await pool.request()
        .input('nom', sql.NVarChar, nom)
        .input('ville', sql.NVarChar, ville)
        .query(`
          SELECT id FROM Agence 
          WHERE nom = @nom AND ville = @ville
        `);

      if (checkResult.recordset.length > 0) {
        return res.status(400).json({ 
          error: 'Une agence avec ce nom existe déjà dans cette ville' 
        });
      }

      // Créer l'agence
      const result = await pool.request()
        .input('nom', sql.NVarChar, nom)
        .input('ville', sql.NVarChar, ville)
        .input('telephone', sql.NVarChar, telephone || null)
        .input('adresse', sql.NVarChar, adresse || null)
        .query(`
          INSERT INTO Agence (nom, ville, telephone, adresse)
          OUTPUT INSERTED.*
          VALUES (@nom, @ville, @telephone, @adresse)
        `);

      res.status(201).json({
        success: true,
        message: 'Agence créée avec succès',
        agency: result.recordset[0]
      });
    } catch (error) {
      console.error('[AgencyController.createAgency] Error:', error);
      res.status(500).json({ 
        error: 'Erreur lors de la création de l\'agence',
        message: error.message 
      });
    }
  }

  /**
   * PUT /api/admin/agencies/:id
   * Modifier une agence
   */
  static async updateAgency(req, res) {
    try {
      const { id } = req.params;
      const { nom, ville, telephone, adresse } = req.body;

      // Validation
      if (!nom || !ville) {
        return res.status(400).json({ 
          error: 'Les champs nom et ville sont requis' 
        });
      }

      const pool = await getConnection();

      // Vérifier que l'agence existe
      const checkResult = await pool.request()
        .input('id', sql.BigInt, id)
        .query('SELECT id FROM Agence WHERE id = @id');

      if (checkResult.recordset.length === 0) {
        return res.status(404).json({ error: 'Agence non trouvée' });
      }

      // Vérifier les doublons (sauf l'agence actuelle)
      const duplicateCheck = await pool.request()
        .input('id', sql.BigInt, id)
        .input('nom', sql.NVarChar, nom)
        .input('ville', sql.NVarChar, ville)
        .query(`
          SELECT id FROM Agence 
          WHERE nom = @nom AND ville = @ville AND id != @id
        `);

      if (duplicateCheck.recordset.length > 0) {
        return res.status(400).json({ 
          error: 'Une autre agence avec ce nom existe déjà dans cette ville' 
        });
      }

      // Mettre à jour l'agence
      const result = await pool.request()
        .input('id', sql.BigInt, id)
        .input('nom', sql.NVarChar, nom)
        .input('ville', sql.NVarChar, ville)
        .input('telephone', sql.NVarChar, telephone || null)
        .input('adresse', sql.NVarChar, adresse || null)
        .query(`
          UPDATE Agence
          SET 
            nom = @nom,
            ville = @ville,
            telephone = @telephone,
            adresse = @adresse
          OUTPUT INSERTED.*
          WHERE id = @id
        `);

      res.json({
        success: true,
        message: 'Agence mise à jour avec succès',
        agency: result.recordset[0]
      });
    } catch (error) {
      console.error('[AgencyController.updateAgency] Error:', error);
      res.status(500).json({ 
        error: 'Erreur lors de la mise à jour de l\'agence',
        message: error.message 
      });
    }
  }

  /**
   * DELETE /api/admin/agencies/:id
   * Supprimer une agence
   */
  static async deleteAgency(req, res) {
    try {
      const { id } = req.params;
      const pool = await getConnection();

      // Vérifier que l'agence existe
      const checkResult = await pool.request()
        .input('id', sql.BigInt, id)
        .query('SELECT id FROM Agence WHERE id = @id');

      if (checkResult.recordset.length === 0) {
        return res.status(404).json({ error: 'Agence non trouvée' });
      }

      // Vérifier s'il y a des rendez-vous associés
      const rdvCheck = await pool.request()
        .input('id', sql.BigInt, id)
        .query('SELECT COUNT(*) as count FROM RendezVous WHERE agence_id = @id');

      if (rdvCheck.recordset[0].count > 0) {
        return res.status(400).json({ 
          error: 'Impossible de supprimer cette agence car elle a des rendez-vous associés',
          message: 'Désactivez l\'agence au lieu de la supprimer'
        });
      }

      // Supprimer l'agence
      await pool.request()
        .input('id', sql.BigInt, id)
        .query('DELETE FROM Agence WHERE id = @id');

      res.json({
        success: true,
        message: 'Agence supprimée avec succès'
      });
    } catch (error) {
      console.error('[AgencyController.deleteAgency] Error:', error);
      res.status(500).json({ 
        error: 'Erreur lors de la suppression de l\'agence',
        message: error.message 
      });
    }
  }

  /**
   * GET /api/admin/agencies/:id/stats
   * Statistiques d'une agence
   */
  static async getAgencyStats(req, res) {
    try {
      const { id } = req.params;
      const pool = await getConnection();

      // Vérifier que l'agence existe
      const checkResult = await pool.request()
        .input('id', sql.BigInt, id)
        .query('SELECT nom FROM Agence WHERE id = @id');

      if (checkResult.recordset.length === 0) {
        return res.status(404).json({ error: 'Agence non trouvée' });
      }

      // Statistiques des rendez-vous
      const rdvStats = await pool.request()
        .input('id', sql.BigInt, id)
        .query(`
          SELECT 
            COUNT(*) as total_rdv,
            SUM(CASE WHEN statut = 'TERMINE' THEN 1 ELSE 0 END) as rdv_termines,
            SUM(CASE WHEN statut = 'CONFIRME' THEN 1 ELSE 0 END) as rdv_confirmes,
            SUM(CASE WHEN statut = 'EN_ATTENTE' THEN 1 ELSE 0 END) as rdv_en_attente,
            SUM(CASE WHEN statut = 'ANNULE' THEN 1 ELSE 0 END) as rdv_annules
          FROM RendezVous
          WHERE agence_id = @id
        `);

      // Nombre de clients uniques
      const clientStats = await pool.request()
        .input('id', sql.BigInt, id)
        .query(`
          SELECT COUNT(DISTINCT client_id) as clients_uniques
          FROM RendezVous
          WHERE agence_id = @id
        `);

      // Nombre d'agents
      const agentStats = await pool.request()
        .input('id', sql.BigInt, id)
        .query(`
          SELECT COUNT(*) as total_agents
          FROM Utilisateur
          WHERE agence_id = @id AND role_id = (SELECT id FROM Role WHERE nom = 'AGENT')
        `);

      // Rendez-vous du mois en cours
      const monthStats = await pool.request()
        .input('id', sql.BigInt, id)
        .query(`
          SELECT COUNT(*) as rdv_ce_mois
          FROM RendezVous
          WHERE agence_id = @id 
            AND MONTH(date_heure) = MONTH(GETDATE())
            AND YEAR(date_heure) = YEAR(GETDATE())
        `);

      res.json({
        success: true,
        stats: {
          agency_name: checkResult.recordset[0].nom,
          ...rdvStats.recordset[0],
          ...clientStats.recordset[0],
          ...agentStats.recordset[0],
          ...monthStats.recordset[0]
        }
      });
    } catch (error) {
      console.error('[AgencyController.getAgencyStats] Error:', error);
      res.status(500).json({ 
        error: 'Erreur lors de la récupération des statistiques',
        message: error.message 
      });
    }
  }
}

module.exports = AgencyController;
