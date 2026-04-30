// scripts/syncData.js
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const { syncSQLServerData } = require('../services/ragService');

syncSQLServerData()
  .then(() => {
    console.log('🎉 Sync terminée !');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Erreur:', err);
    process.exit(1);
  });
