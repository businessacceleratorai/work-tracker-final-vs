const { Pool } = require('pg');

const pool = new Pool({
  host: 'db.srgvovfooypxprpwxyhn.supabase.co',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: 'Jahid.1996',
  ssl: {
    rejectUnauthorized: false
  }
});

async function testConnection() {
  try {
    console.log('Testing database connection...');
    const client = await pool.connect();
    console.log('✅ Database connection successful!');
    
    const result = await client.query('SELECT NOW() as current_time');
    console.log('✅ Query successful:', result.rows[0]);
    
    client.release();
    await pool.end();
    console.log('✅ Connection closed successfully');
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.error('Full error:', error);
  }
}

testConnection();
