/**
 * CONTROLLER: Audit Logs (Admin)
 * Consultation et export des logs d'audit
 */

const { getConnection, sql } = require('../config/database');
const ExcelJS = require('exceljs');

class AuditController {
  /**
   * GET /api/admin/audit
   * Liste des logs d'audit avec filtres avancés
   */
  static async getAuditLogs(req, res) {
    try {
      const {
        utilisateur_id,
        action,
        entite_type,
        date_debut,
        date_fin,
        statut,
        search,
        page = 1,
        limit = 50
      } = req.query;

      const pool = await getConnection();
      const offset = (page - 1) * limit;

      // Construction de la requête avec filtres
      let whereConditions = [];
      let queryParams = {};

      if (utilisateur_id) {
        whereConditions.push('utilisateur_id = @utilisateur_id');
        queryParams.utilisateur_id = { type: sql.BigInt, value: utilisateur_id };
      }

      if (action) {
        whereConditions.push('action = @action');
        queryParams.action = { type: sql.NVarChar, value: action };
      }

      if (entite_type) {
        whereConditions.push('entite_type = @entite_type');
        queryParams.entite_type = { type: sql.NVarChar, value: entite_type };
      }

      if (date_debut) {
        whereConditions.push('date_action >= @date_debut');
        queryParams.date_debut = { type: sql.DateTime, value: new Date(date_debut) };
      }

      if (date_fin) {
        whereConditions.push('date_action <= @date_fin');
        queryParams.date_fin = { type: sql.DateTime, value: new Date(date_fin) };
      }

      if (statut) {
        whereConditions.push('statut = @statut');
        queryParams.statut = { type: sql.NVarChar, value: statut };
      }

      if (search) {
        whereConditions.push('(description LIKE @search OR utilisateur_nom LIKE @search OR entite_id LIKE @search)');
        queryParams.search = { type: sql.NVarChar, value: `%${search}%` };
      }

      const whereClause = whereConditions.length > 0 
        ? 'WHERE ' + whereConditions.join(' AND ')
        : '';

      // Requête pour compter le total
      let countRequest = pool.request();
      Object.entries(queryParams).forEach(([key, { type, value }]) => {
        countRequest.input(key, type, value);
      });

      const countResult = await countRequest.query(`
        SELECT COUNT(*) as total
        FROM AuditLog
        ${whereClause}
      `);

      const total = countResult.recordset[0].total;

      // Requête pour récupérer les logs
      let logsRequest = pool.request();
      Object.entries(queryParams).forEach(([key, { type, value }]) => {
        logsRequest.input(key, type, value);
      });
      logsRequest.input('limit', sql.Int, parseInt(limit));
      logsRequest.input('offset', sql.Int, offset);

      const logsResult = await logsRequest.query(`
        SELECT 
          id,
          utilisateur_id,
          utilisateur_nom,
          utilisateur_role,
          action,
          entite_type,
          entite_id,
          ancien_valeur,
          nouveau_valeur,
          description,
          ip_address,
          user_agent,
          endpoint,
          methode_http,
          date_action,
          statut,
          erreur_message
        FROM AuditLog
        ${whereClause}
        ORDER BY date_action DESC
        OFFSET @offset ROWS
        FETCH NEXT @limit ROWS ONLY
      `);

      // Parser les JSON strings
      const logs = logsResult.recordset.map(log => ({
        ...log,
        ancien_valeur: log.ancien_valeur ? JSON.parse(log.ancien_valeur) : null,
        nouveau_valeur: log.nouveau_valeur ? JSON.parse(log.nouveau_valeur) : null
      }));

      res.json({
        success: true,
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit),
        logs
      });
    } catch (error) {
      console.error('[AuditController.getAuditLogs] Error:', error);
      res.status(500).json({
        error: 'Erreur lors de la récupération des logs',
        message: error.message
      });
    }
  }

  /**
   * GET /api/admin/audit/:entiteType/:entiteId
   * Historique complet d'une entité spécifique
   */
  static async getEntityHistory(req, res) {
    try {
      const { entiteType, entiteId } = req.params;
      const pool = await getConnection();

      const result = await pool.request()
        .input('entite_type', sql.NVarChar, entiteType)
        .input('entite_id', sql.NVarChar, entiteId)
        .query(`
          SELECT 
            id,
            utilisateur_id,
            utilisateur_nom,
            utilisateur_role,
            action,
            entite_type,
            entite_id,
            ancien_valeur,
            nouveau_valeur,
            description,
            ip_address,
            date_action,
            statut
          FROM AuditLog
          WHERE entite_type = @entite_type AND entite_id = @entite_id
          ORDER BY date_action DESC
        `);

      // Parser les JSON strings
      const history = result.recordset.map(log => ({
        ...log,
        ancien_valeur: log.ancien_valeur ? JSON.parse(log.ancien_valeur) : null,
        nouveau_valeur: log.nouveau_valeur ? JSON.parse(log.nouveau_valeur) : null
      }));

      res.json({
        success: true,
        entite_type: entiteType,
        entite_id: entiteId,
        count: history.length,
        history
      });
    } catch (error) {
      console.error('[AuditController.getEntityHistory] Error:', error);
      res.status(500).json({
        error: 'Erreur lors de la récupération de l\'historique',
        message: error.message
      });
    }
  }

  /**
   * GET /api/admin/audit/export
   * Export des logs en Excel ou CSV
   */
  static async exportLogs(req, res) {
    try {
      const {
        utilisateur_id,
        action,
        entite_type,
        date_debut,
        date_fin,
        statut,
        format = 'excel'
      } = req.query;

      const pool = await getConnection();

      // Construction de la requête avec filtres
      let whereConditions = [];
      let queryParams = {};

      if (utilisateur_id) {
        whereConditions.push('utilisateur_id = @utilisateur_id');
        queryParams.utilisateur_id = { type: sql.BigInt, value: utilisateur_id };
      }

      if (action) {
        whereConditions.push('action = @action');
        queryParams.action = { type: sql.NVarChar, value: action };
      }

      if (entite_type) {
        whereConditions.push('entite_type = @entite_type');
        queryParams.entite_type = { type: sql.NVarChar, value: entite_type };
      }

      if (date_debut) {
        whereConditions.push('date_action >= @date_debut');
        queryParams.date_debut = { type: sql.DateTime, value: new Date(date_debut) };
      }

      if (date_fin) {
        whereConditions.push('date_action <= @date_fin');
        queryParams.date_fin = { type: sql.DateTime, value: new Date(date_fin) };
      }

      if (statut) {
        whereConditions.push('statut = @statut');
        queryParams.statut = { type: sql.NVarChar, value: statut };
      }

      const whereClause = whereConditions.length > 0 
        ? 'WHERE ' + whereConditions.join(' AND ')
        : '';

      // Récupérer tous les logs (limité à 10000 pour éviter les problèmes de mémoire)
      let request = pool.request();
      Object.entries(queryParams).forEach(([key, { type, value }]) => {
        request.input(key, type, value);
      });

      const result = await request.query(`
        SELECT TOP 10000
          id,
          utilisateur_nom,
          utilisateur_role,
          action,
          entite_type,
          entite_id,
          description,
          ip_address,
          endpoint,
          methode_http,
          date_action,
          statut,
          erreur_message
        FROM AuditLog
        ${whereClause}
        ORDER BY date_action DESC
      `);

      if (format === 'csv') {
        // Export CSV
        const csv = convertToCSV(result.recordset);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=audit_logs_${Date.now()}.csv`);
        res.send(csv);
      } else {
        // Export Excel
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Audit Logs');

        // En-têtes
        worksheet.columns = [
          { header: 'ID', key: 'id', width: 10 },
          { header: 'Date', key: 'date_action', width: 20 },
          { header: 'Utilisateur', key: 'utilisateur_nom', width: 25 },
          { header: 'Rôle', key: 'utilisateur_role', width: 15 },
          { header: 'Action', key: 'action', width: 12 },
          { header: 'Type Entité', key: 'entite_type', width: 20 },
          { header: 'ID Entité', key: 'entite_id', width: 15 },
          { header: 'Description', key: 'description', width: 40 },
          { header: 'IP', key: 'ip_address', width: 15 },
          { header: 'Endpoint', key: 'endpoint', width: 30 },
          { header: 'Méthode', key: 'methode_http', width: 10 },
          { header: 'Statut', key: 'statut', width: 12 },
          { header: 'Erreur', key: 'erreur_message', width: 30 }
        ];

        // Style de l'en-tête
        worksheet.getRow(1).font = { bold: true };
        worksheet.getRow(1).fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFE0E0E0' }
        };

        // Ajouter les données
        result.recordset.forEach(log => {
          worksheet.addRow(log);
        });

        // Générer le fichier
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=audit_logs_${Date.now()}.xlsx`);
        
        await workbook.xlsx.write(res);
        res.end();
      }
    } catch (error) {
      console.error('[AuditController.exportLogs] Error:', error);
      res.status(500).json({
        error: 'Erreur lors de l\'export des logs',
        message: error.message
      });
    }
  }

  /**
   * GET /api/admin/audit/stats
   * Statistiques des logs d'audit
   */
  static async getAuditStats(req, res) {
    try {
      const { date_debut, date_fin } = req.query;
      const pool = await getConnection();

      let dateFilter = '';
      let request = pool.request();

      if (date_debut) {
        dateFilter += ' AND date_action >= @date_debut';
        request.input('date_debut', sql.DateTime, new Date(date_debut));
      }

      if (date_fin) {
        dateFilter += ' AND date_action <= @date_fin';
        request.input('date_fin', sql.DateTime, new Date(date_fin));
      }

      const result = await request.query(`
        SELECT 
          COUNT(*) as total_logs,
          SUM(CASE WHEN action = 'CREATE' THEN 1 ELSE 0 END) as total_creates,
          SUM(CASE WHEN action = 'UPDATE' THEN 1 ELSE 0 END) as total_updates,
          SUM(CASE WHEN action = 'DELETE' THEN 1 ELSE 0 END) as total_deletes,
          SUM(CASE WHEN statut = 'SUCCESS' THEN 1 ELSE 0 END) as total_success,
          SUM(CASE WHEN statut = 'FAILED' THEN 1 ELSE 0 END) as total_failed,
          COUNT(DISTINCT utilisateur_id) as unique_users,
          COUNT(DISTINCT entite_type) as unique_entity_types
        FROM AuditLog
        WHERE 1=1 ${dateFilter}
      `);

      // Top utilisateurs
      const topUsersResult = await pool.request().query(`
        SELECT TOP 10
          utilisateur_nom,
          utilisateur_role,
          COUNT(*) as action_count
        FROM AuditLog
        WHERE 1=1 ${dateFilter}
        GROUP BY utilisateur_nom, utilisateur_role
        ORDER BY action_count DESC
      `);

      // Actions par type d'entité
      const entityStatsResult = await pool.request().query(`
        SELECT 
          entite_type,
          COUNT(*) as action_count,
          SUM(CASE WHEN action = 'CREATE' THEN 1 ELSE 0 END) as creates,
          SUM(CASE WHEN action = 'UPDATE' THEN 1 ELSE 0 END) as updates,
          SUM(CASE WHEN action = 'DELETE' THEN 1 ELSE 0 END) as deletes
        FROM AuditLog
        WHERE 1=1 ${dateFilter}
        GROUP BY entite_type
        ORDER BY action_count DESC
      `);

      res.json({
        success: true,
        stats: result.recordset[0],
        top_users: topUsersResult.recordset,
        entity_stats: entityStatsResult.recordset
      });
    } catch (error) {
      console.error('[AuditController.getAuditStats] Error:', error);
      res.status(500).json({
        error: 'Erreur lors de la récupération des statistiques',
        message: error.message
      });
    }
  }
}

/**
 * Convertit un tableau d'objets en CSV
 */
function convertToCSV(data) {
  if (data.length === 0) return '';

  const headers = Object.keys(data[0]);
  const csvRows = [];

  // En-têtes
  csvRows.push(headers.join(','));

  // Données
  for (const row of data) {
    const values = headers.map(header => {
      const value = row[header];
      // Échapper les guillemets et entourer de guillemets si nécessaire
      if (value === null || value === undefined) return '';
      const escaped = String(value).replace(/"/g, '""');
      return `"${escaped}"`;
    });
    csvRows.push(values.join(','));
  }

  return csvRows.join('\n');
}

module.exports = AuditController;
