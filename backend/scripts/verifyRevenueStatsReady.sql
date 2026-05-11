-- =============================================
-- Vérifier que tout est prêt pour les statistiques de revenus
-- =============================================

USE STA_SAV_DB;
GO

PRINT '🔍 Vérification de la configuration pour les statistiques de revenus';
PRINT '====================================================================';
PRINT '';

-- 1. Vérifier les colonnes de Facture
PRINT '1️⃣ Colonnes de la table Facture:';
PRINT '';

DECLARE @colonnesFacture TABLE (colonne NVARCHAR(100), existe BIT);

INSERT INTO @colonnesFacture VALUES ('id', 0);
INSERT INTO @colonnesFacture VALUES ('numero', 0);
INSERT INTO @colonnesFacture VALUES ('commande_id', 0);
INSERT INTO @colonnesFacture VALUES ('montant_ht', 0);
INSERT INTO @colonnesFacture VALUES ('montant_tva', 0);
INSERT INTO @colonnesFacture VALUES ('montant_ttc', 0);
INSERT INTO @colonnesFacture VALUES ('taux_tva', 0);
INSERT INTO @colonnesFacture VALUES ('statut', 0);
INSERT INTO @colonnesFacture VALUES ('date_emission', 0);

UPDATE @colonnesFacture
SET existe = 1
WHERE colonne IN (
    SELECT COLUMN_NAME 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_NAME = 'Facture'
);

SELECT 
    colonne AS [Colonne],
    CASE WHEN existe = 1 THEN '✅ OUI' ELSE '❌ NON' END AS [Existe]
FROM @colonnesFacture
ORDER BY colonne;

DECLARE @colonnesManquantesFacture INT;
SELECT @colonnesManquantesFacture = COUNT(*) FROM @colonnesFacture WHERE existe = 0;

IF @colonnesManquantesFacture > 0
BEGIN
    PRINT '';
    PRINT '⚠️  ' + CAST(@colonnesManquantesFacture AS NVARCHAR) + ' colonne(s) manquante(s) dans Facture!';
    PRINT '   Exécutez: backend/migrations/fix_facture_revenue_columns_v2.sql';
END
ELSE
BEGIN
    PRINT '';
    PRINT '✅ Toutes les colonnes nécessaires sont présentes dans Facture';
END

PRINT '';
PRINT '--------------------------------------------------------------------';
PRINT '';

-- 2. Vérifier CommandeReparation.agence_id
PRINT '2️⃣ Colonne agence_id dans CommandeReparation:';
PRINT '';

IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('CommandeReparation') AND name = 'agence_id')
BEGIN
    PRINT '✅ Colonne agence_id existe';
    
    -- Vérifier combien de commandes ont un agence_id
    DECLARE @commandesAvecAgence INT;
    DECLARE @commandesTotales INT;
    
    SELECT @commandesAvecAgence = COUNT(*) FROM CommandeReparation WHERE agence_id IS NOT NULL;
    SELECT @commandesTotales = COUNT(*) FROM CommandeReparation;
    
    PRINT '   - Commandes avec agence_id: ' + CAST(@commandesAvecAgence AS NVARCHAR) + ' / ' + CAST(@commandesTotales AS NVARCHAR);
    
    IF @commandesAvecAgence = 0 AND @commandesTotales > 0
    BEGIN
        PRINT '   ⚠️  Aucune commande n''a d''agence_id!';
        PRINT '   Les statistiques par agence ne fonctionneront pas.';
    END
END
ELSE
BEGIN
    PRINT '❌ Colonne agence_id manquante';
    PRINT '   Exécutez: backend/migrations/fix_facture_revenue_columns_v2.sql';
END

PRINT '';
PRINT '--------------------------------------------------------------------';
PRINT '';

-- 3. Vérifier les données
PRINT '3️⃣ Données disponibles:';
PRINT '';

SELECT 
    COUNT(*) AS [Total Factures],
    SUM(CASE WHEN montant_ttc IS NOT NULL THEN 1 ELSE 0 END) AS [Avec Montant TTC],
    SUM(CASE WHEN commande_id IS NOT NULL THEN 1 ELSE 0 END) AS [Avec Commande],
    SUM(CASE WHEN date_emission IS NOT NULL THEN 1 ELSE 0 END) AS [Avec Date Émission],
    SUM(ISNULL(montant_ttc, 0)) AS [Revenu Total (€)]
FROM Facture;

PRINT '';

SELECT 
    COUNT(*) AS [Total Commandes],
    SUM(CASE WHEN agence_id IS NOT NULL THEN 1 ELSE 0 END) AS [Avec Agence]
FROM CommandeReparation;

PRINT '';
PRINT '--------------------------------------------------------------------';
PRINT '';

-- 4. Résultat final
PRINT '4️⃣ Résultat de la vérification:';
PRINT '';

IF @colonnesManquantesFacture = 0 
   AND EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('CommandeReparation') AND name = 'agence_id')
BEGIN
    PRINT '✅✅✅ TOUT EST PRÊT! ✅✅✅';
    PRINT '';
    PRINT 'Vous pouvez maintenant:';
    PRINT '1. Redémarrer le backend';
    PRINT '2. Accéder aux statistiques de revenus';
    PRINT '3. Les données seront affichées correctement';
END
ELSE
BEGIN
    PRINT '❌ Configuration incomplète';
    PRINT '';
    PRINT 'Action requise:';
    PRINT '1. Exécutez: backend/migrations/fix_facture_revenue_columns_v2.sql';
    PRINT '2. Relancez ce script de vérification';
END

PRINT '';
PRINT '====================================================================';

GO
