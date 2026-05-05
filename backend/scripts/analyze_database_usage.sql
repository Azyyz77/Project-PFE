-- ============================================================================
-- ANALYSE D'UTILISATION DE LA BASE DE DONNÉES
-- Identifie les tables potentiellement non utilisées
-- ============================================================================

USE STA_SAV_DB;
GO

PRINT '============================================================================';
PRINT 'ANALYSE D''UTILISATION DE LA BASE DE DONNÉES';
PRINT '============================================================================';
PRINT '';

-- ============================================================================
-- 1. TABLES SANS DONNÉES
-- ============================================================================
PRINT '📊 1. TABLES VIDES (Sans données)';
PRINT '----------------------------------------------------------------------------';

SELECT 
    t.name AS [Table],
    p.rows AS [Nombre_Lignes]
FROM sys.tables t
INNER JOIN sys.partitions p ON t.object_id = p.object_id
WHERE t.is_ms_shipped = 0
  AND p.index_id IN (0, 1)  -- Heap ou Clustered Index
  AND p.rows = 0
ORDER BY t.name;

PRINT '';
PRINT '';

-- ============================================================================
-- 2. TABLES AVEC PEU DE DONNÉES
-- ============================================================================
PRINT '📉 2. TABLES AVEC PEU DE DONNÉES (< 10 lignes)';
PRINT '----------------------------------------------------------------------------';

SELECT 
    t.name AS [Table],
    p.rows AS [Nombre_Lignes]
FROM sys.tables t
INNER JOIN sys.partitions p ON t.object_id = p.object_id
WHERE t.is_ms_shipped = 0
  AND p.index_id IN (0, 1)
  AND p.rows > 0
  AND p.rows < 10
ORDER BY p.rows, t.name;

PRINT '';
PRINT '';

-- ============================================================================
-- 3. TABLES SANS CLÉS ÉTRANGÈRES
-- ============================================================================
PRINT '🔗 3. TABLES SANS RELATIONS (Pas de FK entrantes ou sortantes)';
PRINT '----------------------------------------------------------------------------';

SELECT 
    t.name AS [Table],
    (SELECT COUNT(*) FROM sys.foreign_keys fk WHERE fk.parent_object_id = t.object_id) AS [FK_Sortantes],
    (SELECT COUNT(*) FROM sys.foreign_keys fk WHERE fk.referenced_object_id = t.object_id) AS [FK_Entrantes]
FROM sys.tables t
WHERE t.is_ms_shipped = 0
  AND NOT EXISTS (
    SELECT 1 FROM sys.foreign_keys fk 
    WHERE fk.parent_object_id = t.object_id 
       OR fk.referenced_object_id = t.object_id
  )
ORDER BY t.name;

PRINT '';
PRINT '';

-- ============================================================================
-- 4. STATISTIQUES PAR TABLE
-- ============================================================================
PRINT '📈 4. STATISTIQUES COMPLÈTES PAR TABLE';
PRINT '----------------------------------------------------------------------------';

SELECT 
    t.name AS [Table],
    p.rows AS [Lignes],
    (SELECT COUNT(*) FROM sys.columns c WHERE c.object_id = t.object_id) AS [Colonnes],
    (SELECT COUNT(*) FROM sys.foreign_keys fk WHERE fk.parent_object_id = t.object_id) AS [FK_Sortantes],
    (SELECT COUNT(*) FROM sys.foreign_keys fk WHERE fk.referenced_object_id = t.object_id) AS [FK_Entrantes],
    (SELECT COUNT(*) FROM sys.indexes i WHERE i.object_id = t.object_id AND i.type > 0) AS [Index],
    CASE 
        WHEN p.rows = 0 THEN '⚠️ VIDE'
        WHEN p.rows < 10 THEN '⚠️ PEU DE DONNÉES'
        WHEN p.rows < 100 THEN '✓ DONNÉES TEST'
        ELSE '✅ DONNÉES OK'
    END AS [Statut]
FROM sys.tables t
INNER JOIN sys.partitions p ON t.object_id = p.object_id
WHERE t.is_ms_shipped = 0
  AND p.index_id IN (0, 1)
ORDER BY p.rows DESC, t.name;

PRINT '';
PRINT '';

-- ============================================================================
-- 5. TABLES DE RÉFÉRENCE (Lookup Tables)
-- ============================================================================
PRINT '📚 5. TABLES DE RÉFÉRENCE (Lookup/Master Data)';
PRINT '----------------------------------------------------------------------------';

SELECT 
    t.name AS [Table],
    p.rows AS [Lignes],
    CASE 
        WHEN t.name LIKE '%Statut%' THEN 'Statut'
        WHEN t.name LIKE '%Type%' THEN 'Type'
        WHEN t.name LIKE 'Role%' THEN 'Rôle'
        WHEN t.name IN ('Marque', 'Modele', 'Version', 'Couleur', 'Package') THEN 'Catalogue'
        WHEN t.name IN ('Agence') THEN 'Organisation'
        ELSE 'Autre'
    END AS [Catégorie]
FROM sys.tables t
INNER JOIN sys.partitions p ON t.object_id = p.object_id
WHERE t.is_ms_shipped = 0
  AND p.index_id IN (0, 1)
  AND (
    t.name LIKE '%Statut%' 
    OR t.name LIKE '%Type%'
    OR t.name LIKE 'Role%'
    OR t.name IN ('Marque', 'Modele', 'Version', 'Couleur', 'Package', 'Agence')
  )
ORDER BY [Catégorie], t.name;

PRINT '';
PRINT '';

-- ============================================================================
-- 6. TABLES TRANSACTIONNELLES
-- ============================================================================
PRINT '💼 6. TABLES TRANSACTIONNELLES (Données métier)';
PRINT '----------------------------------------------------------------------------';

SELECT 
    t.name AS [Table],
    p.rows AS [Lignes],
    (SELECT COUNT(*) FROM sys.foreign_keys fk WHERE fk.parent_object_id = t.object_id) AS [Relations]
FROM sys.tables t
INNER JOIN sys.partitions p ON t.object_id = p.object_id
WHERE t.is_ms_shipped = 0
  AND p.index_id IN (0, 1)
  AND t.name NOT LIKE '%Statut%'
  AND t.name NOT LIKE '%Type%'
  AND t.name NOT LIKE 'Role%'
  AND t.name NOT IN ('Marque', 'Modele', 'Version', 'Couleur', 'Package', 'Agence')
ORDER BY p.rows DESC;

PRINT '';
PRINT '';

-- ============================================================================
-- 7. RÉSUMÉ GLOBAL
-- ============================================================================
PRINT '📊 7. RÉSUMÉ GLOBAL';
PRINT '----------------------------------------------------------------------------';

SELECT 
    'Tables Totales' AS [Catégorie],
    COUNT(*) AS [Nombre]
FROM sys.tables
WHERE is_ms_shipped = 0

UNION ALL

SELECT 
    'Tables Vides' AS [Catégorie],
    COUNT(*) AS [Nombre]
FROM sys.tables t
INNER JOIN sys.partitions p ON t.object_id = p.object_id
WHERE t.is_ms_shipped = 0
  AND p.index_id IN (0, 1)
  AND p.rows = 0

UNION ALL

SELECT 
    'Tables avec Données' AS [Catégorie],
    COUNT(*) AS [Nombre]
FROM sys.tables t
INNER JOIN sys.partitions p ON t.object_id = p.object_id
WHERE t.is_ms_shipped = 0
  AND p.index_id IN (0, 1)
  AND p.rows > 0

UNION ALL

SELECT 
    'Tables sans Relations' AS [Catégorie],
    COUNT(*) AS [Nombre]
FROM sys.tables t
WHERE t.is_ms_shipped = 0
  AND NOT EXISTS (
    SELECT 1 FROM sys.foreign_keys fk 
    WHERE fk.parent_object_id = t.object_id 
       OR fk.referenced_object_id = t.object_id
  )

UNION ALL

SELECT 
    'Vues' AS [Catégorie],
    COUNT(*) AS [Nombre]
FROM sys.views
WHERE is_ms_shipped = 0;

PRINT '';
PRINT '============================================================================';
PRINT 'ANALYSE TERMINÉE';
PRINT '============================================================================';
