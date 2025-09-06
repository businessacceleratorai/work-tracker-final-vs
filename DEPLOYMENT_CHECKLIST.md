# 🚀 Vercel Deployment Checklist

## Pre-Deployment Setup ✅

- [ ] **GitHub Repository**: Code pushed to https://github.com/businessacceleratorai/work-tracker-final-vs
- [ ] **Database Ready**: Supabase project created and database schema deployed
- [ ] **Environment Variables**: JWT_SECRET and DATABASE_URL prepared

## Vercel Deployment Steps 📋

### 1. Import Project to Vercel
- [ ] Go to [vercel.com](https://vercel.com) and sign in
- [ ] Click "New Project"
- [ ] Import from GitHub: `businessacceleratorai/work-tracker-final-vs`
- [ ] Select the repository and click "Import"

### 2. Configure Environment Variables
In Vercel project settings, add these environment variables:

- [ ] `DATABASE_URL` = `postgresql://postgres.[ref]:[password]@aws-0-us-west-1.pooler.supabase.com:6543/postgres`
- [ ] `JWT_SECRET` = `[generate 32+ character random string]`
- [ ] `NEXTAUTH_URL` = `https://[your-app].vercel.app`
- [ ] `NEXTAUTH_SECRET` = `[another random string]`
- [ ] `NODE_ENV` = `production` (usually set automatically)

### 3. Deploy!
- [ ] Click "Deploy" in Vercel
- [ ] Wait for build to complete (~2-3 minutes)
- [ ] Visit your live app URL

### 4. Post-Deployment Testing
- [ ] **Registration**: Create a new user account
- [ ] **Login**: Test authentication flow
- [ ] **Notes**: Create folders and notes
- [ ] **Tasks**: Add and complete tasks
- [ ] **Timers**: Start and stop timers
- [ ] **Reminders**: Set reminders

### 5. Database Schema Setup
Run this SQL in your Supabase SQL Editor:

```sql
-- Copy the complete schema from VERCEL_SETUP.md
-- Or run each table creation individually
```

## Quick Generate Commands 🔧

**Generate JWT Secret:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Generate NextAuth Secret:**
```bash
openssl rand -base64 32
```

## Environment Variables Template 📝

```env
DATABASE_URL=postgresql://postgres.[ref]:[password]@aws-0-us-west-1.pooler.supabase.com:6543/postgres
JWT_SECRET=abcdef123456789abcdef123456789abcdef123456789abcdef123456789
NEXTAUTH_URL=https://work-tracker-final-vs.vercel.app
NEXTAUTH_SECRET=your-nextauth-secret-here
```

## Troubleshooting 🔍

### Build Fails?
- [ ] Check TypeScript errors in Vercel logs
- [ ] Verify all dependencies in package.json
- [ ] Check environment variables are set

### Database Connection Error?
- [ ] Verify DATABASE_URL format is correct
- [ ] Check Supabase project is active
- [ ] Ensure database schema is deployed
- [ ] Test connection from Supabase SQL editor

### Authentication Not Working?
- [ ] Verify JWT_SECRET is set and long enough
- [ ] Check NEXTAUTH_URL matches your domain
- [ ] Ensure cookies are working in production

## Success! 🎉

Your Work Tracker app should now be live at:
**https://[your-app].vercel.app**

### Next Steps:
1. **Custom Domain**: Add your domain in Vercel settings
2. **Analytics**: Enable Vercel Analytics
3. **Monitoring**: Set up error tracking
4. **Users**: Share with your team/users

---
**Need Help?** Check the full guide in `VERCEL_SETUP.md`