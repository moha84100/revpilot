#!/bin/zsh
set -e

ROOT="${0:A:h}"
export PATH="$ROOT/.tools/node/bin:/usr/bin:/bin:/usr/sbin:/sbin"
cd "$ROOT/app"

if [[ -f "$ROOT/.env.local" ]]; then
  set -a
  source "$ROOT/.env.local"
  set +a
fi

if [[ ! -d node_modules ]]; then
  npm install
fi

node server/index.mjs &
API_PID=$!
trap 'kill "$API_PID" 2>/dev/null || true' EXIT INT TERM

npm run dev
