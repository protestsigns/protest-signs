.PHONY: help install dev build start setup

help: ## Show this help message
	@echo "Protest Signs - Available Commands"
	@echo "==================================="
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}'

install: ## Install dependencies
	npm install

dev: ## Run development server (with Turbopack for faster compilation)
	npm run dev

build: ## Build for production
	npm run build

start: ## Start production server
	npm start

setup: ## First-time setup checklist
	@echo "📋 Setup Checklist"
	@echo "=================="
	@echo ""
	@echo "1. Edit .env.local with your credentials:"
	@echo "   code .env.local"
	@echo ""
	@echo "2. Add Supabase credentials (from dashboard → Settings → API)"
	@echo "   - NEXT_PUBLIC_SUPABASE_URL"
	@echo "   - NEXT_PUBLIC_SUPABASE_ANON_KEY"
	@echo "   - SUPABASE_SERVICE_ROLE_KEY"
	@echo ""
	@echo "3. Add Stripe TEST credentials (enable Test Mode → Developers → API keys)"
	@echo "   - NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_..."
	@echo "   - STRIPE_SECRET_KEY=sk_test_..."
	@echo ""
	@echo "4. Run database schema in Supabase SQL Editor:"
	@echo "   Copy supabase/schema.sql → SQL Editor → Run"
	@echo ""
	@echo "5. Then run: make dev"
	@echo ""
	@echo "📖 Full guide: SETUP.md"
