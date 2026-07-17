# Plan d’implémentation — RevPilot V4 avec Vivienne et vidéos contextuelles

Conception de référence : `docs/superpowers/specs/2026-07-17-video-v4-voix-vivienne-et-clips-design.md`

## Résultat attendu

Produire un master de 69 à 72 secondes avec la narration Vivienne, quatre vidéos contextuelles, les captures animées RevPilot, les sous-titres, le copilote et le CTA complet.

## 1. Génération vocale locale

Fichiers à modifier ou créer :

- `video/v4/scripts/generate-local-voice.mjs` ;
- `video/v4/scripts/local-voice-utils.mjs` ;
- `video/v4/scripts/local-voice-utils.test.mjs` ;
- `video/v4/package.json` ;
- `video/v4/README.md`.

Actions :

1. lire les sept narrations depuis `timeline.json` ;
2. utiliser Edge TTS avec `fr-FR-VivienneMultilingualNeural`, un débit proche de `+8 %` et une hauteur légèrement abaissée ;
3. écrire les pistes dans `video/v4/audio/` avec les noms déjà attendus par le compositeur ;
4. mesurer chaque piste et refuser toute phrase plus longue que sa scène ;
5. conserver un fichier `durations.json` avec la durée et le débit mesurés.

Vérification : tests unitaires, présence des sept pistes et écoute de contrôle sur plusieurs scènes.

## 2. Intégration des vidéos contextuelles

Fichiers à modifier :

- `video/v4/timeline.json` ;
- `video/v4/scripts/compose-video.mjs` ;
- `video/v4/scripts/compositor-utils.mjs` ;
- tests associés.

Découpage :

- `hotel-hook` : `hotel-intro.mp4` sur toute l’accroche ;
- `human-decision` : `manager-decision.mp4` en courte introduction, puis capture RevPilot ;
- `events` : `city-event.mp4` en introduction, puis panneau des événements ;
- `alerts` : `phone-alert.mp4` en introduction, puis centre de notifications.

Chaque cutaway dure entre 2,5 et 4 secondes. Les transitions sont des fondus de 0,25 à 0,4 seconde, sans tremblement ni mouvement aléatoire.

## 3. Composition et export

Le compositeur :

1. rend chaque scène en 1920 × 1080 à 30 images par seconde ;
2. mélange cutaway, capture, personnage et sous-titre ;
3. ajoute la piste Vivienne correspondante ;
4. concatène les sept scènes en réencodant les horodatages ;
5. produit le master, la version de partage et la miniature.

Sorties :

- `video/output/RevPilot_demo_V4_dynamique.mp4` ;
- `video/output/RevPilot_demo_V4_partage.mp4` ;
- `video/output/RevPilot_demo_V4_miniature.png`.

## 4. Contrôles finaux

- tous les tests application et vidéo passent ;
- durée entre 60 et 75 secondes ;
- H.264/AAC, 1920 × 1080, 30 images par seconde ;
- sept pistes Vivienne présentes ;
- quatre vidéos contextuelles réellement utilisées ;
- aucune phrase coupée ;
- vérification visuelle de l’accroche, de la décision, des événements, des alertes et du CTA ;
- création d’une version légère lisible sur téléphone et par e-mail.
