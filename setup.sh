#!/bin/bash

# 🚀 Vendorify Project Setup Script
# This script automates the initial setup process

set -e  # Exit on any error

echo "🚀 Welcome to Vendorify Setup!"
echo "================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check if Node.js is installed
check_node() {
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version)
        print_status "Node.js is installed: $NODE_VERSION"
        
        # Check if version is 18 or higher
        NODE_MAJOR=$(echo $NODE_VERSION | cut -d'.' -f1 | sed 's/v//')
        if [ "$NODE_MAJOR" -lt 18 ]; then
            print_warning "Node.js version 18+ is recommended. Current: $NODE_VERSION"
        fi
    else
        print_error "Node.js is not installed. Please install Node.js 18+ from https://nodejs.org/"
        exit 1
    fi
}

# Check if MongoDB is installed
check_mongodb() {
    if command -v mongod &> /dev/null; then
        MONGO_VERSION=$(mongod --version | head -n1)
        print_status "MongoDB is installed: $MONGO_VERSION"
    else
        print_warning "MongoDB not found. Please install MongoDB 5+ from https://www.mongodb.com/try/download/community"
        print_info "You can also use MongoDB Atlas (cloud) by updating the MONGODB_URI in .env"
    fi
}

# Install dependencies
install_dependencies() {
    print_info "Installing client dependencies..."
    cd client
    npm install
    cd ..
    
    print_info "Installing server dependencies..."
    cd server
    npm install
    cd ..
    
    print_status "Dependencies installed successfully!"
}

# Setup environment variables
setup_env() {
    print_info "Setting up environment variables..."
    
    if [ ! -f "server/.env" ]; then
        cat > server/.env << EOL
# Database Configuration
MONGODB_URI=mongodb://127.0.0.1:27017/vendorify

# Authentication
JWT_SECRET=$(openssl rand -base64 32)
JWT_EXPIRES_IN=7d

# Server Configuration
PORT=5001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# Optional: AI Integration (Google AI)
# GOOGLE_AI_API_KEY=your-google-ai-api-key-here

# Optional: File Upload Configuration
MAX_FILE_SIZE=5MB
UPLOAD_PATH=./uploads
EOL
        print_status "Environment file created at server/.env"
    else
        print_warning "Environment file already exists at server/.env"
    fi
}

# Initialize database
init_database() {
    print_info "Initializing database with test data..."
    cd server
    
    # Check if MongoDB is running
    if ! pgrep -x "mongod" > /dev/null; then
        print_warning "MongoDB doesn't appear to be running."
        print_info "Please start MongoDB manually or use MongoDB Atlas"
        print_info "To start MongoDB locally: sudo systemctl start mongod (Linux) or brew services start mongodb/brew/mongodb-community (Mac)"
    fi
    
    # Try to initialize database
    if npm run init-db; then
        print_status "Database initialized successfully!"
        print_info "Test accounts created:"
        echo "  👨‍💼 Admin: admin@vendorify.com / admin123456"
        echo "  🛍️  Customer: customer@test.com / customer123"
        echo "  🏪 Vendor: vendor@test.com / vendor123"
    else
        print_error "Database initialization failed. Please check MongoDB connection."
    fi
    
    cd ..
}

# Verify setup
verify_setup() {
    print_info "Verifying setup..."
    cd server
    
    if npm run verify; then
        print_status "Setup verification completed successfully!"
    else
        print_warning "Setup verification had some issues. Check the output above."
    fi
    
    cd ..
}

# Create useful directories
create_directories() {
    print_info "Creating project directories..."
    
    mkdir -p screenshots
    mkdir -p assets/logo
    mkdir -p server/uploads/shops
    mkdir -p server/uploads/products
    
    print_status "Project directories created!"
}

# Main setup function
main() {
    echo
    print_info "Starting Vendorify project setup..."
    echo
    
    # Pre-flight checks
    check_node
    check_mongodb
    echo
    
    # Setup steps
    install_dependencies
    echo
    
    setup_env
    echo
    
    create_directories
    echo
    
    init_database
    echo
    
    verify_setup
    echo
    
    # Final instructions
    echo "🎉 Setup completed successfully!"
    echo
    echo "📋 Next steps:"
    echo "1. Start the backend server:"
    echo "   cd server && npm run dev"
    echo
    echo "2. In a new terminal, start the frontend:"
    echo "   cd client && npm start"
    echo
    echo "3. Open your browser and visit:"
    echo "   🌐 Frontend: http://localhost:3000"
    echo "   🔌 Backend API: http://localhost:5001"
    echo
    echo "4. Login with test accounts:"
    echo "   🛍️  Customer: customer@test.com / customer123"
    echo "   🏪 Vendor: vendor@test.com / vendor123"
    echo
    echo "📖 For more information, check the README.md file"
    echo "🐛 If you encounter issues, please check the troubleshooting section"
    echo
    print_status "Happy coding! 🚀"
}

# Run main function
main