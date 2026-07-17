#!/bin/zsh
set -e

ROOT="${0:A:h}"
ENV_FILE="$ROOT/video/v4/.env.local"

echo "Configuration de la voix naturelle RevPilot V4"
echo "Les valeurs resteront uniquement sur ce Mac et ne seront pas envoyées sur GitHub."
printf "Clé API ElevenLabs : "
read -rs ELEVENLABS_API_KEY
echo
printf "Identifiant de la voix féminine choisie : "
read -r ELEVENLABS_VOICE_ID

if [[ -z "$ELEVENLABS_API_KEY" || -z "$ELEVENLABS_VOICE_ID" ]]; then
  echo "Configuration annulée : les deux valeurs sont obligatoires."
  exit 1
fi

umask 077
printf 'ELEVENLABS_API_KEY=%s\nELEVENLABS_VOICE_ID=%s\n' "$ELEVENLABS_API_KEY" "$ELEVENLABS_VOICE_ID" > "$ENV_FILE"
unset ELEVENLABS_API_KEY ELEVENLABS_VOICE_ID

echo "Voix configurée. Lance ensuite :"
echo "cd \"$ROOT/video/v4\""
echo "PATH='../../.tools/node/bin:/usr/bin:/bin:/usr/sbin:/sbin' npm run voice"
echo "PATH='../../.tools/node/bin:/usr/bin:/bin:/usr/sbin:/sbin' npm run compose"
