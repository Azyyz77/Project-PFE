USE [STA_SAV_DB]
GO

-- ============================================================
-- CRÉATION DU SYSTÈME DE DIAGNOSTIC TECHNIQUE
-- ============================================================

PRINT 'Création du système de diagnostic technique...'
PRINT ''

-- ============================================================
-- 1. Table ProblemePredéfini
-- ============================================================

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[ProblemePredefini]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[ProblemePredefini](
        [id] [bigint] IDENTITY(1,1) NOT NULL,
        [nom] [nvarchar](150) NOT NULL,
        [description] [nvarchar](max) NULL,
        [solution] [nvarchar](max) NULL,
        [categorie] [nvarchar](50) NOT NULL,
        [actif] [bit] NOT NULL DEFAULT 1,
        [date_creation] [datetime2](7) NOT NULL DEFAULT GETDATE(),
        CONSTRAINT [PK_ProblemePredefini] PRIMARY KEY CLUSTERED ([id] ASC)
    )
    PRINT '✓ Table ProblemePredefini créée'
END
ELSE
BEGIN
    PRINT '- Table ProblemePredefini existe déjà'
END
GO

-- ============================================================
-- 2. Table Diagnostic
-- ============================================================

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Diagnostic]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[Diagnostic](
        [id] [bigint] IDENTITY(1,1) NOT NULL,
        [rdv_id] [bigint] NOT NULL,
        [agent_id] [bigint] NOT NULL,
        [observations_generales] [nvarchar](max) NULL,
        [recommandations] [nvarchar](max) NULL,
        [date_creation] [datetime2](7) NOT NULL DEFAULT GETDATE(),
        [date_modification] [datetime2](7) NULL,
        CONSTRAINT [PK_Diagnostic] PRIMARY KEY CLUSTERED ([id] ASC),
        CONSTRAINT [FK_Diagnostic_RDV] FOREIGN KEY([rdv_id]) REFERENCES [dbo].[RendezVous]([id]),
        CONSTRAINT [FK_Diagnostic_Agent] FOREIGN KEY([agent_id]) REFERENCES [dbo].[Utilisateur]([id])
    )
    PRINT '✓ Table Diagnostic créée'
END
ELSE
BEGIN
    PRINT '- Table Diagnostic existe déjà'
END
GO

-- ============================================================
-- 3. Table ProblemesDiagnostic (table de liaison)
-- ============================================================

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[ProblemesDiagnostic]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[ProblemesDiagnostic](
        [id] [bigint] IDENTITY(1,1) NOT NULL,
        [diagnostic_id] [bigint] NOT NULL,
        [probleme_id] [bigint] NOT NULL,
        [description_specifique] [nvarchar](max) NULL,
        [gravite] [nvarchar](20) NULL,
        [date_ajout] [datetime2](7) NOT NULL DEFAULT GETDATE(),
        CONSTRAINT [PK_ProblemesDiagnostic] PRIMARY KEY CLUSTERED ([id] ASC),
        CONSTRAINT [FK_ProblemesDiagnostic_Diagnostic] FOREIGN KEY([diagnostic_id]) REFERENCES [dbo].[Diagnostic]([id]) ON DELETE CASCADE,
        CONSTRAINT [FK_ProblemesDiagnostic_Probleme] FOREIGN KEY([probleme_id]) REFERENCES [dbo].[ProblemePredefini]([id])
    )
    PRINT '✓ Table ProblemesDiagnostic créée'
END
ELSE
BEGIN
    PRINT '- Table ProblemesDiagnostic existe déjà'
END
GO

-- ============================================================
-- 4. Index pour optimiser les performances
-- ============================================================

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Diagnostic_RDV' AND object_id = OBJECT_ID(N'[dbo].[Diagnostic]'))
BEGIN
    CREATE INDEX [IX_Diagnostic_RDV] ON [dbo].[Diagnostic]([rdv_id])
    PRINT '✓ Index IX_Diagnostic_RDV créé'
END

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Diagnostic_Agent' AND object_id = OBJECT_ID(N'[dbo].[Diagnostic]'))
BEGIN
    CREATE INDEX [IX_Diagnostic_Agent] ON [dbo].[Diagnostic]([agent_id])
    PRINT '✓ Index IX_Diagnostic_Agent créé'
END

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_ProblemesDiagnostic_Diagnostic' AND object_id = OBJECT_ID(N'[dbo].[ProblemesDiagnostic]'))
BEGIN
    CREATE INDEX [IX_ProblemesDiagnostic_Diagnostic] ON [dbo].[ProblemesDiagnostic]([diagnostic_id])
    PRINT '✓ Index IX_ProblemesDiagnostic_Diagnostic créé'
END

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_ProblemePredefini_Categorie' AND object_id = OBJECT_ID(N'[dbo].[ProblemePredefini]'))
BEGIN
    CREATE INDEX [IX_ProblemePredefini_Categorie] ON [dbo].[ProblemePredefini]([categorie]) WHERE [actif] = 1
    PRINT '✓ Index IX_ProblemePredefini_Categorie créé'
END

GO

-- ============================================================
-- 5. Insertion de problèmes prédéfinis par défaut
-- ============================================================

IF NOT EXISTS (SELECT * FROM [dbo].[ProblemePredefini])
BEGIN
    PRINT ''
    PRINT 'Insertion des problèmes prédéfinis...'
    
    INSERT INTO [dbo].[ProblemePredefini] (nom, description, solution, categorie, actif) VALUES
    -- Moteur
    (N'Voyant moteur allumé', N'Le voyant moteur s''allume sur le tableau de bord', N'Effectuer un diagnostic électronique pour identifier le code d''erreur', N'Moteur', 1),
    (N'Surchauffe moteur', N'Le moteur chauffe anormalement', N'Vérifier le niveau de liquide de refroidissement, thermostat et radiateur', N'Moteur', 1),
    (N'Perte de puissance', N'Le véhicule manque de puissance à l''accélération', N'Vérifier le filtre à air, injecteurs et système d''échappement', N'Moteur', 1),
    (N'Fumée excessive', N'Fumée anormale à l''échappement', N'Identifier la couleur de la fumée et diagnostiquer (blanche=liquide refroidissement, bleue=huile, noire=carburant)', N'Moteur', 1),
    (N'Consommation excessive', N'Consommation de carburant anormalement élevée', N'Vérifier les injecteurs, filtre à air, pression des pneus', N'Moteur', 1),
    
    -- Freinage
    (N'Bruit au freinage', N'Bruit de grincement ou de frottement lors du freinage', N'Vérifier l''état des plaquettes et disques de frein', N'Freinage', 1),
    (N'Pédale de frein molle', N'La pédale de frein s''enfonce trop facilement', N'Purger le circuit de freinage et vérifier les fuites', N'Freinage', 1),
    (N'Vibrations au freinage', N'Vibrations ressenties dans la pédale ou le volant lors du freinage', N'Vérifier l''état des disques de frein (voilage)', N'Freinage', 1),
    (N'Frein de parking inefficace', N'Le frein à main ne retient pas suffisamment le véhicule', N'Ajuster ou remplacer les câbles de frein à main', N'Freinage', 1),
    
    -- Suspension
    (N'Bruits de suspension', N'Claquements ou grincements au passage de dos d''âne', N'Vérifier les amortisseurs, silent-blocs et rotules', N'Suspension', 1),
    (N'Véhicule penche', N'Le véhicule penche d''un côté', N'Vérifier les ressorts et amortisseurs', N'Suspension', 1),
    (N'Vibrations au volant', N'Vibrations ressenties dans le volant à certaines vitesses', N'Vérifier l''équilibrage et l''état des pneus', N'Suspension', 1),
    
    -- Climatisation
    (N'Climatisation inefficace', N'La climatisation ne refroidit pas suffisamment', N'Vérifier le niveau de gaz réfrigérant et le compresseur', N'Climatisation', 1),
    (N'Mauvaise odeur climatisation', N'Odeur désagréable lors de l''utilisation de la climatisation', N'Nettoyer ou remplacer le filtre d''habitacle', N'Climatisation', 1),
    (N'Bruit compresseur clim', N'Bruit anormal du compresseur de climatisation', N'Vérifier l''état du compresseur et de la courroie', N'Climatisation', 1),
    
    -- Électrique
    (N'Batterie déchargée', N'Le véhicule ne démarre pas, batterie faible', N'Tester la batterie et l''alternateur, recharger ou remplacer si nécessaire', N'Électrique', 1),
    (N'Problème démarrage', N'Difficulté à démarrer le véhicule', N'Vérifier la batterie, démarreur et système d''allumage', N'Électrique', 1),
    (N'Feux défectueux', N'Un ou plusieurs feux ne fonctionnent pas', N'Remplacer les ampoules défectueuses ou vérifier les fusibles', N'Électrique', 1),
    (N'Problème alternateur', N'Voyant batterie allumé, charge insuffisante', N'Tester et remplacer l''alternateur si nécessaire', N'Électrique', 1),
    
    -- Transmission
    (N'Difficulté passage vitesses', N'Difficulté à passer les vitesses', N'Vérifier le niveau d''huile de boîte et l''embrayage', N'Transmission', 1),
    (N'Bruit boîte de vitesses', N'Bruit anormal de la boîte de vitesses', N'Vérifier le niveau d''huile et l''état des roulements', N'Transmission', 1),
    (N'Embrayage patine', N'L''embrayage patine, perte de puissance', N'Remplacer le kit d''embrayage', N'Transmission', 1),
    
    -- Direction
    (N'Direction dure', N'La direction est difficile à tourner', N'Vérifier le niveau de liquide de direction assistée et la pompe', N'Direction', 1),
    (N'Jeu dans la direction', N'Jeu excessif dans le volant', N'Vérifier les rotules de direction et la crémaillère', N'Direction', 1),
    (N'Bruit direction', N'Bruit lors de la rotation du volant', N'Vérifier la pompe de direction assistée et le niveau de liquide', N'Direction', 1),
    
    -- Échappement
    (N'Bruit échappement', N'Bruit anormal de l''échappement', N'Vérifier l''état du pot d''échappement et des colliers', N'Échappement', 1),
    (N'Fuite échappement', N'Fuite visible ou odeur de gaz d''échappement', N'Réparer ou remplacer la partie défectueuse', N'Échappement', 1),
    
    -- Carrosserie
    (N'Fuite d''huile moteur', N'Présence de taches d''huile sous le véhicule', N'Identifier la source de la fuite et remplacer le joint défectueux', N'Carrosserie', 1),
    (N'Fuite liquide refroidissement', N'Fuite de liquide de refroidissement', N'Vérifier le radiateur, durites et pompe à eau', N'Carrosserie', 1),
    (N'Pare-brise fissuré', N'Fissure ou impact sur le pare-brise', N'Réparer ou remplacer le pare-brise', N'Carrosserie', 1)
    
    PRINT '✓ 30 problèmes prédéfinis insérés'
END
ELSE
BEGIN
    PRINT '- Problèmes prédéfinis déjà présents'
END

GO

PRINT ''
PRINT '✅ Système de diagnostic technique créé avec succès!'
PRINT ''
PRINT 'Tables créées:'
PRINT '  - ProblemePredefini (catalogue des problèmes)'
PRINT '  - Diagnostic (diagnostics des RDV)'
PRINT '  - ProblemesDiagnostic (liaison diagnostic-problèmes)'
PRINT ''
PRINT 'Index créés pour optimiser les performances'
PRINT '30 problèmes prédéfinis insérés dans 9 catégories'

GO
