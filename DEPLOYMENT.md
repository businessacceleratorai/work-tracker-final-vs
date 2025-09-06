# Work Tracker - Vercel Deployment Guide

This guide will help you deploy the Work Tracker application to Vercel with Supabase PostgreSQL database.

## Prerequisites

- GitHub account
- Vercel account (connected to GitHub)
- Supabase account
- Node.js 18+ installed locally

## 1. Database Setup (Supabase PostgreSQL)

### Create Supabase Project

1. Go to [Supabase](https://supabase.com) and create a new project
2. Choose a project name (e.g., "work-tracker")
3. Set a strong database password
4. Select a region close to your users
5. Wait for the project to be created

### Database Schema Setup

Execute the following SQL commands in your Supabase SQL Editor:

```sql
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

-- Create indexes for better performance
CREATE INDEX idx_folders_user_id ON folders(user_id);
CREATE INDEX idx_notes_folder_id ON notes(folder_id);
CREATE INDEX idx_notes_user_id ON notes(user_id);
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
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
```

### Get Database Connection Details

1. In your Supabase project dashboard, go to **Settings** > **Database**
2. Copy the connection string from the **Connection string** section
3. It should look like: `postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres`

## 2. Environment Variables

Create a `.env.local` file in your project root with the following variables:

```env
# Database
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres

# JWT Secret (generate a strong random string)
JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-random

# Next.js
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-here

# For production, update NEXTAUTH_URL to your Vercel domain
# NEXTAUTH_URL=https://your-app-name.vercel.app
```

### Generate Secure Secrets

Use these commands to generate secure secrets:

```bash
# For JWT_SECRET
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# For NEXTAUTH_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## 3. GitHub Repository Setup

### Initialize Git Repository

```bash
# Initialize git repository
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: Work Tracker application"

# Add GitHub remote (replace with your repository URL)
git remote add origin https://github.com/yourusername/work-tracker.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### Create .gitignore

Ensure your `.gitignore` includes:

```gitignore
# Dependencies
node_modules/
.pnp
.pnp.js

# Testing
coverage/

# Next.js
.next/
out/
build/

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Vercel
.vercel

# IDE
.vscode/
.idea/

# OS
.DS_Store
Thumbs.db

# Logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Optional npm cache directory
.npm

# Optional REPL history
.node_repl_history

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity
```

## 4. Vercel Deployment

### Connect GitHub Repository

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"New Project"**
3. Import your GitHub repository
4. Select the repository you just created

### Configure Build Settings

Vercel should automatically detect Next.js settings:

- **Framework Preset**: Next.js
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`

### Environment Variables in Vercel

1. In your Vercel project dashboard, go to **Settings** > **Environment Variables**
2. Add the following environment variables:

```
DATABASE_URL = postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
JWT_SECRET = your-generated-jwt-secret
NEXTAUTH_URL = https://your-app-name.vercel.app
NEXTAUTH_SECRET = your-generated-nextauth-secret
```

**Important**: Make sure to update `NEXTAUTH_URL` with your actual Vercel domain.

### Deploy

1. Click **"Deploy"**
2. Wait for the build to complete
3. Your app will be available at `https://your-app-name.vercel.app`

## 5. Post-Deployment Setup

### Test the Application

1. Visit your deployed application
2. Register a new user account
3. Test login functionality
4. Create folders and notes
5. Verify all features work correctly

### Custom Domain (Optional)

1. In Vercel dashboard, go to **Settings** > **Domains**
2. Add your custom domain
3. Update `NEXTAUTH_URL` environment variable to use your custom domain
4. Redeploy the application

## 6. Database Management

### Supabase Dashboard

- Access your database through the Supabase dashboard
- Use the SQL Editor for queries
- Monitor database performance and usage
- Set up database backups

### Connection Pooling

For production applications, consider enabling connection pooling in Supabase:

1. Go to **Settings** > **Database**
2. Enable **Connection Pooling**
3. Use the pooled connection string in your `DATABASE_URL`

## 7. Monitoring and Maintenance

### Vercel Analytics

1. Enable Vercel Analytics in your project settings
2. Monitor application performance and usage

### Error Monitoring

Consider integrating error monitoring services like:
- Sentry
- LogRocket
- Bugsnag

### Database Monitoring

Monitor your Supabase database:
- Check connection limits
- Monitor query performance
- Set up alerts for high usage

## 8. Security Considerations

### Environment Variables

- Never commit `.env` files to version control
- Use strong, unique secrets for JWT and NextAuth
- Rotate secrets periodically

### Database Security

- Use Row Level Security (RLS) in Supabase for additional protection
- Regularly update dependencies
- Monitor for security vulnerabilities

### HTTPS

- Vercel automatically provides HTTPS
- Ensure all external API calls use HTTPS
- Set secure cookie flags in production

## 9. Troubleshooting

### Common Issues

1. **Database Connection Errors**
   - Verify DATABASE_URL is correct
   - Check Supabase project status
   - Ensure database is not paused

2. **Authentication Issues**
   - Verify JWT_SECRET is set
   - Check NEXTAUTH_URL matches your domain
   - Ensure cookies are working

3. **Build Failures**
   - Check Node.js version compatibility
   - Verify all dependencies are installed
   - Review build logs for specific errors

### Debug Mode

Enable debug logging by adding to your environment variables:
```
DEBUG=1
NODE_ENV=development
```

## 10. Backup and Recovery

### Database Backups

Supabase automatically creates backups, but you can also:
1. Export data using the Supabase dashboard
2. Set up automated backups using Supabase CLI
3. Create manual database dumps

### Code Backups

- Keep your code in GitHub
- Tag releases for easy rollback
- Maintain separate branches for development and production

---

## Quick Start Checklist

- [ ] Create Supabase project and database
- [ ] Execute SQL schema commands
- [ ] Set up GitHub repository
- [ ] Configure environment variables
- [ ] Deploy to Vercel
- [ ] Test all functionality
- [ ] Set up monitoring

For support, please check the [GitHub Issues](https://github.com/yourusername/work-tracker/issues) or contact the development team.
