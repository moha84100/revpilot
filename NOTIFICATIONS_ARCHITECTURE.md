# Notifications RevPilot

## À qui sont envoyées les alertes ?

Dans RevPilot, le « client » est l'équipe de l'hôtel : direction, revenue manager ou réception. Les voyageurs ne reçoivent jamais une recommandation tarifaire interne.

Chaque utilisateur choisit ses canaux : centre d'alertes RevPilot, e-mail, SMS et notification navigateur.

## Circuit d'une notification

1. Le moteur détecte un surbooking, une anomalie de prix, un nouvel événement local ou un pic d'annulations.
2. Une règle décide de la priorité, des destinataires et des canaux autorisés.
3. Une notification unique est ajoutée à une file d'envoi. Une clé d'idempotence empêche les doublons pour le même hôtel, la même date et le même signal.
4. Les plages silencieuses sont appliquées. Un surbooking critique peut les contourner si l'hôtel l'a autorisé.
5. Le fournisseur e-mail, SMS ou push effectue l'envoi.
6. Le résultat est journalisé : en attente, envoyé, distribué, échoué ou acquitté.
7. En cas d'échec temporaire, RevPilot réessaie progressivement. L'alerte reste toujours visible dans l'application.

## Règles par défaut proposées

| Signal | Priorité | Canal conseillé | Délai |
|---|---:|---|---|
| Surbooking | Critique | Application + SMS + e-mail | Immédiat |
| Hausse/baisse importante | Élevée | Application + e-mail | Immédiat ou résumé |
| Nouvel événement en ville | Moyenne | Application + résumé e-mail | Quotidien |
| Pic d'annulations | Élevée | Application + e-mail | Immédiat |
| Recommandations ordinaires | Normale | Résumé e-mail | Chaque matin |

## Sécurité et conformité

- coordonnées chiffrées côté serveur ;
- clés API uniquement dans les variables d'environnement du serveur ;
- consentement et désinscription par canal ;
- rôles et permissions par hôtel ;
- journal d'audit sans contenu sensible inutile ;
- limitation du nombre de messages et regroupement des alertes répétées ;
- aucun secret ni envoi réel depuis le navigateur.

## Connexions désormais implémentées

Le centre d'alertes, les préférences, la lecture/non-lecture et l'historique fonctionnent dans l'interface. Les envois externes passent côté serveur par **Brevo** :

- e-mail transactionnel ;
- SMS transactionnel ;
- WhatsApp Business avec un modèle approuvé ;
- notification navigateur lorsque la page est ouverte.

Le serveur valide les destinataires, applique une plage silencieuse de 22 h à 7 h, laisse passer les surbookings critiques et bloque pendant 30 minutes un doublon ayant le même canal, le même destinataire, la même date et le même titre. Un journal technique masque les coordonnées.

Configuration :

```bash
./configure-notifications.sh
./start-revpilot.sh
```

Sans clé, l'interface indique honnêtement que le canal n'est pas configuré. Le bouton **Tester** n'est disponible que pour les canaux complets.

## Limites avant la production

- le journal et la protection contre les doublons sont en mémoire et repartent à zéro au redémarrage ;
- les préférences sont encore conservées dans le navigateur ;
- il faudra une base de données et une file persistante pour plusieurs hôtels ;
- les destinataires doivent avoir donné leur accord ;
- le modèle WhatsApp doit être créé et approuvé sur le compte Brevo/WhatsApp Business.
