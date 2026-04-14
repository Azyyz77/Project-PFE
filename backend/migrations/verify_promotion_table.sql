-- Vérifier la structure de la table Promotion
SELECT 
    COLUMN_NAME,
    DATA_TYPE,
    CHARACTER_MAXIMUM_LENGTH,
    IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'Promotion'
ORDER BY ORDINAL_POSITION;

-- Voir les données existantes
SELECT * FROM Promotion;
