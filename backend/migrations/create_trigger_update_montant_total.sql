-- Trigger pour mettre à jour automatiquement le montant_total de la commande
-- quand on ajoute, modifie ou supprime une ligne

-- Supprimer les triggers existants s'ils existent
IF OBJECT_ID('TR_LigneCommande_UpdateMontant_Insert', 'TR') IS NOT NULL
    DROP TRIGGER TR_LigneCommande_UpdateMontant_Insert;
GO

IF OBJECT_ID('TR_LigneCommande_UpdateMontant_Update', 'TR') IS NOT NULL
    DROP TRIGGER TR_LigneCommande_UpdateMontant_Update;
GO

IF OBJECT_ID('TR_LigneCommande_UpdateMontant_Delete', 'TR') IS NOT NULL
    DROP TRIGGER TR_LigneCommande_UpdateMontant_Delete;
GO

-- Trigger AFTER INSERT sur LigneCommande
CREATE TRIGGER TR_LigneCommande_UpdateMontant_Insert
ON LigneCommande
AFTER INSERT
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Mettre à jour le montant_total pour chaque commande affectée
    UPDATE CommandeReparation
    SET montant_total = (
        SELECT ISNULL(SUM(prix_total), 0)
        FROM LigneCommande
        WHERE commande_id = CommandeReparation.id
    )
    WHERE id IN (SELECT DISTINCT commande_id FROM inserted);
END;
GO

-- Trigger AFTER UPDATE sur LigneCommande
CREATE TRIGGER TR_LigneCommande_UpdateMontant_Update
ON LigneCommande
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Mettre à jour le montant_total pour chaque commande affectée
    UPDATE CommandeReparation
    SET montant_total = (
        SELECT ISNULL(SUM(prix_total), 0)
        FROM LigneCommande
        WHERE commande_id = CommandeReparation.id
    )
    WHERE id IN (
        SELECT DISTINCT commande_id FROM inserted
        UNION
        SELECT DISTINCT commande_id FROM deleted
    );
END;
GO

-- Trigger AFTER DELETE sur LigneCommande
CREATE TRIGGER TR_LigneCommande_UpdateMontant_Delete
ON LigneCommande
AFTER DELETE
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Mettre à jour le montant_total pour chaque commande affectée
    UPDATE CommandeReparation
    SET montant_total = (
        SELECT ISNULL(SUM(prix_total), 0)
        FROM LigneCommande
        WHERE commande_id = CommandeReparation.id
    )
    WHERE id IN (SELECT DISTINCT commande_id FROM deleted);
END;
GO

PRINT '✅ Triggers créés avec succès!';
PRINT '';
PRINT '📊 Les triggers suivants ont été créés:';
PRINT '  - TR_LigneCommande_UpdateMontant_Insert';
PRINT '  - TR_LigneCommande_UpdateMontant_Update';
PRINT '  - TR_LigneCommande_UpdateMontant_Delete';
PRINT '';
PRINT '💡 Le montant_total sera maintenant calculé automatiquement!';
GO

-- Recalculer les montants pour les commandes existantes
PRINT '';
PRINT '🔄 Recalcul des montants pour les commandes existantes...';
GO

UPDATE CommandeReparation
SET montant_total = (
    SELECT ISNULL(SUM(prix_total), 0)
    FROM LigneCommande
    WHERE commande_id = CommandeReparation.id
);
GO

PRINT '✅ Montants recalculés!';
PRINT '';
PRINT '📋 Vérification:';
GO

SELECT 
    c.id,
    c.numero,
    COUNT(l.id) AS nb_lignes,
    ISNULL(SUM(l.prix_total), 0) AS total_calcule,
    c.montant_total AS montant_actuel,
    CASE 
        WHEN ISNULL(SUM(l.prix_total), 0) = c.montant_total THEN '✅ OK'
        ELSE '❌ ERREUR'
    END AS statut
FROM CommandeReparation c
LEFT JOIN LigneCommande l ON l.commande_id = c.id
GROUP BY c.id, c.numero, c.montant_total, c.date_creation
ORDER BY c.date_creation DESC;
GO
