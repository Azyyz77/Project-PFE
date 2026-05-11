-- Vérifier toutes les tables liées aux commandes et factures
USE STA_SAV_DB;
GO

PRINT '📋 Tables existantes dans la base de données:';
PRINT '';

SELECT TABLE_NAME 
FROM INFORMATION_SCHEMA.TABLES 
WHERE TABLE_TYPE = 'BASE TABLE'
  AND TABLE_NAME LIKE '%Commande%' OR TABLE_NAME LIKE '%Ligne%' OR TABLE_NAME LIKE '%Facture%'
ORDER BY TABLE_NAME;

GO
