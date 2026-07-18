# RevPilot — plan d’implémentation produit final et scénarios d’import

## Objectif

Livrer la spécification validée : conserver l’accueil premium, ouvrir RevPilot comme un produit final, fournir huit scénarios CSV importables et rendre les effets de chaque import immédiatement comparables.

## Garde-fous

- Ne pas modifier les règles de revenue management pour forcer les résultats.
- Faire passer les scénarios intégrés par le même parseur que les fichiers locaux.
- Ne jamais remplacer le dernier jeu valide après une erreur.
- Ne pas présenter une connexion, un hôtel ou une donnée synthétique comme réels.
- Préserver les paramètres internes nécessaires aux captures vidéo existantes.
- Respecter la base GitHub Pages `/revpilot/`, le clavier, le mobile et la réduction des animations.
- Ne pas toucher aux fichiers non suivis qui n’appartiennent pas à cette évolution.

## Étape 1 — Modèle des scénarios et tests métier

Fichiers :

- créer `app/src/data/importScenarios.ts` ;
- créer `app/src/data/importScenarios.test.ts` ;
- compléter `app/src/data/syntheticReservations.ts` seulement si une primitive CSV existante peut être réutilisée sans couplage.

Actions :

1. Définir les métadonnées des huit scénarios, leur ordre, leur horizon et leurs signaux attendus.
2. Construire des lignes journalières déterministes à partir de petites fonctions spécialisées.
3. Écrire d’abord les tests de distribution : hausse, baisse, stimulation, maintien et surbooking.
4. Vérifier que le scénario mixte exerce chaque signal et que les sept scénarios ciblés restent nettement dominants.
5. Exporter un sérialiseur CSV compatible avec les en-têtes reconnus par `parseCsvFile`.

Vérification : tests unitaires du catalogue et des distributions, sans modification du moteur `analysis.ts`.

## Étape 2 — Génération et validation des huit CSV

Fichiers :

- créer `app/scripts/generateImportScenarios.ts` ;
- créer `app/public/scenarios/01-forte-demande.csv` à `08-portefeuille-mixte-90-jours.csv` ;
- modifier `app/package.json`.

Actions :

1. Ajouter une commande `generate:scenarios` déterministe.
2. Générer les huit fichiers sous `public/scenarios/`.
3. Ajouter un test qui charge chaque asset, le transforme en `File`, puis l’envoie à `parseCsvFile`.
4. Vérifier les nombres de lignes, plages de dates, colonnes requises et distributions attendues.
5. Garantir qu’une seconde génération ne produit aucun diff.

Vérification : génération répétable, tests CSV et `git diff --check`.

## Étape 3 — Bilan avant/après pur

Fichiers :

- créer `app/src/lib/importComparison.ts` ;
- créer `app/src/lib/importComparison.test.ts`.

Actions :

1. Définir un bilan stable à partir de deux `AnalysisSummary`.
2. Calculer les écarts d’occupation, hausses, baisses/stimulations, surbookings et volume analysé.
3. Produire une phrase de synthèse déterministe selon l’écart le plus significatif.
4. Tester valeurs positives, négatives, inchangées et égalités.

Vérification : fonction pure couverte sans rendu React.

## Étape 4 — Catalogue accessible

Fichiers :

- créer `app/src/components/ImportScenarioCatalog.tsx` ;
- créer `app/src/components/ImportScenarioCatalog.test.tsx` ;
- modifier `app/src/premium.css`.

Actions :

1. Construire la section « Essayer avec des données d’exemple ».
2. Afficher huit cartes compactes avec description, signaux attendus et état actif.
3. Ajouter « Charger ce scénario » et « Télécharger le CSV » avec noms accessibles explicites.
4. Afficher un état de chargement local, désactiver les doubles actions et annoncer l’état avec `aria-live`.
5. Implémenter une grille responsive, des cibles de 44 px et des focus visibles.

Vérification : huit cartes, seize actions, clavier, état de chargement, chemins GitHub Pages.

## Étape 5 — Intégration atomique et comparaison visible

Fichiers :

- modifier `app/src/App.tsx` ;
- créer `app/src/components/ImportComparisonPanel.tsx` ;
- créer ou compléter les tests d’intégration du tableau de bord ;
- modifier `app/src/premium.css`.

Actions :

1. Extraire une seule fonction d’application d’un `ParsedDataset` pour les imports locaux et intégrés.
2. Calculer le résumé précédent avant de remplacer les lignes.
3. Réinitialiser sélection et filtre, puis choisir l’horizon du scénario.
4. Garder les données précédentes en cas d’échec réseau ou de parsing.
5. Afficher un panneau « Analyse mise à jour » avec valeurs avant/après, icônes, texte et fermeture explicite.
6. Garder la source active visible et faire passer la restauration par le même bilan.
7. Retirer l’export brut de réservations de la zone d’import ; le placer dans une rubrique technique avec la mention « non importable dans cette version ».

Vérification : KPI et recommandations changent, comparaison correcte, erreur non destructive, restauration correcte.

## Étape 6 — Vocabulaire du produit final

Fichiers :

- modifier `app/src/marketing/MarketingHome.tsx` et son test ;
- modifier `app/src/marketing/marketing.css` ;
- modifier `app/src/App.tsx` et les composants de présentation concernés ;
- modifier `app/src/RootApp.tsx` ;
- modifier `app/scripts/postbuild.mjs` et `app/scripts/verify-seo.mjs`.

Actions :

1. Remplacer les appels à la démo par « Accéder à RevPilot », « Ouvrir le tableau de bord » ou « Voir RevPilot en situation ».
2. Remplacer « Grand Hôtel Démo » par « Mon hôtel » dans le parcours standard.
3. Renommer les sources et remises à zéro en « Données d’exemple ».
4. Conserver les mentions de données fictives nécessaires à la transparence.
5. Passer le titre `/app/` à « RevPilot — Pilotage hôtelier ».
6. Retirer toute mention de démonstration de la page 404 et mettre à jour le vérificateur statique.
7. Ajouter un test de non-régression qui recherche le vocabulaire interdit dans le parcours standard.

Vérification : tests marketing, test de copie, build statique et directive `noindex`.

## Étape 7 — Revue UX et finition visuelle

Actions :

1. Appliquer le design system Quiet Luxury existant sans ajouter une seconde direction visuelle.
2. Faire du panneau avant/après la signature de cette évolution : une transition courte de données, pas une animation décorative.
3. Vérifier contraste, focus, touch targets, `aria-live`, lecture mobile et absence de scroll horizontal.
4. Respecter `prefers-reduced-motion` pour la transition du panneau.
5. Contrôler 375, 768, 1024 et 1440 px, plus le paysage mobile.

Vérification : inspection navigateur et captures comparatives des quatre scénarios principaux.

## Étape 8 — Revue finale, commit et déploiement

Actions :

1. Lancer tous les tests, TypeScript, build, post-build et vérification SEO.
2. Inspecter le diff avec `code-review` et corriger les défauts à forte confiance.
3. Vérifier que seuls les fichiers de cette fonctionnalité sont suivis.
4. Committer l’implémentation, pousser `main` et attendre GitHub Pages.
5. Vérifier en production `/`, `/app/`, les huit CSV, `robots.txt` et `sitemap.xml`.

## Terminé lorsque

RevPilot parle comme le produit final, chaque scénario peut être chargé et téléchargé, les différences apparaissent dans les KPI et le panneau avant/après, les huit distributions sont vérifiées automatiquement, tous les tests et le build passent, et la version est confirmée sur GitHub Pages.
