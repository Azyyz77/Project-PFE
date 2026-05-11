-- =============================================
-- Correction des colonnes de Facture pour les statistiques de revenus
-- =============================================

USE STA_SAV_DB;
GO

PRINT '🔧 Correction des colonnes de Facture pour les statistiques de revenus...';
PRINT '';

-- Vérifier si la table Facture existe
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Facture')
BEGIN
    PRINT '❌ La table Facture n''existe pas!';
    PRINT '   Veuillez d''abord créer la table Facture.';
    RETURN;
END

PRINT '✓ Table Facture trouvée';
PRINT '';

-- Ajouter montant_ttc si elle n'existe pas
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Facture') AND name = 'montant_ttc')
BEGIN
    ALTER TABLE Facture ADD montant_ttc DECIMAL(18,2) NULL;
    PRINT '✓ Colonne montant_ttc ajoutée';
END
ELSE
BEGIN
    PRINT '- Colonne montant_ttc existe déjà';
END

-- Ajouter montant_ht si elle n'existe pas
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Facture') AND name = 'montant_ht')
BEGIN
    ALTER TABLE Facture ADD montant_ht DECIMAL(18,2) NULL;
    PRINT '✓ Colonne montant_ht ajoutée';
    
    -- Calculer montant_ht (montant_ttc / 1.20 pour TVA 20%)
    UPDATE Facture 
    SET montant_ht = montant_ttc / 1.20 
    WHERE montant_ht IS NULL AND montant_ttc IS NOT NULL;
    PRINT '✓ montant_ht calculé (TVA 20%)';
END
ELSE
BEGIN
    PRINT '- Colonne montant_ht existe déjà';
END

-- Ajouter montant_tva si elle n'existe pas
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Facture') AND name = 'montant_tva')
BEGIN
    ALTER TABLE Facture ADD montant_tva DECIMAL(18,2) NULL;
    PRINT '✓ Colonne montant_tva ajoutée';
    
    -- Calculer montant_tva
    UPDATE Facture 
    SET montant_tva = montant_ttc - (montant_ttc / 1.20) 
    WHERE montant_tva IS NULL AND montant_ttc IS NOT NULL;
    PRINT '✓ montant_tva calculé';
END
ELSE
BEGIN
    PRINT '- Colonne montant_tva existe déjà';
END

-- Ajouter taux_tva si elle n'existe pas
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Facture') AND name = 'taux_tva')
BEGIN
    ALTER TABLE Facture ADD taux_tva DECIMAL(5,2) NULL;
    PRINT '✓ Colonne taux_tva ajoutée';
    
    UPDATE Facture SET taux_tva = 20.00 WHERE taux_tva IS NULL;
    PRINT '✓ taux_tva initialisé à 20%';
END
ELSE
BEGIN
    PRINT '- Colonne taux_tva existe déjà';
END

-- Ajouter date_emission si elle n'existe pas
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Facture') AND name = 'date_emission')
BEGIN
    ALTER TABLE Facture ADD date_emission DATETIME2 NULL;
    PRINT '✓ Colonne date_emission ajoutée';
    
    -- Utiliser date_creation si elle existe
    IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Facture') AND name = 'date_creation')
    BEGIN
        UPDATE Facture 
        SET date_emission = date_creation 
        WHERE date_emission IS NULL AND date_creation IS NOT NULL;
        PRINT '✓ date_emission copiée depuis date_creation';
    END
    ELSE
    BEGIN
        -- Sinon utiliser la date actuelle
        UPDATE Facture SET date_emission = GETDATE() WHERE date_emission IS NULL;
        PRINT '✓ date_emission initialisée à la date actuelle';
    END
END
ELSE
BEGIN
    PRINT '- Colonne date_emission existe déjà';
END

-- Ajouter commande_id si elle n'existe pas
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Facture') AND name = 'commande_id')
BEGIN
    ALTER TABLE Facture ADD commande_id BIGINT NULL;
    PRINT '✓ Colonne commande_id ajoutée';
    
    -- Créer la contrainte de clé étrangère si CommandeReparation existe
    IF EXISTS (SELECT * FROM sys.tables WHERE name = 'CommandeReparation')
    BEGIN
        ALTER TABLE Facture 
        ADD CONSTRAINT FK_Facture_CommandeReparation 
        FOREIGN KEY (commande_id) REFERENCES CommandeReparation(id);
        PRINT '✓ Contrainte FK_Facture_CommandeReparation créée';
    END
END
ELSE
BEGIN
    PRINT '- Colonne commande_id existe déjà';
END

-- Vérifier CommandeReparation.agence_id
IF EXISTS (SELECT * FROM sys.tables WHERE name = 'CommandeReparation')
BEGIN
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('CommandeReparation') AND name = 'agence_id')
    BEGIN
        ALTER TABLE CommandeReparation ADD agence_id BIGINT NULL;
        PRINT '✓ Colonne agence_id ajoutée à CommandeReparation';
        
        -- Essayer de remplir agence_id à partir du rendez-vous
        IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('CommandeReparation') AND name = 'rendez_vous_id')
        AND EXISTS (SELECT * FROM sys.tables WHERE name = 'RendezVous')
        BEGIN
            UPDATE c 
            SET c.agence_id = r.agence_id 
            FROM CommandeReparation c 
            INNER JOIN RendezVous r ON c.rendez_vous_id = r.id 
            WHERE c.agence_id IS NULL;
            PRINT '✓ agence_id rempli à partir des rendez-vous';
        END
        
        -- Créer la contrainte de clé étrangère
        IF EXISTS (SELECT * FROM sys.tables WHERE name = 'Agence')
        AND NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_CommandeReparation_Agence')
        BEGIN
            ALTER TABLE CommandeReparation 
            ADD CONSTRAINT FK_CommandeReparation_Agence 
            FOREIGN KEY (agence_id) REFERENCES Agence(id);
            PRINT '✓ Contrainte FK_CommandeReparation_Agence créée';
        END
    END
    ELSE
    BEGIN
        PRINT '- Colonne agence_id existe déjà dans CommandeReparation';
    END
END

PRINT '';
PRINT '✅ Correction terminée!';
PRINT '';

-- Afficher la structure finale
PRINT '📋 Structure finale de Facture:';
SELECT 
    COLUMN_NAME,
    DATA_TYPE,
    CHARACTER_MAXIMUM_LENGTH,
    IS_NULLABLE,
    COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'Facture'
ORDER BY ORDINAL_POSITION;

PRINT '';
PRINT '📊 Statistiques:';
SELECT 
    COUNT(*) AS total_factures,
    SUM(CASE WHEN montant_ttc IS NOT NULL THEN 1 ELSE 0 END) AS factures_avec_montant,
    SUM(CASE WHEN commande_id IS NOT NULL THEN 1 ELSE 0 END) AS factures_avec_commande,
    SUM(CASE WHEN date_emission IS NOT NULL THEN 1 ELSE 0 END) AS factures_avec_date
FROM Facture;

GO
