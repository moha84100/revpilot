# Plan d’implémentation — vidéo commerciale dynamique RevPilot V4

Conception de référence : `docs/superpowers/specs/2026-07-17-video-commerciale-dynamique-design.md`

## Résultat attendu

Produire une vidéo commerciale RevPilot de 60 à 75 secondes reposant principalement sur un véritable enregistrement d’écran, avec zooms synchronisés, voix féminine ElevenLabs, copilote 2D ponctuel, sous-titres courts et CTA complet.

Le travail est découpé pour pouvoir tester et recommencer chaque partie indépendamment.

## Prérequis

- Node.js local déjà présent dans `.tools/node/bin` ;
- FFmpeg local déjà présent dans `.video-tools/node_modules/ffmpeg-static/ffmpeg` ;
- une clé privée `ELEVENLABS_API_KEY` ;
- un identifiant privé `ELEVENLABS_VOICE_ID` correspondant à une voix féminine française validée ;
- Chromium téléchargé par Playwright lors de la phase de capture.

Les secrets restent dans `video/v4/.env.local`. Ce fichier ne doit jamais être ajouté à Git.

## Tâche 1 — Préparer des sources V4 versionnables

### Fichiers

- modifier `.gitignore` ;
- créer `video/v4/.env.example` ;
- créer `video/v4/README.md` ;
- créer `video/v4/package.json` ;
- créer `video/v4/.gitignore`.

### Étapes

1. Remplacer l’exclusion globale de `/video/` par une règle qui conserve les anciens médias hors Git mais autorise `video/v4/**` et `video/SCRIPT_VIDEO_V4.md`.
2. Ignorer explicitement dans `video/v4/` : `.env.local`, `node_modules/`, `audio/`, `captures/`, `renders/` et `tmp/`.
3. Déclarer dans `.env.example` uniquement les noms `ELEVENLABS_API_KEY` et `ELEVENLABS_VOICE_ID`, avec des valeurs vides.
4. Ajouter les dépendances de développement Playwright et le SDK officiel ElevenLabs dans le package V4, séparé de l’application.
5. Documenter les commandes de génération sans valeur secrète.

### Vérification

```bash
git check-ignore video/v4/.env.local
git check-ignore video/v4/captures/test.webm
git check-ignore -v video/v4/README.md
```

Le troisième appel ne doit retourner aucune règle d’exclusion.

### Commit prévu

`Préparer la chaîne vidéo V4`

## Tâche 2 — Rendre les données de présentation déterministes

### Fichiers

- créer `app/src/presentation/videoPresentation.ts` ;
- créer `app/src/presentation/videoPresentation.test.ts` ;
- modifier `app/src/App.tsx`.

### Comportement

L’URL `/?videoPresentation=v4` active un mode dédié. Ce mode utilise la date de référence `2026-07-14T12:00:00`, réinitialise les décisions enregistrées et charge toujours le scénario volumétrique intégré.

Le module expose :

- `isVideoPresentation(search: string): boolean` ;
- `VIDEO_REFERENCE_DATE` ;
- `VIDEO_EXPECTED_POTENTIAL = 5296` ;
- les paramètres d’état initial destinés à la capture.

### Tests à écrire en premier

1. le mode reste inactif sans paramètre ;
2. le mode est actif uniquement avec `videoPresentation=v4` ;
3. l’analyse à la date de référence produit le potentiel attendu ;
4. les décisions locales précédentes ne modifient pas l’état de capture.

### Vérification

```bash
cd app
npm test -- src/presentation/videoPresentation.test.ts
```

### Commit prévu

`Stabiliser le scénario de présentation vidéo`

## Tâche 3 — Créer l’interface propre destinée à la capture

### Fichiers

- créer `app/src/presentation/VideoPresentationBadge.tsx` ;
- créer `app/src/presentation/VideoPresentationBadge.test.tsx` ;
- modifier `app/src/App.tsx` ;
- modifier `app/src/styles.css`.

### Comportement

Lorsque le mode V4 est actif :

- masquer le bandeau `Événements en mode simulation` ;
- masquer les badges `clé absente` ;
- afficher `Données de démonstration` dans une pastille discrète ;
- ne pas appeler les API événements, PMS et notifications au chargement ;
- conserver toutes les interactions locales utiles à la démo.

Ajouter les sélecteurs stables suivants :

- `data-video="demo-disclaimer"` ;
- `data-video="potential-kpi"` ;
- `data-video="priority-increase"` ;
- `data-video="decision-drawer"` ;
- `data-video="decision-price-input"` ;
- `data-video="decision-confidence"` ;
- `data-video="decision-accept"` ;
- `data-video="events-panel"` ;
- `data-video="notifications-trigger"` ;
- `data-video="notifications-drawer"`.

### Tests à écrire en premier

1. le badge de démonstration apparaît en mode V4 ;
2. les avertissements techniques n’apparaissent pas en mode V4 ;
3. ils restent présents dans le fonctionnement normal ;
4. tous les sélecteurs nécessaires à la capture existent.

### Vérification

```bash
cd app
npm test
npm run build
```

### Commit prévu

`Ajouter le mode de capture commerciale`

## Tâche 4 — Écrire et verrouiller la narration V4

### Fichiers

- créer `video/SCRIPT_VIDEO_V4.md` ;
- créer `video/v4/timeline.json` ;
- créer `video/v4/scripts/validate-timeline.mjs` ;
- créer `video/v4/scripts/validate-timeline.test.mjs`.

### Contenu du script

Le document contient sept scènes, leur texte exact, leur durée cible et les actions visibles. Le texte total vise 160 à 175 mots afin de rester proche de 150 mots par minute.

Le manifeste `timeline.json` définit pour chaque scène :

- identifiant ;
- durée minimale et maximale ;
- texte de narration ;
- sous-titre court ;
- sélecteurs UI utilisés ;
- instant de chaque clic ;
- instant, cible et niveau de chaque zoom ;
- apparition éventuelle du copilote ;
- transition entrante et sortante.

### Tests à écrire en premier

1. sept scènes sont présentes ;
2. la somme des durées reste entre 60 et 75 secondes ;
3. aucun zoom ne dépasse 135 % ;
4. aucun personnage ne reste plus de trois secondes ;
5. il existe au maximum quatre apparitions du personnage ;
6. le CTA dure au moins cinq secondes ;
7. tous les mots-clés appartiennent à la liste validée.

### Vérification

```bash
cd video/v4
npm test
```

### Commit prévu

`Écrire le scénario temporel de la vidéo V4`

## Tâche 5 — Générer la voix ElevenLabs par scène

### Fichiers

- créer `video/v4/scripts/generate-voice.mjs` ;
- créer `video/v4/scripts/audio-utils.mjs` ;
- créer `video/v4/scripts/audio-utils.test.mjs` ;
- modifier `video/v4/README.md`.

### Comportement

1. Charger `.env.local` sans afficher les valeurs.
2. Refuser de démarrer si la clé ou l’identifiant de voix manque.
3. Générer un MP3 distinct pour chaque scène dans `audio/`.
4. Conserver les réglages de stabilité et de style dans un objet versionné, sans secret.
5. Mesurer chaque durée avec FFprobe ou FFmpeg.
6. Mettre à jour un fichier dérivé `audio/durations.json`.
7. Refuser silencieusement tout fallback Edge TTS.

### Tests à écrire en premier

- validation des variables requises ;
- construction correcte des noms de fichiers ;
- rejet d’une réponse vide ;
- calcul du débit de parole ;
- absence de clé dans les erreurs et journaux.

Les tests utilisent un client ElevenLabs simulé et ne consomment aucun crédit.

### Vérification réelle

```bash
cd video/v4
npm run voice
```

Écouter les sept segments avant de poursuivre. La voix doit être validée manuellement pour son naturel, son débit et ses pauses.

### Commit prévu

`Automatiser la narration ElevenLabs`

## Tâche 6 — Automatiser les parcours du navigateur

### Fichiers

- créer `video/v4/playwright.config.mjs` ;
- créer `video/v4/scripts/capture-ui.mjs` ;
- créer `video/v4/scripts/browser-actions.mjs` ;
- créer `video/v4/scripts/browser-actions.test.mjs`.

### Comportement

Le pilote lance l’application sur `127.0.0.1`, ouvre `/?videoPresentation=v4` en 1920 × 1080 et enregistre une vidéo WebM par scène.

Il ne se fie jamais à une temporisation fixe pour attendre l’interface. Il attend les sélecteurs `data-video`, puis vérifie leur visibilité.

Le curseur visible est un élément HTML injecté dans la page. Chaque déplacement Playwright anime ce curseur. Chaque clic crée un halo de 300 millisecondes. Le curseur disparaît pendant les plans d’ambiance et le CTA.

### Parcours enregistrés

1. arrivée sur le tableau de bord et potentiel ;
2. ouverture d’une recommandation de hausse ;
3. modification légère du tarif et validation ;
4. défilement vers les événements ;
5. ouverture du centre d’alertes.

### Tests à écrire en premier

- erreur claire lorsqu’un sélecteur manque ;
- calcul du centre d’un élément ;
- déplacement du faux curseur ;
- création et suppression du halo ;
- validation de la résolution et du nombre de scènes.

### Vérification

```bash
cd video/v4
npx playwright install chromium
npm run capture
```

Chaque fichier de `captures/` doit être lisible, mesurer 1920 × 1080 et montrer l’action annoncée.

### Commit prévu

`Automatiser les enregistrements de RevPilot`

## Tâche 7 — Produire le copilote 2D original

### Fichiers

- créer `video/v4/character/pilot-base.svg` ;
- créer `video/v4/character/pilot-enter.svg` ;
- créer `video/v4/character/pilot-point.svg` ;
- créer `video/v4/character/pilot-positive.svg` ;
- créer `video/v4/character/pilot-exit.svg` ;
- créer `video/v4/character/README.md` ;
- créer `video/v4/scripts/validate-character.mjs`.

### Contraintes

- palette RevPilot bleu nuit, bleu principal et accent doré ;
- fond transparent ;
- silhouette cohérente entre toutes les poses ;
- aucun logo d’hôtel ou marque tierce ;
- lisibilité à une hauteur finale d’environ 180 pixels ;
- occupation maximale de 15 % du cadre ;
- aucune animation de lèvres.

Les mouvements d’entrée, de pointage, de réaction et de sortie sont produits au montage à partir de ces poses. Le personnage ne doit pas être régénéré différemment à chaque scène.

### Vérification

Le validateur contrôle le `viewBox`, la transparence, les couleurs autorisées et les dimensions. Une planche de comparaison PNG est ensuite examinée manuellement.

### Commit prévu

`Créer le copilote 2D RevPilot`

## Tâche 8 — Construire le compositeur vidéo

### Fichiers

- créer `video/v4/scripts/build-video.mjs` ;
- créer `video/v4/scripts/ffmpeg-filters.mjs` ;
- créer `video/v4/scripts/ffmpeg-filters.test.mjs` ;
- créer `video/v4/scripts/create-captions.mjs` ;
- créer `video/v4/scripts/create-cta.mjs`.

### Responsabilités

- convertir les captures WebM en plans H.264 homogènes ;
- appliquer des zooms progressifs de 105 à 135 % sans secousse ;
- conserver une pause lisible d’environ une seconde sur les chiffres ;
- superposer le copilote aux instants du manifeste ;
- brûler les sous-titres courts ;
- intégrer le plan hôtelier d’ouverture existant ;
- construire un CTA final différent de l’ouverture ;
- assembler les scènes avec fondus courts ou raccords sur clic ;
- ajouter la narration sans modifier sa vitesse.

### Tests à écrire en premier

- génération correcte des filtres de zoom ;
- refus d’un zoom supérieur à 135 % ;
- refus d’une position de personnage recouvrant la zone protégée ;
- CTA contenant téléphone, email et URL ;
- durée des fondus inférieure ou égale à 0,35 seconde.

### Vérification

```bash
cd video/v4
npm run build:video
```

Le résultat intermédiaire est écrit dans `renders/RevPilot_demo_V4_preview.mp4`.

### Commit prévu

`Assembler la vidéo commerciale V4`

## Tâche 9 — Ajouter les contrôles automatiques de livraison

### Fichiers

- créer `video/v4/scripts/validate-output.mjs` ;
- créer `video/v4/scripts/validate-output.test.mjs` ;
- créer `video/v4/QUALITY_CHECKLIST.md`.

### Contrôles automatiques

- codec H.264 et audio AAC ;
- résolution 1920 × 1080 ;
- fréquence 30 images par seconde ;
- durée comprise entre 60 et 75 secondes ;
- présence d’une piste audio ;
- CTA d’au moins cinq secondes dans le manifeste ;
- existence des deux MP4 et de la miniature ;
- taille raisonnable de la version de partage.

### Contrôles humains

1. visionnage sans son ;
2. visionnage avec son et contrôle de la synchronisation à 0,2 seconde ;
3. visionnage sur téléphone ;
4. recherche visuelle de tremblements ;
5. vérification qu’aucun avertissement API n’est visible ;
6. vérification qu’aucune donnée réelle d’hôtel n’apparaît ;
7. vérification du téléphone, de l’email et de l’URL.

### Commit prévu

`Contrôler la qualité de la vidéo V4`

## Tâche 10 — Exporter les livrables

### Fichiers produits

- `video/output/RevPilot_demo_V4_dynamique.mp4` ;
- `video/output/RevPilot_demo_V4_partage.mp4` ;
- `video/output/RevPilot_demo_V4_miniature.png`.

### Étapes

1. Copier le master validé depuis `renders/`.
2. Créer la version de partage avec un débit réduit sans rendre les textes flous.
3. Extraire ou composer la miniature avec `Découvrez le potentiel de votre hôtel`.
4. Exécuter le validateur de sortie.
5. Compléter manuellement `QUALITY_CHECKLIST.md`.
6. Ajouter les chemins de livraison à `README_LOGICIEL.md` sans versionner les gros médias dans Git.

### Vérification finale

```bash
cd video/v4
npm test
npm run validate
```

Puis exécuter depuis `app/` :

```bash
npm test
npm run build
```

### Commit prévu

`Documenter la livraison de la vidéo V4`

## Ordre d’exécution et points d’arrêt

Les tâches sont réalisées dans l’ordre. Trois validations humaines bloquent la suite :

1. validation de la voix après la tâche 5 ;
2. validation visuelle du copilote après la tâche 7 ;
3. validation de la préversion après la tâche 8.

Si une validation est refusée, seule l’unité correspondante est reprise. Le mode présentation, les captures et les autres médias validés restent inchangés.

## Dépendances externes et autorisations nécessaires

- téléchargement de Playwright Chromium ;
- installation du SDK ElevenLabs dans `video/v4/` ;
- utilisation de crédits ElevenLabs pour la narration réelle ;
- éventuelle ouverture du navigateur pour contrôler les captures.

Ces actions nécessitent l’autorisation de l’utilisateur au moment où elles seront exécutées.
