-- =============================================
-- Ajouter la colonne taux_tva (VERSION ULTRA-SIMPLE)
-- =============================================

USE STA_SAV_DB;
GO

PRINT '🔧 Ajout de la colonne taux_tva...';

-- Ajouter la colonne avec une valeur par défaut
ALTER TABLE Facture ADD taux_tva DECIMAL(5,2) NULL;

PRINT '✅ Colonne taux_tva ajoutée';
PRINT '';
PRINT '✅✅✅ TERMINÉ! ✅✅✅';
PRINT '';
PRINT 'Prochaines étapes:';
PRINT '1. Redémarrer le backend: cd backend && npm start';
PRINT '2. Tester: http://localhost:3000/dashboard/direction/statistics';

GO

-- Maintenant initialiser les valeurs (dans un batch séparé)
UPDATE Facture SET taux_tva = 20.00 WHERE taux_tva IS NULL;
PRINT '✅ taux_tva initialisé à 20%';

GO
