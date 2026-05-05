-- Fix du trigger de génération automatique du numéro de réclamation
-- Problème : Le trigger génère des numéros en double
-- Solution : Utiliser MAX() + 1 au lieu d'un compteur

USE STA_SAV_DB;
GO

-- Supprimer l'ancien trigger s'il existe
IF OBJECT_ID('TR_Reclamation_Numero', 'TR') IS NOT NULL
    DROP TRIGGER TR_Reclamation_Numero;
GO

-- Créer le nouveau trigger avec logique corrigée
CREATE TRIGGER TR_Reclamation_Numero
ON Reclamation
INSTEAD OF INSERT
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @annee INT = YEAR(GETDATE());
    DECLARE @max_numero INT;
    DECLARE @nouveau_numero NVARCHAR(20);
    
    -- Récupérer le numéro maximum pour l'année en cours
    SELECT @max_numero = ISNULL(MAX(CAST(SUBSTRING(numero, 10, 4) AS INT)), 0)
    FROM Reclamation
    WHERE numero LIKE 'REC-' + CAST(@annee AS NVARCHAR(4)) + '-%';
    
    -- Incrémenter pour obtenir le prochain numéro
    SET @max_numero = @max_numero + 1;
    
    -- Formater le numéro : REC-YYYY-NNNN
    SET @nouveau_numero = 'REC-' + CAST(@annee AS NVARCHAR(4)) + '-' + RIGHT('0000' + CAST(@max_numero AS NVARCHAR(4)), 4);
    
    -- Insérer avec le nouveau numéro
    INSERT INTO Reclamation (
        numero,
        client_id,
        agent_id,
        objet,
        description,
        statut,
        date_soumission,
        appointment_id
    )
    SELECT 
        @nouveau_numero,
        client_id,
        agent_id,
        objet,
        description,
        ISNULL(statut, 'EN_ATTENTE'),
        ISNULL(date_soumission, GETDATE()),
        appointment_id
    FROM inserted;
END;
GO

PRINT 'Trigger TR_Reclamation_Numero recréé avec succès';
GO

-- Vérifier le prochain numéro qui sera généré
DECLARE @annee INT = YEAR(GETDATE());
DECLARE @max_numero INT;

SELECT @max_numero = ISNULL(MAX(CAST(SUBSTRING(numero, 10, 4) AS INT)), 0)
FROM Reclamation
WHERE numero LIKE 'REC-' + CAST(@annee AS NVARCHAR(4)) + '-%';

PRINT 'Prochain numéro de réclamation : REC-' + CAST(@annee AS NVARCHAR(4)) + '-' + RIGHT('0000' + CAST(@max_numero + 1 AS NVARCHAR(4)), 4);
GO
