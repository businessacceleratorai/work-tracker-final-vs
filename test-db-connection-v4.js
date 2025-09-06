// Database Connection Test - Run this to debug connection issues
// Usage: node test-db-connection-v4.js

const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres.srgvovfooypxprpwxyhn:Jahid.1996@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres',
  ssl: {
    rejectUnauthorized: false
  }
});

async function testConnection() {
  try {
    console.log('🔄 Testing database connection...');
    
    // Test basic connection
    const client = await pool.connect();
    console.log('✅ Database connection successful!');
    
    // Check if tables exist
    const tablesQuery = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `;
    
    const tablesResult = await client.query(tablesQuery);
    console.log('\n📋 Existing tables:');
    if (tablesResult.rows.length === 0) {
      console.log('❌ No tables found! Database schema needs to be created.');
      console.log('\n🔧 Run the database schema from database-schema-complete.sql');
    } else {
      tablesResult.rows.forEach(row => {
        console.log(`  - ${row.table_name}`);
      });
    }
    
    // Check for required tables
    const requiredTables = ['users', 'folders', 'notes', 'tasks', 'timers', 'reminders'];
    const existingTables = tablesResult.rows.map(row => row.table_name);
    
    console.log('\n🔍 Table status:');
    requiredTables.forEach(table => {
      const exists = existingTables.includes(table);
      console.log(`  ${exists ? '✅' : '❌'} ${table}`);
    });
    
    // Test a simple query on users table if it exists
    if (existingTables.includes('users')) {
      try {
        const userCount = await client.query('SELECT COUNT(*) as count FROM users');
        console.log(`\n👥 Users in database: ${userCount.rows[0].count}`);
      } catch (error) {
        console.log(`\n❌ Error querying users table: ${error.message}`);
      }
    }
    
    client.release();
    console.log('\n🎉 Database test completed!');
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.error('\n🔧 Troubleshooting tips:');
    console.error('1. Check if DATABASE_URL is correct');
    console.error('2. Ensure Supabase project is active');
    console.error('3. Verify database credentials');
    console.error('4. Check network connectivity');
  } finally {
    await pool.end();
  }
}

testConnection();