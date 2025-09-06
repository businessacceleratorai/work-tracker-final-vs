-- Create tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id SERIAL PRIMARY KEY,
  text TEXT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Create timers table
CREATE TABLE IF NOT EXISTS timers (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  duration INTEGER NOT NULL, -- in seconds
  remaining INTEGER NOT NULL,
  is_running BOOLEAN DEFAULT FALSE,
  is_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create reminders table
CREATE TABLE IF NOT EXISTS reminders (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  type VARCHAR(20) NOT NULL, -- 'once' or 'recurring'
  interval_seconds INTEGER NOT NULL,
  next_trigger TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
