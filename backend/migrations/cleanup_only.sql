-- ============================================================================
-- NETTOYAGE SIMPLE DE LA BASE DE DONNEES
-- Suppression des tables en double uniquement
-- ============================================================================

USE STA_SAV_DB;
GO

PRINT 'NETTOYAGE DE LA BASE DE DONNEES';
PRINT '================================';
PRINT '';

-- Supprimer les tables en double
IF OBJECT_ID('[ProblemePredéfini]', 'U') IS NOT NULL
BEGIN
    DROP TABLE [ProblemePredéfini];
    PRINT 'Table ProblemePredéfini supprimee (doublon)';
END

IF OBJECT_ID('PiecesJointes', 'U') IS NOT NULL
BEGIN
    DROP TABLE PiecesJointes;
    PRINT 'Table PiecesJointes supprimee (doublon)';
END

IF OBJECT_ID('appointment_logs', 'U') IS NOT NULL
BEGIN
    DROP TABLE appointment_logs;
    PRINT 'Table appointment_logs supprimee (non utilisee)';
END

PRINT '';
PRINT 'VERIFICATION DES TABLES RESTANTES';
PRINT '==================================';

SELECT 
    'Tables Totales' AS [Categorie],
    COUNT(*) AS [Nombre]
FROM sys.tables
WHERE is_ms_shipped = 0

UNION ALL

SELECT 
    'Tables Vides' AS [Categorie],
    COUNT(*) AS [Nombre]
FROM sys.tables t
INNER JOIN sys.partitions p ON t.object_id = p.object_id
WHERE t.is_ms_shipped = 0
  AND p.index_id IN (0, 1)
  AND p.rows = 0;

PRINT '';
PRINT 'NETTOYAGE TERMINE';
