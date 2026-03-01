#!/usr/bin/env bash
set -euo pipefail

# Usage: ./scripts/new-lesson.sh <path-slug> <module-slug> <lesson-slug>
# Example: ./scripts/new-lesson.sh foundations linux terminal-basics

if [ $# -lt 3 ]; then
  echo "Usage: $0 <path-slug> <module-slug> <lesson-slug>"
  echo "Example: $0 foundations linux terminal-basics"
  exit 1
fi

PATH_SLUG="$1"
MODULE_SLUG="$2"
LESSON_SLUG="$3"

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
CONTENT_DIR="$ROOT_DIR/content/paths"

MODULE_DIR="$CONTENT_DIR/$PATH_SLUG/$MODULE_SLUG"
LESSON_DIR="$MODULE_DIR/$LESSON_SLUG"

# Verify path and module exist
if [ ! -d "$CONTENT_DIR/$PATH_SLUG" ]; then
  echo "Error: Path '$PATH_SLUG' does not exist in $CONTENT_DIR"
  exit 1
fi

if [ ! -d "$MODULE_DIR" ]; then
  echo "Error: Module '$MODULE_SLUG' does not exist in path '$PATH_SLUG'"
  exit 1
fi

if [ -d "$LESSON_DIR" ]; then
  echo "Error: Lesson '$LESSON_SLUG' already exists at $LESSON_DIR"
  exit 1
fi

# Count existing lessons for auto-increment
EXISTING_LESSONS=$(find "$MODULE_DIR" -mindepth 1 -maxdepth 1 -type d | wc -l)
ORDER=$((EXISTING_LESSONS + 1))

# Convert slug to title (replace hyphens with spaces, capitalize words)
TITLE=$(echo "$LESSON_SLUG" | sed 's/-/ /g' | awk '{for(i=1;i<=NF;i++) $i=toupper(substr($i,1,1)) tolower(substr($i,2))}1')

mkdir -p "$LESSON_DIR"

cat > "$LESSON_DIR/index.mdx" << TEMPLATE
---
title: "$TITLE"
description: ""
order: $ORDER
xpReward: 25
estimatedMinutes: 30
prerequisites: []
objectives:
  -
tags:
  - $MODULE_SLUG
  - fundamentals
---

<Callout type="story" title="The Story">
[Replace with a real-world scenario that motivates this lesson]
</Callout>

## Introduction

[Your lesson content here]

## Key Concepts

[Explain the core concepts]

<Callout type="tip" title="Pro Tip">
[Add a helpful tip]
</Callout>

## Hands-On Practice

\`\`\`bash
# Example commands
\`\`\`

<Exercise number={1} title="Your First Exercise">

[Describe the exercise]

<CollapsibleSolution>

\`\`\`bash
# Solution here
\`\`\`

</CollapsibleSolution>
</Exercise>

<MiniProject title="Mini Project">

[Describe the mini project]

</MiniProject>

## Key Takeaways

-
-
-

<Quiz>
<QuizQuestion
  question=""
  options={["", "", "", ""]}
  answer={0}
  explanation=""
/>
</Quiz>

## What's Next?

[Preview the next lesson]
TEMPLATE

echo "Created lesson: $LESSON_DIR/index.mdx"
echo "Order: $ORDER"
echo "Title: $TITLE"
