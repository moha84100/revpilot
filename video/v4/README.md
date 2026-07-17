# Production vidéo RevPilot V4

Cette chaîne fabrique la démonstration commerciale dynamique à partir de la vraie interface RevPilot. Les captures, pistes audio et rendus restent locaux ; les scripts et la timeline sont versionnés.

## Préparation

```bash
cp .env.example .env.local
npm install
npx playwright install chromium
```

Renseigner dans `.env.local` une clé ElevenLabs et l’identifiant d’une voix féminine française. Ne jamais partager ni versionner ce fichier.

Depuis la racine du projet, la méthode la plus simple est :

```bash
./configure-video-voice.sh
```

La clé est saisie de manière masquée. Le script crée le fichier privé `.env.local` avec des droits restreints.

## Commandes

```bash
npm test
npm run voice
npm run capture
npm run compose
npm run validate:output
```

La capture attend l’application sur `http://127.0.0.1:4173/?videoPresentation=v4`. Les exports finaux sont écrits dans `../output/`.

La voix est générée avec le modèle multilingue d’ElevenLabs, adapté à une narration française naturelle. Aucun remplacement automatique par une voix système n’est autorisé.
