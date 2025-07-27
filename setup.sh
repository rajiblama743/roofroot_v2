#!/bin/bash

# RoofRoot Platform Setup Script
echo "🏠 Welcome to RoofRoot Platform Setup!"
echo "======================================"

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
        print_status "Node.js found: $NODE_VERSION"
    else
        print_error "Node.js is not installed. Please install Node.js 18+ first."
        print_info "Visit: https://nodejs.org/"
        exit 1
    fi
}

# Setup Backend
setup_backend() {
    echo ""
    print_info "Setting up Backend API..."
    
    if [ -d "roofroot-backend" ]; then
        cd roofroot-backend
        
        print_info "Installing backend dependencies..."
        npm install
        
        if [ ! -f ".env" ]; then
            print_warning "Creating .env file from template..."
            cp env.example .env
            print_info "Please update .env with your MongoDB Atlas URI"
        fi
        
        print_status "Backend setup complete!"
        print_info "To start backend: cd roofroot-backend && npm run dev"
        cd ..
    else
        print_error "Backend directory not found!"
    fi
}

# Setup Web Frontend
setup_web() {
    echo ""
    print_info "Setting up Web Frontend..."
    
    if [ -d "roofroot-web" ]; then
        cd roofroot-web
        
        print_info "Installing web frontend dependencies..."
        npm install
        
        print_status "Web frontend setup complete!"
        print_info "To start web app: cd roofroot-web && npm start"
        cd ..
    else
        print_error "Web frontend directory not found!"
    fi
}

# Check for Xcode (macOS only)
check_xcode() {
    if [[ "$OSTYPE" == "darwin"* ]]; then
        if command -v xcode-select &> /dev/null; then
            print_info "Xcode found on macOS"
            print_info "To setup iOS app:"
            print_info "1. Open Xcode"
            print_info "2. Create new iOS App project named 'RoofRoot'"
            print_info "3. Use SwiftUI interface"
            print_info "4. Follow instructions in roofroot-ios/README.md"
        else
            print_warning "Xcode not found. Install Xcode from App Store for iOS development."
        fi
    else
        print_info "iOS development requires macOS with Xcode"
    fi
}

# Main setup
main() {
    echo ""
    print_info "Checking prerequisites..."
    check_node
    
    echo ""
    print_info "Starting RoofRoot platform setup..."
    
    setup_backend
    setup_web
    check_xcode
    
    echo ""
    print_status "Setup complete! 🎉"
    echo ""
    print_info "Next steps:"
    echo "1. Configure MongoDB Atlas (see DEPLOYMENT.md)"
    echo "2. Update .env files with your settings"
    echo "3. Start backend: cd roofroot-backend && npm run dev"
    echo "4. Start web app: cd roofroot-web && npm start"
    echo "5. Setup iOS app in Xcode (macOS only)"
    echo ""
    print_info "For detailed instructions, see README.md and DEPLOYMENT.md"
}

# Run main function
main 