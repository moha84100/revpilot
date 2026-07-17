# Plan d’implémentation — V4 corrigée et success story Higgsfield

Conception de référence : `docs/superpowers/specs/2026-07-17-video-v5-success-story-higgsfield-design.md`

## Résultat attendu

Produire une V4 corrigée de 59 à 61 secondes sans longs silences, puis une publicité V5 de 58 à 63 secondes mettant en scène deux hôteliers fictifs et intégrant de véritables écrans RevPilot.

## Tâche 1 — Installer et authentifier Higgsfield

1. Installer uniquement les compétences officielles `higgsfield-generate` et `higgsfield-soul-id` depuis `higgsfield-ai/skills`.
2. Vérifier la présence de la commande `higgsfield`.
3. Lancer `higgsfield auth login` et laisser l’utilisateur terminer la connexion dans le navigateur.
4. Vérifier le compte et le solde de crédits sans afficher de jeton privé.
5. Inspecter les modèles disponibles et leur coût avant toute génération.

## Tâche 2 — Corriger les silences de la V4

1. Ajouter un manifeste compact distinct afin de préserver la V4 existante.
2. Ramener chaque scène à la durée de sa narration plus une respiration courte.
3. Recaler proportionnellement clics, zooms et apparitions du personnage.
4. Ajouter des raccords audio de 100 à 250 ms et une ambiance sonore discrète.
5. Produire `RevPilot_demo_V4_sans_blancs.mp4` et sa version légère.
6. Vérifier automatiquement durée, images noires et silences supérieurs à une seconde.

## Tâche 3 — Préparer la chaîne V5

1. Créer `video/v5/` avec un manifeste de scènes, un dossier de prompts, des scripts de contrôle et une documentation locale.
2. Versionner les dialogues exacts, les mentions obligatoires et le CTA.
3. Définir les six plans, les axes caméra, les durées et les raccords.
4. Préparer les emplacements des médias générés sans versionner les fichiers lourds.

## Tâche 4 — Créer les personnages récurrents

1. Générer plusieurs propositions visuelles pour le directeur et la directrice fictifs.
2. Sélectionner une apparence professionnelle et crédible pour chaque personnage.
3. Créer ou enregistrer leurs références Soul afin de préserver leur identité.
4. Produire une fiche de continuité : visage, tenue, voix, accessoires, lumière et décor.

## Tâche 5 — Générer les plans Higgsfield

1. Calculer et afficher le coût de chaque génération.
2. Générer d’abord un seul plan pilote à faible coût.
3. Contrôler le réalisme, la direction artistique et la cohérence du casting.
4. Générer les cinq autres plans seulement après validation du plan pilote.
5. Régénérer uniquement les plans comportant morphing, mains incorrectes, regard caméra involontaire ou rupture de continuité.

## Tâche 6 — Produire les dialogues

1. Générer deux voix françaises distinctes et naturelles.
2. Produire ou corriger le lip-sync des plans parlés.
3. Transformer en voix hors champ tout plan qui reste imparfait après deux essais.
4. Normaliser les voix et préparer les sous-titres français.

## Tâche 7 — Intégrer RevPilot

1. Réutiliser les captures déterministes du mode présentation V4.
2. Montrer le potentiel estimé, la recommandation expliquée, les événements et la validation humaine.
3. Conserver `Données de démonstration` et `Estimation à valider`.
4. Réaliser le raccord entre l’ordinateur du personnage et le véritable écran du produit.

## Tâche 8 — Monter et contrôler la V5

1. Assembler les scènes jouées, les captures, les voix, l’ambiance, la musique, les sous-titres et le CTA.
2. Afficher `Mise en situation fictive` pendant toutes les scènes jouées.
3. Produire le master Full HD, la version légère et la miniature.
4. Contrôler : durée, codecs, résolution, images noires, silences, lisibilité du CTA et mentions obligatoires.
5. Produire un rapport JSON de contrôle qualité.

## Tâche 9 — Livrer

1. Conserver tous les scripts et prompts versionnables dans Git.
2. Conserver les médias lourds dans `video/output/` et les dossiers ignorés.
3. Fournir des liens locaux directs vers les deux masters, les versions légères et les miniatures.

## Ordre des validations coûteuses

Les étapes locales et la correction V4 sont exécutées sans crédit Higgsfield. Pour la V5, aucun lot complet n’est généré avant le contrôle du compte, l’affichage du coût et la réussite d’un plan pilote.
