const sql = require('mssql');

const dbConfig = {
  server: process.env.DB_SERVER || 'sqlserver',
  port: parseInt(process.env.DB_PORT, 10) || 1433,
  database: process.env.DB_NAME || 'STA_SAV',
  user: process.env.DB_USER || 'sa',
  password: process.env.DB_PASSWORD || 'Daligh2004',
  options: {
    encrypt: false,
    trustServerCertificate: true,
    enableArithAbort: true,
    useUTC: false
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  }
};

let poolPromise;

const getConnection = async () => {
  try {
    if (!poolPromise) {
      poolPromise = await sql.connect(dbConfig);
      console.log('✅ Connecté à SQL Server (Database: ' + dbConfig.database + ')');
    }
    return poolPromise;
  } catch (error) {
    console.error('❌ Erreur de connexion à la base de données:', error);
    poolPromise = null;
    throw error;
  }
};

module.exports = { getConnection, sql };
