# ==============================================================================
# DevOps Engineers — Local Development Makefile
# ==============================================================================
# Usage:
#   make setup      — First-time project setup
#   make start      — Start all services (smart port detection)
#   make stop       — Stop all running services
#   make restart    — Stop + Start
#   make status     — Show running services and ports
#   make test       — Run all tests
#   make lint       — Run linter + type-check
#   make build      — Production build
#   make clean      — Remove all build artifacts
#   make logs       — Tail the dev server logs
#   make db-start   — Start local Supabase (requires Docker)
#   make db-stop    — Stop local Supabase
#   make db-reset   — Reset local database + re-run migrations
#   make help       — Show this help
# ==============================================================================

SHELL := /bin/bash
.DEFAULT_GOAL := help

# --- Configuration -----------------------------------------------------------
PROJECT_ROOT := $(shell pwd)
WEB_DIR      := $(PROJECT_ROOT)/apps/web
ENV_FILE     := $(WEB_DIR)/.env.local
PID_DIR      := $(PROJECT_ROOT)/.pids
LOG_DIR      := $(PROJECT_ROOT)/.logs
DEFAULT_PORT := 3000
PORT_RANGE   := 3000 3001 3002 3003 3004 3005 3006 3007 3008 3009 3010

# Supabase local ports
SUPABASE_API_PORT    := 54321
SUPABASE_DB_PORT     := 54322
SUPABASE_STUDIO_PORT := 54323

# Colors for output
GREEN  := \033[0;32m
YELLOW := \033[0;33m
RED    := \033[0;31m
CYAN   := \033[0;36m
BOLD   := \033[1m
NC     := \033[0m  # No Color

# ==============================================================================
# HELPER FUNCTIONS
# ==============================================================================

# Find the first available port from PORT_RANGE
define find_free_port
$(shell \
	for port in $(PORT_RANGE); do \
		if ! lsof -i :$$port -sTCP:LISTEN >/dev/null 2>&1; then \
			echo $$port; \
			break; \
		fi; \
	done \
)
endef

# Check if a command exists
define check_command
	@command -v $(1) >/dev/null 2>&1 || { \
		echo -e "$(RED)Error: $(1) is not installed.$(NC)"; \
		echo -e "$(YELLOW)$(2)$(NC)"; \
		exit 1; \
	}
endef

# ==============================================================================
# PRIMARY TARGETS
# ==============================================================================

.PHONY: help
help: ## Show this help message
	@echo ""
	@echo -e "$(BOLD)$(CYAN)  DevOps Engineers — Local Development$(NC)"
	@echo -e "  ====================================="
	@echo ""
	@echo -e "$(BOLD)  Quick Start:$(NC)"
	@echo -e "    make setup    — First-time setup"
	@echo -e "    make start    — Start dev server"
	@echo -e "    make stop     — Stop everything"
	@echo ""
	@echo -e "$(BOLD)  Available Commands:$(NC)"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "    \033[0;36m%-15s\033[0m %s\n", $$1, $$2}'
	@echo ""

# --- Setup -------------------------------------------------------------------

.PHONY: setup
setup: ## First-time project setup (install deps, create .env, build)
	$(call check_command,node,Install Node.js 22+: https://nodejs.org)
	$(call check_command,pnpm,Install pnpm: npm install -g pnpm@10)
	@echo ""
	@echo -e "$(BOLD)$(CYAN)=== DevOps Engineers — Project Setup ===$(NC)"
	@echo ""
	@# Check Node version
	@NODE_VERSION=$$(node -v | cut -d'.' -f1 | tr -d 'v'); \
	if [ "$$NODE_VERSION" -lt 20 ]; then \
		echo -e "$(RED)Error: Node.js 20+ required. You have $$(node -v)$(NC)"; \
		exit 1; \
	elif [ "$$NODE_VERSION" -lt 22 ]; then \
		echo -e "$(YELLOW)Warning: Node.js 22+ recommended. You have $$(node -v)$(NC)"; \
	else \
		echo -e "$(GREEN)✓ Node.js $$(node -v)$(NC)"; \
	fi
	@echo -e "$(GREEN)✓ pnpm $$(pnpm --version)$(NC)"
	@echo ""
	@# Install dependencies
	@echo -e "$(CYAN)Installing dependencies...$(NC)"
	@pnpm install
	@echo ""
	@# Create .env.local if it doesn't exist
	@if [ ! -f "$(ENV_FILE)" ]; then \
		cp $(PROJECT_ROOT)/.env.example $(ENV_FILE); \
		echo -e "$(GREEN)✓ Created $(ENV_FILE) from .env.example$(NC)"; \
		echo -e "$(YELLOW)  → Edit this file with your Clerk and Supabase keys$(NC)"; \
	else \
		echo -e "$(GREEN)✓ $(ENV_FILE) already exists$(NC)"; \
	fi
	@echo ""
	@# Create pid and log directories
	@mkdir -p $(PID_DIR) $(LOG_DIR)
	@echo -e "$(GREEN)✓ Created .pids/ and .logs/ directories$(NC)"
	@echo ""
	@# Type check
	@echo -e "$(CYAN)Running type check...$(NC)"
	@SKIP_ENV_VALIDATION=true pnpm type-check 2>&1 || true
	@echo ""
	@# Build
	@echo -e "$(CYAN)Running build...$(NC)"
	@SKIP_ENV_VALIDATION=true pnpm build 2>&1 || true
	@echo ""
	@echo -e "$(BOLD)$(GREEN)=== Setup Complete ===$(NC)"
	@echo ""
	@echo -e "  Next steps:"
	@echo -e "  1. Edit $(YELLOW)apps/web/.env.local$(NC) with your keys"
	@echo -e "  2. Run: $(CYAN)make start$(NC)"
	@echo ""

# --- Start / Stop / Restart -------------------------------------------------

.PHONY: start
start: _check-deps _ensure-dirs ## Start the dev server (auto-detects free port)
	@# Check if already running
	@if [ -f "$(PID_DIR)/next-dev.pid" ] && kill -0 $$(cat "$(PID_DIR)/next-dev.pid") 2>/dev/null; then \
		RUNNING_PORT=$$(cat "$(PID_DIR)/next-dev.port" 2>/dev/null || echo "unknown"); \
		echo -e "$(YELLOW)Dev server is already running on port $$RUNNING_PORT$(NC)"; \
		echo -e "  Run $(CYAN)make restart$(NC) to restart, or $(CYAN)make stop$(NC) to stop."; \
		exit 0; \
	fi
	@# Check .env.local exists
	@if [ ! -f "$(ENV_FILE)" ]; then \
		echo -e "$(RED)Error: $(ENV_FILE) not found.$(NC)"; \
		echo -e "  Run $(CYAN)make setup$(NC) first."; \
		exit 1; \
	fi
	@# Find a free port
	@FREE_PORT=$(call find_free_port); \
	if [ -z "$$FREE_PORT" ]; then \
		echo -e "$(RED)Error: No free port found in range $(PORT_RANGE)$(NC)"; \
		echo -e "  Free up a port or run $(CYAN)make stop$(NC) first."; \
		exit 1; \
	fi; \
	echo ""; \
	echo -e "$(BOLD)$(CYAN)=== Starting Dev Server ===$(NC)"; \
	echo ""; \
	if [ "$$FREE_PORT" != "$(DEFAULT_PORT)" ]; then \
		echo -e "$(YELLOW)⚠  Port $(DEFAULT_PORT) is in use — using port $$FREE_PORT instead$(NC)"; \
		echo ""; \
	fi; \
	echo -e "  $(BOLD)Web App:$(NC)       $(GREEN)http://localhost:$$FREE_PORT$(NC)"; \
	echo ""; \
	if command -v supabase >/dev/null 2>&1 && supabase status >/dev/null 2>&1; then \
		echo -e "  $(BOLD)Supabase:$(NC)"; \
		echo -e "    Studio:      $(GREEN)http://localhost:$(SUPABASE_STUDIO_PORT)$(NC)"; \
		echo -e "    API:         $(GREEN)http://localhost:$(SUPABASE_API_PORT)$(NC)"; \
		echo -e "    Database:    $(GREEN)localhost:$(SUPABASE_DB_PORT)$(NC)"; \
		echo ""; \
	fi; \
	echo -e "  $(BOLD)Logs:$(NC)          $(CYAN).logs/next-dev.log$(NC)"; \
	echo -e "  $(BOLD)Stop:$(NC)          $(CYAN)make stop$(NC)"; \
	echo ""; \
	echo "$$FREE_PORT" > "$(PID_DIR)/next-dev.port"; \
	cd $(PROJECT_ROOT) && \
	NEXT_DEV_PORT=$$FREE_PORT nohup pnpm exec -- turbo run dev -- --port $$FREE_PORT \
		> "$(LOG_DIR)/next-dev.log" 2>&1 & \
	DEV_PID=$$!; \
	echo "$$DEV_PID" > "$(PID_DIR)/next-dev.pid"; \
	echo -e "$(GREEN)✓ Dev server started (PID: $$DEV_PID, Port: $$FREE_PORT)$(NC)"; \
	echo -e "  Waiting for server to be ready..."; \
	for i in $$(seq 1 30); do \
		if curl -s -o /dev/null -w '' "http://localhost:$$FREE_PORT" 2>/dev/null; then \
			echo -e "$(GREEN)✓ Server is ready at http://localhost:$$FREE_PORT$(NC)"; \
			break; \
		fi; \
		if [ $$i -eq 30 ]; then \
			echo -e "$(YELLOW)  Server is starting... check $(CYAN)make logs$(NC) for progress."; \
		fi; \
		sleep 2; \
	done

.PHONY: stop
stop: ## Stop all running services
	@echo ""
	@echo -e "$(BOLD)$(CYAN)=== Stopping Services ===$(NC)"
	@echo ""
	@STOPPED=0; \
	if [ -f "$(PID_DIR)/next-dev.pid" ]; then \
		PID=$$(cat "$(PID_DIR)/next-dev.pid"); \
		PORT=$$(cat "$(PID_DIR)/next-dev.port" 2>/dev/null || echo "unknown"); \
		if kill -0 $$PID 2>/dev/null; then \
			kill $$PID 2>/dev/null; \
			sleep 1; \
			if kill -0 $$PID 2>/dev/null; then \
				kill -9 $$PID 2>/dev/null; \
			fi; \
			echo -e "$(GREEN)✓ Stopped dev server (PID: $$PID, Port: $$PORT)$(NC)"; \
			STOPPED=1; \
		else \
			echo -e "$(YELLOW)  Dev server was not running (stale PID file)$(NC)"; \
		fi; \
		rm -f "$(PID_DIR)/next-dev.pid" "$(PID_DIR)/next-dev.port"; \
	fi; \
	ORPHAN_PIDS=$$(lsof -t -i :3000-3010 -sTCP:LISTEN 2>/dev/null || true); \
	if [ -n "$$ORPHAN_PIDS" ]; then \
		for OPID in $$ORPHAN_PIDS; do \
			OPORT=$$(lsof -i -P -n 2>/dev/null | grep "$$OPID" | grep LISTEN | awk '{print $$9}' | cut -d: -f2 | head -1); \
			ONAME=$$(ps -p $$OPID -o comm= 2>/dev/null || echo "unknown"); \
			if echo "$$ONAME" | grep -qiE "node|next|turbo"; then \
				kill $$OPID 2>/dev/null && \
				echo -e "$(GREEN)✓ Stopped orphan process $$ONAME (PID: $$OPID, Port: $$OPORT)$(NC)" && \
				STOPPED=1; \
			fi; \
		done; \
	fi; \
	if [ "$$STOPPED" -eq 0 ]; then \
		echo -e "$(YELLOW)  No running services found.$(NC)"; \
	fi; \
	echo ""

.PHONY: restart
restart: ## Restart all services
	@$(MAKE) stop
	@sleep 1
	@$(MAKE) start

# --- Status ------------------------------------------------------------------

.PHONY: status
status: ## Show running services and ports
	@echo ""
	@echo -e "$(BOLD)$(CYAN)=== Service Status ===$(NC)"
	@echo ""
	@# Dev server
	@if [ -f "$(PID_DIR)/next-dev.pid" ] && kill -0 $$(cat "$(PID_DIR)/next-dev.pid") 2>/dev/null; then \
		PORT=$$(cat "$(PID_DIR)/next-dev.port" 2>/dev/null || echo "?"); \
		PID=$$(cat "$(PID_DIR)/next-dev.pid"); \
		echo -e "  $(GREEN)● Running$(NC)  Web App          http://localhost:$$PORT  (PID: $$PID)"; \
	else \
		echo -e "  $(RED)○ Stopped$(NC)  Web App"; \
	fi
	@# Supabase
	@if command -v supabase >/dev/null 2>&1 && supabase status >/dev/null 2>&1; then \
		echo -e "  $(GREEN)● Running$(NC)  Supabase Studio  http://localhost:$(SUPABASE_STUDIO_PORT)"; \
		echo -e "  $(GREEN)● Running$(NC)  Supabase API     http://localhost:$(SUPABASE_API_PORT)"; \
		echo -e "  $(GREEN)● Running$(NC)  PostgreSQL       localhost:$(SUPABASE_DB_PORT)"; \
	else \
		echo -e "  $(YELLOW)○ Stopped$(NC)  Supabase (local) — run $(CYAN)make db-start$(NC) to start"; \
	fi
	@echo ""
	@# Port scan
	@echo -e "$(BOLD)  Ports in use (3000-3010):$(NC)"
	@FOUND=0; \
	for port in $(PORT_RANGE); do \
		PID=$$(lsof -t -i :$$port -sTCP:LISTEN 2>/dev/null | head -1); \
		if [ -n "$$PID" ]; then \
			NAME=$$(ps -p $$PID -o comm= 2>/dev/null || echo "unknown"); \
			echo -e "    :$$port → $$NAME (PID: $$PID)"; \
			FOUND=1; \
		fi; \
	done; \
	if [ "$$FOUND" -eq 0 ]; then \
		echo -e "    $(GREEN)All ports free$(NC)"; \
	fi
	@echo ""

# --- Development Tools -------------------------------------------------------

.PHONY: logs
logs: ## Tail the dev server logs
	@if [ -f "$(LOG_DIR)/next-dev.log" ]; then \
		tail -f "$(LOG_DIR)/next-dev.log"; \
	else \
		echo -e "$(YELLOW)No log file found. Is the dev server running?$(NC)"; \
		echo -e "  Run $(CYAN)make start$(NC) first."; \
	fi

.PHONY: test
test: _check-deps ## Run all tests
	@echo -e "$(CYAN)Running tests...$(NC)"
	@cd $(PROJECT_ROOT) && SKIP_ENV_VALIDATION=true pnpm test

.PHONY: test-watch
test-watch: _check-deps ## Run tests in watch mode
	@echo -e "$(CYAN)Running tests in watch mode...$(NC)"
	@cd $(WEB_DIR) && SKIP_ENV_VALIDATION=true pnpm test:watch

.PHONY: lint
lint: _check-deps ## Run linter and type-check
	@echo -e "$(CYAN)Running lint...$(NC)"
	@cd $(PROJECT_ROOT) && SKIP_ENV_VALIDATION=true pnpm lint
	@echo ""
	@echo -e "$(CYAN)Running type-check...$(NC)"
	@cd $(PROJECT_ROOT) && SKIP_ENV_VALIDATION=true pnpm type-check

.PHONY: build
build: _check-deps ## Run production build
	@echo -e "$(CYAN)Running production build...$(NC)"
	@cd $(PROJECT_ROOT) && SKIP_ENV_VALIDATION=true pnpm build

.PHONY: clean
clean: stop ## Remove all build artifacts, logs, and pid files
	@echo -e "$(CYAN)Cleaning build artifacts...$(NC)"
	@cd $(PROJECT_ROOT) && pnpm clean 2>/dev/null || true
	@rm -rf $(PID_DIR) $(LOG_DIR)
	@echo -e "$(GREEN)✓ Cleaned .next, .turbo, node_modules, .pids, .logs$(NC)"

# --- Database ----------------------------------------------------------------

.PHONY: db-start
db-start: ## Start local Supabase (requires Docker)
	$(call check_command,docker,Install Docker: https://docs.docker.com/get-docker)
	$(call check_command,supabase,Install Supabase CLI: npm install -g supabase)
	@echo -e "$(CYAN)Starting local Supabase...$(NC)"
	@cd $(PROJECT_ROOT) && supabase start
	@echo ""
	@echo -e "$(GREEN)✓ Supabase is running$(NC)"
	@echo -e "  Studio:    $(GREEN)http://localhost:$(SUPABASE_STUDIO_PORT)$(NC)"
	@echo -e "  API:       $(GREEN)http://localhost:$(SUPABASE_API_PORT)$(NC)"
	@echo -e "  Database:  $(GREEN)localhost:$(SUPABASE_DB_PORT)$(NC)"
	@echo ""
	@echo -e "$(YELLOW)  Update apps/web/.env.local with the keys shown above.$(NC)"

.PHONY: db-stop
db-stop: ## Stop local Supabase
	$(call check_command,supabase,Supabase CLI is not installed)
	@echo -e "$(CYAN)Stopping local Supabase...$(NC)"
	@cd $(PROJECT_ROOT) && supabase stop
	@echo -e "$(GREEN)✓ Supabase stopped$(NC)"

.PHONY: db-reset
db-reset: ## Reset local database and re-run migrations
	$(call check_command,supabase,Supabase CLI is not installed)
	@echo -e "$(CYAN)Resetting local database...$(NC)"
	@cd $(PROJECT_ROOT) && supabase db reset
	@echo -e "$(GREEN)✓ Database reset complete$(NC)"

.PHONY: db-migrate
db-migrate: ## Push migrations to local Supabase
	$(call check_command,supabase,Supabase CLI is not installed)
	@echo -e "$(CYAN)Running migrations...$(NC)"
	@cd $(PROJECT_ROOT) && supabase db push
	@echo -e "$(GREEN)✓ Migrations applied$(NC)"

# --- Health Check ------------------------------------------------------------

.PHONY: health
health: ## Check if running services are healthy
	@echo ""
	@echo -e "$(BOLD)$(CYAN)=== Health Check ===$(NC)"
	@echo ""
	@if [ -f "$(PID_DIR)/next-dev.port" ]; then \
		PORT=$$(cat "$(PID_DIR)/next-dev.port"); \
		RESPONSE=$$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:$$PORT" 2>/dev/null); \
		if [ "$$RESPONSE" = "200" ] || [ "$$RESPONSE" = "307" ]; then \
			echo -e "  $(GREEN)✓$(NC) Web App (port $$PORT)         $(GREEN)$$RESPONSE OK$(NC)"; \
		else \
			echo -e "  $(RED)✗$(NC) Web App (port $$PORT)         $(RED)$$RESPONSE$(NC)"; \
		fi; \
		API_RESPONSE=$$(curl -s "http://localhost:$$PORT/api/health" 2>/dev/null); \
		if echo "$$API_RESPONSE" | grep -q "healthy" 2>/dev/null; then \
			echo -e "  $(GREEN)✓$(NC) Health API                  $(GREEN)healthy$(NC)"; \
		else \
			echo -e "  $(YELLOW)~$(NC) Health API                  $(YELLOW)$$API_RESPONSE$(NC)"; \
		fi; \
	else \
		echo -e "  $(RED)✗$(NC) Web App                     $(RED)not running$(NC)"; \
	fi
	@echo ""

# ==============================================================================
# INTERNAL TARGETS
# ==============================================================================

.PHONY: _check-deps
_check-deps:
	$(call check_command,node,Install Node.js 22+: https://nodejs.org)
	$(call check_command,pnpm,Install pnpm: npm install -g pnpm@10)
	@if [ ! -d "$(PROJECT_ROOT)/node_modules" ]; then \
		echo -e "$(YELLOW)Dependencies not installed. Running pnpm install...$(NC)"; \
		cd $(PROJECT_ROOT) && pnpm install; \
	fi

.PHONY: _ensure-dirs
_ensure-dirs:
	@mkdir -p $(PID_DIR) $(LOG_DIR)
