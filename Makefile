# TMC Frontend Makefile
# Toyota Manufacturers Club - React + TypeScript + Vite Application

.PHONY: help install dev build preview clean docker-build docker-up docker-down docker-stop docker-logs lint format type-check test ci destroy

# Default target
help:
	@echo "TMC Frontend - Toyota Manufacturers Club"
	@echo "======================================="
	@echo ""
	@echo "Development Commands:"
	@echo "  install      Install dependencies with npm"
	@echo "  dev          Start development server"
	@echo "  build        Build for production"
	@echo "  preview      Preview production build"
	@echo "  type-check   Run TypeScript type checking"
	@echo "  lint         Run ESLint"
	@echo "  format       Format code with Prettier"
	@echo "  test         Run tests"
	@echo ""
	@echo "Docker Commands:"
	@echo "  docker-build Build Docker image"
	@echo "  docker-up    Start development container"
	@echo "  docker-prod  Start production container"
	@echo "  docker-down  Stop and remove containers"
	@echo "  docker-stop  Stop containers"
	@echo "  docker-logs  Show container logs"
	@echo "  docker-clean Clean Docker resources"
	@echo "  destroy      Compose down and prune all Docker resources"
	@echo ""
	@echo "Maintenance:"
	@echo "  clean        Clean build artifacts"
	@echo "  ci           Run full CI pipeline"

# Dependencies
install:
	@echo "Installing dependencies with npm..."
	npm install

# Development
dev:
	@echo "Starting development server..."
	npm run dev

# Build & Production
build:
	@echo "Building for production..."
	npm run build

preview:
	@echo "Starting preview server..."
	npm run preview

# Code Quality
type-check:
	@echo "Running TypeScript type checking..."
	npm run type-check

lint:
	@echo "Running ESLint..."
	npm run lint

format:
	@echo "Formatting code with Prettier..."
	npm run format

test:
	@echo "Running tests..."
	npm run test

# Cleanup
clean:
	@echo "Cleaning build artifacts..."
	rm -rf dist
	rm -rf node_modules/.vite
	rm -rf .vite

# Docker Commands
docker-build:
	@echo "Building Docker image..."
	docker build -t tmc-frontend:latest .

docker-up:
	@echo "Starting development container..."
	docker-compose up tmc-frontend-dev -d

docker-prod:
	@echo "Starting production container..."
	docker-compose up -d

docker-down:
	@echo "Stopping and removing containers..."
	docker-compose down

docker-stop:
	@echo "Stopping containers..."
	docker-compose stop

docker-logs:
	@echo "Showing container logs..."
	docker-compose logs -f

docker-clean:
	@echo "Cleaning Docker resources..."
	docker-compose down -v
	docker system prune -f
	docker volume prune -f

destroy:
	@echo "Destroying Docker resources (compose down + system prune -a)..."
	docker compose down -v
	docker system prune -a -f

# CI Pipeline
ci: clean install type-check lint test build
	@echo "✅ CI pipeline completed successfully!"

# Development workflow with hot reload
docker-dev: docker-build docker-up
	@echo "🚀 Development environment is ready!"
	@echo "📝 App is running at http://localhost:5173"
	@echo "📋 View logs with: make docker-logs"

# Production deployment
deploy:
	@echo "🚀 Deploying to production (Docker will install & build)..."
	docker-compose up -d --build app nginx
	@echo "✅ Production deployment complete!"
	@echo "🌐 App tersedia via Nginx di http://localhost:${NGINX_PORT:-8080}"

# Quick start for new developers
setup: install
	@echo "🎉 Setup complete!"
	@echo "🚀 Run 'make dev' to start development"
	@echo "🐳 Or 'make docker-dev' for Docker development"

# Show project status
status:
	@echo "📊 TMC Frontend Status"
	@echo "===================="
	@echo "Node version: $(shell node --version)"
	@echo "NPM version: $(shell npm --version)"
	@echo "Docker version: $(shell docker --version)"
	@echo "Docker Compose version: $(shell docker-compose --version)"
	@if [ -d "node_modules" ]; then echo "✅ Dependencies installed"; else echo "❌ Dependencies not installed"; fi
	@if [ -d "dist" ]; then echo "✅ Production build exists"; else echo "❌ No production build"; fi

# Database migration (if needed)
migrate:
	@echo "No database migrations for frontend application"

# Generate assets
assets:
	@echo "Generating application assets..."
	npm run build

# Watch for changes (alternative to dev)
watch:
	@echo "Watching for file changes..."
	npm run dev -- --watch

# Security audit
audit:
	@echo "Running security audit..."
	npm audit

# Update dependencies
update:
	@echo "Updating dependencies..."
	npm update

# Create release
release: clean ci
	@echo "Creating release package..."
	@echo "✅ Release ready!"
