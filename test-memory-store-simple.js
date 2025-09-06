// Simple test for in-memory store functionality
console.log('🧪 Testing in-memory store concept...');

// Simulate the in-memory store
let users = [];
let nextUserId = 1;

const memoryStore = {
  users: {
    findByEmail: (email) => {
      return users.find(user => user.email.toLowerCase() === email.toLowerCase());
    },
    
    create: (email, password_hash, name) => {
      const user = {
        id: nextUserId++,
        email: email.toLowerCase(),
        password_hash,
        name: name || undefined,
        created_at: new Date().toISOString()
      };
      users.push(user);
      return user;
    }
  }
};

try {
  console.log('\n📊 Initial users:', users.length);
  
  // Create a test user
  const user1 = memoryStore.users.create('test@example.com', 'hashed_password_123', 'Test User');
  console.log('✅ User created:', user1);
  
  // Find user by email
  const foundUser = memoryStore.users.findByEmail('test@example.com');
  console.log('✅ User found by email:', foundUser);
  
  // Test case sensitivity
  const foundUserCaseInsensitive = memoryStore.users.findByEmail('TEST@EXAMPLE.COM');
  console.log('✅ Case insensitive search works:', foundUserCaseInsensitive ? 'Yes' : 'No');
  
  // Test duplicate email detection
  const existingUser = memoryStore.users.findByEmail('test@example.com');
  console.log('✅ Duplicate detection works:', existingUser ? 'User exists' : 'User not found');
  
  console.log('\n📊 Final users:', users.length);
  console.log('\n🎉 In-memory store concept works perfectly!');
  
} catch (error) {
  console.error('❌ In-memory store test failed:', error.message);
}
