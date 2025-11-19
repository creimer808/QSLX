#!/bin/bash

# QSLX Deployment Script
# This script helps deploy QSLX to a production environment

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check Node.js version
check_node_version() {
    if ! command_exists node; then
        print_error "Node.js is not installed"
        print_info "Please install Node.js 18 or higher"
        print_info "For Raspberry Pi, you can use: curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash"
        exit 1
    fi

    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        print_error "Node.js version 18 or higher is required (current: $(node -v))"
        exit 1
    fi

    print_success "Node.js version: $(node -v)"
}

# Function to check npm
check_npm() {
    if ! command_exists npm; then
        print_error "npm is not installed"
        exit 1
    fi
    print_success "npm version: $(npm -v)"
}

# Function to check environment variables
check_env() {
    if [ ! -f .env ]; then
        print_warning ".env file not found"
        print_info "Creating .env file from template..."
        
        # Generate a secure SESSION_SECRET
        SESSION_SECRET=$(openssl rand -base64 32 2>/dev/null || head -c 32 /dev/urandom | base64)
        
        cat > .env << EOF
# Database
DATABASE_URL="file:./prisma/db.sqlite"

# Session Secret (auto-generated)
SESSION_SECRET="${SESSION_SECRET}"

# Node Environment
NODE_ENV="production"
EOF
        
        print_success ".env file created with auto-generated SESSION_SECRET"
        print_warning "Please review and update .env file if needed"
    else
        print_success ".env file exists"
        
        # Check if SESSION_SECRET is set
        if ! grep -q "SESSION_SECRET=" .env || grep -q "SESSION_SECRET=\"\"" .env; then
            print_warning "SESSION_SECRET is not set or is empty"
            read -p "Generate a new SESSION_SECRET? (y/n) " -n 1 -r
            echo
            if [[ $REPLY =~ ^[Yy]$ ]]; then
                SESSION_SECRET=$(openssl rand -base64 32 2>/dev/null || head -c 32 /dev/urandom | base64)
                if grep -q "SESSION_SECRET=" .env; then
                    sed -i.bak "s/SESSION_SECRET=.*/SESSION_SECRET=\"${SESSION_SECRET}\"/" .env
                else
                    echo "SESSION_SECRET=\"${SESSION_SECRET}\"" >> .env
                fi
                print_success "SESSION_SECRET generated and added to .env"
            fi
        fi
        
        # Check if DATABASE_URL is set
        if ! grep -q "DATABASE_URL=" .env; then
            print_warning "DATABASE_URL is not set in .env"
            print_info "Adding default DATABASE_URL..."
            echo 'DATABASE_URL="file:./prisma/db.sqlite"' >> .env
        fi
    fi
}

# Function to install dependencies
install_dependencies() {
    print_info "Installing dependencies..."
    npm install
    print_success "Dependencies installed"
}

# Function to build the application
build_app() {
    print_info "Building application..."
    npm run build
    print_success "Application built successfully"
}

# Function to setup database
setup_database() {
    print_info "Setting up database..."
    npm run db:push
    print_success "Database setup complete"
}

# Function to check PM2
check_pm2() {
    if command_exists pm2; then
        print_success "PM2 is installed"
        return 0
    else
        print_warning "PM2 is not installed"
        return 1
    fi
}

# Function to setup PM2
setup_pm2() {
    if check_pm2; then
        print_info "PM2 is already installed"
    else
        print_info "Installing PM2 globally..."
        print_warning "This requires administrator permissions (sudo)"
        
        # Try to install with sudo if available
        if command_exists sudo; then
            print_info "Attempting to install PM2 with sudo..."
            if sudo npm install -g pm2; then
                print_success "PM2 installed successfully"
            else
                print_error "Failed to install PM2 with sudo"
                print_info "You can install PM2 manually with:"
                print_info "  sudo npm install -g pm2"
                print_info ""
                print_info "Or install it locally (without sudo):"
                print_info "  npm install pm2"
                print_info "  Then use: npx pm2 start npm --name \"qslx\" -- start"
                print_info ""
                read -p "Continue without PM2? (y/n) " -n 1 -r
                echo
                if [[ ! $REPLY =~ ^[Yy]$ ]]; then
                    exit 1
                fi
                return 1
            fi
        else
            # Try without sudo first
            if npm install -g pm2 2>/dev/null; then
                print_success "PM2 installed successfully"
            else
                print_error "Failed to install PM2 (permission denied)"
                print_info "Please install PM2 manually with one of these options:"
                print_info ""
                print_info "Option 1 (with sudo):"
                print_info "  sudo npm install -g pm2"
                print_info ""
                print_info "Option 2 (local installation):"
                print_info "  npm install pm2"
                print_info "  npx pm2 start npm --name \"qslx\" -- start"
                print_info ""
                read -p "Continue without PM2? (y/n) " -n 1 -r
                echo
                if [[ ! $REPLY =~ ^[Yy]$ ]]; then
                    exit 1
                fi
                return 1
            fi
        fi
    fi
    
    # Verify PM2 is now available
    if ! check_pm2; then
        print_error "PM2 is not available. Cannot proceed with PM2 setup."
        return 1
    fi
    
    print_info "Starting application with PM2..."
    
    # Stop existing instance if running
    pm2 stop qslx 2>/dev/null || true
    pm2 delete qslx 2>/dev/null || true
    
    # Start the application
    pm2 start npm --name "qslx" -- start
    pm2 save
    
    print_success "Application started with PM2"
    print_info "Use 'pm2 status' to check status"
    print_info "Use 'pm2 logs qslx' to view logs"
    print_info "Use 'pm2 restart qslx' to restart"
    print_info "Use 'pm2 stop qslx' to stop"
    
    # Check if startup script is needed
    if ! pm2 startup | grep -q "already"; then
        print_info "To enable PM2 on system startup, run the command shown above"
    fi
}

# Function to start without PM2
start_direct() {
    print_info "Starting application directly..."
    print_warning "This will run in the foreground. Press Ctrl+C to stop."
    print_info "For production, consider using PM2 (run with --pm2 flag)"
    npm start
}

# Main deployment function
main() {
    echo ""
    echo "=========================================="
    echo "  QSLX Deployment Script"
    echo "=========================================="
    echo ""
    
    # Parse arguments
    USE_PM2=false
    SKIP_BUILD=false
    
    while [[ $# -gt 0 ]]; do
        case $1 in
            --pm2)
                USE_PM2=true
                shift
                ;;
            --skip-build)
                SKIP_BUILD=true
                shift
                ;;
            --help)
                echo "Usage: ./deploy.sh [OPTIONS]"
                echo ""
                echo "Options:"
                echo "  --pm2          Use PM2 to manage the process"
                echo "  --skip-build   Skip building the application"
                echo "  --help         Show this help message"
                echo ""
                exit 0
                ;;
            *)
                print_error "Unknown option: $1"
                echo "Use --help for usage information"
                exit 1
                ;;
        esac
    done
    
    # Run checks
    check_node_version
    check_npm
    check_env
    
    # Install dependencies
    install_dependencies
    
    # Build application
    if [ "$SKIP_BUILD" = false ]; then
        build_app
    else
        print_warning "Skipping build (--skip-build flag set)"
    fi
    
    # Setup database
    setup_database
    
    # Start application
    if [ "$USE_PM2" = true ]; then
        if ! setup_pm2; then
            print_warning "PM2 setup failed, starting application directly..."
            start_direct
        fi
    else
        read -p "Start application with PM2? (recommended for production) (y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            if ! setup_pm2; then
                print_warning "PM2 setup failed, starting application directly..."
                start_direct
            fi
        else
            start_direct
        fi
    fi
    
    echo ""
    print_success "Deployment complete!"
    echo ""
    print_info "Your application should be running at:"
    print_info "  - Local: http://localhost:3000"
    
    # Try to get network IP (works on Linux)
    if command_exists hostname && hostname -I >/dev/null 2>&1; then
        NETWORK_IP=$(hostname -I | awk '{print $1}')
        print_info "  - Network: http://${NETWORK_IP}:3000"
    else
        print_info "  - Network: http://<your-ip-address>:3000"
    fi
    echo ""
}

# Run main function
main "$@"

