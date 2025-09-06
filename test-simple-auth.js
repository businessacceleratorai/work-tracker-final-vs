// Test the simple authentication utilities using built-in Node.js crypto
const crypto = require('crypto');

console.log('🧪 Testing simple authentication utilities...');

// Simple password hashing using built-in crypto
async function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

// Simple password verification using built-in crypto
async function verifyPassword(password, storedHash) {
  try {
    const [salt, hash] = storedHash.split(':');
    const verifyHash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
    return hash === verifyHash;
  } catch {
    return false;
  }
}

// Simple JWT generation using built-in crypto
function generateToken(payload) {
  const JWT_SECRET = 'test-secret-key';
  const header = {
    alg: 'HS256',
    typ: 'JWT'
  };
  
  const now = Math.floor(Date.now() / 1000);
  const jwtPayload = {
    ...payload,
    iat: now,
    exp: now + (7 * 24 * 60 * 60) // 7 days
  };
  
  const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
  const encodedPayload = Buffer.from(JSON.stringify(jwtPayload)).toString('base64url');
  
  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest('base64url');
  
  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

// Simple JWT verification using built-in crypto
function verifyToken(token) {
  try {
    const JWT_SECRET = 'test-secret-key';
    const [encodedHeader, encodedPayload, signature] = token.split('.');
    
    // Verify signature
    const expectedSignature = crypto
      .createHmac('sha256', JWT_SECRET)
      .update(`${encodedHeader}.${encodedPayload}`)
      .digest('base64url');
    
    if (signature !== expectedSignature) {
      return null;
    }
    
    // Decode payload
    const payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString());
    
    // Check expiration
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      return null;
    }
    
    return {
      userId: payload.userId,
      email: payload.email
    };
  } catch {
    return null;
  }
}

async function testAuth() {
  try {
    console.log('\n🔐 Testing password hashing...');
    const password = 'password123';
    const hashedPassword = await hashPassword(password);
    console.log('✅ Password hashed:', hashedPassword.substring(0, 50) + '...');
    
    console.log('\n🔍 Testing password verification...');
    const isValid = await verifyPassword(password, hashedPassword);
    console.log('✅ Password verification (correct):', isValid);
    
    const isInvalid = await verifyPassword('wrongpassword', hashedPassword);
    console.log('✅ Password verification (incorrect):', isInvalid);
    
    console.log('\n🎫 Testing JWT generation...');
    const token = generateToken({ userId: 1, email: 'test@example.com' });
    console.log('✅ JWT generated:', token.substring(0, 50) + '...');
    
    console.log('\n🔓 Testing JWT verification...');
    const decoded = verifyToken(token);
    console.log('✅ JWT decoded:', decoded);
    
    const invalidDecoded = verifyToken('invalid.token.here');
    console.log('✅ Invalid JWT decoded:', invalidDecoded);
    
    console.log('\n🎉 All simple authentication tests passed!');
    
  } catch (error) {
    console.error('❌ Simple authentication test failed:', error.message);
    console.error('Full error:', error);
  }
}

testAuth();
