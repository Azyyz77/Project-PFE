-- ============================================================================
-- EXPORT DU SCHÉMA EN FORMAT CSV POUR OUTILS UML
-- Base de données: STA_SAV_DB
-- ============================================================================

USE STA_SAV_DB;
GO

-- ============================================================================
-- EXPORT 1: TABLES ET ATTRIBUTS (Format CSV)
-- ============================================================================
PRINT 'Table,Colonne,Type,Taille,Nullable,PK,FK,Auto,Description';

SELECT 
    t.name + ',' +
    c.name + ',' +
    TYPE_NAME(c.user_type_id) + ',' +
    CASE 
        WHEN TYPE_NAME(c.user_type_id) IN ('varchar', 'nvarchar', 'char', 'nchar') 
        THEN CAST(c.max_length AS VARCHAR)
        WHEN TYPE_NAME(c.user_type_id) IN ('decimal', 'numeric')
        THEN CAST(c.precision AS VARCHAR) + '.' + CAST(c.scale AS VARCHAR)
        ELSE ''
    END + ',' +
    CASE WHEN c.is_nullable = 1 THEN 'OUI' ELSE 'NON' END + ',' +
    CASE WHEN pk.column_id IS NOT NULL THEN 'OUI' ELSE 'NON' END + ',' +
    CASE WHEN fk.parent_column_id IS NOT NULL THEN 'OUI' ELSE 'NON' END + ',' +
    CASE WHEN c.is_identity = 1 THEN 'OUI' ELSE 'NON' END + ',' +
    ISNULL(REPLACE(CAST(ep.value AS NVARCHAR(MAX)), ',', ';'), '') AS [CSV_Line]
FROM sys.tables t
INNER JOIN sys.columns c ON t.object_id = c.object_id
LEFT JOIN (
    SELECT ic.object_id, ic.column_id
    FROM sys.indexes i
    INNER JOIN sys.index_columns ic ON i.object_id = ic.object_id AND i.index_id = ic.index_id
    WHERE i.is_primary_key = 1
) pk ON c.object_id = pk.object_id AND c.column_id = pk.column_id
LEFT JOIN sys.foreign_key_columns fk ON c.object_id = fk.parent_object_id AND c.column_id = fk.parent_column_id
LEFT JOIN sys.extended_properties ep ON c.object_id = ep.major_id AND c.column_id = ep.minor_id
WHERE t.is_ms_shipped = 0
ORDER BY t.name, c.column_id;

PRINT '';
PRINT '';

-- ============================================================================
-- EXPORT 2: RELATIONS (Format CSV)
-- ============================================================================
PRINT 'Contrainte,Table_Source,Colonne_Source,Table_Cible,Colonne_Cible,Cardinalite,On_Delete';

SELECT 
    fk.name + ',' +
    OBJECT_NAME(fk.parent_object_id) + ',' +
    STRING_AGG(c_parent.name, '+') WITHIN GROUP (ORDER BY fkc.constraint_column_id) + ',' +
    OBJECT_NAME(fk.referenced_object_id) + ',' +
    STRING_AGG(c_ref.name, '+') WITHIN GROUP (ORDER BY fkc.constraint_column_id) + ',' +
    '1..N' + ',' +
    CASE fk.delete_referential_action
        WHEN 0 THEN 'NO_ACTION'
        WHEN 1 THEN 'CASCADE'
        WHEN 2 THEN 'SET_NULL'
        WHEN 3 THEN 'SET_DEFAULT'
    END AS [CSV_Line]
FROM sys.foreign_keys fk
INNER JOIN sys.foreign_key_columns fkc ON fk.object_id = fkc.constraint_object_id
INNER JOIN sys.columns c_parent ON fkc.parent_object_id = c_parent.object_id 
    AND fkc.parent_column_id = c_parent.column_id
INNER JOIN sys.columns c_ref ON fkc.referenced_object_id = c_ref.object_id 
    AND fkc.referenced_column_id = c_ref.column_id
GROUP BY 
    fk.name,
    fk.parent_object_id,
    fk.referenced_object_id,
    fk.delete_referential_action
ORDER BY OBJECT_NAME(fk.parent_object_id);
