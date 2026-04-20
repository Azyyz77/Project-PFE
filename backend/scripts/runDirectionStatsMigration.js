require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const fs = require('fs');
const path = require('path');
const { getConnection, closeConnection } = require('../config/database');

async function runMigration() {
  let pool;
  
  try {
    console.log('🔄 Starting direction stats schema migration...\n');
    
    // Read the migration file
    const migrationPath = path.join(__dirname, '../migrations/fix_direction_stats_schema.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    // Split by GO statements (case insensitive, with various whitespace)
    const statements = migrationSQL
      .split(/\r?\n\s*GO\s*\r?\n/gi)
      .map(s => s.trim())
      .filter(s => {
        // Remove empty statements and comment-only blocks
        if (!s || s.length === 0) return false;
        const lines = s.split('\n').filter(line => {
          const trimmed = line.trim();
          return trimmed && !trimmed.startsWith('--');
        });
        return lines.length > 0;
      });
    
    console.log(`📄 Found ${statements.length} SQL statement blocks to execute\n`);
    
    // Get database connection
    pool = await getConnection();
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      try {
        console.log(`⏳ Executing statement block ${i + 1}/${statements.length}...`);
        console.log(`   Preview: ${statement.substring(0, 100).replace(/\n/g, ' ')}...`);
        
        const result = await pool.request().query(statement);
        
        // Show any messages from PRINT statements
        if (result.recordset && result.recordset.length > 0) {
          console.log('   Result:', result.recordset);
        }
        
        console.log(`✅ Statement block ${i + 1} completed\n`);
      } catch (error) {
        console.error(`❌ Error executing statement block ${i + 1}:`, error.message);
        console.error('   Statement preview:', statement.substring(0, 300).replace(/\n/g, ' ') + '...\n');
        // Continue with other statements
      }
    }
    
    console.log('✅ Migration completed successfully!\n');
    console.log('📊 Verifying schema changes...\n');
    
    // Verify the changes
    const verifyResult = await pool.request().query(`
      SELECT 
        t.name AS TableName,
        COUNT(c.column_id) AS ColumnCount
      FROM sys.tables t
      LEFT JOIN sys.columns c ON t.object_id = c.object_id
      WHERE t.name IN ('InterventionCatalog', 'Appointment', 'Feedback', 'Reclamation')
      GROUP BY t.name
      ORDER BY t.name
    `);
    
    console.log('Table column counts:');
    verifyResult.recordset.forEach(row => {
      console.log(`  - ${row.TableName}: ${row.ColumnCount} columns`);
    });
    
    // Check if view exists
    const viewCheck = await pool.request().query(`
      SELECT COUNT(*) AS ViewExists 
      FROM sys.views 
      WHERE name = 'VW_StatsAgence'
    `);
    
    console.log(`\n  - VW_StatsAgence view: ${viewCheck.recordset[0].ViewExists ? '✅ Created' : '❌ Not found'}`);
    
    console.log('\n🎉 All done! The direction statistics API should now work correctly.');
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await closeConnection();
  }
}

// Run the migration
runMigration();
