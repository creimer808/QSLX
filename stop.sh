#!/bin/bash

# QSLX Stop Script
# Gracefully stops the QSLX application

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

# Function to check if PM2 is running the app
check_pm2_running() {
    if command_exists pm2; then
        if pm2 list | grep -q "qslx"; then
            return 0
        fi
    fi
    return 1
}

# Function to stop with PM2
stop_pm2() {
    print_info "Stopping QSLX with PM2..."
    
    # Stop gracefully (allows current requests to finish)
    pm2 stop qslx
    
    # Wait a moment for graceful shutdown
    sleep 2
    
    # Check if it's still running
    if pm2 list | grep -q "qslx.*online"; then
        print_warning "App still running, forcing stop..."
        pm2 stop qslx --update-env
    fi
    
    print_success "QSLX stopped successfully"
    print_info "Use 'pm2 start qslx' or './start.sh' to start it again"
}

# Function to stop direct npm process
stop_direct() {
    print_info "Looking for running Node.js process..."
    
    # Find the process
    PID=$(pgrep -f "next start" || pgrep -f "node.*start" || true)
    
    if [ -z "$PID" ]; then
        print_warning "No running QSLX process found"
        return 1
    fi
    
    print_info "Found process with PID: $PID"
    print_info "Sending SIGTERM for graceful shutdown..."
    
    # Send SIGTERM for graceful shutdown
    kill -TERM "$PID" 2>/dev/null || true
    
    # Wait up to 10 seconds for graceful shutdown
    for i in {1..10}; do
        if ! kill -0 "$PID" 2>/dev/null; then
            print_success "QSLX stopped gracefully"
            return 0
        fi
        sleep 1
    done
    
    # If still running, force kill
    if kill -0 "$PID" 2>/dev/null; then
        print_warning "Process didn't stop gracefully, forcing shutdown..."
        kill -KILL "$PID" 2>/dev/null || true
        print_success "QSLX stopped (forced)"
    else
        print_success "QSLX stopped gracefully"
    fi
}

# Main function
main() {
    echo ""
    echo "=========================================="
    echo "  QSLX Stop Script"
    echo "=========================================="
    echo ""
    
    # Check if PM2 is managing the app
    if check_pm2_running; then
        stop_pm2
    else
        # Try to stop direct process
        if stop_direct; then
            print_success "Application stopped"
        else
            print_warning "No running application found to stop"
        fi
    fi
    
    echo ""
}

# Run main function
main "$@"

