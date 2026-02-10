@echo off
echo ========================================
echo AdSphere Enterprise - Quick Start
echo ========================================
echo.

echo [1/6] Checking prerequisites...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js 18+ from https://nodejs.org/
    pause
    exit /b 1
)

npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: npm is not installed or not in PATH
    pause
    exit /b 1
)

echo ✓ Node.js and npm are available
echo.

echo [2/6] Installing dependencies...
cd /d "%~dp0"
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install root dependencies
    pause
    exit /b 1
)

cd backend
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install backend dependencies
    pause
    exit /b 1
)

cd ..\frontend
call npm install --legacy-peer-deps
if %errorlevel% neq 0 (
    echo ERROR: Failed to install frontend dependencies
    pause
    exit /b 1
)

cd ..\mobile
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install mobile dependencies
    pause
    exit /b 1
)

echo ✓ Dependencies installed successfully
echo.

echo [3/6] Setting up environment...
cd /d "%~dp0"
if not exist backend\.env (
    copy backend\.env.example backend\.env
    echo ✓ Created backend environment file
)

if not exist frontend\.env (
    copy frontend\.env.example frontend\.env
    echo ✓ Created frontend environment file
)

if not exist mobile\.env (
    copy mobile\.env.example mobile\.env
    echo ✓ Created mobile environment file
)

echo.

echo [4/6] Database Setup Instructions...
echo ========================================
echo To set up the database, you have two options:
echo.
echo OPTION 1: Docker (Recommended)
echo --------------------------------
echo 1. Start Docker Desktop
echo 2. Run: cd docker && docker-compose up -d postgres redis
echo 3. Wait for services to start (30 seconds)
echo 4. Run: cd ..\backend\shared-utils && npm run db:migrate
echo.
echo OPTION 2: Local PostgreSQL
echo -------------------------
echo 1. Install PostgreSQL 15+ from https://www.postgresql.org/download/windows/
echo 2. Create database: createdb -U postgres adsphere
echo 3. Run: cd backend\shared-utils && npm run db:migrate
echo.

echo [5/6] API Configuration Required...
echo ===================================
echo BEFORE starting the application, you MUST configure:
echo.
echo 1. AMAZON ADS API:
echo    - Get credentials from https://advertising.amazon.com/
echo    - Edit backend\.env and add AMAZON_CLIENT_ID, AMAZON_CLIENT_SECRET, etc.
echo.
echo 2. WALMART ADS API:
echo    - Get credentials from https://developer.walmart.com/
echo    - Edit backend\.env and add WALMART_CLIENT_ID, WALMART_CLIENT_SECRET, etc.
echo.
echo See CONFIGURE_API_KEYS.md for detailed instructions
echo.

echo [6/6] Starting the Application...
echo ==================================
echo After database and API setup:
echo.
echo Start all services:
echo   npm run dev
echo.
echo Or start individually:
echo   npm run dev:backend  (Ports 8000-8006)
echo   npm run dev:frontend (Port 3000)
echo.
echo Access URLs:
echo   Web App: http://localhost:3000
echo   API Docs: http://localhost:8000/api/docs
echo.

echo ========================================
echo Setup complete! Next steps:
echo 1. Start Docker Desktop
echo 2. Set up database (see instructions above)
echo 3. Configure API keys (see CONFIGURE_API_KEYS.md)
echo 4. Start the application
echo ========================================
echo.
pause
