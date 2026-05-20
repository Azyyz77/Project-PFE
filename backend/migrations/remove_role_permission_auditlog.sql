-- Migrate roles into Utilisateur.role and remove Role/Permission/AuditLog tables

-- 1) Ensure Utilisateur.role exists
IF COL_LENGTH('Utilisateur', 'role') IS NULL
BEGIN
  ALTER TABLE Utilisateur ADD role NVARCHAR(20) NULL;
END

-- 2) Backfill role values from Role table if it exists
IF OBJECT_ID('Role', 'U') IS NOT NULL
  AND COL_LENGTH('Utilisateur', 'role_id') IS NOT NULL
  AND COL_LENGTH('Utilisateur', 'role') IS NOT NULL
BEGIN
  DECLARE @backfillSql NVARCHAR(MAX);
  SET @backfillSql = N'UPDATE u
  SET [role] = ISNULL(u.[role], r.nom)
  FROM Utilisateur u
  LEFT JOIN Role r ON r.id = u.role_id;';
  EXEC sp_executesql @backfillSql;
END

-- 3) Fallback default role
IF COL_LENGTH('Utilisateur', 'role') IS NOT NULL
BEGIN
  DECLARE @defaultRoleSql NVARCHAR(MAX);
  SET @defaultRoleSql = N'UPDATE Utilisateur SET [role] = ''CLIENT'' WHERE [role] IS NULL OR [role] = '''';';
  EXEC sp_executesql @defaultRoleSql;
END

-- 4) Drop foreign keys referencing Role or Permission
DECLARE @sql NVARCHAR(MAX) = '';
SELECT @sql = @sql +
  'ALTER TABLE ' + QUOTENAME(OBJECT_SCHEMA_NAME(parent_object_id)) + '.' +
  QUOTENAME(OBJECT_NAME(parent_object_id)) +
  ' DROP CONSTRAINT ' + QUOTENAME(name) + ';'
FROM sys.foreign_keys
WHERE referenced_object_id IN (OBJECT_ID('Role'), OBJECT_ID('Permission'));

IF LEN(@sql) > 0
BEGIN
  EXEC sp_executesql @sql;
END

-- 5) Drop default constraint and column role_id if it exists
IF COL_LENGTH('Utilisateur', 'role_id') IS NOT NULL
BEGIN
  DECLARE @dc NVARCHAR(128);
  SELECT @dc = dc.name
  FROM sys.default_constraints dc
  JOIN sys.columns c ON c.default_object_id = dc.object_id
  WHERE dc.parent_object_id = OBJECT_ID('Utilisateur')
    AND c.name = 'role_id';

  IF @dc IS NOT NULL
  BEGIN
    DECLARE @dropSql NVARCHAR(MAX);
    SET @dropSql = N'ALTER TABLE Utilisateur DROP CONSTRAINT ' + QUOTENAME(@dc);
    EXEC sp_executesql @dropSql;
  END

  ALTER TABLE Utilisateur DROP COLUMN role_id;
END

-- 6) Drop Permission, Role, AuditLog tables
IF OBJECT_ID('Permission', 'U') IS NOT NULL
  DROP TABLE Permission;

IF OBJECT_ID('Role', 'U') IS NOT NULL
  DROP TABLE Role;

IF OBJECT_ID('AuditLog', 'U') IS NOT NULL
  DROP TABLE AuditLog;
