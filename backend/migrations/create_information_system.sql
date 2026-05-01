-- ============================================================================
-- SYSTÈME D'INFORMATION ET DOCUMENTS
-- Création des tables pour gérer les informations (garantie, assurance, etc.)
-- et les documents téléchargeables
-- ============================================================================

-- Table pour les sections d'information (Garantie, Assurance, etc.)
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'SectionInformation')
BEGIN
    CREATE TABLE SectionInformation (
        id INT IDENTITY(1,1) PRIMARY KEY,
        titre NVARCHAR(200) NOT NULL,
        slug NVARCHAR(200) NOT NULL UNIQUE, -- URL-friendly identifier
        icone NVARCHAR(50), -- Nom de l'icône Lucide React
        ordre INT NOT NULL DEFAULT 0, -- Ordre d'affichage
        actif BIT NOT NULL DEFAULT 1,
        date_creation DATETIME NOT NULL DEFAULT GETDATE(),
        date_modification DATETIME
    );
    PRINT 'Table SectionInformation créée avec succès';
END
ELSE
BEGIN
    PRINT 'Table SectionInformation existe déjà';
END
GO

-- Table pour le contenu des sections
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'ContenuInformation')
BEGIN
    CREATE TABLE ContenuInformation (
        id INT IDENTITY(1,1) PRIMARY KEY,
        section_id INT NOT NULL,
        titre NVARCHAR(300) NOT NULL,
        contenu NVARCHAR(MAX) NOT NULL, -- Contenu en HTML ou Markdown
        ordre INT NOT NULL DEFAULT 0,
        actif BIT NOT NULL DEFAULT 1,
        date_creation DATETIME NOT NULL DEFAULT GETDATE(),
        date_modification DATETIME,
        FOREIGN KEY (section_id) REFERENCES SectionInformation(id) ON DELETE CASCADE
    );
    PRINT 'Table ContenuInformation créée avec succès';
END
ELSE
BEGIN
    PRINT 'Table ContenuInformation existe déjà';
END
GO

-- Table pour les documents téléchargeables
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'DocumentTelecharge')
BEGIN
    CREATE TABLE DocumentTelecharge (
        id INT IDENTITY(1,1) PRIMARY KEY,
        section_id INT, -- NULL si document général
        titre NVARCHAR(300) NOT NULL,
        description NVARCHAR(MAX),
        nom_fichier NVARCHAR(500) NOT NULL, -- Nom original du fichier
        chemin_fichier NVARCHAR(1000) NOT NULL, -- Chemin de stockage
        type_fichier NVARCHAR(100), -- PDF, DOCX, etc.
        taille_octets BIGINT, -- Taille du fichier en octets
        nombre_telechargements INT NOT NULL DEFAULT 0,
        actif BIT NOT NULL DEFAULT 1,
        date_creation DATETIME NOT NULL DEFAULT GETDATE(),
        date_modification DATETIME,
        FOREIGN KEY (section_id) REFERENCES SectionInformation(id) ON DELETE SET NULL
    );
    PRINT 'Table DocumentTelecharge créée avec succès';
END
ELSE
BEGIN
    PRINT 'Table DocumentTelecharge existe déjà';
END
GO

-- Index pour améliorer les performances
CREATE NONCLUSTERED INDEX IX_SectionInformation_Slug ON SectionInformation(slug);
CREATE NONCLUSTERED INDEX IX_SectionInformation_Actif ON SectionInformation(actif);
CREATE NONCLUSTERED INDEX IX_ContenuInformation_Section ON ContenuInformation(section_id);
CREATE NONCLUSTERED INDEX IX_DocumentTelecharge_Section ON DocumentTelecharge(section_id);
GO

-- Vue pour obtenir les sections avec leur nombre de contenus et documents
IF EXISTS (SELECT * FROM sys.views WHERE name = 'VueSectionsInformation')
    DROP VIEW VueSectionsInformation;
GO

CREATE VIEW VueSectionsInformation AS
SELECT 
    s.id,
    s.titre,
    s.slug,
    s.icone,
    s.ordre,
    s.actif,
    s.date_creation,
    s.date_modification,
    COUNT(DISTINCT c.id) as nombre_contenus,
    COUNT(DISTINCT d.id) as nombre_documents
FROM SectionInformation s
LEFT JOIN ContenuInformation c ON s.id = c.section_id AND c.actif = 1
LEFT JOIN DocumentTelecharge d ON s.id = d.section_id AND d.actif = 1
GROUP BY s.id, s.titre, s.slug, s.icone, s.ordre, s.actif, s.date_creation, s.date_modification;
GO

PRINT 'Vue VueSectionsInformation créée avec succès';
GO

-- Insertion des sections par défaut
INSERT INTO SectionInformation (titre, slug, icone, ordre, actif) VALUES
('Garantie', 'garantie', 'Shield', 1, 1),
('Assurance', 'assurance', 'FileText', 2, 1),
('Documents Requis', 'documents-requis', 'FileCheck', 3, 1),
('Entretien', 'entretien', 'Wrench', 4, 1),
('Contact', 'contact', 'Phone', 5, 1);
GO

PRINT 'Sections par défaut insérées avec succès';
GO

-- Insertion de contenus d'exemple pour la section Garantie
DECLARE @garantieId INT = (SELECT id FROM SectionInformation WHERE slug = 'garantie');

INSERT INTO ContenuInformation (section_id, titre, contenu, ordre, actif) VALUES
(@garantieId, 'Garantie Constructeur', 
'<h3>Garantie Constructeur Chery</h3>
<p>Tous les véhicules Chery neufs bénéficient d''une garantie constructeur complète :</p>
<ul>
<li><strong>Durée :</strong> 5 ans ou 150 000 km (selon la première échéance atteinte)</li>
<li><strong>Couverture :</strong> Tous les défauts de fabrication et de matériaux</li>
<li><strong>Peinture :</strong> 3 ans contre les défauts de peinture</li>
<li><strong>Corrosion :</strong> 10 ans contre la corrosion perforante</li>
</ul>
<p><strong>Important :</strong> La garantie est valable uniquement si l''entretien est effectué selon le carnet d''entretien.</p>', 
1, 1),

(@garantieId, 'Conditions de Garantie', 
'<h3>Conditions d''Application</h3>
<p>Pour bénéficier de la garantie, vous devez :</p>
<ol>
<li>Effectuer tous les entretiens dans un centre agréé Chery</li>
<li>Respecter les intervalles d''entretien recommandés</li>
<li>Conserver tous les justificatifs d''entretien</li>
<li>Utiliser uniquement des pièces d''origine Chery</li>
<li>Signaler immédiatement tout problème technique</li>
</ol>
<h4>Exclusions</h4>
<p>La garantie ne couvre pas :</p>
<ul>
<li>L''usure normale (pneus, freins, embrayage, etc.)</li>
<li>Les dommages causés par un accident ou une mauvaise utilisation</li>
<li>Les modifications non autorisées</li>
<li>Le manque d''entretien</li>
</ul>', 
2, 1);
GO

-- Insertion de contenus d'exemple pour la section Assurance
DECLARE @assuranceId INT = (SELECT id FROM SectionInformation WHERE slug = 'assurance');

INSERT INTO ContenuInformation (section_id, titre, contenu, ordre, actif) VALUES
(@assuranceId, 'Assurance Automobile', 
'<h3>Assurance Obligatoire</h3>
<p>En Tunisie, l''assurance automobile est obligatoire pour tous les véhicules en circulation.</p>
<h4>Types d''Assurance</h4>
<ul>
<li><strong>Responsabilité Civile (RC) :</strong> Obligatoire, couvre les dommages causés aux tiers</li>
<li><strong>Tous Risques :</strong> Recommandée, couvre également les dommages à votre véhicule</li>
<li><strong>Vol et Incendie :</strong> Protection contre le vol et l''incendie</li>
<li><strong>Bris de Glace :</strong> Couverture des vitres et pare-brise</li>
</ul>', 
1, 1),

(@assuranceId, 'Partenaires Assurance', 
'<h3>Nos Partenaires Assurance</h3>
<p>Chery Tunisie travaille avec les principales compagnies d''assurance :</p>
<ul>
<li>STAR Assurances</li>
<li>GAT Assurances</li>
<li>COMAR Assurances</li>
<li>AMI Assurances</li>
<li>Maghrebia Assurances</li>
</ul>
<p>Nos conseillers peuvent vous aider à choisir la meilleure couverture pour votre véhicule.</p>', 
2, 1);
GO

-- Insertion de contenus d'exemple pour Documents Requis
DECLARE @documentsId INT = (SELECT id FROM SectionInformation WHERE slug = 'documents-requis');

INSERT INTO ContenuInformation (section_id, titre, contenu, ordre, actif) VALUES
(@documentsId, 'Documents pour Rendez-vous', 
'<h3>Documents à Fournir</h3>
<p>Pour votre rendez-vous au service après-vente, veuillez apporter :</p>
<h4>Documents Obligatoires</h4>
<ul>
<li>Carte d''identité nationale (CIN) ou passeport</li>
<li>Carte grise du véhicule (original)</li>
<li>Carnet d''entretien</li>
</ul>
<h4>Documents Recommandés</h4>
<ul>
<li>Attestation d''assurance en cours de validité</li>
<li>Factures des entretiens précédents</li>
<li>Certificat de garantie (si applicable)</li>
</ul>', 
1, 1);
GO

PRINT 'Contenus d''exemple insérés avec succès';
GO

-- Insertion de documents téléchargeables d'exemple
DECLARE @garantieIdDoc INT = (SELECT id FROM SectionInformation WHERE slug = 'garantie');
DECLARE @assuranceIdDoc INT = (SELECT id FROM SectionInformation WHERE slug = 'assurance');
DECLARE @documentsIdDoc INT = (SELECT id FROM SectionInformation WHERE slug = 'documents-requis');

INSERT INTO DocumentTelecharge (section_id, titre, description, nom_fichier, chemin_fichier, type_fichier, taille_octets, actif) VALUES
(@garantieIdDoc, 'Certificat de Garantie', 'Modèle de certificat de garantie Chery', 'certificat_garantie_chery.pdf', '/documents/garantie/certificat_garantie_chery.pdf', 'application/pdf', 524288, 1),
(@garantieIdDoc, 'Conditions Générales de Garantie', 'Document complet des conditions de garantie', 'conditions_garantie.pdf', '/documents/garantie/conditions_garantie.pdf', 'application/pdf', 1048576, 1),
(@assuranceIdDoc, 'Formulaire Déclaration Sinistre', 'Formulaire à remplir en cas de sinistre', 'declaration_sinistre.pdf', '/documents/assurance/declaration_sinistre.pdf', 'application/pdf', 262144, 1),
(@documentsIdDoc, 'Liste Documents Requis', 'Liste complète des documents nécessaires', 'liste_documents.pdf', '/documents/liste_documents.pdf', 'application/pdf', 131072, 1);
GO

PRINT 'Documents d''exemple insérés avec succès';
GO

PRINT '============================================================================';
PRINT 'Migration terminée avec succès !';
PRINT 'Tables créées : SectionInformation, ContenuInformation, DocumentTelecharge';
PRINT 'Vue créée : VueSectionsInformation';
PRINT 'Données d''exemple insérées';
PRINT '============================================================================';
