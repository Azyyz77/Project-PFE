-- Create VW_PlanningRDV view for the planning controller
-- This view joins RendezVous with related tables to provide all necessary information

IF EXISTS (SELECT * FROM sys.views WHERE name = 'VW_PlanningRDV')
    DROP VIEW VW_PlanningRDV;
GO

CREATE VIEW VW_PlanningRDV AS
SELECT 
    rdv.id AS rdv_id,
    c.nom AS client_nom,
    c.prenom AS client_prenom,
    c.telephone AS client_telephone,
    v.immatriculation AS vehicule_immatriculation,
    m.nom AS vehicule_marque,
    mod.nom AS vehicule_modele,
    ag.id AS agence_id,
    ag.nom AS agence_nom,
    ag.ville AS agence_ville,
    rdv.date_heure,
    rdv.statut,
    rdv.description,
    rdv.duree_estimee,
    NULL AS type_intervention,
    NULL AS sous_type_intervention,
    agent.id AS agent_id,
    agent.nom AS agent_nom,
    agent.prenom AS agent_prenom
FROM RendezVous rdv
    INNER JOIN Utilisateur c ON rdv.client_id = c.id
    INNER JOIN Vehicule v ON rdv.vehicule_id = v.id
    INNER JOIN Version ver ON v.version_id = ver.id
    INNER JOIN Modele mod ON ver.modele_id = mod.id
    INNER JOIN Marque m ON mod.marque_id = m.id
    INNER JOIN Agence ag ON rdv.agence_id = ag.id
    LEFT JOIN Utilisateur agent ON rdv.agent_id = agent.id
WHERE rdv.statut != 'ANNULE';
GO
