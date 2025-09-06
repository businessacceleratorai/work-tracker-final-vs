# 🔐 Environment Variables Import Guide

## How to Import .env to Vercel

### Method 1: Upload .env file (Easiest)
1. Go to your Vercel project dashboard
2. Click on **Settings** tab
3. Click on **Environment Variables** in the left sidebar
4. Click **"Import .env file"** button
5. Upload the `.env` file from this directory
6. Click **Save**

### Method 2: Copy/Paste Individual Variables
Copy these environment variables to your Vercel project settings:

```
DATABASE_URL=postgresql://postgres.vdbtqbhyxjwdglpttjwa:Jahid.1996@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres

JWT_SECRET=MLTwwVeuiTlOGjnJInOvQ1T1Pkz88rmumZuhjbFfHb5HOT+9HIcHrxJHuEdZVgMBefFuSQu/03q2Q5CNos1SsA==

NEXTAUTH_URL=https://work-tracker-final-vs.vercel.app

NEXTAUTH_SECRET=MLTwwVeuiTlOGjnJInOvQ1T1Pkz88rmumZuhjbFfHb5HOT+9HIcHrxJHuEdZVgMBefFuSQu/03q2Q5CNos1SsA==
```

### Method 3: Using Vercel CLI (Advanced)
```bash
# Install Vercel CLI if not already installed
npm i -g vercel

# Link your project
vercel link

# Add environment variables from .env file
vercel env add
```

## ⚠️ Security Note
- The `.env` file is already in `.gitignore` and will NOT be pushed to GitHub
- Keep your environment variables secure
- Never commit sensitive data to version control

## 🚀 After Setting Environment Variables
1. Redeploy your project in Vercel
2. Run the database schema in Supabase
3. Test your deployed application

Your Work Tracker app will be live at:
**https://work-tracker-final-vs.vercel.app**