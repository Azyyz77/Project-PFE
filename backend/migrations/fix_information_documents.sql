-- ============================================================================
-- FIX: Insertion des documents d'exemple
-- Ce script corrige l'erreur d'insertion des documents
-- ============================================================================

-- Vérifier si les documents existent déjà
IF NOT EXISTS (SELECT 1 FROM DocumentTelecharge)
BEGIN
    PRINT 'Insertion des documents d''exemple...';
    
    -- Récupérer les IDs des sections
    DECLARE @garantieId INT = (SELECT id FROM SectionInformation WHERE slug = 'garantie');
    DECLARE @assuranceId INT = (SELECT id FROM SectionInformation WHERE slug = 'assurance');
    DECLARE @documentsId INT = (SELECT id FROM SectionInformation WHERE slug = 'documents-requis');

    -- Insérer les documents
    INSERT INTO DocumentTelecharge (section_id, titre, description, nom_fichier, chemin_fichier, type_fichier, taille_octets, actif) VALUES
    (@garantieId, 'Certificat de Garantie', 'Modèle de certificat de garantie Chery', 'certificat_garantie_chery.pdf', '/documents/garantie/certificat_garantie_chery.pdf', 'application/pdf', 524288, 1),
    (@garantieId, 'Conditions Générales de Garantie', 'Document complet des conditions de garantie', 'conditions_garantie.pdf', '/documents/garantie/conditions_garantie.pdf', 'application/pdf', 1048576, 1),
    (@assuranceId, 'Formulaire Déclaration Sinistre', 'Formulaire à remplir en cas de sinistre', 'declaration_sinistre.pdf', '/documents/assurance/declaration_sinistre.pdf', 'application/pdf', 262144, 1),
    (@documentsId, 'Liste Documents Requis', 'Liste complète des documents nécessaires', 'liste_documents.pdf', '/documents/liste_documents.pdf', 'application/pdf', 131072, 1);

    PRINT 'Documents d''exemple insérés avec succès';
    PRINT CAST(@@ROWCOUNT AS VARCHAR) + ' documents insérés';
END
ELSE
BEGIN
    PRINT 'Les documents existent déjà';
    PRINT 'Nombre de documents: ' + CAST((SELECT COUNT(*) FROM DocumentTelecharge) AS VARCHAR);
END
GO

-- Vérifier le résultat
SELECT 
    d.id,
    d.titre,
    s.titre as section,
    d.nom_fichier,
    d.actif
FROM DocumentTelecharge d
LEFT JOIN SectionInformation s ON d.section_id = s.id
ORDER BY s.ordre, d.titre;
GO

PRINT '============================================================================';
PRINT 'Vérification terminée';
PRINT '============================================================================';
