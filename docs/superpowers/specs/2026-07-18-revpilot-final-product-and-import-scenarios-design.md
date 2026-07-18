# RevPilot — produit final et scénarios d’import

## Objectif

Présenter RevPilot comme un produit utilisable, et non comme une démonstration commerciale, tout en permettant à un visiteur d’évaluer clairement les réactions de l’analyse à plusieurs situations hôtelières.

Le travail porte sur deux éléments liés :

- remplacer le vocabulaire public de démonstration par un parcours produit cohérent ;
- fournir un catalogue de fichiers CSV valides, nettement différenciés et chargeables dans l’application.

La page d’accueil premium reste la route publique `/`. Ses appels à l’action ouvrent le produit à `/app/`. Cette évolution n’ajoute ni authentification, ni facturation, ni connexion PMS fictive, ni écriture automatique de tarifs.

## Critères de réussite

- La page d’accueil ne demande plus de « lancer », « explorer » ou « tester » une démo.
- Le bouton principal emploie une formulation produit stable, « Accéder à RevPilot ».
- La route `/app/` porte le titre « RevPilot — Pilotage hôtelier » et ressemble à l’application finale.
- Les données synthétiques restent honnêtement identifiées comme « Données d’exemple » lorsqu’elles sont affichées.
- Huit CSV valides peuvent être téléchargés ou chargés directement depuis RevPilot.
- Chaque scénario déclenche une distribution de recommandations reconnaissable et reproductible.
- Après chaque import, l’interface montre ce qui a réellement changé dans l’analyse.
- L’import manuel et le chargement d’un scénario utilisent le même parseur et les mêmes règles métier.
- Les erreurs conservent le dernier jeu de données valide et expliquent comment corriger le fichier.

## Positionnement produit final

### Page d’accueil

Les liens vers `/app/` utilisent une terminologie produit :

- « Accéder à RevPilot » pour l’action principale ;
- « Ouvrir le tableau de bord » lorsqu’un libellé plus descriptif est utile ;
- « Voir RevPilot en situation » pour la section qui illustre le fonctionnement sans prétendre afficher des données réelles.

Les mentions « démo », « démonstration », « lancer la démo », « explorer la démo » et « tester avec les données de démonstration » disparaissent du parcours standard. Les aperçus synthétiques sont décrits comme des « données d’exemple » ou un « exemple hôtelier ».

### Application

La route `/app/` devient l’entrée normale du produit :

- titre du document : « RevPilot — Pilotage hôtelier » ;
- identité neutre : « Mon hôtel », avec la capacité et la ville existantes ;
- source initiale : « Données d’exemple RevPilot » ;
- action de remise à zéro : « Restaurer les données d’exemple » ;
- aucune connexion PMS n’est indiquée comme active si aucun fournisseur réel n’est configuré.

Le mode de présentation vidéo piloté par des paramètres d’URL peut rester compatible pour ne pas casser les captures existantes, mais ses libellés spécialisés ne doivent jamais apparaître dans le parcours standard.

### Transparence

« Produit final » signifie ici que le site parle comme le produit, pas qu’il simule des services inexistants. Les données fictives conservent une mention discrète et explicite. Mews ne peut être indiqué comme connecté qu’après une réponse positive du fournisseur existant. Le connecteur synthétique reste clairement séparé des intégrations réelles.

## Catalogue des scénarios

### Scénarios fournis

Le catalogue contient huit fichiers déterministes :

| Fichier | Situation dominante | Résultat attendu |
| --- | --- | --- |
| `01-forte-demande.csv` | Occupation et pickup élevés | Plusieurs hausses tarifaires |
| `02-demande-faible.csv` | Faible occupation à court terme | Baisses et actions de visibilité |
| `03-evenement-majeur.csv` | Événement actuel sans équivalent N-1 | Hausses motivées par l’événement |
| `04-evenement-n1-absent.csv` | Événement porteur présent uniquement à N-1 | Baisses motivées par la perte de demande |
| `05-surbooking.csv` | Ventes supérieures à la capacité | Alertes de surbooking et fermeture des ventes |
| `06-annulations-elevees.csv` | Faible demande et annulations récentes | Actions de stimulation avec explication enrichie |
| `07-activite-stable.csv` | Occupation et rythme normaux | Majorité de maintiens tarifaires |
| `08-portefeuille-mixte-90-jours.csv` | Combinaison de toutes les situations | Vue complète de tous les signaux |

Les sept scénarios ciblés couvrent au moins 21 dates consécutives. Le scénario mixte en couvre 90. Toutes les dates sont cohérentes avec la date de référence actuellement employée par le moteur afin que les règles à J-10, J-30, J-60 et J-120 restent reproductibles.

### Format et génération

Les CSV utilisent les en-têtes français déjà reconnus par `parseCsvFile`. Ils sont stockés sous `app/public/scenarios/` et peuvent donc être téléchargés sans code serveur.

Une définition TypeScript centralise pour chaque scénario :

- identifiant et ordre ;
- nom, description et intention métier ;
- chemin du CSV ;
- horizon d’affichage conseillé ;
- signaux dominants attendus.

Les fichiers sont produits par un générateur déterministe versionné, puis vérifiés par les tests. Le générateur évite huit fichiers maintenus manuellement qui pourraient diverger. Les CSV générés restent eux-mêmes versionnés pour être disponibles directement dans le déploiement statique.

Le gros export de réservations existant n’est plus présenté comme importable par le champ CSV journalier. Il est retiré de la zone d’import et reste uniquement téléchargeable dans une rubrique technique distincte, sous le libellé « Jeu de réservations brut — non importable dans cette version ». Aucun bouton ne doit laisser croire qu’un format est accepté lorsqu’il ne l’est pas.

## Expérience d’import

### Catalogue intégré

Sous la zone d’import, une section « Essayer avec des données d’exemple » affiche les huit scénarios sous forme de cartes compactes. Chaque carte contient :

- le nom de la situation ;
- une phrase expliquant ce que RevPilot devrait détecter ;
- deux à quatre badges décrivant les signaux attendus ;
- une action principale « Charger ce scénario » ;
- une action secondaire « Télécharger le CSV ».

Le catalogue reste lisible au clavier et sur mobile. Les actions ont une zone tactile d’au moins 44 px et ne reposent pas uniquement sur la couleur.

### Chargement

« Charger ce scénario » suit exactement le parcours d’un fichier local :

1. récupérer le CSV statique ;
2. construire un objet `File` ;
3. l’envoyer à `parseCsvFile` ;
4. analyser les lignes avec `analyzeData` ;
5. remplacer le jeu de données seulement si toutes les étapes réussissent ;
6. réinitialiser le filtre, la sélection et l’horizon selon le scénario ;
7. afficher le bilan de l’import.

Pendant le chargement, l’action indique son état et ne peut pas être déclenchée plusieurs fois. Une erreur réseau ou de format laisse les données précédentes intactes.

### Bilan avant/après

Après un import local ou le chargement d’un scénario, un panneau persistant « Analyse mise à jour » montre :

- le nom de la source et le nombre de dates analysées ;
- l’occupation moyenne avant et après ;
- le nombre de hausses avant et après ;
- le nombre de baisses ou stimulations avant et après ;
- le nombre d’alertes de surbooking avant et après ;
- une phrase de synthèse issue des écarts les plus significatifs.

Les valeurs précédentes restent visibles jusqu’au prochain import ou à la fermeture explicite du panneau. Les changements sont indiqués par du texte, des nombres et des icônes ; le vert ou le rouge ne constitue jamais le seul signal.

La source active reste visible dans l’en-tête de données. Le bouton de restauration recharge les données d’exemple initiales et produit le même bilan avant/après.

## Architecture

Les responsabilités sont isolées :

- `scenarioCatalog` décrit les scénarios sans connaître React ;
- le générateur construit les lignes déterministes et les CSV ;
- `parseCsvFile` reste l’unique frontière de validation des imports ;
- une fonction pure calcule le bilan avant/après ;
- le composant de catalogue gère uniquement l’affichage et les actions ;
- `DashboardApp` orchestre la source active, le chargement et le remplacement atomique des données.

Le moteur de recommandations n’est pas modifié pour fabriquer des différences. Les fichiers sont conçus pour exercer les règles existantes. Si un scénario ne produit plus le signal attendu après une évolution du moteur, un test doit échouer et forcer une décision explicite.

## Erreurs et états limites

- Fichier inaccessible : « Ce scénario n’a pas pu être chargé. Téléchargez-le puis importez-le manuellement. »
- CSV invalide : afficher la ligne et la cause déjà fournies par le parseur.
- Jeu vide : conserver les données actives et afficher l’erreur existante.
- Scénario sans différence notable : le test de distribution échoue ; l’interface ne prétend pas qu’un changement a eu lieu.
- Chargement concurrent : une seule opération est acceptée à la fois.
- Restauration : revient au jeu initial sans effacer les préférences ou décisions qui ne dépendent pas du fichier, sauf si leur date n’existe plus dans le nouveau jeu.

## SEO et métadonnées

La page d’accueil garde son titre indexable actuel. La route `/app/` reste `noindex, nofollow`, car elle ne doit pas concurrencer la page commerciale, mais son titre devient « RevPilot — Pilotage hôtelier ».

Le post-traitement statique et son vérificateur SEO doivent rechercher le nouveau titre produit. La page 404 renvoie vers « l’accueil » ou « RevPilot », jamais vers une démonstration.

## Tests

### Données et logique

- Chaque CSV est accepté par `parseCsvFile`.
- Chaque fichier contient le nombre et la plage de dates prévus.
- Chaque scénario ciblé produit sa majorité ou son minimum de signaux attendus.
- Le scénario mixte contient au moins une hausse, une baisse, une stimulation, un maintien et un surbooking.
- Le bilan avant/après est exact pour les augmentations, diminutions et valeurs inchangées.
- Un échec de parsing ne remplace pas les données valides.

### Interface

- Les huit cartes sont affichées avec deux actions accessibles.
- Charger un scénario met à jour la source, les KPI, les recommandations et le panneau avant/après.
- Télécharger un scénario pointe vers le bon fichier statique.
- L’état de chargement empêche les doubles actions.
- Le bouton de restauration revient au jeu initial.
- Aucun libellé standard de la page d’accueil ou de l’application ne présente RevPilot comme une démo.
- Le titre `/app/`, la directive `noindex` et la 404 sont vérifiés après build.

### Revue manuelle

- Comparer visuellement forte demande, activité stable, surbooking et scénario mixte.
- Vérifier le catalogue à 375, 768, 1024 et 1440 px.
- Parcourir toutes les cartes au clavier.
- Vérifier le panneau de comparaison avec et sans réduction des animations.
- Confirmer qu’un visiteur comprend à la fois que RevPilot est le produit et que les scénarios fournis sont fictifs.

## Livraison

La livraison comprend les huit CSV, leur générateur déterministe, le catalogue intégré, le bilan avant/après, la révision complète du vocabulaire standard, les tests, le build et la vérification du déploiement GitHub Pages.

Elle n’inclut pas une nouvelle logique de revenue management, l’agrégation d’un export de réservations arbitraire, une authentification, un stockage multi-hôtel, un paiement, ni une fausse connexion à un service externe.
