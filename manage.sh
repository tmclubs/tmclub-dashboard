#!/bin/bash

# TMC Frontend Management Script
# This script helps manage the TMC Frontend project with Bun

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Project configuration
PROJECT_NAME="TMC Frontend"
PORT=5173

# Cleanup function to kill processes on port
cleanup_port() {
    local port_to_clean=$1
    if [ -n "$port_to_clean" ]; then
        echo -e "${YELLOW}🛑 Cleaning up processes on port $port_to_clean...${NC}"
        local pids=$(lsof -ti:$port_to_clean 2>/dev/null || true)
        if [ -n "$pids" ]; then
            echo -e "${YELLOW}Killing processes: $pids${NC}"
            kill -9 $pids 2>/dev/null || true
            echo -e "${GREEN}✅ Port $port_to_clean cleaned up${NC}"
        else
            echo -e "${BLUE}ℹ️  No processes found on port $port_to_clean${NC}"
        fi
    fi
}

# Signal trap for cleanup
trap cleanup_and_exit SIGINT SIGTERM

cleanup_and_exit() {
    echo -e "\n${YELLOW}🛑 Interrupt received. Cleaning up...${NC}"
    cleanup_port $PORT
    echo -e "${GREEN}✅ Cleanup completed. Exiting.${NC}"
    exit 0
}

# Helper functions
print_header() {
    echo -e "${BLUE}"
    echo "┌─────────────────────────────────────────────────────────────────┐"
    echo "│                $PROJECT_NAME Management Script                │"
    echo "└─────────────────────────────────────────────────────────────────┘"
    echo -e "${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

check_bun() {
    if ! command -v bun &> /dev/null; then
        print_error "Bun is not installed. Please install Bun first:"
        echo "curl -fsSL https://bun.sh/install | bash"
        exit 1
    fi
}

check_dependencies() {
    if [ ! -f "package.json" ]; then
        print_error "package.json not found. Please run this script from the project root."
        exit 1
    fi
}

check_docker() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi

    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
}

# Menu functions
install_deps() {
    print_header
    print_info "Installing dependencies with Bun..."

    check_bun
    check_dependencies

    bun install
    print_success "Dependencies installed successfully!"
}

start_dev() {
    print_header
    print_info "Starting development server on port $PORT..."

    check_bun
    check_dependencies

    # Clean up any existing processes on the port first
    cleanup_port $PORT

    print_info "Press Ctrl+C to stop the server and clean up port $PORT"

    if [ -z "$1" ] || [ "$1" = "--open" ]; then
        bun run dev -- --open --host
    else
        bun run dev -- --host
    fi
}

stop_dev() {
    print_header
    print_info "Stopping development server on port $PORT..."

    cleanup_port $PORT

    print_success "Development server stopped!"
}

build_project() {
    print_header
    print_info "Building project for production..."

    check_bun
    check_dependencies

    bun run build
    print_success "Build completed! Files are in ./dist/"
}

preview_build() {
    print_header
    print_info "Previewing production build on port $PORT..."

    if [ ! -d "dist" ]; then
        print_error "Build directory not found. Please build the project first:"
        echo "./manage.sh build"
        exit 1
    fi

    bun run preview
}

lint_code() {
    print_header
    print_info "Running ESLint..."

    check_bun
    check_dependencies

    bun run lint
    print_success "Linting completed!"
}

lint_fix() {
    print_header
    print_info "Running ESLint with auto-fix..."

    check_bun
    check_dependencies

    bun run lint:fix
    print_success "Linting and auto-fix completed!"
}

format_code() {
    print_header
    print_info "Formatting code with Prettier..."

    check_bun
    check_dependencies

    bun run format
    print_success "Code formatted successfully!"
}

type_check() {
    print_header
    print_info "Running TypeScript type checking..."

    check_bun
    check_dependencies

    bun run type-check
    print_success "Type checking completed!"
}

clean_project() {
    print_header
    print_warning "Cleaning project..."

    # Remove node_modules
    if [ -d "node_modules" ]; then
        rm -rf node_modules
        print_success "Removed node_modules/"
    fi

    # Remove dist
    if [ -d "dist" ]; then
        rm -rf dist
        print_success "Removed dist/"
    fi

    # Remove bun.lockb
    if [ -f "bun.lockb" ]; then
        rm -f bun.lockb
        print_success "Removed bun.lockb"
    fi

    # Remove logs
    find . -name "*.log" -type f -delete 2>/dev/null || true
    print_success "Cleaned log files"

    print_success "Project cleaned successfully!"
}

reset_project() {
    print_header
    print_warning "Resetting project (clean + fresh install)..."

    clean_project
    install_deps

    print_success "Project reset completed!"
}

# Docker functions
docker_build() {
    print_header
    print_info "Building Docker image..."

    check_docker

    docker build -t tmc-frontend:latest .
    print_success "Docker image built successfully!"
}

docker_dev() {
    print_header
    print_info "Starting Docker development container..."

    check_docker

    docker-compose up tmc-frontend-dev -d
    print_success "Development container started!"
    print_info "App is running at http://localhost:5173"
    print_info "View logs with: ./manage.sh docker-logs"
}

docker_prod() {
    print_header
    print_info "Starting Docker production container..."

    check_docker

    docker-compose --profile production up -d
    print_success "Production container started!"
    print_info "App is running at http://localhost:8082"
}

docker_down() {
    print_header
    print_info "Stopping and removing Docker containers..."

    check_docker

    docker-compose down
    print_success "Docker containers stopped and removed!"
}

docker_stop() {
    print_header
    print_info "Stopping Docker containers..."

    check_docker

    docker-compose stop
    print_success "Docker containers stopped!"
}

docker_logs() {
    print_header
    print_info "Showing Docker container logs..."

    check_docker

    docker-compose logs -f
}

docker_clean() {
    print_header
    print_warning "Cleaning Docker resources..."

    check_docker

    docker-compose down -v
    docker system prune -f
    docker volume prune -f
    print_success "Docker resources cleaned!"
}

docker_deploy() {
    print_header
    print_info "Deploying to production with Docker..."

    check_docker

    docker build -t tmc-frontend:latest .
    docker-compose --profile production up -d
    print_success "Production deployment complete!"
    print_info "App is running at http://localhost:8082"
}

show_status() {
    print_header

    echo "📊 Project Status:"
    echo ""

    # Check if bun is installed
    if command -v bun &> /dev/null; then
        BUN_VERSION=$(bun --version)
        echo "🟢 Bun: $BUN_VERSION"
    else
        echo "🔴 Bun: Not installed"
    fi

    # Check if dependencies are installed
    if [ -d "node_modules" ]; then
        echo "🟢 Dependencies: Installed"
    else
        echo "🔴 Dependencies: Not installed"
    fi

    # Check if build exists
    if [ -d "dist" ]; then
        BUILD_SIZE=$(du -sh dist 2>/dev/null | cut -f1)
        echo "🟢 Build: Available ($BUILD_SIZE)"
    else
        echo "🔴 Build: Not available"
    fi

    # Check git status
    if command -v git &> /dev/null && [ -d ".git" ]; then
        if git diff-index --quiet HEAD --; then
            echo "🟢 Git: Clean working directory"
        else
            echo "🟡 Git: Uncommitted changes"
        fi
    else
        echo "⚪ Git: Not a git repository"
    fi

    echo ""
    echo "📁 Project Structure:"
    echo "├── src/"
    echo "│   ├── components/"
    echo "│   ├── pages/"
    echo "│   ├── lib/"
    echo "│   └── types/"
    echo "├── public/"
    echo "├── docs/"
    echo "└── dist/ (generated)"

    echo ""
    echo "🔗 Useful Links:"
    echo "• Development Server: http://localhost:$PORT"
    echo "• Documentation: ./docs/"
    echo "• API Endpoint: http://localhost:8000"
}

show_help() {
    print_header

    echo "📖 Available Commands:"
    echo ""
    echo "📦 Package Management:"
    echo "  install      Install dependencies"
    echo "  clean        Remove node_modules, dist, and caches"
    echo "  reset        Clean project and reinstall dependencies"
    echo ""
    echo "🚀 Development:"
    echo "  dev          Start development server"
    echo "  dev --open   Start dev server and open browser"
    echo ""
    echo "🏗️  Build & Preview:"
    echo "  build        Build for production"
    echo "  preview      Preview production build"
    echo ""
    echo "🔍 Code Quality:"
    echo "  lint         Run ESLint"
    echo "  lint:fix     Run ESLint with auto-fix"
    echo "  format       Format code with Prettier"
    echo "  type-check   Run TypeScript type checking"
    echo ""
    echo "📊 Information:"
    echo "  status       Show project status"
    echo "  help         Show this help message"
    echo ""
    echo "💡 Examples:"
    echo "  ./manage.sh install"
    echo "  ./manage.sh dev"
    echo "  ./manage.sh build"
    echo "  ./manage.sh lint:fix"
    echo ""
    echo "🐳 Docker Commands:"
    echo "  docker-build Build Docker image"
    echo "  docker-dev   Start development container"
    echo "  docker-prod  Start production container"
    echo "  docker-deploy Deploy to production"
    echo "  docker-down  Stop and remove containers"
    echo "  docker-stop  Stop containers"
    echo "  docker-logs  Show container logs"
    echo "  docker-clean Clean Docker resources"
    echo ""
    echo "🔍 Code Quality:"
    echo "  lint         Run ESLint"
    echo "  lint:fix     Run ESLint with auto-fix"
    echo "  format       Format code with Prettier"
    echo "  type-check   Run TypeScript type checking"
    echo ""
    echo "📊 Information:"
    echo "  status       Show project status"
    echo "  help         Show this help message"
    echo ""
    echo "💡 Examples:"
    echo "  ./manage.sh install"
    echo "  ./manage.sh dev"
    echo "  ./manage.sh build"
    echo "  ./manage.sh docker-dev"
    echo "  ./manage.sh docker-prod"
    echo "  ./manage.sh lint:fix"
    echo ""
    echo "🔧 Environment:"
    echo "• Make sure Bun is installed: curl -fsSL https://bun.sh/install | bash"
    echo "• Make sure Docker is installed for container commands"
    echo "• Backend API should be running on http://localhost:8000"
}

# Main script logic
case "${1:-help}" in
    "install")
        install_deps
        ;;
    "dev")
        start_dev "$2"
        ;;
    "build")
        build_project
        ;;
    "preview")
        preview_build
        ;;
    "lint")
        lint_code
        ;;
    "lint:fix")
        lint_fix
        ;;
    "format")
        format_code
        ;;
    "type-check")
        type_check
        ;;
    "clean")
        clean_project
        ;;
    "reset")
        reset_project
        ;;
    "status")
        show_status
        ;;
    "docker-build")
        docker_build
        ;;
    "docker-dev")
        docker_dev
        ;;
    "docker-prod")
        docker_prod
        ;;
    "docker-deploy")
        docker_deploy
        ;;
    "docker-down")
        docker_down
        ;;
    "docker-stop")
        docker_stop
        ;;
    "docker-logs")
        docker_logs
        ;;
    "docker-clean")
        docker_clean
        ;;
    "help"|*)
        show_help
        ;;
esac