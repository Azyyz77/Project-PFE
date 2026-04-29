-- Script de vérification de la base de données
-- Exécutez ce script pour vérifier votre connexion

-- Afficher la base de données actuelle
SELECT DB_NAME() AS 'Base de données actuelle';
GO

-- Lister toutes les bases de données disponibles
SELECT name AS 'Bases de données disponibles'
FROM sys.databases
WHERE name NOT IN ('master', 'tempdb', 'model', 'msdb')
ORDER BY name;
GO

-- Si vous n'êtes pas sur STA_SAV_DB, exécutez:
-- USE STA_SAV_DB;
-- GO

-- Vérifier les tables dans la base actuelle
SELECT 
    TABLE_SCHEMA,
    TABLE_NAME,
    TABLE_TYPE
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_NAME LIKE '%Utilisateur%' OR TABLE_NAME LIKE '%utilisateur%'
ORDER BY TABLE_NAME;
GO

-- Lister toutes les tables de la base actuelle
SELECT 
    TABLE_NAME,
    TABLE_TYPE
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_TYPE = 'BASE TABLE'
ORDER BY TABLE_NAME;
GO
