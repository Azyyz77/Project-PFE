-- Migration: Ajouter les colonnes de montants à CommandeReparation
-- Date: 7 Mai 2026
-- Description: Ajouter montant_total_ht, montant_tva, montant_total_ttc, taux_tva

USE CheryServiceDB;
GO

-- Vérifier et ajouter montant_total_ht
IF NOT EXISTS (
    SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_NAME = 'CommandeReparation' AND COLUMN_NAME = 'montant_total_ht'
)
BEGIN
    ALTER TABLE CommandeReparation
    ADD montant_total_ht DECIMAL(10, 2) DEFAULT 0.00;
    PRINT '✅ Colonne montant_total_ht ajoutée';
END
ELSE
BEGIN
    PRINT 'ℹ️  Colonne montant_total_ht existe déjà';
END
GO

-- Vérifier et ajouter montant_tva
IF NOT EXISTS (
    SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_NAME = 'CommandeReparation' AND COLUMN_NAME = 'montant_tva'
)
BEGIN
    ALTER TABLE CommandeReparation
    ADD montant_tva DECIMAL(10, 2) DEFAULT 0.00;
    PRINT '✅ Colonne montant_tva ajoutée';
END
ELSE
BEGIN
    PRINT 'ℹ️  Colonne montant_tva existe déjà';
END
GO

-- Vérifier et ajouter montant_total_ttc
IF NOT EXISTS (
    SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_NAME = 'CommandeReparation' AND COLUMN_NAME = 'montant_total_ttc'
)
BEGIN
    ALTER TABLE CommandeReparation
    ADD montant_total_ttc DECIMAL(10, 2) DEFAULT 0.00;
    PRINT '✅ Colonne montant_total_ttc ajoutée';
END
ELSE
BEGIN
    PRINT 'ℹ️  Colonne montant_total_ttc existe déjà';
END
GO

-- Vérifier et ajouter taux_tva
IF NOT EXISTS (
    SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_NAME = 'CommandeReparation' AND COLUMN_NAME = 'taux_tva'
)
BEGIN
    ALTER TABLE CommandeReparation
    ADD taux_tva DECIMAL(5, 2) DEFAULT 19.00;
    PRINT '✅ Colonne taux_tva ajoutée';
END
ELSE
BEGIN
    PRINT 'ℹ️  Colonne taux_tva existe déjà';
END
GO

-- Vérifier et ajouter date_modification
IF NOT EXISTS (
    SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_NAME = 'CommandeReparation' AND COLUMN_NAME = 'date_modification'
)
BEGIN
    ALTER TABLE CommandeReparation
    ADD date_modification DATETIME NULL;
    PRINT '✅ Colonne date_modification ajoutée';
END
ELSE
BEGIN
    PRINT 'ℹ️  Colonne date_modification existe déjà';
END
GO

-- Vérifier et ajouter agent_id
IF NOT EXISTS (
    SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_NAME = 'CommandeReparation' AND COLUMN_NAME = 'agent_id'
)
BEGIN
    ALTER TABLE CommandeReparation
    ADD agent_id BIGINT NULL;
    PRINT '✅ Colonne agent_id ajoutée';
    
    -- Ajouter la contrainte de clé étrangère
    ALTER TABLE CommandeReparation
    ADD CONSTRAINT FK_CommandeReparation_Agent
    FOREIGN KEY (agent_id) REFERENCES Utilisateur(id);
    PRINT '✅ Contrainte FK_CommandeReparation_Agent ajoutée';
END
ELSE
BEGIN
    PRINT 'ℹ️  Colonne agent_id existe déjà';
END
GO

-- Mettre à jour les montants existants basés sur montant_total
UPDATE CommandeReparation
SET 
    montant_total_ht = ROUND(montant_total / 1.19, 2),
    montant_tva = ROUND(montant_total - (montant_total / 1.19), 2),
    montant_total_ttc = montant_total,
    taux_tva = 19.00
WHERE montant_total_ttc = 0 OR montant_total_ttc IS NULL;
GO

PRINT '✅ Migration terminée: Colonnes de montants ajoutées à CommandeReparation';
GO
