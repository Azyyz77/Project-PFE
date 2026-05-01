-- ============================================================================
-- NETTOYAGE DES CONTENUS DUPLIQUÉS
-- Ce script supprime les doublons dans la table ContenuInformation
-- ============================================================================

PRINT 'Début du nettoyage des doublons...';
PRINT '';

-- Afficher le nombre de contenus avant nettoyage
DECLARE @countBefore INT;
SELECT @countBefore = COUNT(*) FROM ContenuInformation;
PRINT 'Nombre de contenus avant nettoyage: ' + CAST(@countBefore AS VARCHAR);
PRINT '';

-- Afficher les doublons
PRINT 'Doublons détectés:';
SELECT 
    section_id,
    titre,
    COUNT(*) as nombre_doublons
FROM ContenuInformation
GROUP BY section_id, titre
HAVING COUNT(*) > 1;
PRINT '';

-- Supprimer les doublons (garder l'ID le plus bas)
DELETE FROM ContenuInformation
WHERE id NOT IN (
    SELECT MIN(id)
    FROM ContenuInformation
    GROUP BY section_id, titre, contenu, ordre
);

-- Afficher le nombre de contenus après nettoyage
DECLARE @countAfter INT;
SELECT @countAfter = COUNT(*) FROM ContenuInformation;
PRINT 'Nombre de contenus après nettoyage: ' + CAST(@countAfter AS VARCHAR);
PRINT 'Contenus supprimés: ' + CAST(@countBefore - @countAfter AS VARCHAR);
PRINT '';

-- Afficher les contenus restants
PRINT 'Contenus restants:';
SELECT 
    c.id,
    s.titre as section,
    c.titre,
    c.ordre,
    c.actif
FROM ContenuInformation c
INNER JOIN SectionInformation s ON c.section_id = s.id
ORDER BY s.ordre, c.ordre;
PRINT '';

PRINT '============================================================================';
PRINT 'Nettoyage terminé avec succès!';
PRINT '============================================================================';
