const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// Create SQLite database in a persistent location
const dbPath = path.join(process.cwd(), 'data', 'work-tracker.db');

// Ensure data directory exists
const dataDir = path.dirname(dbPath);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

console.log('Database path:', dbPath);

try {
  const db = new Database(dbPath);
  console.log('✅ SQLite database connection successful!');

  // Enable WAL mode for better performance
  db.pragma('journal_mode = WAL');
  console.log('✅ WAL mode enabled');

  // Create tables if they don't exist
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
  console.log('✅ Users table created/verified');

  // Test insert and select
  const insertUser = db.prepare('INSERT INTO users (email, password_hash, name) VALUES (?, ?, ?)');
  const result = insertUser.run('test@example.com', 'hashed_password_123', 'Test User');
  console.log('✅ Test user inserted with ID:', result.lastInsertRowid);

  // Test select
  const user = db.prepare('SELECT id, email, name, created_at FROM users WHERE email = ?').get('test@example.com');
  console.log('✅ Test user retrieved:', user);

  // Clean up test data
  db.prepare('DELETE FROM users WHERE email = ?').run('test@example.com');
  console.log('✅ Test data cleaned up');

  db.close();
  console.log('✅ Database connection closed successfully');
  console.log('🎉 SQLite database is working perfectly!');

} catch (error) {
  console.error('❌ SQLite database error:', error.message);
  console.error('Full error:', error);
}
