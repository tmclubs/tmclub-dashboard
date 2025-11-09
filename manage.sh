#!/bin/bash

# TMC Frontend Management Script
# This script helps manage the TMC Frontend project with npm (Vite)

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
    # Repurpose to check Node & npm availability
    if ! command -v node &> /dev/null || ! command -v npm &> /dev/null; then
        print_error "Node.js atau npm belum terpasang. Mohon install terlebih dahulu."
        echo "macOS (Homebrew): brew install node"
        echo "Atau unduh dari: https://nodejs.org/"
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

# Read env var from .env or use default
get_env_var() {
    local var_name="$1"
    local default_value="$2"
    local value="$default_value"
    if [ -f ".env" ]; then
        local found=$(grep -E "^${var_name}=" .env | tail -n 1 | cut -d '=' -f2-)
        if [ -n "$found" ]; then
            value="$found"
        fi
    fi
    echo "$value"
}

# Prompt to kill processes on a given port if in use (respecting confirmation)
prompt_port_cleanup_if_busy() {
    local port="$1"
    local label="${2:-Port}"
    if lsof -ti:"$port" >/dev/null 2>&1; then
        print_warning "${label} (port ${port}) sedang digunakan."
        echo -n "Anda ingin kill proses pada port ${port}? [y/N]: "
        read -r ans
        if [[ "$ans" == "y" || "$ans" == "Y" ]]; then
            cleanup_port "$port"
        else
            print_error "${label} (port ${port}) masih digunakan. Ubah NGINX_PORT/APP_PORT atau bebaskan port tersebut."
            exit 1
        fi
    fi
}

# Menu functions
install_deps() {
    print_header
    print_info "Menginstal dependencies dengan npm..."

    check_bun
    check_dependencies

    if [ -f "package-lock.json" ]; then
        npm ci
    else
        npm install
    fi
    print_success "Dependencies berhasil diinstal!"
}

start_dev() {
    print_header
    print_info "Menjalankan development server di port $PORT..."

    check_bun
    check_dependencies

    # Bersihkan proses pada port bila ada
    cleanup_port $PORT

    print_info "Tekan Ctrl+C untuk menghentikan server dan membersihkan port $PORT"

    if [ -z "$1" ] || [ "$1" = "--open" ]; then
        npm run dev -- --open --host
    else
        npm run dev -- --host
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
    print_info "Build project untuk produksi..."

    check_bun
    check_dependencies

    npm run build
    print_success "Build selesai! File berada di ./dist/"
}

preview_build() {
    print_header
    print_info "Preview build produksi pada port $PORT..."

    if [ ! -d "dist" ]; then
        print_error "Direktori build tidak ditemukan. Silakan build terlebih dahulu:"
        echo "./manage.sh build"
        exit 1
    fi

    npm run preview
}

lint_code() {
    print_header
    print_info "Menjalankan ESLint..."

    check_bun
    check_dependencies

    npm run lint
    print_success "Linting selesai!"
}

lint_fix() {
    print_header
    print_info "Menjalankan ESLint dengan auto-fix..."

    check_bun
    check_dependencies

    npm run lint:fix
    print_success "Linting dan perbaikan otomatis selesai!"
}

format_code() {
    print_header
    print_info "Memformat kode dengan Prettier..."

    check_bun
    check_dependencies

    npm run format
    print_success "Kode berhasil diformat!"
}

type_check() {
    print_header
    print_info "Menjalankan TypeScript type-checking..."

    check_bun
    check_dependencies

    npm run type-check
    print_success "Type checking selesai!"
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

    # Check ports from .env with defaults
    local nginx_port
    nginx_port=$(get_env_var "NGINX_PORT" "")
    if [ -z "$nginx_port" ]; then
        nginx_port=$(get_env_var "NGINX_HTTP_PORT" "8080")
    fi
    print_info "Memeriksa port: Nginx ${nginx_port}"
    prompt_port_cleanup_if_busy "$nginx_port" "Nginx"
    
    COMPOSE_DOCKER_CLI_BUILD=0 DOCKER_BUILDKIT=0 docker-compose up -d --build nginx
    print_success "Production container started!"
    print_info "App tersedia via Nginx di http://localhost:${nginx_port}"
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
    print_info "Deploying with Docker (production setup)..."

    check_docker

    # Check ports from .env with defaults
    local nginx_port
    nginx_port=$(get_env_var "NGINX_PORT" "")
    if [ -z "$nginx_port" ]; then
        nginx_port=$(get_env_var "NGINX_HTTP_PORT" "8080")
    fi
    print_info "Memeriksa port: Nginx ${nginx_port}"
    prompt_port_cleanup_if_busy "$nginx_port" "Nginx"
    
    COMPOSE_DOCKER_CLI_BUILD=0 DOCKER_BUILDKIT=0 docker-compose up -d --build nginx
    print_success "Deployment complete!"
    print_info "App tersedia via Nginx di http://localhost:${nginx_port}"
}

show_status() {
    print_header

    echo "📊 Project Status:"
    echo ""

    # Check Node & npm
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version)
        echo "🟢 Node: $NODE_VERSION"
    else
        echo "🔴 Node: Not installed"
    fi

    if command -v npm &> /dev/null; then
        NPM_VERSION=$(npm --version)
        echo "🟢 npm: $NPM_VERSION"
    else
        echo "🔴 npm: Not installed"
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
    echo "• Pastikan Node.js & npm terpasang, atau gunakan Docker untuk deploy"
    echo "• Pastikan Docker terpasang untuk perintah container"
    echo "• Setel port Nginx via env: NGINX_PORT atau NGINX_HTTP_PORT"
    echo "• Backend API sebaiknya berjalan di http://localhost:8000"
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