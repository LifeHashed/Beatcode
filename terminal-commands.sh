#!/bin/bash

echo "=== Setting up LeetCode Questions Tracker ==="

# 1. Install Node.js dependencies
echo "Installing Node.js dependencies..."
npm install

# 2. Set up Prisma
echo "Setting up Prisma..."
npx prisma generate
npx prisma db push --force-reset
# This will reset your database and apply the schema

# 3. Open Prisma Studio to visually inspect your database
echo "Opening Prisma Studio..."
npx prisma studio

# 4. Install Python dependencies
echo "Installing Python dependencies..."
pip install pandas psycopg2-binary python-dotenv

# 5. Import questions using Python script
echo "Importing questions from CSV..."
python import_questions.py

# Alternative: Import using TypeScript seed
# echo "Alternative: Running TypeScript seed..."
# npm run db:seed

# 6. Start development server
echo "Starting development server..."
npm run dev

echo "=== Setup Complete! ==="
echo "Your app should be running at http://localhost:3000"
echo ""
echo "Available commands:"
echo "  npm run dev          - Start development server"
echo "  npm run db:push      - Push schema changes to database"
echo "  npm run db:seed      - Run TypeScript seed script"
echo "  python import_questions.py - Run Python import script"
