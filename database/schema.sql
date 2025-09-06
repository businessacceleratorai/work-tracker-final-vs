-- Work Tracker Database Schema
-- PostgreSQL/Supabase Setup

-- Create users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create folders table
CREATE TABLE folders (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create notes table
CREATE TABLE notes (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT,
    folder_id INTEGER NOT NULL REFERENCES folders(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create tasks table
CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    completed BOOLEAN DEFAULT FALSE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create timers table (for future time tracking functionality)
CREATE TABLE timers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    start_time TIMESTAMP,
    end_time TIMESTAMP,
    duration INTEGER, -- in seconds
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    task_id INTEGER REFERENCES tasks(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create reminders table (for future reminder functionality)
CREATE TABLE reminders (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    reminder_time TIMESTAMP NOT NULL,
    is_completed BOOLEAN DEFAULT FALSE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_folders_user_id ON folders(user_id);
CREATE INDEX idx_notes_folder_id ON notes(folder_id);
CREATE INDEX idx_notes_user_id ON notes(user_id);
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_timers_user_id ON timers(user_id);
CREATE INDEX idx_timers_task_id ON timers(task_id);
CREATE INDEX idx_reminders_user_id ON reminders(user_id);
CREATE INDEX idx_reminders_time ON reminders(reminder_time);
CREATE INDEX idx_users_email ON users(email);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_folders_updated_at BEFORE UPDATE ON folders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_notes_updated_at BEFORE UPDATE ON notes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_timers_updated_at BEFORE UPDATE ON timers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reminders_updated_at BEFORE UPDATE ON reminders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data (optional - remove in production)
-- This is useful for testing the application

-- Sample user (password is 'password' hashed with bcryptjs)
INSERT INTO users (name, email, password) VALUES 
('Test User', 'test@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi');

-- Sample folders for the test user
INSERT INTO folders (name, user_id) VALUES 
('General', 1),
('Work', 1),
('Personal', 1);

-- Sample notes
INSERT INTO notes (title, content, folder_id, user_id) VALUES 
('Welcome Note', '<p>Welcome to Work Tracker! This is your first note.</p>', 1, 1),
('Meeting Notes', '<p>Important meeting notes go here...</p>', 2, 1),
('Ideas', '<p>Random ideas and thoughts...</p>', 3, 1);

-- Sample tasks
INSERT INTO tasks (title, description, completed, user_id) VALUES 
('Setup Work Tracker', 'Complete the initial setup of the Work Tracker application', true, 1),
('Create first note', 'Create your first note in the application', false, 1),
('Explore features', 'Explore all the features of Work Tracker', false, 1);

-- Sample reminders
INSERT INTO reminders (title, description, reminder_time, user_id) VALUES 
('Daily Standup', 'Join the daily standup meeting', CURRENT_TIMESTAMP + INTERVAL '1 day', 1),
('Review Notes', 'Review and organize your notes', CURRENT_TIMESTAMP + INTERVAL '3 days', 1);

-- Comments for documentation
COMMENT ON TABLE users IS 'User accounts and authentication information';
COMMENT ON TABLE folders IS 'Folders for organizing notes';
COMMENT ON TABLE notes IS 'User notes with rich text content';
COMMENT ON TABLE tasks IS 'Task management and tracking';
COMMENT ON TABLE timers IS 'Time tracking for tasks and activities';
COMMENT ON TABLE reminders IS 'User reminders and notifications';

COMMENT ON COLUMN users.password IS 'Hashed password using bcryptjs';
COMMENT ON COLUMN notes.content IS 'Rich text content stored as HTML';
COMMENT ON COLUMN timers.duration IS 'Duration in seconds';
COMMENT ON COLUMN reminders.reminder_time IS 'When the reminder should trigger';
