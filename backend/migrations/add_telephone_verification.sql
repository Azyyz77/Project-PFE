-- Migration: Ajouter la vérification du téléphone et images véhicule
-- Date: 2024-01-15

-- Ajouter la colonne telephone_verifie si elle n'existe pas
IF NOT EXISTS (
    SELECT * FROM sys.columns 
    WHERE object_id = OBJECT_ID('Utilisateur') 
    AND name = 'telephone_verifie'
)
BEGIN
    ALTER TABLE Utilisateur
    ADD telephone_verifie BIT NOT NULL DEFAULT 0;
    
    PRINT 'Colonne telephone_verifie ajoutée avec succès';
END
ELSE
BEGIN
    PRINT 'La colonne telephone_verifie existe déjà';
END

-- Ajouter les colonnes d'images dans Vehicule
IF NOT EXISTS (
    SELECT * FROM sys.columns 
    WHERE object_id = OBJECT_ID('Vehicule') 
    AND name = 'image_vehicule'
)
BEGIN
    ALTER TABLE Vehicule
    ADD image_vehicule NVARCHAR(500) NULL;
    
    PRINT 'Colonne image_vehicule ajoutée avec succès';
END
ELSE
BEGIN
    PRINT 'La colonne image_vehicule existe déjà';
END

IF NOT EXISTS (
    SELECT * FROM sys.columns 
    WHERE object_id = OBJECT_ID('Vehicule') 
    AND name = 'image_carte_grise'
)
BEGIN
    ALTER TABLE Vehicule
    ADD image_carte_grise NVARCHAR(500) NULL;
    
    PRINT 'Colonne image_carte_grise ajoutée avec succès';
END
ELSE
BEGIN
    PRINT 'La colonne image_carte_grise existe déjà';
END
