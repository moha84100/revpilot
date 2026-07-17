# RevPilot — prototype logiciel

Guide pas à pas pour récupérer et installer tous les accès externes : [manuel très simple des clés API](MANUEL_RECUPERATION_CLES_API.md).

Voir aussi : [architecture des notifications](NOTIFICATIONS_ARCHITECTURE.md).

Les envois réels par e-mail, SMS et WhatsApp sont disponibles via Brevo après configuration :

```bash
./configure-notifications.sh
./start-revpilot.sh
```

Ouvrir ensuite les préférences de notification. Chaque canal affiche son état et propose un bouton **Tester** lorsque les informations nécessaires sont présentes. WhatsApp nécessite un numéro Business et un modèle approuvé.

Nouveau module : [RevPilot Voice, agent vocal hôtelier](README_VOICE.md).

Vidéo de présentation client avec voix féminine, version recalée : [RevPilot_demo_commerciale_voix_feminine_recalee.mp4](video/output/RevPilot_demo_commerciale_voix_feminine_recalee.mp4). Le discours complet est disponible dans [video/SCRIPT_VIDEO.md](video/SCRIPT_VIDEO.md).

RevPilot transforme un export quotidien du PMS en trois réponses simples :

1. quelles dates demandent une attention immédiate ;
2. pourquoi le rythme de réservation est inhabituel ;
3. quelle action tarifaire l’hôtelier peut envisager.

Le prototype ne modifie jamais les prix automatiquement. Toutes les recommandations restent consultatives.

## Connexion PMS Mews

Le logiciel possède maintenant un premier connecteur PMS **Mews en lecture seule**. Il récupère :

- la capacité de l'établissement ;
- les réservations confirmées, en séjour et terminées ;
- le pickup des sept derniers jours ;
- l'occupation par date ;
- la comparaison avec les réservations de l'année précédente.

Pour tester l'écran sans identifiants, cliquer sur **Connecter un PMS**, puis **Connexion de démonstration**.

Pour connecter un véritable établissement Mews :

```bash
./configure-pms.sh
./start-revpilot.sh
```

Mews doit fournir le `Client Token` de l'intégration et l'administrateur de l'hôtel doit autoriser un `Access Token`. Ces secrets sont placés dans `.env.local`, jamais dans le navigateur ni dans Git.

Cette première version ne lit pas encore les écritures comptables détaillées : le chiffre d'affaires utilise temporairement le tarif moyen configuré. Elle n'écrit aucune donnée et ne modifie aucun prix dans Mews.

## Lancer l’application

Depuis un terminal ouvert dans le dossier `hotel-revenue` :

```bash
./start-revpilot.sh
```

Ouvrir ensuite l’adresse affichée, normalement <http://127.0.0.1:4173>.

Node.js LTS est installé localement dans `.tools/node`. Il n’est pas nécessaire d’installer Node sur le reste du Mac.

## Démonstration à un hôtel

Cliquer sur **Présenter** puis suivre les trois écrans :

1. l’hôtel importe son export PMS ;
2. RevPilot détecte les dates importantes ;
3. l’hôtelier reçoit une recommandation expliquée et garde la décision finale.

Phrase courte :

> RevPilot vous indique où regarder chaque matin, pourquoi cette date compte et quelle action envisager.

Le scénario contient **12 215 réservations fictives**, agrégées sur 180 dates futures. Le sélecteur d’horizon permet de comparer les vues à 30, 60, 90 et 180 jours.

Les scénarios comprennent notamment :

- hausses et baisses de prix ;
- surbooking ;
- événements et saisonnalité ;
- demande faible ou forte ;
- annulations et no-shows ;
- groupes, clientèle corporate et OTA ;
- types de chambres et durées de séjour ;
- commissions, part directe, ADR et RevPAR.

## Tester l’import CSV

Utiliser `app/public/exemple-export-pms.csv` ou télécharger l’exemple depuis l’interface.

Colonnes reconnues :

| Colonne | Signification |
|---|---|
| `date` | Date de séjour |
| `chambres_disponibles` | Capacité vendable |
| `chambres_vendues` | Chambres déjà réservées |
| `chiffre_affaires` | Revenu chambre déjà réservé |
| `reservations_7j` | Nouvelles réservations des sept derniers jours |
| `vendues_n_1` | Chambres vendues à période comparable l’an dernier |
| `prix_actuel` | Tarif ou prix moyen actuel |
| `annulations_7j` | Annulations récentes affectant la date |
| `chambres_groupe` | Chambres réservées par des groupes |
| `chambres_directes` | Chambres vendues en direct |
| `cout_commissions` | Commissions des intermédiaires |
| `prix_concurrents` | Prix du marché ou des concurrents |
| `evenement` | Événement prévu cette année |
| `affluence_evenement` | Affluence locale estimée |
| `impact_evenement` | Score d’impact de 0 à 100 |
| `evenement_n_1` | Événement présent sur la date comparable N-1 |
| `affluence_evenement_n_1` | Affluence de l’événement N-1 |
| `impact_evenement_n_1` | Score d’impact N-1 |

Les dates `AAAA-MM-JJ` et `JJ/MM/AAAA`, les séparateurs virgule/point-virgule et plusieurs variantes françaises ou anglaises des en-têtes sont acceptés.

Fichiers volumétriques disponibles :

- `app/public/reservations-fictives-revpilot.csv` — 12 215 réservations individuelles ;
- `app/public/donnees-journalieres-fictives-revpilot.csv` — 180 dates agrégées prêtes à importer.

Pour régénérer exactement le même scénario :

```bash
cd app
PATH="../.tools/node/bin:$PATH" npm run generate:data
```

## Vérifications techniques

```bash
cd app
PATH="../.tools/node/bin:$PATH" npm test
PATH="../.tools/node/bin:$PATH" npm run build
```

## Limites volontaires de cette première version

- un seul hôtel de démonstration ;
- import quotidien agrégé, pas encore un export réservation par réservation ;
- connecteur Mews en lecture seule ; chiffre d'affaires PMS détaillé et écriture des tarifs non activés ;
- règles transparentes plutôt qu’un modèle prédictif opaque ;
- pas encore de connexion utilisateur ni de base distante ;
- potentiel financier indicatif à valider pendant les pilotes.

Ces limites permettent de tester la valeur auprès des hôtels avant de financer les intégrations PMS et l’automatisation complète.

La stratégie multi-API pour les événements est décrite dans `EVENTS_API_STRATEGY.md`. La démonstration utilise actuellement des événements simulés au format final ; le passage aux données réelles nécessitera les clés OpenAgenda, Ticketmaster et/ou PredictHQ.

## Connecter les événements réels

Le serveur d’agrégation est déjà branché aux trois fournisseurs. Sans clé, l’application affiche clairement `mode simulation`.

1. Créer au moins un compte fournisseur et récupérer sa clé :
   - Ticketmaster : https://developer.ticketmaster.com/
   - OpenAgenda : https://developers.openagenda.com/
   - PredictHQ : https://signup.predicthq.com/
2. Depuis le dossier `hotel-revenue`, lancer :

```bash
./configure-event-apis.sh
```

3. Coller les clés obtenues, laisser les autres champs vides, puis relancer :

```bash
./start-revpilot.sh
```

Le bandeau situé sous l’import PMS indique pour chaque fournisseur : `connecté`, `clé absente` ou `erreur`. Les clés sont enregistrées dans `.env.local`, exclu du suivi Git et chargé uniquement par le serveur local.
