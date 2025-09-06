// Check Database Schema - Diagnose table structure
// Usage: node check-schema.js

const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres.srgvovfooypxprpwxyhn:Jahid.1996@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres',
  ssl: {
    rejectUnauthorized: false
  }
});

async function checkSchema() {
  try {
    console.log('🔄 Checking database schema...');
    
    const client = await pool.connect();
    
    // Check users table structure
    const userColumns = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'users' AND table_schema = 'public'
      ORDER BY ordinal_position;
    `);
    
    console.log('\n👥 Users table structure:');
    if (userColumns.rows.length === 0) {
      console.log('❌ Users table not found!');
    } else {
      userColumns.rows.forEach(col => {
        console.log(`  - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? '(NOT NULL)' : '(NULLABLE)'}`);
      });
    }
    
    // Check all tables
    const allTables = await client.query(`
      SELECT table_name
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    
    console.log('\n📋 All tables:');
    for (const table of allTables.rows) {
      const columns = await client.query(`
        SELECT column_name, data_type
        FROM information_schema.columns 
        WHERE table_name = '${table.table_name}' AND table_schema = 'public'
        ORDER BY ordinal_position;
      `);
      
      console.log(`\n  🗂️  ${table.table_name}:`);
      columns.rows.forEach(col => {
        console.log(`     - ${col.column_name}: ${col.data_type}`);
      });
    }
    
    client.release();
    
  } catch (error) {
    console.error('❌ Schema check failed:', error.message);
  } finally {
    await pool.end();
  }
}

checkSchema();