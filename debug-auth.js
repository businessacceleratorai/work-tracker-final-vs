// Debug the authentication issue by testing the exact same logic locally
const crypto = require('crypto');

console.log('🔍 Debugging authentication issue...');

// Test the exact same logic as in our API
async function testRegistration() {
  try {
    // Simulate the exact request data
    const requestData = {
      email: 'alex.johnson@example.com',
      password: 'password123',
      name: 'Alex Johnson'
    };
    
    console.log('📝 Request data:', requestData);
    
    // Validate input (same as API)
    if (!requestData.email || !requestData.password) {
      console.log('❌ Validation failed: Email and password are required');
      return;
    }

    if (requestData.password.length < 6) {
      console.log('❌ Validation failed: Password must be at least 6 characters long');
      return;
    }
    
    console.log('✅ Input validation passed');
    
    // Test password hashing (same as API)
    console.log('🔐 Testing password hashing...');
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(requestData.password, salt, 10000, 64, 'sha512').toString('hex');
    const passwordHash = `${salt}:${hash}`;
    console.log('✅ Password hashed successfully:', passwordHash.substring(0, 50) + '...');
    
    // Test user creation (simulate memory store)
    console.log('👤 Testing user creation...');
    const user = {
      id: 1,
      email: requestData.email,
      name: requestData.name,
      password_hash: passwordHash,
      created_at: new Date().toISOString()
    };
    console.log('✅ User created successfully:', {
      id: user.id,
      email: user.email,
      name: user.name,
      created_at: user.created_at
    });
    
    // Test JWT generation (same as API)
    console.log('🎫 Testing JWT generation...');
    const JWT_SECRET = 'your-secret-key-change-in-production';
    const header = {
      alg: 'HS256',
      typ: 'JWT'
    };
    
    const now = Math.floor(Date.now() / 1000);
    const jwtPayload = {
      userId: user.id,
      email: user.email,
      iat: now,
      exp: now + (7 * 24 * 60 * 60) // 7 days
    };
    
    const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
    const encodedPayload = Buffer.from(JSON.stringify(jwtPayload)).toString('base64url');
    
    const signature = crypto
      .createHmac('sha256', JWT_SECRET)
      .update(`${encodedHeader}.${encodedPayload}`)
      .digest('base64url');
    
    const token = `${encodedHeader}.${encodedPayload}.${signature}`;
    console.log('✅ JWT generated successfully:', token.substring(0, 50) + '...');
    
    // Test response creation
    console.log('📤 Testing response creation...');
    const response = {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        created_at: user.created_at
      },
      token
    };
    console.log('✅ Response created successfully:', response.user);
    
    console.log('\n🎉 All authentication logic works perfectly locally!');
    console.log('🤔 The issue must be in the serverless environment or imports...');
    
  } catch (error) {
    console.error('❌ Authentication debug failed:', error.message);
    console.error('Full error:', error);
  }
}

testRegistration();
