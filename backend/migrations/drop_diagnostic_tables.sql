-- Migration: Suppression des tables du système de diagnostic
-- Date: 2026-04-17
-- Description: Supprime toutes les tables liées aux diagnostics et problèmes prédéfinis

-- Supprimer la table de liaison (doit être supprimée en premier à cause des foreign keys)
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[ProblemesDiagnostic]') AND type in (N'U'))
BEGIN
    DROP TABLE [dbo].[ProblemesDiagnostic];
    PRINT 'Table ProblemesDiagnostic supprimée';
END
ELSE
BEGIN
    PRINT 'Table ProblemesDiagnostic n''existe pas';
END
GO

-- Supprimer la table Diagnostic
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Diagnostic]') AND type in (N'U'))
BEGIN
    DROP TABLE [dbo].[Diagnostic];
    PRINT 'Table Diagnostic supprimée';
END
ELSE
BEGIN
    PRINT 'Table Diagnostic n''existe pas';
END
GO

-- Supprimer la table ProblemePredéfini
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[ProblemePredéfini]') AND type in (N'U'))
BEGIN
    DROP TABLE [dbo].[ProblemePredéfini];
    PRINT 'Table ProblemePredéfini supprimée';
END
ELSE
BEGIN
    PRINT 'Table ProblemePredéfini n''existe pas';
END
GO

-- Supprimer aussi les anciennes tables avec encodage différent si elles existent
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[ProblemePredefini]') AND type in (N'U'))
BEGIN
    DROP TABLE [dbo].[ProblemePredefini];
    PRINT 'Table ProblemePredefini (sans accent) supprimée';
END
GO

PRINT 'Migration de suppression terminée';
GO
