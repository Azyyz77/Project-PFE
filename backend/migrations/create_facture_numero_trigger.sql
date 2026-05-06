-- =============================================
-- Trigger pour générer automatiquement le numéro de facture
-- Format: FACT-YYYYMMDD-XXXX
-- =============================================

-- 1. Supprimer le trigger s'il existe déjà
IF EXISTS (SELECT * FROM sys.triggers WHERE name = 'TR_Facture_GenerateNumero')
BEGIN
    DROP TRIGGER TR_Facture_GenerateNumero;
    PRINT '✓ Ancien trigger supprimé';
END
GO

-- 2. Créer le trigger INSTEAD OF INSERT
CREATE TRIGGER TR_Facture_GenerateNumero
ON Facture
INSTEAD OF INSERT
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @Today VARCHAR(8) = CONVERT(VARCHAR(8), GETDATE(), 112); -- Format: YYYYMMDD
    DECLARE @Prefix VARCHAR(20) = 'FACT-' + @Today + '-';
    
    -- Récupérer le dernier numéro du jour
    DECLARE @LastNumber INT;
    SELECT @LastNumber = ISNULL(MAX(CAST(RIGHT(numero, 4) AS INT)), 0)
    FROM Facture
    WHERE numero LIKE @Prefix + '%';
    
    -- Insérer les nouvelles factures avec numéro généré
    INSERT INTO Facture (
        numero,
        commande_id,
        montant_ttc,
        statut,
        date_emission
    )
    SELECT 
        @Prefix + RIGHT('0000' + CAST(@LastNumber + ROW_NUMBER() OVER (ORDER BY (SELECT NULL)) AS VARCHAR(4)), 4) AS numero,
        commande_id,
        montant_ttc,
        statut,
        ISNULL(date_emission, GETDATE())
    FROM inserted;
END
GO

PRINT '✓ Trigger TR_Facture_GenerateNumero créé avec succès!';
PRINT '';
PRINT 'Le numéro de facture sera généré automatiquement au format: FACT-YYYYMMDD-XXXX';
PRINT 'Exemple: FACT-20260506-0001';
GO

-- 3. Vérifier si la colonne numero existe et a une contrainte UNIQUE
IF EXISTS (
    SELECT 1 
    FROM sys.columns 
    WHERE object_id = OBJECT_ID('Facture') 
    AND name = 'numero'
)
BEGIN
    PRINT '✓ Colonne numero existe';
    
    -- Vérifier la contrainte UNIQUE
    IF EXISTS (
        SELECT 1
        FROM sys.indexes i
        JOIN sys.index_columns ic ON i.object_id = ic.object_id AND i.index_id = ic.index_id
        JOIN sys.columns c ON ic.object_id = c.object_id AND ic.column_id = c.column_id
        WHERE i.object_id = OBJECT_ID('Facture')
        AND c.name = 'numero'
        AND i.is_unique = 1
    )
    BEGIN
        PRINT '✓ Contrainte UNIQUE existe sur la colonne numero';
    END
    ELSE
    BEGIN
        PRINT '⚠ ATTENTION: Aucune contrainte UNIQUE sur la colonne numero';
        PRINT '  Exécutez: ALTER TABLE Facture ADD CONSTRAINT UQ_Facture_Numero UNIQUE (numero);';
    END
END
ELSE
BEGIN
    PRINT '❌ ERREUR: La colonne numero n''existe pas dans la table Facture';
    PRINT '  Exécutez: ALTER TABLE Facture ADD numero VARCHAR(50);';
END
GO

-- 4. Mettre à jour les factures existantes qui ont numero = NULL
DECLARE @Count INT;
SELECT @Count = COUNT(*) FROM Facture WHERE numero IS NULL;

IF @Count > 0
BEGIN
    PRINT '';
    PRINT '⚠ ' + CAST(@Count AS VARCHAR) + ' facture(s) avec numero = NULL détectée(s)';
    PRINT 'Mise à jour en cours...';
    
    DECLARE @Counter INT = 1;
    DECLARE @Today VARCHAR(8) = CONVERT(VARCHAR(8), GETDATE(), 112);
    DECLARE @Prefix VARCHAR(20) = 'FACT-' + @Today + '-';
    
    -- Récupérer le dernier numéro existant
    DECLARE @LastNum INT;
    SELECT @LastNum = ISNULL(MAX(CAST(RIGHT(numero, 4) AS INT)), 0)
    FROM Facture
    WHERE numero IS NOT NULL AND numero LIKE 'FACT-%';
    
    -- Mettre à jour chaque facture NULL
    DECLARE @FactureId BIGINT;
    DECLARE facture_cursor CURSOR FOR
        SELECT id FROM Facture WHERE numero IS NULL ORDER BY id;
    
    OPEN facture_cursor;
    FETCH NEXT FROM facture_cursor INTO @FactureId;
    
    WHILE @@FETCH_STATUS = 0
    BEGIN
        DECLARE @NewNumero VARCHAR(50) = @Prefix + RIGHT('0000' + CAST(@LastNum + @Counter AS VARCHAR(4)), 4);
        
        UPDATE Facture 
        SET numero = @NewNumero
        WHERE id = @FactureId;
        
        SET @Counter = @Counter + 1;
        FETCH NEXT FROM facture_cursor INTO @FactureId;
    END
    
    CLOSE facture_cursor;
    DEALLOCATE facture_cursor;
    
    PRINT '✓ ' + CAST(@Counter - 1 AS VARCHAR) + ' facture(s) mise(s) à jour';
END
ELSE
BEGIN
    PRINT '';
    PRINT '✓ Aucune facture avec numero = NULL';
END
GO

-- 5. Vérification finale
PRINT '';
PRINT '=== VÉRIFICATION FINALE ===';
SELECT 
    COUNT(*) AS total_factures,
    COUNT(numero) AS factures_avec_numero,
    COUNT(*) - COUNT(numero) AS factures_sans_numero
FROM Facture;
GO
