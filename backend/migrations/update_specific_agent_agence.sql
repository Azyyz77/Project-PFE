-- ============================================
-- Changer l'agence d'UN agent SAV spécifique
-- ============================================

USE STA_SAV_DB;
GO

PRINT '==========================================================';
PRINT 'CHANGER L''AGENCE D''UN AGENT SAV SPÉCIFIQUE';
PRINT '==========================================================';
PRINT '';

-- ÉTAPE 1: Voir TOUS les agents SAV avec leurs informations
PRINT 'ÉTAPE 1: Liste de tous les agents SAV';
PRINT '----------------------------------------------------------';
SELECT 
    u.id AS agent_id,
    u.nom,
    u.prenom,
    u.email,
    u.agence_id AS agence_actuelle_id,
    a.nom AS agence_actuelle_nom
FROM Utilisateur u
LEFT JOIN Agence a ON u.agence_id = a.id
INNER JOIN Role r ON u.role_id = r.id
WHERE r.nom = 'AGENT'
ORDER BY u.id;
PRINT '';

-- ÉTAPE 2: Voir toutes les agences disponibles
PRINT 'ÉTAPE 2: Agences disponibles';
PRINT '----------------------------------------------------------';
SELECT 
    id AS agence_id, 
    nom AS agence_nom,
    adresse,
    telephone
FROM Agence
ORDER BY id;
PRINT '';

-- ÉTAPE 3: Mettre à jour UN agent spécifique
PRINT 'ÉTAPE 3: Mise à jour d''un agent spécifique';
PRINT '----------------------------------------------------------';

-- ⚠️ MODIFIER CES VALEURS SELON VOS BESOINS:
DECLARE @EmailAgent NVARCHAR(255) = 'agent@test.com';  -- ← Email de l'agent à modifier
DECLARE @NouvelleAgenceId BIGINT = 1;                   -- ← ID de la nouvelle agence

PRINT 'Agent à modifier: ' + @EmailAgent;
PRINT 'Nouvelle agence ID: ' + CAST(@NouvelleAgenceId AS NVARCHAR(10));
PRINT '';

-- Vérifier que l'agent existe
DECLARE @AgentId BIGINT;
SELECT @AgentId = u.id
FROM Utilisateur u
INNER JOIN Role r ON u.role_id = r.id
WHERE u.email = @EmailAgent AND r.nom = 'AGENT';

IF @AgentId IS NULL
BEGIN
    PRINT '❌ ERREUR: Agent introuvable avec cet email!';
    PRINT 'Vérifiez l''email dans la liste ci-dessus.';
    RETURN;
END

-- Vérifier que l'agence existe
IF NOT EXISTS (SELECT 1 FROM Agence WHERE id = @NouvelleAgenceId)
BEGIN
    PRINT '❌ ERREUR: Agence introuvable!';
    PRINT 'Vérifiez l''ID de l''agence dans la liste ci-dessus.';
    RETURN;
END

-- Afficher l'état AVANT modification
PRINT 'AVANT modification:';
SELECT 
    u.id AS agent_id,
    u.nom + ' ' + u.prenom AS agent_nom,
    u.email,
    u.agence_id AS ancienne_agence_id,
    a.nom AS ancienne_agence_nom
FROM Utilisateur u
LEFT JOIN Agence a ON u.agence_id = a.id
WHERE u.id = @AgentId;
PRINT '';

-- Effectuer la mise à jour
UPDATE Utilisateur
SET agence_id = @NouvelleAgenceId
WHERE id = @AgentId;

PRINT '✅ Mise à jour effectuée!';
PRINT '';

-- ÉTAPE 4: Vérifier la modification
PRINT 'ÉTAPE 4: Vérification APRÈS modification';
PRINT '----------------------------------------------------------';
SELECT 
    u.id AS agent_id,
    u.nom + ' ' + u.prenom AS agent_nom,
    u.email,
    u.agence_id AS nouvelle_agence_id,
    a.nom AS nouvelle_agence_nom
FROM Utilisateur u
LEFT JOIN Agence a ON u.agence_id = a.id
WHERE u.id = @AgentId;

PRINT '';
PRINT '==========================================================';
PRINT 'TERMINÉ!';
PRINT '==========================================================';
GO
