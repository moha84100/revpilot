# Manuel très simple pour récupérer les accès de RevPilot

Ce manuel explique quoi ouvrir, quoi copier et où le coller. Il est écrit pour être suivi sans connaissances techniques.

> Important : un adulte doit créer les comptes, accepter les conditions, gérer les paiements et valider les numéros de téléphone. L'enfant peut aider à suivre les étapes et cocher les cases.

## La règle de sécurité à ne jamais oublier

Une clé API est comme le mot de passe d'une application.

- Ne jamais envoyer une clé par WhatsApp, email ou dans un chat.
- Ne jamais mettre une clé dans une capture d'écran.
- Ne jamais écrire une clé dans ce manuel.
- Ne jamais publier le fichier `.env.local` sur GitHub.
- Coller les clés uniquement dans les assistants du Terminal expliqués plus bas.
- Si une clé a été montrée à quelqu'un, la supprimer sur le site concerné et en créer une nouvelle.

## Ce qu'il faut préparer

Avant de commencer, demander à Mohamed de préparer :

- [ ] son adresse email ;
- [ ] son téléphone pour recevoir les codes de sécurité ;
- [ ] un gestionnaire de mots de passe ;
- [ ] une carte bancaire uniquement si un service payant est activé ;
- [ ] le Mac contenant le dossier `hotel-revenue` ;
- [ ] l'application Terminal.

Ne pas acheter de crédits, de numéro ou d'abonnement sans l'accord de Mohamed.

## Résumé de la mission

### À récupérer maintenant

- [ ] une clé Ticketmaster pour les concerts et spectacles ;
- [ ] une clé OpenAgenda pour les événements locaux ;
- [ ] un jeton PredictHQ, seulement si Mohamed veut une couverture plus complète ;
- [ ] une clé Brevo pour les emails, SMS et WhatsApp.

### À récupérer plus tard

- [ ] les accès Mews, lorsque RevPilot aura un hôtel pilote ;
- [ ] une clé OpenAI et les accès Twilio, lorsque les vrais appels seront activés.

## Mission 1 — Ticketmaster

Ticketmaster apporte surtout des concerts, spectacles et événements sportifs.

1. Ouvrir [Ticketmaster Developer](https://developer.ticketmaster.com/).
2. Cliquer sur le bouton de connexion ou d'inscription.
3. Créer le compte avec l'adresse de Mohamed.
4. Ouvrir l'email reçu par Ticketmaster et valider le compte.
5. Se reconnecter au portail Ticketmaster Developer.
6. Ouvrir la partie **My Apps**, **Mes applications** ou **Applications**.
7. Ouvrir l'application créée automatiquement. Si aucune application n'existe, en créer une appelée `RevPilot`.
8. Chercher **Consumer Key** ou **API Key**. Pour RevPilot, ces deux expressions désignent la clé à utiliser.
9. Copier cette clé dans le gestionnaire de mots de passe, dans une fiche appelée `RevPilot - Ticketmaster`.
10. Ne pas copier le **Consumer Secret** : le connecteur actuel n'en a pas besoin.

Résultat attendu :

```text
TICKETMASTER_API_KEY = Consumer Key de Ticketmaster
```

- [ ] La Consumer Key Ticketmaster est enregistrée en sécurité.

Documentation : [obtenir et utiliser une clé Ticketmaster](https://developer.ticketmaster.com/products-and-docs/tutorials/widgets/Event_Discovery_Widget.html).

## Mission 2 — OpenAgenda

OpenAgenda apporte des événements publiés par les villes, offices de tourisme, musées et associations.

### Récupérer la clé

1. Ouvrir [OpenAgenda](https://openagenda.com/).
2. Cliquer sur **Se connecter** puis créer un compte avec l'adresse de Mohamed si nécessaire.
3. Valider l'adresse email.
4. Ouvrir le menu du compte.
5. Ouvrir **Paramètres**, puis la section **API**.
6. Chercher la **clé publique** ou la **clé API de consultation**.
7. Copier la clé dans le gestionnaire de mots de passe, dans une fiche appelée `RevPilot - OpenAgenda`.
8. Ne pas demander de clé secrète d'édition : RevPilot lit les événements mais ne les modifie pas.

Résultat attendu :

```text
OPENAGENDA_API_KEY = clé publique de consultation
```

- [ ] La clé publique OpenAgenda est enregistrée en sécurité.

### Trouver les agendas à surveiller

Un **Agenda UID** est simplement le numéro d'un agenda OpenAgenda. Ce n'est pas un mot de passe.

1. Dans OpenAgenda, rechercher la ville de l'hôtel, par exemple `Paris`, `Lyon` ou `Marseille`.
2. Ouvrir les agendas officiels les plus utiles : ville, office de tourisme, grands musées et salles de spectacle.
3. Dans l'administration de chaque agenda, ouvrir la partie **Avancé** ou **API**.
4. Repérer le nombre appelé **UID**, **Identifiant** ou **Agenda UID**.
5. Noter seulement ces nombres dans une liste, séparés par des virgules.

Exemple inventé :

```text
12345678,23456789,34567890
```

Ne pas recopier cet exemple : il faut utiliser les vrais UID de la ville choisie.

Si l'UID reste introuvable, laisser cette question vide dans le Terminal et demander à Mohamed de choisir les agendas. La clé OpenAgenda sera quand même conservée.

Résultat attendu :

```text
OPENAGENDA_AGENDA_UIDS = nombres séparés par des virgules
```

- [ ] Les UID des agendas locaux sont prêts, ou la case est laissée vide pour plus tard.

Documentation : [authentification OpenAgenda](https://developers.openagenda.com/authentification) et [recherche d'agendas OpenAgenda](https://developers.openagenda.com/en/agendas/recherche/).

## Mission 3 — PredictHQ, facultative

PredictHQ complète les événements avec leur importance estimée. Cette étape peut demander un abonnement ou des limites d'utilisation. Demander l'accord de Mohamed avant de choisir une offre payante.

1. Ouvrir [l'inscription PredictHQ](https://signup.predicthq.com/).
2. Créer le compte avec l'adresse de Mohamed.
3. Valider l'email et se connecter à la WebApp.
4. Ouvrir **API Tools**.
5. Ouvrir **API Tokens**.
6. Cliquer sur **Create Token** ou **Create New Token**.
7. Donner au jeton le nom `RevPilot`.
8. Copier immédiatement le jeton dans le gestionnaire de mots de passe, dans une fiche appelée `RevPilot - PredictHQ`.
9. Si le site demande de payer, s'arrêter et appeler Mohamed.

Résultat attendu :

```text
PREDICTHQ_TOKEN = Access Token PredictHQ
```

- [ ] Le jeton PredictHQ est enregistré, ou Mohamed a décidé de passer cette étape.

Documentation : [créer un token PredictHQ](https://docs.predicthq.com/api/overview/authenticating).

## Enregistrer les accès aux événements dans RevPilot

Faire cette partie après les trois missions précédentes.

1. Ouvrir l'application **Terminal** sur le Mac.
2. Copier la commande suivante, la coller dans le Terminal et appuyer sur **Entrée** :

```bash
cd /Users/mohamedech-chkoubi/Documents/hotel-revenue
```

3. Copier cette deuxième commande et appuyer sur **Entrée** :

```bash
./configure-event-apis.sh
```

4. Le Terminal pose quatre questions. Répondre dans cet ordre :

| Question du Terminal | Réponse à coller |
|---|---|
| `Clé Ticketmaster` | Consumer Key Ticketmaster |
| `Jeton PredictHQ` | Access Token PredictHQ, ou simplement Entrée si absent |
| `Clé OpenAgenda` | clé publique OpenAgenda |
| `Identifiants OpenAgenda` | les UID séparés par des virgules, ou Entrée |

5. Après chaque réponse, appuyer sur **Entrée**.
6. Vérifier que le Terminal affiche `Configuration enregistrée`.
7. Fermer le gestionnaire de mots de passe.

- [ ] Le Terminal a affiché `Configuration enregistrée`.

## Mission 4 — Brevo pour les notifications

Une seule clé Brevo permettra à RevPilot d'envoyer des emails, des SMS et des messages WhatsApp.

### Créer la clé Brevo

1. Ouvrir [Brevo](https://www.brevo.com/fr/).
2. Créer un compte avec l'adresse de Mohamed, puis valider l'email et le téléphone si cela est demandé.
3. Ouvrir directement la page [Clés API Brevo](https://app.brevo.com/settings/keys/api).
4. Ouvrir l'onglet **API Keys** ou **Clés API**.
5. Cliquer sur **Generate a new API key** ou **Générer une nouvelle clé API**.
6. Nommer la clé `RevPilot`.
7. Copier la clé immédiatement dans le gestionnaire de mots de passe, dans une fiche appelée `RevPilot - Brevo`.
8. Ne pas créer une clé MCP : RevPilot utilise une clé API normale.

Résultat attendu :

```text
BREVO_API_KEY = clé API v3 de Brevo
```

- [ ] La clé API Brevo est enregistrée en sécurité.

Documentation : [démarrage avec l'API Brevo](https://developers.brevo.com/reference/quickstart-reference).

### Vérifier l'adresse d'envoi des emails

1. Dans Brevo, ouvrir le menu du compte.
2. Choisir **Paramètres**.
3. Ouvrir **Expéditeurs, domaines et IP**, puis **Expéditeurs**.
4. Cliquer sur **Ajouter un expéditeur**.
5. Mettre `RevPilot` dans **Nom de l'expéditeur**.
6. Mettre l'adresse email choisie par Mohamed dans **Email de l'expéditeur**.
7. Cliquer sur **Enregistrer**.
8. Ouvrir l'email de vérification reçu.
9. Copier le code à six chiffres dans Brevo puis valider.

À préparer pour le Terminal :

```text
BREVO_SENDER_EMAIL = adresse qui vient d'être vérifiée
BREVO_SENDER_NAME = RevPilot
BREVO_SMS_SENDER = RevPilot
```

- [ ] L'expéditeur email apparaît comme vérifié dans Brevo.

Documentation : [créer et vérifier un expéditeur Brevo](https://help.brevo.com/hc/fr/articles/208836149-Cr%C3%A9er-un-nouvel-exp%C3%A9diteur-Nom-de-l-exp%C3%A9diteur-et-Email-de-l-exp%C3%A9diteur).

### WhatsApp : partie réservée à Mohamed

Cette partie nécessite un compte Meta Business, les informations légales de l'entreprise et un numéro réservé à l'entreprise. Un enfant ne doit pas la faire seul.

Avant de commencer, il faut :

- un numéro qui n'est pas déjà utilisé par WhatsApp personnel ;
- le nom juridique et l'adresse de l'entreprise ;
- un site avec un domaine professionnel ;
- l'accès au compte Facebook/Meta Business ;
- l'accord de Mohamed pour les frais éventuels.

Dans Brevo :

1. Aller dans **Paramètres > Campagnes > WhatsApp**.
2. Cliquer sur **Configurer** puis **Se connecter avec Facebook**.
3. Suivre la vérification Meta et celle du numéro.
4. Aller dans **Marketing > Templates > WhatsApp**.
5. Créer un modèle de type **Service** pour une confirmation de réservation.
6. Attendre que Meta approuve le modèle.
7. Conserver le **numéro expéditeur** avec l'indicatif du pays et sans espaces.
8. Conserver le **Template ID** du modèle approuvé.

Résultat attendu :

```text
BREVO_WHATSAPP_SENDER_NUMBER = numéro avec indicatif, sans + ni espaces
BREVO_WHATSAPP_TEMPLATE_ID = numéro du modèle approuvé
```

Si WhatsApp n'est pas encore prêt, laisser ces deux réponses vides. Les emails et SMS pourront quand même fonctionner.

Guides officiels : [relier WhatsApp Business à Brevo](https://help.brevo.com/hc/fr/articles/4417084910866-Partie-1-lier-votre-compte-WhatsApp-Business-%C3%A0-Brevo) et [créer un template WhatsApp](https://help.brevo.com/hc/fr/articles/12941559878290-Cr%C3%A9er-un-template-WhatsApp).

## Enregistrer Brevo dans RevPilot

1. Revenir dans le Terminal.
2. Vérifier que le Terminal est dans le dossier `hotel-revenue`.
3. Coller cette commande puis appuyer sur **Entrée** :

```bash
./configure-notifications.sh
```

4. Répondre aux questions dans cet ordre :

| Question du Terminal | Réponse à coller |
|---|---|
| `Clé API Brevo` | clé API Brevo |
| `Adresse e-mail d'expédition vérifiée` | adresse vérifiée dans Brevo |
| `Nom d'expédition [RevPilot]` | appuyer sur Entrée |
| `Nom SMS [RevPilot]` | appuyer sur Entrée |
| `Numéro WhatsApp Business` | numéro sans espaces, ou Entrée si absent |
| `Identifiant du modèle WhatsApp` | Template ID, ou Entrée si absent |

5. Vérifier que le Terminal affiche `Configuration enregistrée sans afficher la clé`.

- [ ] Le Terminal a confirmé la configuration Brevo.

## Mission 5 — Mews, uniquement avec un hôtel pilote

Ne pas essayer de créer soi-même des accès Mews de production.

Mews utilise :

```text
MEWS_CLIENT_TOKEN = identité de l'application RevPilot
MEWS_ACCESS_TOKEN = autorisation donnée par un hôtel précis
```

Pour la production :

1. Mohamed présente RevPilot à un hôtel utilisant Mews.
2. L'hôtel accepte de connecter son établissement.
3. RevPilot termine le processus de certification demandé par Mews.
4. Mews fournit le `ClientToken` de RevPilot.
5. Mews fournit un `AccessToken` pour chaque hôtel connecté.

Le `Service ID` et le nombre de chambres peuvent rester vides : RevPilot essaiera de les détecter.

Quand Mohamed aura reçu les deux tokens, utiliser :

```bash
./configure-pms.sh
```

Choisir `production` seulement avec de vrais accès. Pour des essais, choisir `demo` et utiliser uniquement les tokens publics indiqués par la documentation Mews.

Documentation : [authentification du Connector API Mews](https://docs.mews.com/connector-api/guidelines/authentication).

- [ ] Cette mission est marquée « en attente de l'hôtel » si aucun hôtel pilote n'est encore connecté.

## Mission 6 — Appels téléphoniques, uniquement avec Mohamed

Cette mission est indépendante des événements et notifications. Elle sert à faire répondre l'agent vocal à de vrais appels.

### OpenAI

1. Un adulte ouvre [OpenAI API Keys](https://platform.openai.com/api-keys).
2. Il crée ou sélectionne un projet appelé `RevPilot`.
3. Il active la facturation et fixe une limite de dépense raisonnable.
4. Il crée une **Secret API key** appelée `RevPilot Voice`.
5. Il enregistre la clé dans le gestionnaire de mots de passe.

Résultat :

```text
OPENAI_API_KEY = clé secrète OpenAI
```

### Twilio

1. Un adulte ouvre la [console Twilio](https://console.twilio.com/).
2. Il crée et vérifie le compte.
3. Sur le tableau de bord, il récupère **Account SID** et **Auth Token**.
4. Il achète un numéro compatible avec les appels en France, après avoir vérifié le tarif et les documents demandés.
5. Il note aussi le numéro de la réception vers lequel transférer les appels.

Résultats :

```text
TWILIO_ACCOUNT_SID = identifiant commençant normalement par AC
TWILIO_AUTH_TOKEN = mot de passe secret Twilio
TWILIO_PHONE_NUMBER = numéro Twilio avec + et indicatif pays
RECEPTION_PHONE_NUMBER = numéro de la réception avec + et indicatif pays
```

Il faut également une adresse `PUBLIC_BASE_URL` qui commence par `https://`. Cette adresse vient du serveur sur lequel l'agent vocal est installé. Ce n'est pas une clé que l'on trouve dans Twilio. Si personne n'a encore installé le serveur public, s'arrêter ici.

Quand tout est prêt :

```bash
./configure-revpilot-voice.sh
```

Le Terminal masque la clé OpenAI et le token Twilio pendant la saisie. Il est normal de ne voir aucun caractère apparaître.

Documentation : [démarrage OpenAI](https://platform.openai.com/docs/quickstart/make-your-first-api-request) et [identifiants Twilio](https://www.twilio.com/docs/iam/api/authtoken).

- [ ] Cette mission est marquée « plus tard » si l'agent téléphonique public n'est pas encore déployé.

## Vérification finale

Cocher seulement ce qui est réellement terminé :

- [ ] Ticketmaster est enregistré dans RevPilot.
- [ ] OpenAgenda est enregistré dans RevPilot.
- [ ] Les UID OpenAgenda ont été choisis pour la ville de l'hôtel.
- [ ] PredictHQ est enregistré, ou volontairement laissé vide.
- [ ] La clé Brevo est enregistrée dans RevPilot.
- [ ] L'adresse email d'envoi est vérifiée dans Brevo.
- [ ] WhatsApp est prêt, ou volontairement laissé vide.
- [ ] Mews attend un hôtel pilote, ou ses vrais tokens ont été fournis.
- [ ] OpenAI et Twilio attendent le déploiement vocal, ou sont configurés.
- [ ] Aucune clé n'a été envoyée dans un message ou ajoutée à ce manuel.

Pour relancer RevPilot après une configuration :

```bash
./start-revpilot.sh
```

## Que faire si quelque chose ne ressemble pas au manuel ?

Les sites changent parfois le nom ou la place de leurs boutons.

1. Ne pas cliquer au hasard sur un bouton de paiement.
2. Faire une capture d'écran sans afficher de clé, mot de passe ou donnée bancaire.
3. Montrer la capture à Mohamed.
4. Indiquer le numéro de la mission et l'étape où le problème apparaît.

Ne jamais photographier une page contenant une API Key, un Auth Token ou une Secret Key.
