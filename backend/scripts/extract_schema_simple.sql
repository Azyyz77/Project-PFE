-- ============================================================================
-- EXTRACTION SIMPLE DU SCHÉMA POUR UML (Sans Extended Properties)
-- Base de données: STA_SAV_DB
-- ============================================================================

USE STA_SAV_DB;
GO

PRINT '============================================================================';
PRINT 'EXTRACTION SIMPLE DU SCHÉMA POUR CONCEPTION UML';
PRINT '============================================================================';
PRINT '';

-- ============================================================================
-- 1. TABLES ET COLONNES (Format Tableau)
-- ============================================================================
PRINT '📊 TABLES ET COLONNES';
PRINT '----------------------------------------------------------------------------';

SELECT 
    t.name AS [Table],
    c.name AS [Colonne],
    TYPE_NAME(c.user_type_id) AS [Type],
    CASE 
        WHEN TYPE_NAME(c.user_type_id) IN ('varchar', 'nvarchar', 'char', 'nchar') 
        THEN CAST(c.max_length AS VARCHAR)
        WHEN TYPE_NAME(c.user_type_id) IN ('decimal', 'numeric')
        THEN CAST(c.precision AS VARCHAR) + ',' + CAST(c.scale AS VARCHAR)
        ELSE ''
    END AS [Taille],
    CASE WHEN c.is_nullable = 1 THEN 'OUI' ELSE 'NON' END AS [Nullable],
    CASE WHEN pk.column_id IS NOT NULL THEN '🔑' ELSE '' END AS [PK],
    CASE WHEN fk.parent_column_id IS NOT NULL THEN '🔗' ELSE '' END AS [FK],
    CASE WHEN c.is_identity = 1 THEN 'AUTO' ELSE '' END AS [Auto]
FROM sys.tables t
INNER JOIN sys.columns c ON t.object_id = c.object_id
LEFT JOIN (
    SELECT ic.object_id, ic.column_id
    FROM sys.indexes i
    INNER JOIN sys.index_columns ic ON i.object_id = ic.object_id AND i.index_id = ic.index_id
    WHERE i.is_primary_key = 1
) pk ON c.object_id = pk.object_id AND c.column_id = pk.column_id
LEFT JOIN sys.foreign_key_columns fk ON c.object_id = fk.parent_object_id AND c.column_id = fk.parent_column_id
WHERE t.is_ms_shipped = 0
ORDER BY t.name, c.column_id;

PRINT '';
PRINT '';

-- ============================================================================
-- 2. RELATIONS (Format Simple)
-- ============================================================================
PRINT '🔗 RELATIONS ENTRE TABLES';
PRINT '----------------------------------------------------------------------------';

SELECT 
    OBJECT_NAME(fk.parent_object_id) AS [Table_Source],
    c_parent.name AS [Colonne_Source],
    '--->' AS [Relation],
    OBJECT_NAME(fk.referenced_object_id) AS [Table_Cible],
    c_ref.name AS [Colonne_Cible],
    CASE fk.delete_referential_action
        WHEN 0 THEN 'NO ACTION'
        WHEN 1 THEN 'CASCADE'
        WHEN 2 THEN 'SET NULL'
    END AS [On_Delete]
FROM sys.foreign_keys fk
INNER JOIN sys.foreign_key_columns fkc ON fk.object_id = fkc.constraint_object_id
INNER JOIN sys.columns c_parent ON fkc.parent_object_id = c_parent.object_id 
    AND fkc.parent_column_id = c_parent.column_id
INNER JOIN sys.columns c_ref ON fkc.referenced_object_id = c_ref.object_id 
    AND fkc.referenced_column_id = c_ref.column_id
ORDER BY OBJECT_NAME(fk.parent_object_id);

PRINT '';
PRINT '';

-- ============================================================================
-- 3. RÉSUMÉ
-- ============================================================================
PRINT '📈 RÉSUMÉ';
PRINT '----------------------------------------------------------------------------';

SELECT 
    (SELECT COUNT(*) FROM sys.tables WHERE is_ms_shipped = 0) AS [Nombre_Tables],
    (SELECT COUNT(*) FROM sys.columns c 
     INNER JOIN sys.tables t ON c.object_id = t.object_id 
     WHERE t.is_ms_shipped = 0) AS [Nombre_Colonnes],
    (SELECT COUNT(*) FROM sys.foreign_keys) AS [Nombre_Relations];

PRINT '';
PRINT '============================================================================';
PRINT 'EXTRACTION TERMINÉE';
PRINT '============================================================================';
