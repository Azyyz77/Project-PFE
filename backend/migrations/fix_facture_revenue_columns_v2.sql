-- =============================================
-- Correction SIMPLIFIÉE des colonnes de Facture
-- Basée sur la structure réelle de votre table
-- =============================================

USE STA_SAV_DB;
GO

PRINT '🔧 Ajout des colonnes manquantes pour les statistiques de revenus...';
PRINT '';

-- Vérifier si la table Facture existe
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Facture')
BEGIN
    PRINT '❌ La table Facture n''existe pas!';
    RETURN;
END

PRINT '✓ Table Facture trouvée';
PRINT '';

-- Afficher les colonnes existantes
PRINT '📊 Colonnes actuelles:';
SELECT COLUMN_NAME 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'Facture'
ORDER BY ORDINAL_POSITION;
PRINT '';

-- Ajouter taux_tva si elle n'existe pas
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Facture') AND name = 'taux_tva')
BEGIN
    ALTER TABLE Facture ADD taux_tva DECIMAL(5,2) NULL DEFAULT 20.00;
    PRINT '✓ Colonne taux_tva ajoutée (défaut: 20%)';
END
ELSE
BEGIN
    PRINT '- Colonne taux_tva existe déjà';
END

-- Ajouter date_echeance si elle n'existe pas
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Facture') AND name = 'date_echeance')
BEGIN
    ALTER TABLE Facture ADD date_echeance DATE NULL;
    PRINT '✓ Colonne date_echeance ajoutée';
END
ELSE
BEGIN
    PRINT '- Colonne date_echeance existe déjà';
END

-- Vérifier CommandeReparation.agence_id
IF EXISTS (SELECT * FROM sys.tables WHERE name = 'CommandeReparation')
BEGIN
    PRINT '';
    PRINT '📋 Vérification de CommandeReparation...';
    
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('CommandeReparation') AND name = 'agence_id')
    BEGIN
        ALTER TABLE CommandeReparation ADD agence_id BIGINT NULL;
        PRINT '✓ Colonne agence_id ajoutée à CommandeReparation';
        
        -- Essayer de remplir agence_id à partir du rendez-vous
        IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('CommandeReparation') AND name = 'rendez_vous_id')
        AND EXISTS (SELECT * FROM sys.tables WHERE name = 'RendezVous')
        AND EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('RendezVous') AND name = 'agence_id')
        BEGIN
            UPDATE c 
            SET c.agence_id = r.agence_id 
            FROM CommandeReparation c 
            INNER JOIN RendezVous r ON c.rendez_vous_id = r.id 
            WHERE c.agence_id IS NULL AND r.agence_id IS NOT NULL;
            
            DECLARE @updated INT = @@ROWCOUNT;
            PRINT '✓ agence_id rempli pour ' + CAST(@updated AS NVARCHAR) + ' commande(s)';
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

-- Afficher un résumé
PRINT '📋 Résumé de la structure Facture:';
SELECT 
    COLUMN_NAME,
    DATA_TYPE,
    IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'Facture'
    AND COLUMN_NAME IN ('id', 'numero', 'commande_id', 'montant_ht', 'montant_tva', 'montant_ttc', 'taux_tva', 'statut', 'date_emission', 'date_echeance')
ORDER BY ORDINAL_POSITION;

PRINT '';
PRINT '📊 Données actuelles:';
SELECT 
    COUNT(*) AS total_factures,
    SUM(CASE WHEN montant_ttc IS NOT NULL THEN 1 ELSE 0 END) AS avec_montant_ttc,
    SUM(CASE WHEN commande_id IS NOT NULL THEN 1 ELSE 0 END) AS avec_commande,
    SUM(CASE WHEN date_emission IS NOT NULL THEN 1 ELSE 0 END) AS avec_date_emission
FROM Facture;

GO
