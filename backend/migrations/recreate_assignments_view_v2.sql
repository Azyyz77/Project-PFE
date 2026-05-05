-- ============================================
-- Script: Recreate VueAffectationsDetaillees V2 (Simplified & Fixed)
-- Date: 3 Mai 2026
-- Description: Recreate the view with correct column names
-- ============================================

USE STA_SAV_DB;
GO

PRINT 'Recreating VueAffectationsDetaillees view V2...';
PRINT '';

-- Drop existing view
IF OBJECT_ID('VueAffectationsDetaillees', 'V') IS NOT NULL
BEGIN
    PRINT 'Dropping existing view...';
    DROP VIEW VueAffectationsDetaillees;
    PRINT 'View dropped';
END
PRINT '';

-- Create simplified view with correct column names
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
    rdv.client_id,
    rdv.vehicule_id,
    
    -- Client fields
    client.nom AS client_nom,
    client.prenom AS client_prenom,
    client.telephone AS client_telephone,
    
    -- Vehicle fields
    v.immatriculation,
    v.version_id,
    
    -- Version, Model, Brand (via Version)
    ver.nom AS version,
    mod.nom AS modele,
    marque.nom AS marque,
    
    -- Agency
    ag.nom AS agence_nom
    
FROM AffectationOuvrier a
INNER JOIN Ouvrier o ON a.ouvrier_id = o.id
INNER JOIN Utilisateur agent ON a.agent_id = agent.id
INNER JOIN RendezVous rdv ON a.rendez_vous_id = rdv.id
INNER JOIN Utilisateur client ON rdv.client_id = client.id
INNER JOIN Vehicule v ON rdv.vehicule_id = v.id
INNER JOIN Version ver ON v.version_id = ver.id
INNER JOIN Modele mod ON ver.modele_id = mod.id
INNER JOIN Marque marque ON mod.marque_id = marque.id
INNER JOIN Agence ag ON o.agence_id = ag.id;

GO

PRINT 'View created successfully';
PRINT '';

-- Test the view
PRINT 'Testing view...';
SELECT COUNT(*) AS total_affectations
FROM VueAffectationsDetaillees;

PRINT '';
PRINT 'Sample data:';
SELECT TOP 3
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
