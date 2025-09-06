// Simple Auth Test - Debug authentication issues
// Usage: node test-auth-simple.js

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres.srgvovfooypxprpwxyhn:Jahid.1996@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres',
  ssl: {
    rejectUnauthorized: false
  }
});

const JWT_SECRET = 'cfba6c60b6872e1d168c6c92d1495d8bb9834b997815ff3f65ee287218d968d9';

async function testAuth() {
  try {
    console.log('🔄 Testing authentication system...');
    
    const client = await pool.connect();
    
    // Test 1: Check if we can query users
    console.log('\n1️⃣ Testing user query...');
    const users = await client.query('SELECT id, email, name, created_at FROM users LIMIT 5');
    console.log(`✅ Found ${users.rows.length} users:`);
    users.rows.forEach(user => {
      console.log(`  - ${user.email} (ID: ${user.id})`);
    });
    
    // Test 2: Try to register a test user
    console.log('\n2️⃣ Testing user registration...');
    const testEmail = `test_${Date.now()}@test.com`;
    const testPassword = 'testpass123';
    const hashedPassword = await bcrypt.hash(testPassword, 12);
    
    try {
      const insertResult = await client.query(
        'INSERT INTO users (email, password, name) VALUES ($1, $2, $3) RETURNING id, email, name',
        [testEmail, hashedPassword, 'Test User']
      );
      console.log('✅ User registration successful:', insertResult.rows[0]);
      
      // Test 3: Try to login with the test user
      console.log('\n3️⃣ Testing user login...');
      const loginResult = await client.query('SELECT * FROM users WHERE email = $1', [testEmail]);
      
      if (loginResult.rows.length > 0) {
        const user = loginResult.rows[0];
        const isValid = await bcrypt.compare(testPassword, user.password);
        
        if (isValid) {
          console.log('✅ Password verification successful');
          
          // Test 4: Generate JWT token
          console.log('\n4️⃣ Testing JWT token generation...');
          const token = jwt.sign(
            { id: user.id, userId: user.id, email: user.email },
            JWT_SECRET,
            { expiresIn: '7d' }
          );
          console.log('✅ JWT token generated successfully');
          
          // Test 5: Verify JWT token
          console.log('\n5️⃣ Testing JWT token verification...');
          const decoded = jwt.verify(token, JWT_SECRET);
          console.log('✅ JWT token verified successfully:', {
            id: decoded.id,
            userId: decoded.userId,
            email: decoded.email
          });
          
        } else {
          console.log('❌ Password verification failed');
        }
      } else {
        console.log('❌ User not found after insertion');
      }
      
      // Clean up test user
      await client.query('DELETE FROM users WHERE email = $1', [testEmail]);
      console.log('🧹 Test user cleaned up');
      
    } catch (error) {
      console.log('❌ Registration error:', error.message);
    }
    
    client.release();
    console.log('\n🎉 Authentication test completed!');
    
  } catch (error) {
    console.error('❌ Authentication test failed:', error.message);
    console.error('Stack trace:', error.stack);
  } finally {
    await pool.end();
  }
}

testAuth();