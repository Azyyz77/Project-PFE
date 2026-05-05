-- ============================================
-- Changer l'agence de l'agent SAV ID 8
-- Email: agentsav@gmail.com
-- ============================================

USE STA_SAV_DB;
GO

PRINT '==========================================================';
PRINT 'CHANGER L''AGENCE DE L''AGENT SAV (ID 8)';
PRINT '==========================================================';
PRINT '';

-- Voir les agences disponibles
PRINT 'Agences disponibles:';
PRINT '----------------------------------------------------------';
SELECT id, nom, adresse, telephone
FROM Agence
ORDER BY id;
PRINT '';

-- État AVANT modification
PRINT 'AVANT modification:';
PRINT '----------------------------------------------------------';
SELECT 
    u.id AS agent_id,
    u.nom + ' ' + u.prenom AS agent_nom,
    u.email,
    u.agence_id AS agence_actuelle_id,
    a.nom AS agence_actuelle_nom
FROM Utilisateur u
LEFT JOIN Agence a ON u.agence_id = a.id
WHERE u.id = 8;
PRINT '';

-- ⚠️ MODIFIER LA NOUVELLE AGENCE ICI:
DECLARE @NouvelleAgenceId BIGINT = 2;  -- ← CHANGER CE NUMÉRO

PRINT 'Mise à jour vers l''agence ID: ' + CAST(@NouvelleAgenceId AS NVARCHAR(10));
PRINT '';

-- Vérifier que l'agence existe
IF NOT EXISTS (SELECT 1 FROM Agence WHERE id = @NouvelleAgenceId)
BEGIN
    PRINT '❌ ERREUR: Agence introuvable!';
    PRINT 'Choisissez un ID d''agence dans la liste ci-dessus.';
    RETURN;
END

-- Effectuer la mise à jour
UPDATE Utilisateur
SET agence_id = @NouvelleAgenceId
WHERE id = 8;

PRINT '✅ Mise à jour effectuée!';
PRINT '';

-- État APRÈS modification
PRINT 'APRÈS modification:';
PRINT '----------------------------------------------------------';
SELECT 
    u.id AS agent_id,
    u.nom + ' ' + u.prenom AS agent_nom,
    u.email,
    u.agence_id AS nouvelle_agence_id,
    a.nom AS nouvelle_agence_nom
FROM Utilisateur u
LEFT JOIN Agence a ON u.agence_id = a.id
WHERE u.id = 8;

PRINT '';
PRINT '==========================================================';
PRINT 'TERMINÉ!';
PRINT '==========================================================';
GO
