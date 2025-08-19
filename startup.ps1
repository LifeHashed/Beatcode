Write-Host "=== Starting application setup process ===" -ForegroundColor Cyan

# 1. Install dependencies
Write-Host "[1/5] Installing dependencies..." -ForegroundColor Yellow
npm install

# 2. Set up Prisma and reset database
Write-Host "[2/5] Setting up database..." -ForegroundColor Yellow
npx prisma generate
npx prisma db push --force-reset

# 3. Initialize admin users
Write-Host "[3/5] Initializing admin users..." -ForegroundColor Yellow
node scripts/initAdmins.js

# 4. Import questions data (manual step after app starts)
Write-Host "[4/5] Ready to import questions..." -ForegroundColor Yellow
Write-Host "NOTE: Run 'npm run import-questions' after the application is running" -ForegroundColor Red

# 5. Start the application
Write-Host "[5/5] Starting the application..." -ForegroundColor Green
npm run dev
