#!/bin/bash

echo "🚀 Starting application setup process..."

# 1. Install dependencies
echo "📦 Installing dependencies..."
npm install 

# 2. Set up Prisma and reset database
echo "🗄️ Setting up database..."
npx prisma generate
npx prisma db push --force-reset

# 3. Initialize admin users
echo "👤 Initializing admin users..."
node scripts/initAdmins.js

# 4. Import questions data (application must be running for this)
echo "📝 Ready to import questions..."
echo "NOTE: You will need to run 'npm run import-questions' after the application is running"

# 5. Start the application
echo "🌐 Starting the application..."
npm run dev
