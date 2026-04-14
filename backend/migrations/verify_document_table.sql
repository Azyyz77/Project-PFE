-- Vérifier la structure de la table Document
SELECT 
    COLUMN_NAME,
    DATA_TYPE,
    CHARACTER_MAXIMUM_LENGTH,
    IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'Document'
ORDER BY ORDINAL_POSITION;

-- Voir les données existantes
SELECT TOP 5 * FROM Document;
