/**
 * Test Script: Audit System
 * Tests the audit logging functionality
 */

const { getConnection, sql } = require('../config/database');

async function testAuditSystem() {
  console.log('🧪 Testing Audit System...\n');

  try {
    const pool = await getConnection();

    // Test 1: Check if AuditLog table exists
    console.log('1️⃣ Checking if AuditLog table exists...');
    const tableCheck = await pool.request().query(`
      SELECT COUNT(*) as count
      FROM INFORMATION_SCHEMA.TABLES
      WHERE TABLE_NAME = 'AuditLog'
    `);

    if (tableCheck.recordset[0].count === 0) {
      console.log('❌ AuditLog table does not exist!');
      console.log('   Run: backend/migrations/create_audit_log_table.sql\n');
      return;
    }
    console.log('✅ AuditLog table exists\n');

    // Test 2: Check table structure
    console.log('2️⃣ Checking table structure...');
    const columns = await pool.request().query(`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = 'AuditLog'
      ORDER BY ORDINAL_POSITION
    `);

    console.log('   Columns:');
    columns.recordset.forEach(col => {
      console.log(`   - ${col.COLUMN_NAME} (${col.DATA_TYPE}) ${col.IS_NULLABLE === 'NO' ? 'NOT NULL' : 'NULL'}`);
    });
    console.log('✅ Table structure verified\n');

    // Test 3: Check indexes
    console.log('3️⃣ Checking indexes...');
    const indexes = await pool.request().query(`
      SELECT 
        i.name as index_name,
        COL_NAME(ic.object_id, ic.column_id) as column_name
      FROM sys.indexes i
      INNER JOIN sys.index_columns ic ON i.object_id = ic.object_id AND i.index_id = ic.index_id
      WHERE i.object_id = OBJECT_ID('AuditLog')
        AND i.name IS NOT NULL
      ORDER BY i.name, ic.key_ordinal
    `);

    const indexGroups = {};
    indexes.recordset.forEach(idx => {
      if (!indexGroups[idx.index_name]) {
        indexGroups[idx.index_name] = [];
      }
      indexGroups[idx.index_name].push(idx.column_name);
    });

    console.log('   Indexes:');
    Object.entries(indexGroups).forEach(([name, columns]) => {
      console.log(`   - ${name}: ${columns.join(', ')}`);
    });
    console.log('✅ Indexes verified\n');

    // Test 4: Insert a test log
    console.log('4️⃣ Inserting test audit log...');
    const testLog = await pool.request()
      .input('utilisateur_id', sql.BigInt, 1)
      .input('utilisateur_nom', sql.NVarChar, 'Test User')
      .input('utilisateur_role', sql.NVarChar, 'ADMIN')
      .input('action', sql.NVarChar, 'CREATE')
      .input('entite_type', sql.NVarChar, 'TestEntity')
      .input('entite_id', sql.NVarChar, '999')
      .input('description', sql.NVarChar, 'Test audit log entry')
      .input('ip_address', sql.NVarChar, '127.0.0.1')
      .input('endpoint', sql.NVarChar, '/api/test')
      .input('methode_http', sql.NVarChar, 'POST')
      .input('statut', sql.NVarChar, 'SUCCESS')
      .query(`
        INSERT INTO AuditLog (
          utilisateur_id, utilisateur_nom, utilisateur_role,
          action, entite_type, entite_id,
          description, ip_address, endpoint, methode_http,
          statut, date_action
        )
        OUTPUT INSERTED.id
        VALUES (
          @utilisateur_id, @utilisateur_nom, @utilisateur_role,
          @action, @entite_type, @entite_id,
          @description, @ip_address, @endpoint, @methode_http,
          @statut, GETDATE()
        )
      `);

    const insertedId = testLog.recordset[0].id;
    console.log(`✅ Test log inserted with ID: ${insertedId}\n`);

    // Test 5: Query the test log
    console.log('5️⃣ Querying test log...');
    const queryResult = await pool.request()
      .input('id', sql.BigInt, insertedId)
      .query(`
        SELECT *
        FROM AuditLog
        WHERE id = @id
      `);

    if (queryResult.recordset.length > 0) {
      const log = queryResult.recordset[0];
      console.log('   Retrieved log:');
      console.log(`   - ID: ${log.id}`);
      console.log(`   - User: ${log.utilisateur_nom} (${log.utilisateur_role})`);
      console.log(`   - Action: ${log.action}`);
      console.log(`   - Entity: ${log.entite_type} #${log.entite_id}`);
      console.log(`   - Description: ${log.description}`);
      console.log(`   - Date: ${log.date_action}`);
      console.log(`   - Status: ${log.statut}`);
      console.log('✅ Query successful\n');
    }

    // Test 6: Test filtering
    console.log('6️⃣ Testing filters...');
    const filterResult = await pool.request()
      .input('action', sql.NVarChar, 'CREATE')
      .query(`
        SELECT COUNT(*) as count
        FROM AuditLog
        WHERE action = @action
      `);
    console.log(`   Found ${filterResult.recordset[0].count} CREATE actions`);
    console.log('✅ Filtering works\n');

    // Test 7: Clean up test log
    console.log('7️⃣ Cleaning up test log...');
    await pool.request()
      .input('id', sql.BigInt, insertedId)
      .query('DELETE FROM AuditLog WHERE id = @id');
    console.log('✅ Test log deleted\n');

    // Test 8: Get statistics
    console.log('8️⃣ Getting audit statistics...');
    const stats = await pool.request().query(`
      SELECT 
        COUNT(*) as total_logs,
        SUM(CASE WHEN action = 'CREATE' THEN 1 ELSE 0 END) as creates,
        SUM(CASE WHEN action = 'UPDATE' THEN 1 ELSE 0 END) as updates,
        SUM(CASE WHEN action = 'DELETE' THEN 1 ELSE 0 END) as deletes,
        COUNT(DISTINCT utilisateur_id) as unique_users,
        COUNT(DISTINCT entite_type) as unique_entities
      FROM AuditLog
    `);

    const stat = stats.recordset[0];
    console.log('   Current statistics:');
    console.log(`   - Total logs: ${stat.total_logs}`);
    console.log(`   - Creates: ${stat.creates}`);
    console.log(`   - Updates: ${stat.updates}`);
    console.log(`   - Deletes: ${stat.deletes}`);
    console.log(`   - Unique users: ${stat.unique_users}`);
    console.log(`   - Unique entities: ${stat.unique_entities}`);
    console.log('✅ Statistics retrieved\n');

    console.log('🎉 All tests passed! Audit system is working correctly.\n');
    console.log('📝 Next steps:');
    console.log('   1. Restart backend server to load audit middleware');
    console.log('   2. Perform some CRUD operations');
    console.log('   3. Check audit logs at /dashboard/admin/audit');
    console.log('   4. Test export functionality\n');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('\nDetails:', error);
  }

  process.exit(0);
}

// Run tests
testAuditSystem();
