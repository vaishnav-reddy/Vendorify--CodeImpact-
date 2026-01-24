@echo off
setlocal enabledelayedexpansion

REM 🚀 Vendorify Project Setup Script (Windows)
REM This script automates the initial setup process

echo 🚀 Welcome to Vendorify Setup!
echo ================================
echo.

REM Check if Node.js is installed
echo ℹ️  Checking Node.js installation...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js 18+ from https://nodejs.org/
    pause
    exit /b 1
) else (
    for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
    echo ✅ Node.js is installed: !NODE_VERSION!
)

REM Check if npm is available
echo ℹ️  Checking npm...
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm is not available
    pause
    exit /b 1
) else (
    echo ✅ npm is available
)

echo.

REM Install client dependencies
echo ℹ️  Installing client dependencies...
cd client
call npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install client dependencies
    pause
    exit /b 1
)
cd ..
echo ✅ Client dependencies installed!

echo.

REM Install server dependencies
echo ℹ️  Installing server dependencies...
cd server
call npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install server dependencies
    pause
    exit /b 1
)
echo ✅ Server dependencies installed!

echo.

REM Setup environment variables
echo ℹ️  Setting up environment variables...
if not exist ".env" (
    (
        echo # Database Configuration
        echo MONGODB_URI=mongodb://127.0.0.1:27017/vendorify
        echo.
        echo # Authentication
        echo JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
        echo JWT_EXPIRES_IN=7d
        echo.
        echo # Server Configuration
        echo PORT=5001
        echo NODE_ENV=development
        echo FRONTEND_URL=http://localhost:3000
        echo.
        echo # Optional: AI Integration
        echo # GOOGLE_AI_API_KEY=your-google-ai-api-key-here
    ) > .env
    echo ✅ Environment file created at server/.env
) else (
    echo ⚠️  Environment file already exists at server/.env
)

echo.

REM Create directories
echo ℹ️  Creating project directories...
if not exist "..\screenshots" mkdir "..\screenshots"
if not exist "..\assets" mkdir "..\assets"
if not exist "..\assets\logo" mkdir "..\assets\logo"
if not exist "uploads" mkdir "uploads"
if not exist "uploads\shops" mkdir "uploads\shops"
if not exist "uploads\products" mkdir "uploads\products"
echo ✅ Project directories created!

echo.

REM Initialize database
echo ℹ️  Initializing database with test data...
call npm run init-db
if %errorlevel% neq 0 (
    echo ⚠️  Database initialization failed. Please check MongoDB connection.
    echo ℹ️  Make sure MongoDB is running or use MongoDB Atlas
) else (
    echo ✅ Database initialized successfully!
    echo ℹ️  Test accounts created:
    echo   👨‍💼 Admin: admin@vendorify.com / admin123456
    echo   🛍️  Customer: customer@test.com / customer123
    echo   🏪 Vendor: vendor@test.com / vendor123
)

echo.

REM Verify setup
echo ℹ️  Verifying setup...
call npm run verify
if %errorlevel% neq 0 (
    echo ⚠️  Setup verification had some issues. Check the output above.
) else (
    echo ✅ Setup verification completed successfully!
)

cd ..

echo.
echo 🎉 Setup completed successfully!
echo.
echo 📋 Next steps:
echo 1. Start the backend server:
echo    cd server ^&^& npm run dev
echo.
echo 2. In a new terminal, start the frontend:
echo    cd client ^&^& npm start
echo.
echo 3. Open your browser and visit:
echo    🌐 Frontend: http://localhost:3000
echo    🔌 Backend API: http://localhost:5001
echo.
echo 4. Login with test accounts:
echo    🛍️  Customer: customer@test.com / customer123
echo    🏪 Vendor: vendor@test.com / vendor123
echo.
echo 📖 For more information, check the README.md file
echo 🐛 If you encounter issues, please check the troubleshooting section
echo.
echo ✅ Happy coding! 🚀

pause