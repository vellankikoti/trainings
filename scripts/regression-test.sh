#!/bin/bash
#
# Pre-Launch Regression Test Script
# TASK-135: Full regression testing before production launch
#
# Usage:
#   ./scripts/regression-test.sh [--full]
#
# Without --full, runs automated tests only.
# With --full, also prints manual testing checklist.
#

set -e

BASE_URL="${BASE_URL:-http://localhost:3000}"
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

pass() { echo -e "${GREEN}  PASS${NC} $1"; }
fail() { echo -e "${RED}  FAIL${NC} $1"; FAILURES=$((FAILURES + 1)); }
warn() { echo -e "${YELLOW}  WARN${NC} $1"; }

FAILURES=0

echo ""
echo "======================================"
echo "  Pre-Launch Regression Test Suite"
echo "======================================"
echo "  Target: $BASE_URL"
echo "  Date:   $(date -u +%Y-%m-%dT%H:%M:%SZ)"
echo "======================================"
echo ""

# ------------------------------------------------
# Phase 1: Unit & Integration Tests
# ------------------------------------------------
echo "--- Phase 1: Unit & Integration Tests ---"
echo ""

cd "$(dirname "$0")/../apps/web"

echo "Running vitest..."
if pnpm test 2>/dev/null; then
  pass "All unit tests passed"
else
  fail "Unit tests failed"
fi

echo ""

# ------------------------------------------------
# Phase 2: Type Check
# ------------------------------------------------
echo "--- Phase 2: Type Check ---"
echo ""

if pnpm type-check 2>/dev/null; then
  pass "TypeScript type check passed"
else
  fail "TypeScript type check failed"
fi

echo ""

# ------------------------------------------------
# Phase 3: Lint
# ------------------------------------------------
echo "--- Phase 3: Lint ---"
echo ""

if pnpm lint 2>/dev/null; then
  pass "Lint passed"
else
  warn "Lint had warnings (check output above)"
fi

echo ""

# ------------------------------------------------
# Phase 4: Build
# ------------------------------------------------
echo "--- Phase 4: Build ---"
echo ""

if SKIP_ENV_VALIDATION=true pnpm build 2>/dev/null; then
  pass "Production build succeeded"
else
  fail "Production build failed"
fi

echo ""

cd "$(dirname "$0")/.."

# ------------------------------------------------
# Phase 5: Health Check (if server is running)
# ------------------------------------------------
echo "--- Phase 5: Endpoint Health Checks ---"
echo ""

if curl -sf "$BASE_URL/api/health" > /dev/null 2>&1; then
  HEALTH=$(curl -sf "$BASE_URL/api/health")
  STATUS=$(echo "$HEALTH" | grep -o '"status":"[^"]*"' | head -1)
  if echo "$STATUS" | grep -q "healthy"; then
    pass "Health endpoint: healthy"
  else
    fail "Health endpoint: $STATUS"
  fi
else
  warn "Server not running at $BASE_URL (skipping endpoint checks)"
fi

echo ""

# ------------------------------------------------
# Phase 6: Content Validation
# ------------------------------------------------
echo "--- Phase 6: Content Validation ---"
echo ""

# Check lesson count
LESSON_COUNT=$(find content/paths -name "*.mdx" | wc -l)
if [ "$LESSON_COUNT" -ge 100 ]; then
  pass "Found $LESSON_COUNT lessons (>= 100 required)"
else
  fail "Only $LESSON_COUNT lessons found (100 required)"
fi

# Check quiz count
QUIZ_COUNT=$(find content/quizzes -name "*.json" 2>/dev/null | wc -l)
if [ "$QUIZ_COUNT" -ge 5 ]; then
  pass "Found $QUIZ_COUNT quiz files"
else
  warn "Only $QUIZ_COUNT quiz files found"
fi

# Check for broken frontmatter
BROKEN=0
for f in $(find content/paths -name "*.mdx"); do
  if ! head -1 "$f" | grep -q "^---"; then
    BROKEN=$((BROKEN + 1))
  fi
done
if [ "$BROKEN" -eq 0 ]; then
  pass "All MDX files have valid frontmatter"
else
  fail "$BROKEN MDX files missing frontmatter"
fi

echo ""

# ------------------------------------------------
# Summary
# ------------------------------------------------
echo "======================================"
if [ "$FAILURES" -eq 0 ]; then
  echo -e "  ${GREEN}ALL AUTOMATED CHECKS PASSED${NC}"
else
  echo -e "  ${RED}$FAILURES CHECK(S) FAILED${NC}"
fi
echo "======================================"
echo ""

# ------------------------------------------------
# Manual Testing Checklist (--full flag)
# ------------------------------------------------
if [ "$1" = "--full" ]; then
  echo "======================================"
  echo "  Manual Testing Checklist"
  echo "======================================"
  echo ""
  echo "User Journey 1 — New Learner:"
  echo "  [ ] Visit homepage -> understand platform purpose"
  echo "  [ ] Click 'Start Learning' -> sign up flow works"
  echo "  [ ] Complete onboarding -> personalized recommendation shown"
  echo "  [ ] Navigate to first lesson -> content renders correctly"
  echo "  [ ] Complete exercises -> progress tracked"
  echo "  [ ] Take inline quiz -> score shown with explanations"
  echo "  [ ] Mark lesson complete -> XP awarded, progress updated"
  echo "  [ ] Navigate to next lesson -> previous/next links work"
  echo "  [ ] Return to dashboard -> progress reflected correctly"
  echo ""
  echo "User Journey 2 — Completing a Module:"
  echo "  [ ] Complete all lessons in Linux module"
  echo "  [ ] Take module assessment -> score calculated"
  echo "  [ ] Pass assessment -> certificate generated"
  echo "  [ ] View certificate -> displays correctly"
  echo "  [ ] Download PDF -> renders properly"
  echo "  [ ] Share certificate link -> public verification works"
  echo ""
  echo "User Journey 3 — Premium User:"
  echo "  [ ] Subscribe via Stripe -> payment processed"
  echo "  [ ] Access cloud lab -> terminal connects to container"
  echo "  [ ] Download lesson PDF -> file downloads"
  echo "  [ ] Cancel subscription -> features downgraded gracefully"
  echo ""
  echo "Cross-Browser Testing:"
  echo "  [ ] Chrome (latest)"
  echo "  [ ] Firefox (latest)"
  echo "  [ ] Safari (latest)"
  echo "  [ ] Edge (latest)"
  echo "  [ ] Mobile Safari (iOS)"
  echo "  [ ] Chrome Mobile (Android)"
  echo ""
  echo "Edge Cases:"
  echo "  [ ] Slow network simulation -> graceful degradation"
  echo "  [ ] Auth token expired -> redirects to login"
  echo "  [ ] 404 pages -> custom error page shown"
  echo "  [ ] Concurrent tab sessions -> no data corruption"
  echo ""
fi

exit $FAILURES
