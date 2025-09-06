const { Pool } = require('pg');
const dns = require('dns');

// Force IPv4 resolution
dns.setDefaultResultOrder('ipv4first');

const pool = new Pool({
  host: 'db.srgvovfooypxprpwxyhn.supabase.co',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: 'Jahid.1996',
  ssl: {
    rejectUnauthorized: false
  },
  connectionTimeoutMillis: 10000,
  idleTimeoutMillis: 30000,
  max: 10
});

async function testConnection() {
  try {
    console.log('Testing database connection with IPv4 forced...');
    
    // First, let's resolve the hostname to see what IP we get
    const util = require('util');
    const lookup = util.promisify(dns.lookup);
    const address = await lookup('db.srgvovfooypxprpwxyhn.supabase.co', { family: 4 });
    console.log('Resolved IPv4 address:', address);
    
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
