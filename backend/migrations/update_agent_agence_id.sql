-- ============================================
-- Script: Update Agent SAV Agency ID
-- Date: 3 Mai 2026
-- Description: Change l'agence_id d'un agent SAV
-- ============================================

USE STA_SAV_DB;
GO

PRINT 'Mise à jour de l''agence_id pour l''agent SAV...';
PRINT '';

-- 1. Voir les agents SAV actuels
PRINT '1. Agents SAV actuels:';
SELECT 
    u.id,
    u.nom,
    u.prenom,
    u.email,
    u.agence_id,
    a.nom AS agence_nom,
    r.nom AS role
FROM Utilisateur u
LEFT JOIN Agence a ON u.agence_id = a.id
INNER JOIN Role r ON u.role_id = r.id
WHERE r.nom = 'AGENT';
PRINT '';

-- 2. Voir les agences disponibles
PRINT '2. Agences disponibles:';
SELECT id, nom, adresse, telephone
FROM Agence
ORDER BY id;
PRINT '';

-- 3. Mettre à jour l'agence_id de l'agent
-- REMPLACER LES VALEURS CI-DESSOUS:
-- @AgentId = ID de l'agent à modifier
-- @NouvelleAgenceId = ID de la nouvelle agence

DECLARE @AgentId BIGINT = 2;  -- ← MODIFIER ICI: ID de l'agent
DECLARE @NouvelleAgenceId BIGINT = 1;  -- ← MODIFIER ICI: ID de la nouvelle agence

PRINT '3. Mise à jour de l''agent...';
PRINT 'Agent ID: ' + CAST(@AgentId AS NVARCHAR(10));
PRINT 'Nouvelle Agence ID: ' + CAST(@NouvelleAgenceId AS NVARCHAR(10));
PRINT '';

-- Vérifier que l'agent existe
IF NOT EXISTS (SELECT 1 FROM Utilisateur u INNER JOIN Role r ON u.role_id = r.id WHERE u.id = @AgentId AND r.nom = 'AGENT')
BEGIN
    PRINT 'ERREUR: Agent introuvable ou n''est pas un AGENT!';
    RETURN;
END

-- Vérifier que l'agence existe
IF NOT EXISTS (SELECT 1 FROM Agence WHERE id = @NouvelleAgenceId)
BEGIN
    PRINT 'ERREUR: Agence introuvable!';
    RETURN;
END

-- Mettre à jour l'agence_id
UPDATE Utilisateur
SET agence_id = @NouvelleAgenceId
WHERE id = @AgentId;

PRINT 'Agent mis à jour avec succès!';
PRINT '';

-- 4. Vérifier la mise à jour
PRINT '4. Vérification:';
SELECT 
    u.id,
    u.nom,
    u.prenom,
    u.email,
    u.agence_id,
    a.nom AS agence_nom,
    r.nom AS role
FROM Utilisateur u
LEFT JOIN Agence a ON u.agence_id = a.id
INNER JOIN Role r ON u.role_id = r.id
WHERE u.id = @AgentId;

PRINT '';
PRINT 'Mise à jour terminée!';
GO
