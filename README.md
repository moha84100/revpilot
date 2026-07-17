# RevPilot

RevPilot est un prototype de revenue management pour hôtels. Il transforme les données de réservation en recommandations tarifaires explicables et tient compte de l'occupation, du rythme des réservations, du risque de surbooking et des événements locaux.

Le projet comprend :

- une interface simple pour les décisions quotidiennes ;
- une vue avancée avec indicateurs et explications ;
- un connecteur PMS Mews en lecture seule ;
- des connecteurs événements Ticketmaster, OpenAgenda et PredictHQ ;
- des notifications email, SMS et WhatsApp via Brevo ;
- un prototype d'agent vocal hôtelier avec OpenAI et Twilio ;
- plusieurs milliers de réservations fictives pour les démonstrations.

## Démarrage local

Prérequis : Node.js et npm.

```bash
cd app
npm install
npm run dev
```

Ouvrir ensuite l'adresse indiquée par Vite dans le Terminal.

Pour lancer le logiciel et ses services locaux depuis la racine :

```bash
./start-revpilot.sh
```

## Configuration

Les clés privées ne sont jamais enregistrées dans Git. Les assistants locaux permettent de les installer dans des fichiers `.env.local` ignorés :

```bash
./configure-event-apis.sh
./configure-notifications.sh
./configure-pms.sh
./configure-revpilot-voice.sh
```

Le guide détaillé est disponible dans [MANUEL_RECUPERATION_CLES_API.md](MANUEL_RECUPERATION_CLES_API.md).

## Documentation

- [Présentation complète du logiciel](README_LOGICIEL.md)
- [Architecture du MVP](ARCHITECTURE_MVP.md)
- [Présentation destinée aux hôtels](PRESENTATION_HOTELS.md)
- [Stratégie des API d'événements](EVENTS_API_STRATEGY.md)
- [Architecture des notifications](NOTIFICATIONS_ARCHITECTURE.md)
- [Agent vocal](README_VOICE.md)

## Sécurité et état du prototype

RevPilot ne publie aucune clé API et le connecteur PMS reste en lecture seule. Les recommandations tarifaires sont consultatives : l'hôtelier conserve la décision finale. Les données de démonstration incluses dans le dépôt sont fictives.
