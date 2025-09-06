#!/bin/bash

echo "🚀 Work Tracker Deployment Script"
echo "=================================="

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "❌ Git not initialized. Run 'git init' first."
    exit 1
fi

# Check if remote origin exists
if ! git remote get-url origin > /dev/null 2>&1; then
    echo "⚠️  No remote origin found."
    echo "Please add your GitHub repository:"
    echo "git remote add origin https://github.com/yourusername/work-tracker.git"
    exit 1
fi

# Add all changes
echo "📦 Adding all changes..."
git add .

# Check if there are changes to commit
if git diff --staged --quiet; then
    echo "✅ No changes to commit."
else
    echo "💾 Committing changes..."
    git commit -m "🔄 Update: $(date '+%Y-%m-%d %H:%M:%S')"
fi

# Push to GitHub
echo "🚀 Pushing to GitHub..."
git push origin main

echo ""
echo "✅ Successfully pushed to GitHub!"
echo ""
echo "🌐 Next Steps for Deployment:"
echo "1. Go to https://vercel.com and sign in with GitHub"
echo "2. Click 'New Project' and import your work-tracker repository"
echo "3. Add environment variables (see DEPLOYMENT.md for details)"
echo "4. Deploy!"
echo ""
echo "📖 For detailed deployment guide, see DEPLOYMENT.md"
