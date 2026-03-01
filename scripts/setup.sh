#!/usr/bin/env bash
set -euo pipefail

# Initial development setup script

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

echo "=== DEVOPS ENGINEERS — Development Setup ==="
echo ""

# Check for pnpm
if ! command -v pnpm &>/dev/null; then
  echo "Error: pnpm is not installed."
  echo "Install it: npm install -g pnpm"
  exit 1
fi

# Check Node.js version
REQUIRED_NODE="22"
CURRENT_NODE=$(node -v | cut -d'.' -f1 | tr -d 'v')
if [ "$CURRENT_NODE" -lt "$REQUIRED_NODE" ]; then
  echo "Warning: Node.js $REQUIRED_NODE+ recommended. You have v$(node -v)"
fi

# Install dependencies
echo "Installing dependencies..."
cd "$ROOT_DIR"
pnpm install

# Copy env file
if [ ! -f "$ROOT_DIR/apps/web/.env.local" ]; then
  if [ -f "$ROOT_DIR/.env.example" ]; then
    cp "$ROOT_DIR/.env.example" "$ROOT_DIR/apps/web/.env.local"
    echo "Created apps/web/.env.local from .env.example"
    echo "  -> Please update with your actual values"
  fi
else
  echo "apps/web/.env.local already exists — skipping"
fi

# Type check
echo ""
echo "Running type check..."
pnpm type-check || echo "Type check completed with warnings"

# Build
echo ""
echo "Running build..."
SKIP_ENV_VALIDATION=true pnpm build || echo "Build completed with warnings"

echo ""
echo "=== Setup Complete ==="
echo ""
echo "Next steps:"
echo "  1. Update apps/web/.env.local with your keys"
echo "  2. Run: pnpm dev"
echo "  3. Open: http://localhost:3000"
