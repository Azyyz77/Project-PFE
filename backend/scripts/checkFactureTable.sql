-- Vérifier la structure de la table Facture
SELECT 
    c.name AS column_name,
    t.name AS data_type,
    c.max_length,
    c.is_nullable,
    c.is_identity
FROM sys.columns c
JOIN sys.types t ON c.user_type_id = t.user_type_id
WHERE c.object_id = OBJECT_ID('Facture')
ORDER BY c.column_id;

-- Vérifier les contraintes UNIQUE
SELECT 
    i.name AS constraint_name,
    COL_NAME(ic.object_id, ic.column_id) AS column_name,
    i.is_unique,
    i.is_primary_key
FROM sys.indexes i
JOIN sys.index_columns ic ON i.object_id = ic.object_id AND i.index_id = ic.index_id
WHERE i.object_id = OBJECT_ID('Facture')
  AND (i.is_unique = 1 OR i.is_primary_key = 1)
ORDER BY i.name, ic.key_ordinal;

-- Vérifier les données existantes
SELECT * FROM Facture;
