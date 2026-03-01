#!/usr/bin/env bash
set -euo pipefail

# Outputs statistics about the content directory

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
CONTENT_DIR="$ROOT_DIR/content/paths"

if [ ! -d "$CONTENT_DIR" ]; then
  echo "Content directory not found: $CONTENT_DIR"
  exit 1
fi

echo "=== DEVOPS ENGINEERS Content Statistics ==="
echo ""

# Count paths
PATHS=$(find "$CONTENT_DIR" -maxdepth 1 -mindepth 1 -type d | wc -l)
echo "Learning Paths: $PATHS"

# Count modules
MODULES=$(find "$CONTENT_DIR" -name "module.json" | wc -l)
echo "Modules: $MODULES"

# Count lessons
LESSONS=$(find "$CONTENT_DIR" -name "index.mdx" -o -name "index.md" | wc -l)
echo "Lessons: $LESSONS"
echo ""

# Word count
TOTAL_WORDS=0
if [ "$LESSONS" -gt 0 ]; then
  TOTAL_WORDS=$(find "$CONTENT_DIR" \( -name "index.mdx" -o -name "index.md" \) -exec cat {} + | wc -w)
fi
echo "Total Words: $TOTAL_WORDS"
echo ""

# Per-path breakdown
echo "--- Per-Path Breakdown ---"
for path_dir in "$CONTENT_DIR"/*/; do
  if [ ! -d "$path_dir" ]; then continue; fi
  path_name=$(basename "$path_dir")
  path_modules=$(find "$path_dir" -name "module.json" | wc -l)
  path_lessons=$(find "$path_dir" \( -name "index.mdx" -o -name "index.md" \) | wc -l)
  echo "  $path_name: $path_modules module(s), $path_lessons lesson(s)"
done

echo ""
echo "--- Per-Module Breakdown ---"
for path_dir in "$CONTENT_DIR"/*/; do
  if [ ! -d "$path_dir" ]; then continue; fi
  for module_dir in "$path_dir"*/; do
    if [ ! -d "$module_dir" ] || [ ! -f "$module_dir/module.json" ]; then continue; fi
    module_name=$(basename "$module_dir")
    path_name=$(basename "$path_dir")
    mod_lessons=$(find "$module_dir" \( -name "index.mdx" -o -name "index.md" \) | wc -l)
    echo "  $path_name/$module_name: $mod_lessons lesson(s)"
  done
done
