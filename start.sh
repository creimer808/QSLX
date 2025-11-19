#!/bin/bash

# QSLX Start Script
# Starts the QSLX application

set -e

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

# Function to check if PM2 is installed
check_pm2() {
    if command_exists pm2; then
        return 0
    fi
    return 1
}

# Function to check if app is already running
check_running() {
    # Check PM2
    if check_pm2; then
        if pm2 list | grep -q "qslx.*online"; then
            return 0
        fi
    fi
    
    # Check direct process
    if pgrep -f "next start" >/dev/null 2>&1 || pgrep -f "node.*start" >/dev/null 2>&1; then
        return 0
    fi
    
    return 1
}

# Function to start with PM2
start_pm2() {
    print_info "Starting QSLX with PM2..."
    
    # Check if already running
    if pm2 list | grep -q "qslx.*online"; then
        print_warning "QSLX is already running with PM2"
        print_info "Use 'pm2 restart qslx' to restart, or './stop.sh' to stop it first"
        return 0
    fi
    
    # Check if stopped but exists
    if pm2 list | grep -q "qslx"; then
        print_info "Restarting existing PM2 process..."
        pm2 restart qslx
    else
        print_info "Starting new PM2 process..."
        pm2 start npm --name "qslx" -- start
        pm2 save
    fi
    
    # Wait a moment for startup
    sleep 2
    
    # Check status
    if pm2 list | grep -q "qslx.*online"; then
        print_success "QSLX started successfully with PM2"
        print_info "Use 'pm2 status' to check status"
        print_info "Use 'pm2 logs qslx' to view logs"
    else
        print_error "Failed to start QSLX with PM2"
        print_info "Check logs with: pm2 logs qslx"
        return 1
    fi
}

# Function to start directly
start_direct() {
    print_info "Starting QSLX directly..."
    
    # Check if already running
    if pgrep -f "next start" >/dev/null 2>&1; then
        print_warning "QSLX appears to already be running"
        print_info "Use './stop.sh' to stop it first"
        return 0
    fi
    
    # Check if .env exists
    if [ ! -f .env ]; then
        print_error ".env file not found"
        print_info "Please create a .env file before starting"
        return 1
    fi
    
    # Check if built
    if [ ! -d ".next" ]; then
        print_warning ".next directory not found - application may not be built"
        read -p "Build the application now? (y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            print_info "Building application..."
            npm run build
        else
            print_error "Cannot start without building first"
            return 1
        fi
    fi
    
    print_info "Starting application in background..."
    nohup npm start > qslx.log 2>&1 &
    
    # Wait a moment
    sleep 2
    
    # Check if started
    if pgrep -f "next start" >/dev/null 2>&1; then
        print_success "QSLX started successfully"
        print_info "Logs are being written to: qslx.log"
        print_info "Use 'tail -f qslx.log' to follow logs"
        print_info "Use './stop.sh' to stop the application"
    else
        print_error "Failed to start QSLX"
        print_info "Check qslx.log for error messages"
        return 1
    fi
}

# Main function
main() {
    echo ""
    echo "=========================================="
    echo "  QSLX Start Script"
    echo "=========================================="
    echo ""
    
    # Check if already running
    if check_running; then
        print_warning "QSLX appears to already be running"
        print_info "Use './stop.sh' to stop it first, or check with 'pm2 status'"
        exit 0
    fi
    
    # Parse arguments
    USE_PM2=false
    FORCE_DIRECT=false
    
    while [[ $# -gt 0 ]]; do
        case $1 in
            --pm2)
                USE_PM2=true
                shift
                ;;
            --direct)
                FORCE_DIRECT=true
                shift
                ;;
            --help)
                echo "Usage: ./start.sh [OPTIONS]"
                echo ""
                echo "Options:"
                echo "  --pm2      Force use of PM2"
                echo "  --direct   Force direct start (no PM2)"
                echo "  --help     Show this help message"
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
    
    # Determine how to start
    if [ "$FORCE_DIRECT" = true ]; then
        start_direct
    elif [ "$USE_PM2" = true ]; then
        if check_pm2; then
            start_pm2
        else
            print_error "PM2 is not installed"
            print_info "Install with: sudo npm install -g pm2"
            print_info "Or use: ./start.sh --direct"
            exit 1
        fi
    elif check_pm2; then
        # PM2 available, ask user
        read -p "Start with PM2? (recommended) (y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            start_pm2
        else
            start_direct
        fi
    else
        # No PM2, start directly
        start_direct
    fi
    
    echo ""
    print_info "Your application should be accessible at:"
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

