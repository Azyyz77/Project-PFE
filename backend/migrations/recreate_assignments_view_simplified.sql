-- ============================================
-- Script: Recreate VueAffectationsDetaillees (Simplified)
-- Date: 3 Mai 2026
-- Description: Recreate the view with only existing columns
-- ============================================

USE STA_SAV_DB;
GO

PRINT 'Recreating VueAffectationsDetaillees view...';
PRINT '';

-- Drop existing view
IF OBJECT_ID('VueAffectationsDetaillees', 'V') IS NOT NULL
BEGIN
    PRINT 'Dropping existing view...';
    DROP VIEW VueAffectationsDetaillees;
    PRINT 'View dropped';
END
PRINT '';

-- Create simplified view
PRINT 'Creating simplified view...';
GO

CREATE VIEW VueAffectationsDetaillees AS
SELECT 
    -- Affectation fields
    a.id AS affectation_id,
    a.rendez_vous_id,
    a.ouvrier_id,
    a.agent_id,
    a.date_affectation,
    a.statut,
    a.notes_agent,
    a.created_at AS affectation_created_at,
    a.updated_at AS affectation_updated_at,
    
    -- Ouvrier fields
    o.nom AS ouvrier_nom,
    o.prenom AS ouvrier_prenom,
    o.telephone AS ouvrier_telephone,
    o.email AS ouvrier_email,
    o.specialite AS ouvrier_specialite,
    o.niveau_competence AS ouvrier_niveau,
    o.agence_id,
    
    -- Agent fields
    agent.nom AS agent_nom,
    agent.prenom AS agent_prenom,
    
    -- Rendez-vous fields
    rdv.date_heure AS rdv_date_heure,
    rdv.statut AS rdv_statut,
    rdv.utilisateur_id AS client_id,
    rdv.vehicule_id,
    
    -- Client fields
    client.nom AS client_nom,
    client.prenom AS client_prenom,
    client.telephone AS client_telephone,
    
    -- Vehicle fields
    v.immatriculation,
    v.marque_id,
    v.modele_id,
    
    -- Brand and Model
    marque.nom AS marque,
    modele.nom AS modele,
    
    -- Agency
    ag.nom AS agence_nom
    
FROM AffectationOuvrier a
INNER JOIN Ouvrier o ON a.ouvrier_id = o.id
INNER JOIN Utilisateur agent ON a.agent_id = agent.id
INNER JOIN RendezVous rdv ON a.rendez_vous_id = rdv.id
INNER JOIN Utilisateur client ON rdv.utilisateur_id = client.id
INNER JOIN Vehicule v ON rdv.vehicule_id = v.id
INNER JOIN Marque marque ON v.marque_id = marque.id
INNER JOIN Modele modele ON v.modele_id = modele.id
INNER JOIN Agence ag ON o.agence_id = ag.id;

GO

PRINT 'View created successfully';
PRINT '';

-- Test the view
PRINT 'Testing view...';
SELECT TOP 5 
    affectation_id,
    ouvrier_nom,
    ouvrier_prenom,
    client_nom,
    statut,
    date_affectation
FROM VueAffectationsDetaillees
ORDER BY date_affectation DESC;

PRINT '';
PRINT 'View recreation complete!';
GO
