-- ============================================================================
-- Système de Promotions Véhicules et Messages d'Accueil
-- ============================================================================

-- Table: PromotionVehicule (Vehicle Promotions)
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'PromotionVehicule')
BEGIN
    CREATE TABLE PromotionVehicule (
        id BIGINT PRIMARY KEY IDENTITY(1,1),
        titre NVARCHAR(255) NOT NULL,
        description NVARCHAR(MAX),
        marque_id BIGINT,
        modele_id BIGINT,
        version_id BIGINT,
        prix_original DECIMAL(18,2),
        prix_promotion DECIMAL(18,2) NOT NULL,
        pourcentage_reduction DECIMAL(5,2),
        image_url NVARCHAR(500),
        date_debut DATE NOT NULL,
        date_fin DATE NOT NULL,
        actif BIT DEFAULT 1,
        stock_disponible INT,
        conditions NVARCHAR(MAX),
        agence_id BIGINT,
        created_by BIGINT,
        created_at DATETIME DEFAULT GETDATE(),
        updated_at DATETIME DEFAULT GETDATE(),
        CONSTRAINT FK_PromotionVehicule_Marque FOREIGN KEY (marque_id) REFERENCES Marque(id),
        CONSTRAINT FK_PromotionVehicule_Modele FOREIGN KEY (modele_id) REFERENCES Modele(id),
        CONSTRAINT FK_PromotionVehicule_Version FOREIGN KEY (version_id) REFERENCES Version(id),
        CONSTRAINT FK_PromotionVehicule_Agence FOREIGN KEY (agence_id) REFERENCES Agence(id),
        CONSTRAINT FK_PromotionVehicule_CreatedBy FOREIGN KEY (created_by) REFERENCES Utilisateur(id),
        CONSTRAINT CHK_PromotionVehicule_Dates CHECK (date_fin >= date_debut),
        CONSTRAINT CHK_PromotionVehicule_Prix CHECK (prix_promotion > 0)
    );
    PRINT 'Table PromotionVehicule créée avec succès';
END
ELSE
BEGIN
    PRINT 'Table PromotionVehicule existe déjà';
END
GO

-- Table: MessageAccueil (Welcome Messages/Announcements)
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'MessageAccueil')
BEGIN
    CREATE TABLE MessageAccueil (
        id BIGINT PRIMARY KEY IDENTITY(1,1),
        titre NVARCHAR(255) NOT NULL,
        contenu NVARCHAR(MAX) NOT NULL,
        type NVARCHAR(50) DEFAULT 'INFO', -- INFO, ALERTE, PROMOTION, MAINTENANCE
        priorite INT DEFAULT 1, -- 1=Basse, 2=Normale, 3=Haute, 4=Urgente
        date_debut DATETIME NOT NULL,
        date_fin DATETIME,
        actif BIT DEFAULT 1,
        afficher_accueil BIT DEFAULT 1, -- Afficher sur page d'accueil
        afficher_dashboard BIT DEFAULT 1, -- Afficher sur dashboard
        couleur_fond NVARCHAR(20), -- Code couleur hex pour personnalisation
        icone NVARCHAR(50), -- Nom de l'icône à afficher
        lien_url NVARCHAR(500), -- Lien optionnel
        lien_texte NVARCHAR(100), -- Texte du lien
        agence_id BIGINT, -- NULL = tous, sinon spécifique à une agence
        created_by BIGINT NOT NULL,
        created_at DATETIME DEFAULT GETDATE(),
        updated_at DATETIME DEFAULT GETDATE(),
        CONSTRAINT FK_MessageAccueil_Agence FOREIGN KEY (agence_id) REFERENCES Agence(id),
        CONSTRAINT FK_MessageAccueil_CreatedBy FOREIGN KEY (created_by) REFERENCES Utilisateur(id),
        CONSTRAINT CHK_MessageAccueil_Type CHECK (type IN ('INFO', 'ALERTE', 'PROMOTION', 'MAINTENANCE', 'URGENT')),
        CONSTRAINT CHK_MessageAccueil_Priorite CHECK (priorite BETWEEN 1 AND 4)
    );
    PRINT 'Table MessageAccueil créée avec succès';
END
ELSE
BEGIN
    PRINT 'Table MessageAccueil existe déjà';
END
GO

-- Table: MessageLecture (Message Read Tracking)
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'MessageLecture')
BEGIN
    CREATE TABLE MessageLecture (
        id BIGINT PRIMARY KEY IDENTITY(1,1),
        message_id BIGINT NOT NULL,
        utilisateur_id BIGINT NOT NULL,
        date_lecture DATETIME DEFAULT GETDATE(),
        CONSTRAINT FK_MessageLecture_Message FOREIGN KEY (message_id) REFERENCES MessageAccueil(id) ON DELETE CASCADE,
        CONSTRAINT FK_MessageLecture_Utilisateur FOREIGN KEY (utilisateur_id) REFERENCES Utilisateur(id),
        CONSTRAINT UQ_MessageLecture UNIQUE (message_id, utilisateur_id)
    );
    PRINT 'Table MessageLecture créée avec succès';
END
ELSE
BEGIN
    PRINT 'Table MessageLecture existe déjà';
END
GO

-- Index pour améliorer les performances
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IDX_PromotionVehicule_Dates')
    CREATE INDEX IDX_PromotionVehicule_Dates ON PromotionVehicule(date_debut, date_fin, actif);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IDX_PromotionVehicule_Marque')
    CREATE INDEX IDX_PromotionVehicule_Marque ON PromotionVehicule(marque_id);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IDX_PromotionVehicule_Agence')
    CREATE INDEX IDX_PromotionVehicule_Agence ON PromotionVehicule(agence_id);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IDX_MessageAccueil_Dates')
    CREATE INDEX IDX_MessageAccueil_Dates ON MessageAccueil(date_debut, date_fin, actif);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IDX_MessageAccueil_Type')
    CREATE INDEX IDX_MessageAccueil_Type ON MessageAccueil(type, priorite);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IDX_MessageLecture_User')
    CREATE INDEX IDX_MessageLecture_User ON MessageLecture(utilisateur_id);

PRINT 'Index créés avec succès';
GO

-- Vue: Promotions actives avec détails
CREATE OR ALTER VIEW VuePromotionsActives AS
SELECT 
    p.id,
    p.titre,
    p.description,
    p.prix_original,
    p.prix_promotion,
    p.pourcentage_reduction,
    p.image_url,
    p.date_debut,
    p.date_fin,
    p.stock_disponible,
    p.conditions,
    -- Marque
    mar.id AS marque_id,
    mar.nom AS marque_nom,
    mar.logo_url AS marque_logo,
    -- Modèle
    mod.id AS modele_id,
    mod.nom AS modele_nom,
    -- Version
    ver.id AS version_id,
    ver.nom AS version_nom,
    ver.annee AS version_annee,
    -- Agence
    a.id AS agence_id,
    a.nom AS agence_nom,
    a.adresse AS agence_adresse,
    a.telephone AS agence_telephone,
    -- Créateur
    u.nom AS created_by_nom,
    u.prenom AS created_by_prenom,
    p.created_at
FROM PromotionVehicule p
LEFT JOIN Marque mar ON p.marque_id = mar.id
LEFT JOIN Modele mod ON p.modele_id = mod.id
LEFT JOIN Version ver ON p.version_id = ver.id
LEFT JOIN Agence a ON p.agence_id = a.id
INNER JOIN Utilisateur u ON p.created_by = u.id
WHERE p.actif = 1
  AND CAST(GETDATE() AS DATE) BETWEEN p.date_debut AND p.date_fin;
GO

PRINT 'Vue VuePromotionsActives créée avec succès';
GO

-- Vue: Messages actifs avec statistiques de lecture
CREATE OR ALTER VIEW VueMessagesActifs AS
SELECT 
    m.id,
    m.titre,
    m.contenu,
    m.type,
    m.priorite,
    m.date_debut,
    m.date_fin,
    m.afficher_accueil,
    m.afficher_dashboard,
    m.couleur_fond,
    m.icone,
    m.lien_url,
    m.lien_texte,
    -- Agence
    a.id AS agence_id,
    a.nom AS agence_nom,
    -- Créateur
    u.nom AS created_by_nom,
    u.prenom AS created_by_prenom,
    m.created_at,
    -- Statistiques
    (SELECT COUNT(*) FROM MessageLecture ml WHERE ml.message_id = m.id) AS nb_lectures
FROM MessageAccueil m
LEFT JOIN Agence a ON m.agence_id = a.id
INNER JOIN Utilisateur u ON m.created_by = u.id
WHERE m.actif = 1
  AND GETDATE() >= m.date_debut
  AND (m.date_fin IS NULL OR GETDATE() <= m.date_fin);
GO

PRINT 'Vue VueMessagesActifs créée avec succès';
GO

PRINT '';
PRINT '============================================================================';
PRINT 'Système de Promotions Véhicules et Messages d''Accueil créé avec succès!';
PRINT '============================================================================';
PRINT '';
PRINT 'Tables créées:';
PRINT '  - PromotionVehicule (Promotions sur véhicules)';
PRINT '  - MessageAccueil (Messages et annonces)';
PRINT '  - MessageLecture (Suivi de lecture des messages)';
PRINT '';
PRINT 'Vues créées:';
PRINT '  - VuePromotionsActives (Promotions en cours)';
PRINT '  - VueMessagesActifs (Messages actifs)';
PRINT '';
PRINT 'Prochaines étapes:';
PRINT '  1. Créer les contrôleurs backend';
PRINT '  2. Créer les routes API';
PRINT '  3. Créer les interfaces frontend (client + admin)';
PRINT '============================================================================';
GO