-- ============================================================================
-- SCRIPT D'EXTRACTION DU SCHÉMA DE BASE DE DONNÉES POUR CONCEPTION UML
-- Base de données: STA_SAV_DB
-- Date: Mai 2026
-- ============================================================================

USE STA_SAV_DB;
GO

PRINT '============================================================================';
PRINT 'EXTRACTION DU SCHÉMA DE BASE DE DONNÉES POUR UML';
PRINT '============================================================================';
PRINT '';

-- ============================================================================
-- 1. LISTE DE TOUTES LES TABLES
-- ============================================================================
PRINT '1️⃣  LISTE DES TABLES';
PRINT '----------------------------------------------------------------------------';

SELECT 
    ROW_NUMBER() OVER (ORDER BY t.name) AS [#],
    t.name AS [Nom_Table],
    SCHEMA_NAME(t.schema_id) AS [Schema],
    (SELECT COUNT(*) FROM sys.columns c WHERE c.object_id = t.object_id) AS [Nb_Colonnes]
FROM sys.tables t
WHERE t.is_ms_shipped = 0
ORDER BY t.name;

PRINT '';
PRINT '';

-- ============================================================================
-- 2. DÉTAILS DES COLONNES POUR CHAQUE TABLE
-- ============================================================================
PRINT '2️⃣  DÉTAILS DES COLONNES PAR TABLE';
PRINT '----------------------------------------------------------------------------';

SELECT 
    t.name AS [Table],
    c.column_id AS [Ordre],
    c.name AS [Colonne],
    TYPE_NAME(c.user_type_id) AS [Type],
    CASE 
        WHEN TYPE_NAME(c.user_type_id) IN ('varchar', 'nvarchar', 'char', 'nchar') 
        THEN CAST(c.max_length AS VARCHAR) + 
             CASE WHEN TYPE_NAME(c.user_type_id) LIKE 'n%' THEN ' (Unicode)' ELSE '' END
        WHEN TYPE_NAME(c.user_type_id) IN ('decimal', 'numeric')
        THEN CAST(c.precision AS VARCHAR) + ',' + CAST(c.scale AS VARCHAR)
        ELSE ''
    END AS [Taille],
    CASE WHEN c.is_nullable = 1 THEN 'OUI' ELSE 'NON' END AS [Nullable],
    CASE WHEN pk.column_id IS NOT NULL THEN '🔑 PK' ELSE '' END AS [Clé_Primaire],
    CASE WHEN fk.parent_column_id IS NOT NULL THEN '🔗 FK' ELSE '' END AS [Clé_Étrangère],
    CASE WHEN c.is_identity = 1 THEN 'AUTO' ELSE '' END AS [Auto_Increment],
    ISNULL(dc.definition, '') AS [Valeur_Par_Défaut]
FROM sys.tables t
INNER JOIN sys.columns c ON t.object_id = c.object_id
LEFT JOIN (
    SELECT ic.object_id, ic.column_id
    FROM sys.indexes i
    INNER JOIN sys.index_columns ic ON i.object_id = ic.object_id AND i.index_id = ic.index_id
    WHERE i.is_primary_key = 1
) pk ON c.object_id = pk.object_id AND c.column_id = pk.column_id
LEFT JOIN sys.foreign_key_columns fk ON c.object_id = fk.parent_object_id AND c.column_id = fk.parent_column_id
LEFT JOIN sys.default_constraints dc ON c.object_id = dc.parent_object_id AND c.column_id = dc.parent_column_id
WHERE t.is_ms_shipped = 0
ORDER BY t.name, c.column_id;

PRINT '';
PRINT '';

-- ============================================================================
-- 3. CLÉS PRIMAIRES
-- ============================================================================
PRINT '3️⃣  CLÉS PRIMAIRES';
PRINT '----------------------------------------------------------------------------';

SELECT 
    t.name AS [Table],
    i.name AS [Nom_Contrainte],
    STRING_AGG(c.name, ', ') WITHIN GROUP (ORDER BY ic.key_ordinal) AS [Colonnes_PK]
FROM sys.tables t
INNER JOIN sys.indexes i ON t.object_id = i.object_id
INNER JOIN sys.index_columns ic ON i.object_id = ic.object_id AND i.index_id = ic.index_id
INNER JOIN sys.columns c ON ic.object_id = c.object_id AND ic.column_id = c.column_id
WHERE i.is_primary_key = 1
  AND t.is_ms_shipped = 0
GROUP BY t.name, i.name
ORDER BY t.name;

PRINT '';
PRINT '';

-- ============================================================================
-- 4. CLÉS ÉTRANGÈRES ET RELATIONS
-- ============================================================================
PRINT '4️⃣  CLÉS ÉTRANGÈRES ET RELATIONS';
PRINT '----------------------------------------------------------------------------';

SELECT 
    fk.name AS [Nom_Contrainte],
    OBJECT_NAME(fk.parent_object_id) AS [Table_Source],
    STRING_AGG(c_parent.name, ', ') WITHIN GROUP (ORDER BY fkc.constraint_column_id) AS [Colonne_Source],
    OBJECT_NAME(fk.referenced_object_id) AS [Table_Référencée],
    STRING_AGG(c_ref.name, ', ') WITHIN GROUP (ORDER BY fkc.constraint_column_id) AS [Colonne_Référencée],
    CASE fk.delete_referential_action
        WHEN 0 THEN 'NO ACTION'
        WHEN 1 THEN 'CASCADE'
        WHEN 2 THEN 'SET NULL'
        WHEN 3 THEN 'SET DEFAULT'
    END AS [On_Delete],
    CASE fk.update_referential_action
        WHEN 0 THEN 'NO ACTION'
        WHEN 1 THEN 'CASCADE'
        WHEN 2 THEN 'SET NULL'
        WHEN 3 THEN 'SET DEFAULT'
    END AS [On_Update]
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
    fk.delete_referential_action,
    fk.update_referential_action
ORDER BY OBJECT_NAME(fk.parent_object_id);

PRINT '';
PRINT '';

-- ============================================================================
-- 5. INDEX
-- ============================================================================
PRINT '5️⃣  INDEX';
PRINT '----------------------------------------------------------------------------';

SELECT 
    t.name AS [Table],
    i.name AS [Nom_Index],
    CASE i.type
        WHEN 1 THEN 'CLUSTERED'
        WHEN 2 THEN 'NONCLUSTERED'
        WHEN 3 THEN 'XML'
        WHEN 4 THEN 'SPATIAL'
    END AS [Type],
    CASE WHEN i.is_unique = 1 THEN 'OUI' ELSE 'NON' END AS [Unique],
    STRING_AGG(c.name, ', ') WITHIN GROUP (ORDER BY ic.key_ordinal) AS [Colonnes]
FROM sys.tables t
INNER JOIN sys.indexes i ON t.object_id = i.object_id
INNER JOIN sys.index_columns ic ON i.object_id = ic.object_id AND i.index_id = ic.index_id
INNER JOIN sys.columns c ON ic.object_id = c.object_id AND ic.column_id = c.column_id
WHERE t.is_ms_shipped = 0
  AND i.type > 0  -- Exclure les HEAP
  AND i.is_primary_key = 0  -- Exclure les PK (déjà listées)
GROUP BY t.name, i.name, i.type, i.is_unique
ORDER BY t.name, i.name;

PRINT '';
PRINT '';

-- ============================================================================
-- 6. VUES
-- ============================================================================
PRINT '6️⃣  VUES';
PRINT '----------------------------------------------------------------------------';

SELECT 
    v.name AS [Nom_Vue],
    SCHEMA_NAME(v.schema_id) AS [Schema],
    (SELECT COUNT(*) FROM sys.columns c WHERE c.object_id = v.object_id) AS [Nb_Colonnes]
FROM sys.views v
WHERE v.is_ms_shipped = 0
ORDER BY v.name;

PRINT '';
PRINT '';

-- ============================================================================
-- 7. CONTRAINTES UNIQUE
-- ============================================================================
PRINT '7️⃣  CONTRAINTES UNIQUE';
PRINT '----------------------------------------------------------------------------';

SELECT 
    t.name AS [Table],
    i.name AS [Nom_Contrainte],
    STRING_AGG(c.name, ', ') WITHIN GROUP (ORDER BY ic.key_ordinal) AS [Colonnes]
FROM sys.tables t
INNER JOIN sys.indexes i ON t.object_id = i.object_id
INNER JOIN sys.index_columns ic ON i.object_id = ic.object_id AND i.index_id = ic.index_id
INNER JOIN sys.columns c ON ic.object_id = c.object_id AND ic.column_id = c.column_id
WHERE i.is_unique = 1
  AND i.is_primary_key = 0
  AND t.is_ms_shipped = 0
GROUP BY t.name, i.name
ORDER BY t.name;

PRINT '';
PRINT '';

-- ============================================================================
-- 8. CONTRAINTES CHECK
-- ============================================================================
PRINT '8️⃣  CONTRAINTES CHECK';
PRINT '----------------------------------------------------------------------------';

SELECT 
    OBJECT_NAME(cc.parent_object_id) AS [Table],
    cc.name AS [Nom_Contrainte],
    cc.definition AS [Condition]
FROM sys.check_constraints cc
WHERE OBJECT_SCHEMA_NAME(cc.parent_object_id) = 'dbo'
ORDER BY OBJECT_NAME(cc.parent_object_id);

PRINT '';
PRINT '';

-- ============================================================================
-- 9. RÉSUMÉ STATISTIQUE
-- ============================================================================
PRINT '9️⃣  RÉSUMÉ STATISTIQUE';
PRINT '----------------------------------------------------------------------------';

SELECT 
    'Tables' AS [Type],
    COUNT(*) AS [Nombre]
FROM sys.tables
WHERE is_ms_shipped = 0

UNION ALL

SELECT 
    'Vues' AS [Type],
    COUNT(*) AS [Nombre]
FROM sys.views
WHERE is_ms_shipped = 0

UNION ALL

SELECT 
    'Clés Primaires' AS [Type],
    COUNT(*) AS [Nombre]
FROM sys.indexes
WHERE is_primary_key = 1

UNION ALL

SELECT 
    'Clés Étrangères' AS [Type],
    COUNT(*) AS [Nombre]
FROM sys.foreign_keys

UNION ALL

SELECT 
    'Index' AS [Type],
    COUNT(*) AS [Nombre]
FROM sys.indexes i
INNER JOIN sys.tables t ON i.object_id = t.object_id
WHERE i.type > 0 
  AND i.is_primary_key = 0
  AND t.is_ms_shipped = 0;

PRINT '';
PRINT '';

-- ============================================================================
-- 10. DIAGRAMME DE RELATIONS (FORMAT TEXTE)
-- ============================================================================
PRINT '🔟 DIAGRAMME DE RELATIONS';
PRINT '----------------------------------------------------------------------------';

SELECT 
    OBJECT_NAME(fk.parent_object_id) AS [Table_Source],
    '---[' + STRING_AGG(c_parent.name, ', ') WITHIN GROUP (ORDER BY fkc.constraint_column_id) + ']--->' AS [Relation],
    OBJECT_NAME(fk.referenced_object_id) AS [Table_Cible],
    '[' + STRING_AGG(c_ref.name, ', ') WITHIN GROUP (ORDER BY fkc.constraint_column_id) + ']' AS [Colonne_Cible]
FROM sys.foreign_keys fk
INNER JOIN sys.foreign_key_columns fkc ON fk.object_id = fkc.constraint_object_id
INNER JOIN sys.columns c_parent ON fkc.parent_object_id = c_parent.object_id 
    AND fkc.parent_column_id = c_parent.column_id
INNER JOIN sys.columns c_ref ON fkc.referenced_object_id = c_ref.object_id 
    AND fkc.referenced_column_id = c_ref.column_id
GROUP BY 
    fk.parent_object_id,
    fk.referenced_object_id
ORDER BY OBJECT_NAME(fk.parent_object_id);

PRINT '';
PRINT '============================================================================';
PRINT 'EXTRACTION TERMINÉE';
PRINT '============================================================================';
