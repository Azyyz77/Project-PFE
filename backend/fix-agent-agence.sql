-- Script pour vérifier et corriger l'agence_id de l'agent SAV
-- Exécutez ce script dans votre outil SQL Server Management Studio ou DBeaver

-- ÉTAPE 1: Vérifier si la table existe
IF OBJECT_ID('Utilisateur', 'U') IS NOT NULL
    PRINT '✓ Table Utilisateur existe'
ELSE
    PRINT '✗ ERREUR: Table Utilisateur n''existe pas!'
GO

-- ÉTAPE 2: Vérifier l'agent SAV
SELECT 
    id,
    email,
    prenom,
    nom,
    agence_id,
    role_id,
    actif
FROM Utilisateur 
WHERE email = 'agentsav@gmail.com';
GO

-- ÉTAPE 3: Vérifier les agences disponibles
SELECT 
    id,
    nom,
    ville,
    actif
FROM Agence
WHERE actif = 1;
GO

-- ÉTAPE 4: Corriger l'agence_id de l'agent (si NULL)
-- Remplacez 1 par l'ID de l'agence appropriée si nécessaire
UPDATE Utilisateur 
SET agence_id = 1 
WHERE email = 'agentsav@gmail.com' 
AND agence_id IS NULL;
GO

-- ÉTAPE 5: Vérifier la correction
SELECT 
    id,
    email,
    prenom,
    nom,
    agence_id,
    role_id,
    actif
FROM Utilisateur 
WHERE email = 'agentsav@gmail.com';
GO

-- ÉTAPE 6: Vérifier tous les agents sans agence
SELECT 
    u.id,
    u.email,
    u.prenom,
    u.nom,
    u.agence_id,
    r.nom AS role_nom
FROM Utilisateur u
INNER JOIN Role r ON u.role_id = r.id
WHERE r.nom = 'AGENT' 
AND u.agence_id IS NULL;
GO

PRINT 'Script terminé. Vérifiez les résultats ci-dessus.';
