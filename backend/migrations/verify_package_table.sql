-- Vérifier la structure de la table PackageIntervention
USE STA_SAV_DB;
GO

-- Afficher toutes les colonnes de la table
SELECT 
    c.name AS ColumnName,
    t.name AS DataType,
    c.max_length AS MaxLength,
    c.precision AS Precision,
    c.scale AS Scale,
    c.is_nullable AS IsNullable,
    c.column_id AS Position
FROM sys.columns c
JOIN sys.types t ON c.user_type_id = t.user_type_id
WHERE c.object_id = OBJECT_ID('PackageIntervention')
ORDER BY c.column_id;
GO

-- Tester une requête SELECT simple
SELECT TOP 1 * FROM PackageIntervention;
GO

-- Tester une requête UPDATE (sans vraiment modifier)
DECLARE @TestId BIGINT = (SELECT TOP 1 id FROM PackageIntervention);

IF @TestId IS NOT NULL
BEGIN
    PRINT 'Test UPDATE avec ID: ' + CAST(@TestId AS VARCHAR);
    
    -- Cette requête ne modifie rien mais teste la syntaxe
    UPDATE PackageIntervention
    SET nom = nom, 
        description = description, 
        prix = prix, 
        duree_estimee = duree_estimee, 
        actif = actif
    WHERE id = @TestId;
    
    PRINT '✅ Requête UPDATE fonctionne correctement';
END
ELSE
BEGIN
    PRINT 'ℹ️ Aucun package dans la table pour tester';
END
GO
