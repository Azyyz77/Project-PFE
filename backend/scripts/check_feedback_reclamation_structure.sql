-- Vérifier la structure des tables Feedback et Reclamation

USE STA_SAV_DB;
GO

PRINT '🔍 Vérification de la structure des tables...';
PRINT '';

-- Structure de la table Feedback
PRINT '📋 Table Feedback:';
SELECT 
    COLUMN_NAME,
    DATA_TYPE,
    CHARACTER_MAXIMUM_LENGTH,
    IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'Feedback'
ORDER BY ORDINAL_POSITION;

PRINT '';

-- Structure de la table Reclamation
PRINT '📋 Table Reclamation:';
SELECT 
    COLUMN_NAME,
    DATA_TYPE,
    CHARACTER_MAXIMUM_LENGTH,
    IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'Reclamation'
ORDER BY ORDINAL_POSITION;

PRINT '';

-- Vérifier les données existantes
PRINT '📊 Données existantes:';
SELECT 
    'Feedback' AS table_name,
    COUNT(*) AS total_rows
FROM Feedback

UNION ALL

SELECT 
    'Reclamation' AS table_name,
    COUNT(*) AS total_rows
FROM Reclamation;
