USE [STA_SAV_DB]
GO

-- ============================================================
-- AJOUT DES TABLES MANQUANTES
-- ============================================================

-- Table Couleur
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Couleur]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[Couleur](
        [id] [bigint] IDENTITY(1,1) NOT NULL,
        [nom] [nvarchar](50) NOT NULL,
        [code_hex] [varchar](7) NULL,
        [actif] [bit] NOT NULL DEFAULT 1,
        CONSTRAINT [PK_Couleur] PRIMARY KEY CLUSTERED ([id] ASC)
    )
    
    -- Insertion de couleurs par défaut
    INSERT INTO [dbo].[Couleur] (nom, code_hex, actif) VALUES
    (N'Blanc', N'#FFFFFF', 1),
    (N'Noir', N'#000000', 1),
    (N'Gris', N'#808080', 1),
    (N'Rouge', N'#FF0000', 1),
    (N'Bleu', N'#0000FF', 1),
    (N'Argent', N'#C0C0C0', 1),
    (N'Beige', N'#F5F5DC', 1)
END
GO

-- Table ProblemePredefini
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[ProblemePredefini]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[ProblemePredefini](
        [id] [bigint] IDENTITY(1,1) NOT NULL,
        [nom] [nvarchar](150) NOT NULL,
        [description] [nvarchar](max) NULL,
        [solution] [nvarchar](max) NULL,
        [categorie] [nvarchar](50) NOT NULL,
        [actif] [bit] NOT NULL DEFAULT 1,
        CONSTRAINT [PK_ProblemePredefini] PRIMARY KEY CLUSTERED ([id] ASC)
    )
    
    -- Insertion de problèmes par défaut
    INSERT INTO [dbo].[ProblemePredefini] (nom, description, solution, categorie, actif) VALUES
    (N'Voyant moteur allumé', N'Le voyant moteur s''allume sur le tableau de bord', N'Effectuer un diagnostic électronique pour identifier le code d''erreur', N'Moteur', 1),
    (N'Bruit anormal au freinage', N'Bruit de grincement ou de frottement lors du freinage', N'Vérifier l''état des plaquettes et disques de frein', N'Freinage', 1),
    (N'Climatisation inefficace', N'La climatisation ne refroidit pas suffisamment', N'Vérifier le niveau de gaz réfrigérant et le compresseur', N'Climatisation', 1),
    (N'Batterie déchargée', N'Le véhicule ne démarre pas, batterie faible', N'Tester la batterie et l''alternateur, recharger ou remplacer si nécessaire', N'Électrique', 1),
    (N'Fuite d''huile moteur', N'Présence de taches d''huile sous le véhicule', N'Identifier la source de la fuite et remplacer le joint défectueux', N'Moteur', 1),
    (N'Vibrations au volant', N'Vibrations ressenties dans le volant à certaines vitesses', N'Vérifier l''équilibrage et l''état des pneus', N'Suspension', 1)
END
GO

-- Table Document (pour les procédures, garanties, etc.)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Document]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[Document](
        [id] [bigint] IDENTITY(1,1) NOT NULL,
        [titre] [nvarchar](200) NOT NULL,
        [description] [nvarchar](max) NULL,
        [url] [nvarchar](500) NOT NULL,
        [categorie] [nvarchar](50) NOT NULL,
        [type_mime] [nvarchar](100) NULL,
        [taille_mo] [decimal](8, 2) NULL,
        [admin_id] [bigint] NOT NULL,
        [actif] [bit] NOT NULL DEFAULT 1,
        [date_creation] [datetime2](7) NOT NULL DEFAULT GETDATE(),
        CONSTRAINT [PK_Document] PRIMARY KEY CLUSTERED ([id] ASC),
        CONSTRAINT [FK_Document_Admin] FOREIGN KEY([admin_id]) REFERENCES [dbo].[Utilisateur] ([id])
    )
END
GO

-- Ajouter la colonne description à la table Promotion si elle n'existe pas
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Promotion]') AND name = 'description')
BEGIN
    ALTER TABLE [dbo].[Promotion]
    ADD [description] [nvarchar](max) NULL
END
GO

-- ============================================================
-- INSERTION DE DONNÉES DE TEST
-- ============================================================

-- Documents de test
IF NOT EXISTS (SELECT * FROM [dbo].[Document])
BEGIN
    DECLARE @admin_id bigint
    DECLARE @admin_role_id bigint
    
    -- Trouver l'ID du rôle ADMIN ou SUPER_ADMIN
    SELECT TOP 1 @admin_role_id = id FROM [dbo].[Role] 
    WHERE nom IN ('SUPER_ADMIN', 'ADMIN')
    ORDER BY CASE WHEN nom = 'SUPER_ADMIN' THEN 1 ELSE 2 END
    
    -- Trouver un utilisateur avec ce rôle
    IF @admin_role_id IS NOT NULL
    BEGIN
        SELECT TOP 1 @admin_id = id FROM [dbo].[Utilisateur] 
        WHERE role_id = @admin_role_id AND actif = 1
    END
    
    -- Si aucun admin trouvé, utiliser le premier utilisateur actif
    IF @admin_id IS NULL
    BEGIN
        SELECT TOP 1 @admin_id = id FROM [dbo].[Utilisateur] WHERE actif = 1
    END
    
    IF @admin_id IS NOT NULL
    BEGIN
        INSERT INTO [dbo].[Document] (titre, description, url, categorie, admin_id, actif, date_creation) VALUES
        (N'Procédure de garantie', N'Document expliquant les conditions de garantie Chery', N'/documents/garantie.pdf', N'Garantie', @admin_id, 1, GETDATE()),
        (N'Procédure d''assurance', N'Guide pour les démarches d''assurance', N'/documents/assurance.pdf', N'Assurance', @admin_id, 1, GETDATE()),
        (N'Documents requis pour SAV', N'Liste des documents à fournir pour un service', N'/documents/documents-requis.pdf', N'SAV', @admin_id, 1, GETDATE()),
        (N'Manuel d''utilisation', N'Manuel d''utilisation des véhicules Chery', N'/documents/manuel.pdf', N'Manuel', @admin_id, 1, GETDATE())
    END
END
GO

-- Promotions de test
IF NOT EXISTS (SELECT * FROM [dbo].[Promotion])
BEGIN
    DECLARE @admin_id bigint
    DECLARE @admin_role_id bigint
    
    -- Trouver l'ID du rôle ADMIN ou SUPER_ADMIN
    SELECT TOP 1 @admin_role_id = id FROM [dbo].[Role] 
    WHERE nom IN ('SUPER_ADMIN', 'ADMIN')
    ORDER BY CASE WHEN nom = 'SUPER_ADMIN' THEN 1 ELSE 2 END
    
    -- Trouver un utilisateur avec ce rôle
    IF @admin_role_id IS NOT NULL
    BEGIN
        SELECT TOP 1 @admin_id = id FROM [dbo].[Utilisateur] 
        WHERE role_id = @admin_role_id AND actif = 1
    END
    
    -- Si aucun admin trouvé, utiliser le premier utilisateur actif
    IF @admin_id IS NULL
    BEGIN
        SELECT TOP 1 @admin_id = id FROM [dbo].[Utilisateur] WHERE actif = 1
    END
    
    IF @admin_id IS NOT NULL
    BEGIN
        INSERT INTO [dbo].[Promotion] (admin_id, titre, description, date_debut, date_fin, actif, date_creation) VALUES
        (@admin_id, N'Promotion Vidange', N'Vidange complète à prix réduit', DATEADD(DAY, -10, GETDATE()), DATEADD(DAY, 20, GETDATE()), 1, GETDATE()),
        (@admin_id, N'Offre Entretien Complet', N'Entretien complet avec réduction de 20%', DATEADD(DAY, -5, GETDATE()), DATEADD(DAY, 25, GETDATE()), 1, GETDATE())
    END
END
GO

PRINT 'Tables manquantes créées avec succès!'
GO
