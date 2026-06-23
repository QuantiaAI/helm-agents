#!/usr/bin/env bash
# Free HelmAgents dev ports held by stale processes.
#
# `pnpm dev` runs two long-lived servers under turbo (api :5171, web :5170).
# If the launching terminal is closed without Ctrl-C, turbo doesn't always
# tear down its children — the next `pnpm dev` then fails with EADDRINUSE and
# turbo aborts the sibling task (looks like "only api started, web didn't").
#
#   pnpm dev:clean && pnpm dev
#
# Scope: only processes LISTENing on 5170/5171, so unrelated projects are never
# touched. Requires lsof (macOS / Linux). On Windows, stop stray node processes
# via Task Manager or run inside WSL.
set -uo pipefail

PORTS=(5170 5171)
killed=0

for port in "${PORTS[@]}"; do
  pids="$(lsof -nP -iTCP:"$port" -sTCP:LISTEN -t 2>/dev/null || true)"
  [ -z "$pids" ] && continue
  for pid in $pids; do
    if kill -TERM "$pid" 2>/dev/null; then
      echo "→ killing PID $pid holding dev port :$port"
      killed=$((killed + 1))
    fi
  done
done

if [ "$killed" -eq 0 ]; then
  echo "✓ dev ports 5170/5171 are free — nothing to clean."
  exit 0
fi

# Condition-wait: poll until both ports are actually released (graceful close).
for _ in $(seq 1 25); do
  busy=0
  for port in "${PORTS[@]}"; do
    lsof -nP -iTCP:"$port" -sTCP:LISTEN -t >/dev/null 2>&1 && busy=1
  done
  [ "$busy" -eq 0 ] && break
  sleep 0.2
done

# If SIGTERM didn't release them, escalate to SIGKILL (unblockable).
if [ "$busy" -ne 0 ]; then
  echo "⚠ ports still held after SIGTERM — sending SIGKILL." >&2
  for port in "${PORTS[@]}"; do
    pids="$(lsof -nP -iTCP:"$port" -sTCP:LISTEN -t 2>/dev/null || true)"
    for pid in $pids; do kill -KILL "$pid" 2>/dev/null || true; done
  done
  sleep 1
  busy=0
  for port in "${PORTS[@]}"; do
    lsof -nP -iTCP:"$port" -sTCP:LISTEN -t >/dev/null 2>&1 && busy=1
  done
fi

if [ "$busy" -ne 0 ]; then
  echo "✗ could not free dev ports 5170/5171 (held by un-killable processes)." >&2
  exit 1
fi

echo "✓ cleaned $killed stale process(es); dev ports 5170/5171 released."
