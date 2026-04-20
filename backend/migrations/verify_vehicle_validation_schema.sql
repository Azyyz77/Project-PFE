USE [STA_SAV_DB]
GO

PRINT '============================================================'
PRINT 'VÉRIFICATION DU SCHÉMA DE VALIDATION DES VÉHICULES'
PRINT '============================================================'
PRINT ''

-- Vérifier les colonnes
PRINT '1. Colonnes de la table Vehicule:'
PRINT '-----------------------------------'
SELECT 
    COLUMN_NAME AS 'Colonne',
    DATA_TYPE AS 'Type',
    CHARACTER_MAXIMUM_LENGTH AS 'Longueur',
    IS_NULLABLE AS 'Nullable',
    COLUMN_DEFAULT AS 'Défaut'
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'Vehicule'
  AND COLUMN_NAME IN ('statut_validation', 'date_validation', 'agent_validation_id')
ORDER BY COLUMN_NAME

PRINT ''
PRINT '2. Contraintes:'
PRINT '-----------------------------------'
SELECT 
    name AS 'Contrainte',
    type_desc AS 'Type'
FROM sys.objects
WHERE parent_object_id = OBJECT_ID('Vehicule')
  AND name IN ('FK_Vehicule_Agent_Validation', 'CK_Vehicule_Statut_Validation')

PRINT ''
PRINT '3. Index:'
PRINT '-----------------------------------'
SELECT 
    i.name AS 'Index',
    i.type_desc AS 'Type',
    STRING_AGG(c.name, ', ') AS 'Colonnes'
FROM sys.indexes i
JOIN sys.index_columns ic ON i.object_id = ic.object_id AND i.index_id = ic.index_id
JOIN sys.columns c ON ic.object_id = c.object_id AND ic.column_id = c.column_id
WHERE i.object_id = OBJECT_ID('Vehicule')
  AND i.name IN ('IX_Vehicule_Statut_Validation', 'IX_Vehicule_Agent_Validation')
GROUP BY i.name, i.type_desc

PRINT ''
PRINT '4. Statistiques des véhicules:'
PRINT '-----------------------------------'
SELECT 
    statut_validation AS 'Statut',
    COUNT(*) AS 'Nombre'
FROM Vehicule
GROUP BY statut_validation
ORDER BY statut_validation

PRINT ''
PRINT '5. Véhicules en attente de validation:'
PRINT '-----------------------------------'
SELECT 
    COUNT(*) AS 'Total en attente'
FROM Vehicule
WHERE statut_validation = 'EN_ATTENTE'

PRINT ''
PRINT '✅ Vérification terminée!'
GO
