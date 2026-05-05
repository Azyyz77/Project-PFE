-- ============================================
-- Script: Supprimer le rôle SUPER_ADMIN
-- Date: 3 Mai 2026
-- Description: Nettoyer toutes les références à SUPER_ADMIN
-- ============================================

USE STA_SAV_DB;
GO

PRINT 'Debut suppression role SUPER_ADMIN...';
PRINT '';

-- ============================================
-- 1. VÉRIFIER SI LE RÔLE EXISTE
-- ============================================
PRINT '1. Verification existence role SUPER_ADMIN...';

IF EXISTS (SELECT 1 FROM Role WHERE nom = 'SUPER_ADMIN')
BEGIN
    PRINT '   Role SUPER_ADMIN trouve - Suppression en cours...';
    
    -- ============================================
    -- 2. MIGRER LES UTILISATEURS SUPER_ADMIN VERS ADMIN
    -- ============================================
    PRINT '';
    PRINT '2. Migration utilisateurs SUPER_ADMIN vers ADMIN...';
    
    DECLARE @SuperAdminId BIGINT = (SELECT id FROM Role WHERE nom = 'SUPER_ADMIN');
    DECLARE @AdminId BIGINT = (SELECT id FROM Role WHERE nom = 'ADMIN');
    DECLARE @UserCount INT;
    
    SELECT @UserCount = COUNT(*) FROM Utilisateur WHERE role_id = @SuperAdminId;
    
    IF @UserCount > 0
    BEGIN
        PRINT '   ' + CAST(@UserCount AS VARCHAR) + ' utilisateur(s) a migrer...';
        
        UPDATE Utilisateur
        SET role_id = @AdminId
        WHERE role_id = @SuperAdminId;
        
        PRINT '   Migration terminee!';
    END
    ELSE
    BEGIN
        PRINT '   Aucun utilisateur SUPER_ADMIN trouve';
    END
    
    -- ============================================
    -- 3. SUPPRIMER LE RÔLE SUPER_ADMIN
    -- ============================================
    PRINT '';
    PRINT '3. Suppression du role SUPER_ADMIN...';
    
    DELETE FROM Role WHERE nom = 'SUPER_ADMIN';
    
    PRINT '   Role SUPER_ADMIN supprime!';
END
ELSE
BEGIN
    PRINT '   Role SUPER_ADMIN non trouve - Rien a faire';
END

-- ============================================
-- 4. VÉRIFICATION FINALE
-- ============================================
PRINT '';
PRINT '========================================';
PRINT 'VERIFICATION FINALE';
PRINT '========================================';
PRINT '';

SELECT 
    r.id,
    r.nom AS Role,
    r.description,
    COUNT(u.id) AS NombreUtilisateurs
FROM Role r
LEFT JOIN Utilisateur u ON r.id = u.role_id
GROUP BY r.id, r.nom, r.description
ORDER BY r.id;

PRINT '';
PRINT 'Roles restants:';
SELECT nom FROM Role ORDER BY id;

PRINT '';
PRINT 'Suppression SUPER_ADMIN terminee avec succes!';
PRINT '';
GO
