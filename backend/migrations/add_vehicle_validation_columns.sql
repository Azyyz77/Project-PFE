USE [STA_SAV_DB]
GO

-- ============================================================
-- AJOUT DES COLONNES DE VALIDATION DES VÉHICULES
-- ============================================================

PRINT 'Ajout des colonnes de validation des véhicules...'

-- Vérifier si les colonnes existent déjà
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Vehicule]') AND name = 'statut_validation')
BEGIN
    ALTER TABLE [dbo].[Vehicule]
    ADD [statut_validation] VARCHAR(20) NOT NULL DEFAULT 'EN_ATTENTE'
    PRINT '✓ Colonne statut_validation ajoutée'
END
ELSE
BEGIN
    PRINT '- Colonne statut_validation existe déjà'
END

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Vehicule]') AND name = 'date_validation')
BEGIN
    ALTER TABLE [dbo].[Vehicule]
    ADD [date_validation] DATETIME2(7) NULL
    PRINT '✓ Colonne date_validation ajoutée'
END
ELSE
BEGIN
    PRINT '- Colonne date_validation existe déjà'
END

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Vehicule]') AND name = 'agent_validation_id')
BEGIN
    ALTER TABLE [dbo].[Vehicule]
    ADD [agent_validation_id] BIGINT NULL
    PRINT '✓ Colonne agent_validation_id ajoutée'
END
ELSE
BEGIN
    PRINT '- Colonne agent_validation_id existe déjà'
END

-- Ajouter la contrainte de clé étrangère si elle n'existe pas
IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_Vehicule_Agent_Validation')
BEGIN
    ALTER TABLE [dbo].[Vehicule]
    ADD CONSTRAINT [FK_Vehicule_Agent_Validation]
    FOREIGN KEY ([agent_validation_id]) REFERENCES [dbo].[Utilisateur]([id])
    PRINT '✓ Contrainte FK_Vehicule_Agent_Validation ajoutée'
END
ELSE
BEGIN
    PRINT '- Contrainte FK_Vehicule_Agent_Validation existe déjà'
END

-- Ajouter une contrainte de vérification pour le statut
IF NOT EXISTS (SELECT * FROM sys.check_constraints WHERE name = 'CK_Vehicule_Statut_Validation')
BEGIN
    ALTER TABLE [dbo].[Vehicule]
    ADD CONSTRAINT [CK_Vehicule_Statut_Validation]
    CHECK ([statut_validation] IN ('EN_ATTENTE', 'VALIDE', 'REFUSE'))
    PRINT '✓ Contrainte CK_Vehicule_Statut_Validation ajoutée'
END
ELSE
BEGIN
    PRINT '- Contrainte CK_Vehicule_Statut_Validation existe déjà'
END

-- Créer un index sur statut_validation pour améliorer les performances
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Vehicule_Statut_Validation' AND object_id = OBJECT_ID(N'[dbo].[Vehicule]'))
BEGIN
    CREATE INDEX [IX_Vehicule_Statut_Validation]
    ON [dbo].[Vehicule]([statut_validation])
    INCLUDE ([date_ajout], [client_id])
    PRINT '✓ Index IX_Vehicule_Statut_Validation créé'
END
ELSE
BEGIN
    PRINT '- Index IX_Vehicule_Statut_Validation existe déjà'
END

-- Créer un index sur agent_validation_id
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Vehicule_Agent_Validation' AND object_id = OBJECT_ID(N'[dbo].[Vehicule]'))
BEGIN
    CREATE INDEX [IX_Vehicule_Agent_Validation]
    ON [dbo].[Vehicule]([agent_validation_id])
    PRINT '✓ Index IX_Vehicule_Agent_Validation créé'
END
ELSE
BEGIN
    PRINT '- Index IX_Vehicule_Agent_Validation existe déjà'
END

-- Mettre à jour les véhicules existants pour avoir un statut par défaut
UPDATE [dbo].[Vehicule]
SET [statut_validation] = 'EN_ATTENTE'
WHERE [statut_validation] IS NULL OR [statut_validation] = ''

PRINT ''
PRINT '✅ Migration terminée avec succès!'
PRINT ''
PRINT 'Colonnes ajoutées:'
PRINT '  - statut_validation (VARCHAR(20), défaut: EN_ATTENTE)'
PRINT '  - date_validation (DATETIME2(7), nullable)'
PRINT '  - agent_validation_id (BIGINT, nullable, FK vers Utilisateur)'
PRINT ''
PRINT 'Contraintes ajoutées:'
PRINT '  - CK_Vehicule_Statut_Validation (EN_ATTENTE, VALIDE, REFUSE)'
PRINT '  - FK_Vehicule_Agent_Validation (vers Utilisateur)'
PRINT ''
PRINT 'Index créés:'
PRINT '  - IX_Vehicule_Statut_Validation'
PRINT '  - IX_Vehicule_Agent_Validation'

GO
