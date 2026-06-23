#!/usr/bin/env bash
# HelmAgents — one-click local install: dependencies → build → start.
# After it starts, open the printed URL, go to Settings, pick an LLM provider
# and paste your API key (stored encrypted on this machine).
set -euo pipefail

# --- repo root (this script lives in scripts/) -------------------------------
# Run from the repo root regardless of where the user invoked the script, so the
# Node-version gate below can read package.json.
cd "$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# --- Node.js -----------------------------------------------------------------
# Required major version is derived from package.json#engines.node (single source
# of truth) so this gate can't drift out of sync with the declared engine range.
if ! command -v node >/dev/null 2>&1; then
  echo "✗ Node.js not found. Install Node.js per package.json#engines.node from https://nodejs.org and re-run." >&2
  exit 1
fi
NEED_NODE="$(node -p "const m=require('./package.json').engines?.node?.match(/[0-9]+/); m?m[0]:''")"
if ! [[ "${NEED_NODE}" =~ ^[1-9][0-9]*$ ]]; then
  echo "✗ Could not determine required Node major version from package.json#engines.node." >&2
  exit 1
fi
NODE_MAJOR="$(node -p 'process.versions.node.split(".")[0]')"
if [ "${NODE_MAJOR}" -lt "${NEED_NODE}" ]; then
  echo "✗ Node.js >= ${NEED_NODE} required (found $(node -v)). See package.json#engines.node." >&2
  exit 1
fi

# --- pnpm (via corepack, bundled with Node) ----------------------------------
if ! command -v pnpm >/dev/null 2>&1; then
  echo "→ Enabling pnpm via corepack…"
  corepack enable >/dev/null 2>&1 || true
fi
if ! command -v pnpm >/dev/null 2>&1; then
  echo "✗ pnpm not available. Install pnpm >= 10 from https://pnpm.io/installation and re-run." >&2
  exit 1
fi

echo "→ Installing dependencies…"
pnpm install

echo "→ Building all packages and apps…"
pnpm build

cat <<'EOF'

✓ HelmAgents installed. Starting the app (API on :5171, web on :5170)…

  Next steps once it is running:
    1. Open  http://localhost:5170
    2. Go to  Settings  → choose an LLM provider and paste your API key
       (it is stored encrypted on this machine), then run an analysis.

  No API key yet? Stop with Ctrl-C and run  `DEMO_LLM=1 pnpm dev`  to try it
  fully offline with a deterministic stub model.

EOF

exec pnpm dev
