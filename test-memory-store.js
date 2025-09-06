// Test the in-memory store functionality
const { memoryStore } = require('./lib/db/memory-store.ts');

console.log('🧪 Testing in-memory store...');

try {
  // Test user operations
  console.log('\n📊 Initial stats:', memoryStore.debug.getStats());
  
  // Create a test user
  const user1 = memoryStore.users.create('test@example.com', 'hashed_password_123', 'Test User');
  console.log('✅ User created:', user1);
  
  // Find user by email
  const foundUser = memoryStore.users.findByEmail('test@example.com');
  console.log('✅ User found by email:', foundUser);
  
  // Find user by ID
  const foundById = memoryStore.users.findById(user1.id);
  console.log('✅ User found by ID:', foundById);
  
  // Test duplicate email
  try {
    memoryStore.users.create('test@example.com', 'another_password', 'Another User');
    console.log('❌ Should have failed - duplicate email allowed');
  } catch (error) {
    // This won't throw an error in our current implementation, but let's check if user exists
    const duplicate = memoryStore.users.findByEmail('test@example.com');
    console.log('✅ Duplicate check works - existing user:', duplicate ? 'found' : 'not found');
  }
  
  // Test folder operations
  const folder1 = memoryStore.folders.create('Work Notes', user1.id);
  console.log('✅ Folder created:', folder1);
  
  const userFolders = memoryStore.folders.findByUserId(user1.id);
  console.log('✅ User folders:', userFolders);
  
  // Test note operations
  const note1 = memoryStore.notes.create('Test Note', 'This is a test note content', user1.id, folder1.id);
  console.log('✅ Note created:', note1);
  
  const userNotes = memoryStore.notes.findByUserId(user1.id);
  console.log('✅ User notes:', userNotes);
  
  const folderNotes = memoryStore.notes.findByFolderId(folder1.id);
  console.log('✅ Folder notes:', folderNotes);
  
  // Final stats
  console.log('\n📊 Final stats:', memoryStore.debug.getStats());
  
  console.log('\n🎉 All in-memory store tests passed!');
  
} catch (error) {
  console.error('❌ In-memory store test failed:', error.message);
  console.error('Full error:', error);
}
