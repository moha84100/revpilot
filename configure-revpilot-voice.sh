#!/bin/zsh
set -e

ROOT="${0:A:h}"
TARGET="$ROOT/voice-agent/.env.local"

echo "Configuration privée de RevPilot Voice"
echo "Les secrets seront enregistrés uniquement dans $TARGET"
echo

read -rs "OPENAI_KEY?Clé API OpenAI (saisie masquée) : "
echo
read -r "TWILIO_SID?Twilio Account SID : "
read -rs "TWILIO_TOKEN?Twilio Auth Token (saisie masquée) : "
echo
read -r "TWILIO_NUMBER?Numéro Twilio, ex. +33123456789 : "
read -r "RECEPTION_NUMBER?Numéro de la réception, ex. +33490000000 : "
read -r "PUBLIC_URL?Adresse publique HTTPS du serveur : "

if [[ -z "$OPENAI_KEY" || -z "$TWILIO_SID" || -z "$TWILIO_TOKEN" ]]; then
  echo "Erreur : les identifiants OpenAI et Twilio sont obligatoires pour les vrais appels."
  exit 1
fi

if [[ "$PUBLIC_URL" != https://* ]]; then
  echo "Erreur : l’adresse publique doit commencer par https://"
  exit 1
fi

umask 077
{
  echo "VOICE_PORT=4180"
  echo "PUBLIC_BASE_URL=$PUBLIC_URL"
  echo "OPENAI_API_KEY=$OPENAI_KEY"
  echo "OPENAI_REALTIME_MODEL=gpt-realtime"
  echo "OPENAI_REALTIME_VOICE=marin"
  echo "TWILIO_ACCOUNT_SID=$TWILIO_SID"
  echo "TWILIO_AUTH_TOKEN=$TWILIO_TOKEN"
  echo "TWILIO_PHONE_NUMBER=$TWILIO_NUMBER"
  echo "RECEPTION_PHONE_NUMBER=$RECEPTION_NUMBER"
} > "$TARGET"

echo
echo "Configuration enregistrée avec des permissions privées."
echo "Il reste à configurer le webhook du numéro Twilio :"
echo "  $PUBLIC_URL/twilio/voice"
