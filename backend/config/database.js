const useTrustedConnection = process.env.DB_TRUSTED_CONNECTION === 'true';
const sql = useTrustedConnection ? require('mssql/msnodesqlv8') : require('mssql');

const dbConfig = useTrustedConnection
  ? {
      server: process.env.DB_SERVER || 'localhost',
      database: process.env.DB_NAME || 'STA_SAV',
      driver: 'msnodesqlv8',
      options: {
        trustedConnection: true,
        trustServerCertificate: true,
        enableArithAbort: true
      },
      pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000
      }
    }
  : {
      server: process.env.DB_SERVER || 'localhost',
      port: parseInt(process.env.DB_PORT) || 1433,
      database: process.env.DB_NAME || 'STA_SAV',
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      options: {
        encrypt: false,
        trustServerCertificate: true,
        enableArithAbort: true
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
      poolPromise = sql.connect(dbConfig);
      await poolPromise;
      console.log('✅ Connecté à SQL Server (Database: ' + dbConfig.database + ')');
    }
    return poolPromise;
  } catch (error) {
    console.error('❌ Erreur de connexion à la base de données:', error);
    poolPromise = null;
    throw error;
  }
};

const closeConnection = async () => {
  try {
    if (poolPromise) {
      await sql.close();
      poolPromise = null;
    }
  } catch (error) {
    console.error('Erreur lors de la fermeture de la connexion:', error);
  }
};

module.exports = { getConnection, closeConnection, sql };
