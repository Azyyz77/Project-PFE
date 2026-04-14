-- Script pour corriger les colonnes de la table PackageIntervention
USE STA_SAV_DB;
GO

-- Vérifier si la colonne prix existe
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('PackageIntervention') AND name = 'prix')
BEGIN
    -- Si prix_estimatif existe, la renommer en prix
    IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('PackageIntervention') AND name = 'prix_estimatif')
    BEGIN
        EXEC sp_rename 'PackageIntervention.prix_estimatif', 'prix', 'COLUMN';
        PRINT 'Colonne prix_estimatif renommée en prix';
    END
    ELSE
    BEGIN
        -- Sinon, créer la colonne prix
        ALTER TABLE PackageIntervention ADD prix DECIMAL(10,3) NOT NULL DEFAULT 0;
        PRINT 'Colonne prix créée';
    END
END
ELSE
BEGIN
    PRINT 'Colonne prix existe déjà';
END
GO

-- Vérifier si la colonne duree_estimee existe
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('PackageIntervention') AND name = 'duree_estimee')
BEGIN
    ALTER TABLE PackageIntervention ADD duree_estimee NVARCHAR(50);
    PRINT 'Colonne duree_estimee créée';
END
ELSE
BEGIN
    PRINT 'Colonne duree_estimee existe déjà';
END
GO

-- Afficher la structure finale de la table
SELECT 
    c.name AS ColumnName,
    t.name AS DataType,
    c.max_length AS MaxLength,
    c.is_nullable AS IsNullable
FROM sys.columns c
JOIN sys.types t ON c.user_type_id = t.user_type_id
WHERE c.object_id = OBJECT_ID('PackageIntervention')
ORDER BY c.column_id;
GO

PRINT '';
PRINT '✅ Colonnes de PackageIntervention corrigées!';
GO
