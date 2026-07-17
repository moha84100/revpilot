#!/bin/zsh
set -e

ROOT="${0:A:h}"
TARGET="$ROOT/.env.local"
TEMP="$ROOT/.env.local.tmp"
umask 077

echo "Configuration des API d'événements RevPilot"
echo "Laisse une valeur vide si tu n'as pas encore la clé."
echo

read "ticketmaster?Clé Ticketmaster : "
read "predicthq?Jeton PredictHQ : "
read "openagenda?Clé OpenAgenda : "
read "agenda_uids?Identifiants OpenAgenda séparés par des virgules : "

if [[ -f "$TARGET" ]]; then
  grep -vE '^(TICKETMASTER_API_KEY|PREDICTHQ_TOKEN|OPENAGENDA_API_KEY|OPENAGENDA_AGENDA_UIDS)=' "$TARGET" > "$TEMP" || true
else
  : > "$TEMP"
fi

{
  print -r -- "TICKETMASTER_API_KEY=$ticketmaster"
  print -r -- "PREDICTHQ_TOKEN=$predicthq"
  print -r -- "OPENAGENDA_API_KEY=$openagenda"
  print -r -- "OPENAGENDA_AGENDA_UIDS=$agenda_uids"
} >> "$TEMP"

mv "$TEMP" "$TARGET"

echo
echo "Configuration enregistrée dans $TARGET"
echo "Relance maintenant ./start-revpilot.sh"
