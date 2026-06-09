USE [STA_SAV_DB]
GO

IF COL_LENGTH('dbo.Utilisateur', 'role') IS NULL
BEGIN
    ALTER TABLE dbo.Utilisateur ADD [role] NVARCHAR(20) NULL;
END
GO

IF COL_LENGTH('dbo.Utilisateur', 'telephone_verifie') IS NULL
BEGIN
    ALTER TABLE dbo.Utilisateur ADD telephone_verifie BIT NOT NULL CONSTRAINT DF_Utilisateur_telephone_verifie DEFAULT (0) WITH VALUES;
END
GO

UPDATE dbo.Utilisateur
SET [role] = COALESCE([role], type_utilisateur, 'CLIENT')
WHERE [role] IS NULL;
GO

UPDATE dbo.Utilisateur
SET telephone_verifie = COALESCE(telephone_verifie, 0)
WHERE telephone_verifie IS NULL;
GO
