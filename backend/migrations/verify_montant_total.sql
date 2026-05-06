-- Vérification des montants totaux

PRINT '🔍 Vérification des montants totaux...';
PRINT '';

-- Vérifier les commandes
SELECT 
    c.id,
    c.numero,
    c.statut,
    COUNT(l.id) AS nb_lignes,
    ISNULL(SUM(l.prix_total), 0) AS total_calcule,
    c.montant_total AS montant_actuel,
    CASE 
        WHEN ISNULL(SUM(l.prix_total), 0) = c.montant_total THEN '✅ OK'
        ELSE '❌ ERREUR'
    END AS statut_verification
FROM CommandeReparation c
LEFT JOIN LigneCommande l ON l.commande_id = c.id
GROUP BY c.id, c.numero, c.statut, c.montant_total, c.date_creation
ORDER BY c.date_creation DESC;

PRINT '';
PRINT '📋 Détails des lignes par commande:';
PRINT '';

-- Détails de chaque commande
SELECT 
    c.numero AS Commande,
    l.id AS Ligne_ID,
    l.type AS Type,
    l.quantite AS Qte,
    l.prix_unitaire AS Prix_Unit,
    l.prix_total AS Prix_Total
FROM CommandeReparation c
LEFT JOIN LigneCommande l ON l.commande_id = c.id
ORDER BY c.date_creation DESC, l.id;

PRINT '';
PRINT '✅ Vérification terminée!';
