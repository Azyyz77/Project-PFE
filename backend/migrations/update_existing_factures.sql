-- ================================================================
-- Script: Mettre à Jour les Factures Existantes
-- Description: Marque les factures comme payées pour afficher des données dans les graphiques
-- Date: 11 mai 2026
-- ================================================================

USE STA_SAV_DB;
GO

PRINT '💰 Mise à jour des factures existantes...';
PRINT '';

-- Mettre à jour les factures existantes pour les marquer comme payées
UPDATE Facture
SET 
    statut = 'PAYEE',
    mode_paiement = CASE 
        WHEN id % 3 = 0 THEN 'ESPECES'
        WHEN id % 3 = 1 THEN 'CARTE_BANCAIRE'
        ELSE 'VIREMENT'
    END,
    date_paiement = DATEADD(DAY, 3, date_emission)
WHERE statut IN ('EMISE', 'ENVOYEE', 'BROUILLON');

DECLARE @updated INT = @@ROWCOUNT;
PRINT '✅ ' + CAST(@updated AS VARCHAR) + ' factures mises à jour';
PRINT '';

-- Vérifier les résultats
PRINT '📊 Résumé des factures:';
SELECT 
    statut,
    COUNT(*) AS nombre,
    SUM(montant_ttc) AS montant_total_TND
FROM Facture
GROUP BY statut
ORDER BY statut;

PRINT '';
PRINT '✅ Mise à jour terminée!';
PRINT '';
PRINT '📝 Prochaines étapes:';
PRINT '   1. Redémarrer le backend';
PRINT '   2. Rafraîchir la page Facturation';
PRINT '   3. Les graphiques de revenus devraient afficher des données';

GO
