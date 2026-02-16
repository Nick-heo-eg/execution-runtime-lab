#!/bin/bash
#
# Boundary Integrity Check for execution-runtime-lab (Public Repo)
#
# Verifies that the public verification layer does NOT import from the private
# execution-runtime-core repository.
#
# This ensures complete isolation between:
# - Public verification layer (execution-runtime-lab) - this repo
# - Private enforcement core (execution-runtime-core) - separate repo
#
# Exit codes:
# - 0: No boundary violations found
# - 1: Boundary violations detected
# - 2: Script error

set -e

REPO_ROOT=$(cd "$(dirname "$0")/.." && pwd)
VIOLATIONS_FOUND=0

echo "======================================"
echo "Boundary Integrity Check (Public Repo)"
echo "======================================"
echo ""
echo "Repository: execution-runtime-lab"
echo "Root: $REPO_ROOT"
echo ""

# Check 1: No imports from execution-runtime-core in source code
echo "[1/3] Checking for forbidden imports from execution-runtime-core..."

# Check TypeScript/JavaScript files (if any exist in src/)
if [ -d "$REPO_ROOT/src" ]; then
  FORBIDDEN_IMPORTS=$(find "$REPO_ROOT/src" -name "*.ts" -o -name "*.js" | \
    xargs grep -n "from ['\"].*execution-runtime-core" 2>/dev/null || true)

  if [ -n "$FORBIDDEN_IMPORTS" ]; then
    echo "❌ FAIL: Forbidden imports from execution-runtime-core detected:"
    echo "$FORBIDDEN_IMPORTS"
    echo ""
    VIOLATIONS_FOUND=1
  else
    echo "✅ PASS: No forbidden imports from execution-runtime-core in src/"
  fi
else
  echo "ℹ️  No src/ directory found (public repo is proof-only)"
fi

echo ""

# Check 2: No imports from execution-runtime-core in proof scripts
echo "[2/3] Checking proof scripts for forbidden imports..."

if [ -d "$REPO_ROOT/proof" ]; then
  PROOF_IMPORTS=$(find "$REPO_ROOT/proof" -name "*.ts" -o -name "*.js" 2>/dev/null | \
    xargs grep -n "from ['\"].*execution-runtime-core" 2>/dev/null || true)

  if [ -n "$PROOF_IMPORTS" ]; then
    echo "❌ FAIL: Forbidden imports in proof scripts:"
    echo "$PROOF_IMPORTS"
    echo ""
    VIOLATIONS_FOUND=1
  else
    echo "✅ PASS: No forbidden imports in proof scripts"
  fi
else
  echo "ℹ️  No proof/ directory found"
fi

echo ""

# Check 3: Documentation references are OK
echo "[3/3] Checking for hard-coded private repo paths (code only)..."

# Check only code files, not docs (docs/ and contracts/ can reference private repo)
if [ -d "$REPO_ROOT/src" ] || [ -d "$REPO_ROOT/proof" ]; then
  HARDCODED_PATHS=$(find "$REPO_ROOT/src" "$REPO_ROOT/proof" -name "*.ts" -o -name "*.js" 2>/dev/null | \
    xargs grep -n "/execution-runtime-core\|~/.*execution-runtime-core" 2>/dev/null || true)

  if [ -n "$HARDCODED_PATHS" ]; then
    echo "⚠️  WARNING: Hard-coded private repo paths found in code:"
    echo "$HARDCODED_PATHS"
    echo ""
  else
    echo "✅ PASS: No hard-coded private repo paths in code"
  fi
else
  echo "ℹ️  No source code directories to check"
fi

echo ""
echo "======================================"
echo "Boundary Integrity Check Summary"
echo "======================================"

if [ $VIOLATIONS_FOUND -eq 0 ]; then
  echo "✅ ALL CHECKS PASSED"
  echo ""
  echo "The public verification layer is properly isolated from the private repo."
  echo "No boundary violations detected."
  echo ""
  echo "Note: Documentation references in docs/ and contracts/ are allowed."
  exit 0
else
  echo "❌ BOUNDARY VIOLATIONS DETECTED"
  echo ""
  echo "The public repo MUST NOT import from the private execution-runtime-core."
  echo "These repositories must remain completely isolated."
  echo ""
  echo "Fix violations before committing."
  exit 1
fi
