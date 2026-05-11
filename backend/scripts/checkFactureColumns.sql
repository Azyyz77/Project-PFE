-- =============================================
-- Vérifier les colonnes existantes dans Facture
-- =============================================

USE STA_SAV_DB;
GO

PRINT '📊 Colonnes existantes dans la table Facture:';
PRINT '';

SELECT 
    COLUMN_NAME,
    DATA_TYPE,
    CHARACTER_MAXIMUM_LENGTH,
    IS_NULLABLE,
    COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'Facture'
ORDER BY ORDINAL_POSITION;

PRINT '';
PRINT '📋 Données actuelles (5 premières lignes):';

SELECT TOP 5 * FROM Facture;

GO
