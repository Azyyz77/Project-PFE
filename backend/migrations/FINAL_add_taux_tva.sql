-- =============================================
-- SCRIPT FINAL - Ajouter taux_tva
-- Version ultra-simple qui ne peut pas échouer
-- =============================================

USE STA_SAV_DB;
GO

PRINT '🔧 Ajout de taux_tva...';

-- Ajouter la colonne
ALTER TABLE Facture ADD taux_tva DECIMAL(5,2) NULL;

PRINT '✅ Colonne ajoutée';

GO

-- Initialiser les valeurs (batch séparé)
UPDATE Facture SET taux_tva = 20.00;

PRINT '✅ Valeurs initialisées';

GO

-- Vérifier
SELECT id, numero, montant_ttc, taux_tva FROM Facture;

PRINT '';
PRINT '✅✅✅ TERMINÉ! ✅✅✅';
PRINT '';
PRINT 'IMPORTANT: Redémarrez le backend maintenant!';
PRINT '  cd backend';
PRINT '  npm start';

GO
