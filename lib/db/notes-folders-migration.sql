-- Create folders table
CREATE TABLE IF NOT EXISTS folders (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL DEFAULT 'Untitled Folder',
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Update notes table to include folder_id
ALTER TABLE notes ADD COLUMN IF NOT EXISTS folder_id INTEGER REFERENCES folders(id) ON DELETE SET NULL;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_folders_user_id ON folders(user_id);
CREATE INDEX IF NOT EXISTS idx_notes_folder_id ON notes(folder_id);

-- Create default folder for existing users
INSERT INTO folders (name, user_id) 
SELECT 'General', id FROM users 
WHERE NOT EXISTS (SELECT 1 FROM folders WHERE folders.user_id = users.id);

-- Update trigger for folders updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_folders_updated_at BEFORE UPDATE ON folders
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
