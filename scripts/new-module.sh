#!/usr/bin/env bash
set -euo pipefail

# Usage: ./scripts/new-module.sh <path-slug> <module-slug>
# Example: ./scripts/new-module.sh foundations networking

if [ $# -lt 2 ]; then
  echo "Usage: $0 <path-slug> <module-slug>"
  echo "Example: $0 foundations networking"
  exit 1
fi

PATH_SLUG="$1"
MODULE_SLUG="$2"

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
CONTENT_DIR="$ROOT_DIR/content/paths"

PATH_DIR="$CONTENT_DIR/$PATH_SLUG"
MODULE_DIR="$PATH_DIR/$MODULE_SLUG"

# Verify path exists
if [ ! -d "$PATH_DIR" ]; then
  echo "Error: Path '$PATH_SLUG' does not exist in $CONTENT_DIR"
  exit 1
fi

if [ -d "$MODULE_DIR" ]; then
  echo "Error: Module '$MODULE_SLUG' already exists at $MODULE_DIR"
  exit 1
fi

# Count existing modules for auto-increment
EXISTING_MODULES=$(find "$PATH_DIR" -mindepth 1 -maxdepth 1 -type d | wc -l)
ORDER=$((EXISTING_MODULES + 1))

# Convert slug to title
TITLE=$(echo "$MODULE_SLUG" | sed 's/-/ /g' | awk '{for(i=1;i<=NF;i++) $i=toupper(substr($i,1,1)) tolower(substr($i,2))}1')

mkdir -p "$MODULE_DIR"

cat > "$MODULE_DIR/module.json" << TEMPLATE
{
  "title": "$TITLE",
  "slug": "$MODULE_SLUG",
  "description": "",
  "order": $ORDER,
  "estimatedHours": 20,
  "lessons": []
}
TEMPLATE

echo "Created module: $MODULE_DIR/module.json"
echo "Order: $ORDER"
echo "Title: $TITLE"
echo ""
echo "Next steps:"
echo "  1. Edit $MODULE_DIR/module.json to add description"
echo "  2. Create lessons: ./scripts/new-lesson.sh $PATH_SLUG $MODULE_SLUG <lesson-slug>"
