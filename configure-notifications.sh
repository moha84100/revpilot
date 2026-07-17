#!/bin/zsh
set -e

ROOT="${0:A:h}"
TARGET="$ROOT/.env.local"
TEMP="$ROOT/.env.local.tmp"
umask 077

echo "Configuration des notifications réelles RevPilot avec Brevo"
echo "Crée d'abord une clé API sur https://app.brevo.com/settings/keys/api"
echo "Laisse WhatsApp vide tant que ton compte Business et ton modèle ne sont pas validés."
echo

read "api_key?Clé API Brevo : "
read "sender_email?Adresse e-mail d'expédition vérifiée : "
read "sender_name?Nom d'expédition [RevPilot] : "
read "sms_sender?Nom SMS [RevPilot] : "
read "whatsapp_sender?Numéro WhatsApp Business avec indicatif, sans espaces (facultatif) : "
read "whatsapp_template?Identifiant du modèle WhatsApp approuvé (facultatif) : "

sender_name="${sender_name:-RevPilot}"
sms_sender="${sms_sender:-RevPilot}"

if [[ -f "$TARGET" ]]; then
  grep -vE '^(BREVO_API_KEY|BREVO_SENDER_EMAIL|BREVO_SENDER_NAME|BREVO_SMS_SENDER|BREVO_WHATSAPP_SENDER_NUMBER|BREVO_WHATSAPP_TEMPLATE_ID)=' "$TARGET" > "$TEMP" || true
else
  : > "$TEMP"
fi

{
  print -r -- "BREVO_API_KEY=$api_key"
  print -r -- "BREVO_SENDER_EMAIL=$sender_email"
  print -r -- "BREVO_SENDER_NAME=$sender_name"
  print -r -- "BREVO_SMS_SENDER=$sms_sender"
  print -r -- "BREVO_WHATSAPP_SENDER_NUMBER=$whatsapp_sender"
  print -r -- "BREVO_WHATSAPP_TEMPLATE_ID=$whatsapp_template"
} >> "$TEMP"

mv "$TEMP" "$TARGET"
echo
echo "Configuration enregistrée sans afficher la clé."
echo "Relance ./start-revpilot.sh, ouvre les préférences de notification puis clique sur Tester."
