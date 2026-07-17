# RevPilot Voice — MVP d’agent vocal hôtelier

RevPilot Voice est un module séparé de RevPilot Revenue. Il permet de démontrer un standard téléphonique intelligent avant de connecter un vrai numéro et un vrai PMS.

## Ce qui fonctionne maintenant

- tableau de bord hôtelier ;
- simulation d’un appel depuis le navigateur ;
- saisie au clavier ou avec le micro de Chrome ;
- réponse vocale dans le navigateur ;
- français, avec détection simple de l’anglais et de l’espagnol ;
- vérification de disponibilités et tarifs dans un PMS de démonstration ;
- questions sur le parking, le petit-déjeuner, les horaires et les animaux ;
- création d’une **demande** de réservation à valider par la réception ;
- transfert humain simulé et journalisé ;
- historique des appels et des demandes ;
- pont serveur prêt pour Twilio Media Streams et OpenAI Realtime.

Le mode démonstration n’utilise aucune donnée réelle et n’appelle aucun service payant.

## Lancer l’application

Depuis le dossier `hotel-revenue` :

```bash
./start-revpilot-voice.sh
```

Ouvrir ensuite : <http://127.0.0.1:4180>

Dans le tableau de bord, cliquer sur **Tester un appel**. Chrome est recommandé pour tester le microphone. La saisie écrite fonctionne dans tous les navigateurs modernes.

## Parcours conseillé pour la démonstration

1. Cliquer sur **Vérifier une chambre**.
2. Accepter la proposition en écrivant « Oui, je veux réserver ».
3. Donner un nom, puis une adresse e-mail.
4. Fermer l’appel et montrer la demande dans le tableau de bord.
5. Relancer une simulation et tester **Transférer l’appel**.

## Activer les vrais appels

Le chat et la voix du navigateur sont uniquement un aperçu technique. Le produit cible reçoit les appels sur un vrai numéro Twilio et échange directement en audio avec OpenAI Realtime.

Créer d’abord un compte API OpenAI et un compte Twilio avec un numéro de téléphone, puis lancer :

```bash
./configure-revpilot-voice.sh
```

Le script demande les secrets dans le terminal avec une saisie masquée. Il ne faut pas envoyer les clés par e-mail, les coller dans une capture d’écran ou les enregistrer dans le code.

Copier `voice-agent/.env.example` vers `voice-agent/.env.local`, puis renseigner :

- `OPENAI_API_KEY` ;
- `TWILIO_ACCOUNT_SID` ;
- `TWILIO_AUTH_TOKEN` ;
- `PUBLIC_BASE_URL`, une adresse HTTPS publique pointant vers le serveur ;
- `RECEPTION_PHONE_NUMBER`.

Configurer le webhook d’appel entrant du numéro Twilio sur :

```text
POST https://votre-domaine.fr/twilio/voice
```

Le flux audio bidirectionnel utilise ensuite :

```text
WSS https://votre-domaine.fr/twilio/media
```

En production, la signature Twilio est vérifiée lorsque `TWILIO_AUTH_TOKEN` est présent. La clé OpenAI reste uniquement sur le serveur.

## Garde-fous métier

- aucune carte bancaire collectée par l’agent ;
- aucune disponibilité annoncée sans consultation du PMS ;
- nouvelle vérification avant création d’une demande ;
- aucun statut « confirmé » dans l’adaptateur de démonstration ;
- transfert humain demandé en cas d’incertitude ;
- journal des messages et des actions ;
- les vrais enregistrements d’appel doivent être désactivés par défaut et soumis au consentement applicable.

## Connecter un PMS réel

L’interface attend un adaptateur ayant au minimum :

```js
await pms.getAvailability({ checkIn, checkOut, guests })
await pms.createReservationRequest(payload)
```

Le premier connecteur doit être choisi après identification du PMS de l’hôtel pilote. Il ne faut pas développer Mews, Cloudbeds et Opera en parallèle avant d’avoir un premier client.

## Tests

```bash
cd voice-agent
npm test
```

Les tests couvrent les disponibilités, les prix, les validations, le transfert et le parcours complet de demande.

## Sources techniques officielles

- [OpenAI Realtime](https://developers.openai.com/api/docs/models/gpt-realtime)
- [Twilio Media Streams](https://www.twilio.com/docs/voice/media-streams)
- [Mews Connector API](https://mews-systems.gitbook.io/connector-api)
- [Cloudbeds API](https://developers.cloudbeds.com/docs/about-cloudbeds-api)
