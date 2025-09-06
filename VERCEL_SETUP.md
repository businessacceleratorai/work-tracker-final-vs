# Vercel Deployment Guide for Work Tracker

## 🚀 Quick Deployment Steps

### 1. Database Setup (Supabase - Recommended)

1. Go to [Supabase](https://supabase.com) and create a new project
2. Get your database connection details from Settings → Database
3. Copy the connection string (URI format)

### 2. Vercel Deployment

1. Go to [Vercel](https://vercel.com) and import your GitHub repository:
   `https://github.com/businessacceleratorai/work-tracker-final-vs`

2. Configure Environment Variables in Vercel:

```bash
# Database
DATABASE_URL=postgresql://[username]:[password]@[host]:[port]/[database]

# JWT Secret (generate a random string)
JWT_SECRET=your-super-secret-jwt-key-here

# NextAuth (if using)
NEXTAUTH_SECRET=your-nextauth-secret
NEXTAUTH_URL=https://your-app.vercel.app
```

### 3. Environment Variables Details

#### Required Variables:
- `DATABASE_URL`: Your PostgreSQL connection string from Supabase
- `JWT_SECRET`: A random secret for JWT token signing (generate with `openssl rand -base64 32`)

#### Optional Variables:
- `NODE_ENV`: Set to `production` (Vercel sets this automatically)
- `NEXTAUTH_SECRET`: If using NextAuth.js for authentication
- `NEXTAUTH_URL`: Your deployed app URL

### 4. Database Schema Setup

After deployment, run these SQL commands in your Supabase SQL Editor:

```sql
-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Folders table
CREATE TABLE folders (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Notes table
CREATE TABLE notes (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL DEFAULT 'Untitled',
    content TEXT DEFAULT '',
    folder_id INTEGER REFERENCES folders(id) ON DELETE SET NULL,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tasks table
CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    completed BOOLEAN DEFAULT FALSE,
    priority VARCHAR(10) CHECK (priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
    due_date TIMESTAMP,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Timers table
CREATE TABLE timers (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    duration INTEGER DEFAULT 0, -- in seconds
    is_running BOOLEAN DEFAULT FALSE,
    started_at TIMESTAMP,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Reminders table
CREATE TABLE reminders (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    reminder_time TIMESTAMP NOT NULL,
    is_completed BOOLEAN DEFAULT FALSE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_notes_user_id ON notes(user_id);
CREATE INDEX idx_notes_folder_id ON notes(folder_id);
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_timers_user_id ON timers(user_id);
CREATE INDEX idx_reminders_user_id ON reminders(user_id);
CREATE INDEX idx_folders_user_id ON folders(user_id);
```

### 5. Post-Deployment

1. **Test the deployment**: Visit your Vercel URL
2. **Create test account**: Register a new user
3. **Test features**: Create notes, tasks, timers, and reminders
4. **Monitor logs**: Check Vercel function logs for any issues

### 6. Custom Domain (Optional)

1. In Vercel dashboard, go to your project
2. Navigate to Settings → Domains
3. Add your custom domain
4. Update `NEXTAUTH_URL` environment variable if using authentication

## 🔧 Troubleshooting

### Common Issues:

1. **Database Connection Error**:
   - Verify `DATABASE_URL` is correct
   - Check Supabase project is running
   - Ensure database schema is created

2. **Authentication Issues**:
   - Verify `JWT_SECRET` is set
   - Check password hashing is working

3. **Build Errors**:
   - Check TypeScript errors in local development
   - Verify all dependencies in package.json

### Environment Variable Template:

```bash
# Copy this to Vercel Environment Variables
DATABASE_URL=postgresql://user:password@host:port/database
JWT_SECRET=your-jwt-secret-minimum-32-characters
NODE_ENV=production
```

## 📝 Notes

- This app uses **PostgreSQL** (Supabase recommended)
- Built with **Next.js 15** and **TypeScript**
- Uses **Tailwind CSS** and **shadcn/ui** components
- JWT authentication with secure HTTP-only cookies
- Real-time features ready for WebSocket integration

## 🎉 Your Work Tracker is Now Live!

Visit your deployed application and start managing your productivity with:
- 📝 Rich text notes with folder organization
- ✅ Task management with priorities and due dates
- ⏱️ Time tracking with built-in timers
- 🔔 Reminders with notifications
- 🔐 Secure user authentication

Good luck with your productivity journey! 🚀