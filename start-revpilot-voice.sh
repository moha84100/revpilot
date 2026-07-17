#!/bin/zsh
set -e

ROOT="${0:A:h}"
export PATH="$ROOT/.tools/node/bin:/usr/bin:/bin:/usr/sbin:/sbin"

if [[ -f "$ROOT/voice-agent/.env.local" ]]; then
  set -a
  source "$ROOT/voice-agent/.env.local"
  set +a
fi

cd "$ROOT/voice-agent"
if [[ ! -d node_modules ]]; then
  npm install
fi

npm start
