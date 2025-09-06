const { Pool } = require('pg');

// Test with connection string (forces IPv4)
const pool = new Pool({
  connectionString: 'postgresql://postgres:Jahid.1996@db.srgvovfooypxprpwxyhn.supabase.co:5432/postgres?sslmode=require',
  ssl: {
    rejectUnauthorized: false
  },
  connectionTimeoutMillis: 10000,
  idleTimeoutMillis: 30000,
  max: 10
});

async function testConnection() {
  try {
    console.log('Testing database connection with connection string...');
    const client = await pool.connect();
    console.log('✅ Database connection successful!');
    
    const result = await client.query('SELECT NOW() as current_time, version() as db_version');
    console.log('✅ Query successful:', result.rows[0]);
    
    // Test if users table exists
    const tableCheck = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'users'
    `);
    console.log('✅ Users table exists:', tableCheck.rows.length > 0);
    
    client.release();
    await pool.end();
    console.log('✅ Connection closed successfully');
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.error('Error code:', error.code);
    console.error('Error details:', error.detail || 'No additional details');
  }
}

testConnection();
