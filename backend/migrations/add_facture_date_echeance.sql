-- Ajouter la colonne date_echeance à la table Facture si elle n'existe pas

-- Vérifier si la colonne existe
IF NOT EXISTS (
    SELECT 1 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_NAME = 'Facture' 
    AND COLUMN_NAME = 'date_echeance'
)
BEGIN
    PRINT 'Ajout de la colonne date_echeance à la table Facture...';
    
    ALTER TABLE Facture
    ADD date_echeance DATETIME2 NULL;
    
    PRINT '✅ Colonne date_echeance ajoutée avec succès';
END
ELSE
BEGIN
    PRINT 'ℹ️ La colonne date_echeance existe déjà';
END
GO

-- Vérifier la structure finale
SELECT 
    COLUMN_NAME,
    DATA_TYPE,
    IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'Facture'
ORDER BY ORDINAL_POSITION;
