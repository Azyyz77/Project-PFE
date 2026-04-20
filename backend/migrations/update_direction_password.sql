USE [STA_SAV_DB]
GO

PRINT '========================================='
PRINT 'Mise à jour du mot de passe DIRECTION'
PRINT '========================================='
PRINT ''

-- Hash bcrypt pour: Direction2024!
-- Généré avec bcrypt.hash('Direction2024!', 10)
DECLARE @hash NVARCHAR(255) = '$2a$10$tPs3FdkA.zZReByUrxGTNO0oY.fXmvuMeUxtCPo8sqNa8y2FVfirG'

-- Mettre à jour le mot de passe
UPDATE Utilisateur 
SET mot_de_passe = @hash
WHERE email = 'direction@stachery.tn'

IF @@ROWCOUNT > 0
BEGIN
    PRINT '✓ Mot de passe mis à jour avec succès!'
    PRINT ''
    
    -- Afficher les informations de l'utilisateur
    SELECT 
        id,
        nom,
        prenom,
        email,
        telephone,
        role_id,
        actif,
        LEFT(mot_de_passe, 20) + '...' AS mot_de_passe_preview
    FROM Utilisateur
    WHERE email = 'direction@stachery.tn'
    
    PRINT ''
    PRINT '========================================='
    PRINT 'INFORMATIONS DE CONNEXION'
    PRINT '========================================='
    PRINT 'Email:        direction@stachery.tn'
    PRINT 'Mot de passe: Direction2024!'
    PRINT '========================================='
END
ELSE
BEGIN
    PRINT '❌ Utilisateur non trouvé!'
    PRINT 'Veuillez d''abord exécuter: create_direction_test_user.sql'
END

PRINT ''

GO
