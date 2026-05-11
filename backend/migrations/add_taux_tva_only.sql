-- =============================================
-- Ajouter UNIQUEMENT la colonne taux_tva
-- =============================================

USE STA_SAV_DB;
GO

PRINT '🔧 Ajout de la colonne taux_tva...';
PRINT '';

-- Ajouter taux_tva si elle n'existe pas
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Facture') AND name = 'taux_tva')
BEGIN
    ALTER TABLE Facture ADD taux_tva DECIMAL(5,2) NULL;
    PRINT '✅ Colonne taux_tva ajoutée';
END
ELSE
BEGIN
    PRINT '✅ Colonne taux_tva existe déjà';
END

-- Initialiser à 20% pour toutes les factures qui n'ont pas de taux
UPDATE Facture SET taux_tva = 20.00 WHERE taux_tva IS NULL;
PRINT '✅ taux_tva initialisé à 20% pour les factures existantes';

PRINT '';
PRINT '✅✅✅ TERMINÉ! ✅✅✅';
PRINT '';
PRINT 'Prochaines étapes:';
PRINT '1. Redémarrer le backend: cd backend && npm start';
PRINT '2. Tester: http://localhost:3000/dashboard/direction/statistics';
PRINT '';

GO
