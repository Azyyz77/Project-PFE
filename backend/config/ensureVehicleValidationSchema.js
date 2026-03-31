const { getConnection } = require('./database');

const ensureVehicleValidationSchema = async () => {
  const pool = await getConnection();

  await pool.request().query(`
    IF COL_LENGTH('Vehicule', 'statut_validation') IS NULL
    BEGIN
      ALTER TABLE Vehicule
      ADD statut_validation VARCHAR(20) NOT NULL
        CONSTRAINT DF_Vehicule_StatutValidation DEFAULT 'EN_ATTENTE';
    END
  `);

  await pool.request().query(`
    IF COL_LENGTH('Vehicule', 'motif_refus') IS NULL
    BEGIN
      ALTER TABLE Vehicule
      ADD motif_refus NVARCHAR(255) NULL;
    END
  `);

  await pool.request().query(`
    IF COL_LENGTH('Vehicule', 'date_validation') IS NULL
    BEGIN
      ALTER TABLE Vehicule
      ADD date_validation DATETIME2 NULL;
    END
  `);

  await pool.request().query(`
    IF COL_LENGTH('Vehicule', 'agent_validateur_id') IS NULL
    BEGIN
      ALTER TABLE Vehicule
      ADD agent_validateur_id BIGINT NULL;
    END
  `);

  await pool.request().query(`
    IF NOT EXISTS (
      SELECT 1
      FROM sys.check_constraints
      WHERE name = 'CK_Vehicule_StatutValidation'
    )
    BEGIN
      ALTER TABLE Vehicule
      ADD CONSTRAINT CK_Vehicule_StatutValidation
      CHECK (statut_validation IN ('EN_ATTENTE', 'VALIDE', 'REFUSE'));
    END
  `);

  await pool.request().query(`
    UPDATE Vehicule
    SET statut_validation = 'EN_ATTENTE'
    WHERE statut_validation IS NULL;
  `);
};

module.exports = { ensureVehicleValidationSchema };
