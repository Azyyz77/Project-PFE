-- ============================================
-- SIMPLE: Changer l'agence d'un agent SAV
-- ============================================

USE STA_SAV_DB;
GO

-- ÉTAPE 1: Voir les agents et leurs agences actuelles
SELECT 
    u.id AS agent_id,
    u.nom + ' ' + u.prenom AS agent_nom,
    u.email,
    u.agence_id AS agence_actuelle,
    a.nom AS nom_agence_actuelle
FROM Utilisateur u
LEFT JOIN Agence a ON u.agence_id = a.id
INNER JOIN Role r ON u.role_id = r.id
WHERE r.nom = 'AGENT';

-- ÉTAPE 2: Voir les agences disponibles
SELECT id AS agence_id, nom AS nom_agence
FROM Agence;

-- ÉTAPE 3: Mettre à jour (MODIFIER LES VALEURS)
-- Remplacer 2 par l'ID de l'agent
-- Remplacer 1 par l'ID de la nouvelle agence
UPDATE Utilisateur
SET agence_id = 1  -- ← Nouvelle agence ID
WHERE id = 2;      -- ← Agent ID

-- ÉTAPE 4: Vérifier
SELECT 
    u.id AS agent_id,
    u.nom + ' ' + u.prenom AS agent_nom,
    u.agence_id AS nouvelle_agence,
    a.nom AS nom_nouvelle_agence
FROM Utilisateur u
LEFT JOIN Agence a ON u.agence_id = a.id
WHERE u.id = 2;    -- ← Agent ID

GO
