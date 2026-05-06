-- Script complet pour corriger les numéros NULL et créer le trigger

-- Étape 1: Supprimer les commandes avec numero = NULL (commandes de test)
PRINT '🧹 Nettoyage des commandes de test avec numero = NULL...';
DELETE FROM LigneCommande WHERE commande_id IN (SELECT id FROM CommandeReparation WHERE numero IS NULL);
DELETE FROM CommandeReparation WHERE numero IS NULL;
PRINT '✅ Commandes de test supprimées';
GO

-- Étape 2: Supprimer l'ancien trigger s'il existe
IF OBJECT_ID('TR_CommandeReparation_Numero', 'TR') IS NOT NULL
BEGIN
    DROP TRIGGER TR_CommandeReparation_Numero;
    PRINT '✅ Ancien trigger supprimé';
END
GO

-- Étape 3: Créer le nouveau trigger
PRINT '🔧 Création du nouveau trigger...';
GO

CREATE TRIGGER TR_CommandeReparation_Numero
ON CommandeReparation
INSTEAD OF INSERT
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Table temporaire pour stocker les données avec numéros générés
    DECLARE @temp TABLE (
        rdv_id BIGINT,
        client_id BIGINT,
        vehicule_id BIGINT,
        agence_id BIGINT,
        statut VARCHAR(20),
        montant_total DECIMAL(10,2),
        date_creation DATETIME2,
        date_validation DATETIME2,
        date_fin DATETIME2,
        numero_genere VARCHAR(50)
    );
    
    -- Générer les numéros pour toutes les lignes à insérer
    INSERT INTO @temp
    SELECT 
        rdv_id,
        client_id,
        vehicule_id,
        agence_id,
        ISNULL(statut, 'BROUILLON'),
        ISNULL(montant_total, 0),
        ISNULL(date_creation, GETDATE()),
        date_validation,
        date_fin,
        'CMD-' + CONVERT(VARCHAR(8), GETDATE(), 112) + '-' + 
        RIGHT('0000' + CAST(
            ISNULL((
                SELECT MAX(CAST(RIGHT(numero, 4) AS INT))
                FROM CommandeReparation
                WHERE numero LIKE 'CMD-' + CONVERT(VARCHAR(8), GETDATE(), 112) + '-%'
            ), 0) + ROW_NUMBER() OVER (ORDER BY (SELECT NULL))
        AS VARCHAR), 4) AS numero_genere
    FROM inserted;
    
    -- Insérer avec les numéros générés
    INSERT INTO CommandeReparation (
        numero,
        rdv_id,
        client_id,
        vehicule_id,
        agence_id,
        statut,
        montant_total,
        date_creation,
        date_validation,
        date_fin
    )
    SELECT 
        numero_genere,
        rdv_id,
        client_id,
        vehicule_id,
        agence_id,
        statut,
        montant_total,
        date_creation,
        date_validation,
        date_fin
    FROM @temp;
END;
GO

PRINT '✅ Trigger TR_CommandeReparation_Numero créé avec succès!';
PRINT '';
PRINT '📋 Format des numéros: CMD-YYYYMMDD-XXXX';
PRINT '📋 Exemple: CMD-20260506-0001';
PRINT '';
PRINT '✅ Système prêt à créer des commandes!';
GO
