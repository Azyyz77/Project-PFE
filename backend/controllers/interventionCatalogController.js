const { getConnection, sql } = require('../config/database');

/**
 * Controller pour la gestion du catalogue d'interventions
 */

// Récupérer tous les types d'interventions avec leurs sous-types
const getInterventionTypes = async (req, res) => {
  try {
    const pool = await getConnection();

    const result = await pool.request().query(`
      SELECT 
        ti.id,
        ti.nom,
        ti.delai_moyen,
        COUNT(sti.id) AS nombre_sous_types
      FROM TypeIntervention ti
      LEFT JOIN SousTypeIntervention sti ON sti.type_intervention_id = ti.id
      GROUP BY ti.id, ti.nom, ti.delai_moyen
      ORDER BY ti.nom
    `);

    return res.json({ types: result.recordset });
  } catch (error) {
    console.error('Erreur récupération types intervention:', error);
    return res.status(500).json({ error: 'Erreur lors de la récupération des types d\'intervention' });
  }
};

// Récupérer tous les sous-types d'interventions
const getSubTypes = async (req, res) => {
  try {
    const pool = await getConnection();

    const result = await pool.request().query(`
      SELECT 
        sti.id,
        sti.nom,
        sti.duree_estimee,
        sti.type_intervention_id,
        ti.nom AS type_nom
      FROM SousTypeIntervention sti
      JOIN TypeIntervention ti ON ti.id = sti.type_intervention_id
      ORDER BY ti.nom, sti.nom
    `);

    return res.json({ subTypes: result.recordset });
  } catch (error) {
    console.error('Erreur récupération sous-types:', error);
    return res.status(500).json({ error: 'Erreur lors de la récupération des sous-types' });
  }
};

// Récupérer tous les packages
const getPackages = async (req, res) => {
  try {
    const pool = await getConnection();

    const result = await pool.request().query(`
      SELECT 
        p.id,
        p.nom,
        p.description,
        p.prix,
        p.duree_estimee,
        p.actif,
        COUNT(pst.sous_type_id) AS nombre_interventions
      FROM PackageIntervention p
      LEFT JOIN Package_SousType pst ON pst.package_id = p.id
      GROUP BY p.id, p.nom, p.description, p.prix, p.duree_estimee, p.actif
      ORDER BY p.nom
    `);

    return res.json({ packages: result.recordset });
  } catch (error) {
    console.error('Erreur récupération packages:', error);
    return res.status(500).json({ error: 'Erreur lors de la récupération des packages' });
  }
};

// Récupérer les détails d'un package avec ses interventions
const getPackageDetails = async (req, res) => {
  try {
    const packageId = parseInt(req.params.id);
    const pool = await getConnection();

    // Récupérer le package
    const packageResult = await pool.request()
      .input('id', sql.Int, packageId)
      .query(`
        SELECT 
          id,
          nom,
          description,
          prix,
          duree_estimee,
          actif
        FROM PackageIntervention
        WHERE id = @id
      `);

    if (packageResult.recordset.length === 0) {
      return res.status(404).json({ error: 'Package non trouvé' });
    }

    // Récupérer les interventions du package
    const interventionsResult = await pool.request()
      .input('package_id', sql.Int, packageId)
      .query(`
        SELECT 
          sti.id,
          sti.nom,
          sti.duree_estimee,
          ti.nom AS type_nom
        FROM Package_SousType pst
        JOIN SousTypeIntervention sti ON sti.id = pst.sous_type_id
        JOIN TypeIntervention ti ON ti.id = sti.type_intervention_id
        WHERE pst.package_id = @package_id
        ORDER BY ti.nom, sti.nom
      `);

    return res.json({
      package: packageResult.recordset[0],
      interventions: interventionsResult.recordset
    });
  } catch (error) {
    console.error('Erreur récupération détails package:', error);
    return res.status(500).json({ error: 'Erreur lors de la récupération des détails du package' });
  }
};

// Récupérer les statistiques du catalogue
const getCatalogStats = async (req, res) => {
  try {
    const pool = await getConnection();

    const stats = await pool.request().query(`
      SELECT 
        (SELECT COUNT(*) FROM TypeIntervention) AS total_types,
        (SELECT COUNT(*) FROM SousTypeIntervention) AS total_sous_types,
        (SELECT COUNT(*) FROM PackageIntervention WHERE actif = 1) AS total_packages_actifs,
        (SELECT COUNT(*) FROM PackageIntervention) AS total_packages,
        (SELECT AVG(CAST(duree_estimee AS FLOAT)) FROM SousTypeIntervention) AS duree_moyenne
    `);

    return res.json({ stats: stats.recordset[0] });
  } catch (error) {
    console.error('Erreur récupération stats catalogue:', error);
    return res.status(500).json({ error: 'Erreur lors de la récupération des statistiques' });
  }
};

module.exports = {
  getInterventionTypes,
  getSubTypes,
  getPackages,
  getPackageDetails,
  getCatalogStats
};
