-- Migration: Augmenter la taille des colonnes d'images dans la table Vehicule
-- Date: 2026-04-30
-- Description: Changer NVARCHAR(500) en NVARCHAR(MAX) pour stocker les images Base64

USE STA_SAV_DB;
GO

-- Vérifier les colonnes actuelles
SELECT 
    COLUMN_NAME, 
    DATA_TYPE, 
    CHARACTER_MAXIMUM_LENGTH 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'Vehicule' 
AND COLUMN_NAME IN ('image_vehicule', 'image_carte_grise');
GO

-- Modifier la colonne image_vehicule
ALTER TABLE Vehicule
ALTER COLUMN image_vehicule NVARCHAR(MAX) NULL;
GO

-- Modifier la colonne image_carte_grise
ALTER TABLE Vehicule
ALTER COLUMN image_carte_grise NVARCHAR(MAX) NULL;
GO

-- Vérifier les modifications
SELECT 
    COLUMN_NAME, 
    DATA_TYPE, 
    CHARACTER_MAXIMUM_LENGTH 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'Vehicule' 
AND COLUMN_NAME IN ('image_vehicule', 'image_carte_grise');
GO

PRINT '✅ Colonnes d''images mises à jour avec succès!';
GO
