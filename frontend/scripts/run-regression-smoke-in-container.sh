#!/usr/bin/env bash
set -euo pipefail

export PUPPETEER_SKIP_DOWNLOAD=true
npm ci --no-fund --no-audit

CHROME_BIN="$(find /ms-playwright -maxdepth 4 -type f -path "*/chrome-linux/chrome" | head -n 1 || true)"
if [ -z "$CHROME_BIN" ]; then
  echo "playwright chromium binary not found"
  exit 1
fi
export PUPPETEER_EXECUTABLE_PATH="$CHROME_BIN"

npm run dev -- --host 0.0.0.0 --port 8090 > /tmp/frontend-dev.log 2>&1 &
DEV_PID=$!

cleanup() {
  kill "$DEV_PID" >/dev/null 2>&1 || true
  wait "$DEV_PID" >/dev/null 2>&1 || true
}
trap cleanup EXIT

for _ in $(seq 1 120); do
  if grep -q "http://localhost:8090/" /tmp/frontend-dev.log || grep -q "http://127.0.0.1:8090/" /tmp/frontend-dev.log; then
    break
  fi
  sleep 1
done

if ! grep -q "http://localhost:8090/" /tmp/frontend-dev.log && ! grep -q "http://127.0.0.1:8090/" /tmp/frontend-dev.log; then
  echo "frontend dev server failed to start"
  tail -n 120 /tmp/frontend-dev.log
  exit 1
fi

export SMOKE_URL=http://127.0.0.1:8090/

node scripts/smoke/check-shell-readiness.mjs
node scripts/smoke/check-analysis-trigger.mjs
node scripts/smoke/check-analysis-auto-refresh.mjs
node scripts/smoke/check-device-alarm-two-status.mjs
node scripts/smoke/check-auth-expiry.mjs
