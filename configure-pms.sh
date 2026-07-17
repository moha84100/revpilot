#!/bin/zsh
set -e

ROOT="${0:A:h}"
TARGET="$ROOT/.env.local"
TEMP="$ROOT/.env.local.tmp"
umask 077

echo "Configuration du connecteur PMS Mews"
echo "Les jetons restent uniquement dans .env.local sur ce Mac."
echo

read "environment?Environnement Mews (demo/production) [demo] : "
environment="${environment:-demo}"
if [[ "$environment" != "demo" && "$environment" != "production" ]]; then
  echo "Environnement invalide : utilise demo ou production."
  exit 1
fi

read "client_token?Client Token Mews : "
read "access_token?Access Token de l'hôtel : "
read "service_id?Service ID (facultatif, détection automatique si vide) : "
read "room_count?Nombre de chambres (facultatif, détection automatique si vide) : "
read "default_rate?Tarif moyen de départ en euros [110] : "
default_rate="${default_rate:-110}"

if [[ -f "$TARGET" ]]; then
  grep -vE '^(MEWS_ENVIRONMENT|MEWS_CLIENT_TOKEN|MEWS_ACCESS_TOKEN|MEWS_SERVICE_ID|MEWS_ROOM_COUNT|MEWS_DEFAULT_ROOM_RATE)=' "$TARGET" > "$TEMP" || true
else
  : > "$TEMP"
fi

{
  print -r -- "MEWS_ENVIRONMENT=$environment"
  print -r -- "MEWS_CLIENT_TOKEN=$client_token"
  print -r -- "MEWS_ACCESS_TOKEN=$access_token"
  print -r -- "MEWS_SERVICE_ID=$service_id"
  print -r -- "MEWS_ROOM_COUNT=$room_count"
  print -r -- "MEWS_DEFAULT_ROOM_RATE=$default_rate"
} >> "$TEMP"

mv "$TEMP" "$TARGET"
echo
echo "Configuration PMS enregistrée sans afficher les jetons."
echo "Relance maintenant ./start-revpilot.sh puis clique sur « Connecter un PMS »."
