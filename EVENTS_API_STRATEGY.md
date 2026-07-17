# Stratégie API pour les événements locaux

## Pourquoi une seule API ne suffit pas

Les événements utiles à un hôtel viennent de sources différentes : billetterie, mairie, office de tourisme, salons professionnels, congrès, compétitions sportives et événements privés. Une source unique laisserait des angles morts.

## Sources recommandées

### OpenAgenda

À privilégier pour les agendas culturels et publics français. L’API v2 permet de consulter les événements d’agendas publiés et nécessite une clé d’authentification.

- documentation : https://developers.openagenda.com/
- lecture : `GET /v2/agendas/{agendaUID}/events`

### Ticketmaster Discovery API

À utiliser pour les concerts, spectacles et événements vendus sur les plateformes couvertes par Ticketmaster.

- documentation : https://developer.ticketmaster.com/products-and-docs/apis/discovery-api/v2/
- recherche géographique et par dates ;
- clé API obligatoire ;
- quota public indiqué par Ticketmaster : 5 000 appels par jour et 5 appels par seconde.

### PredictHQ

Option commerciale pertinente lorsque le produit doit estimer l’impact sur la demande. PredictHQ expose notamment des catégories, rangs, affluences prédites, événements non marchands et fonctions destinées à la prévision.

- documentation : https://docs.predicthq.com/api/events/

### Sources locales et saisie manuelle

Conserver une quatrième source pour : mariages, groupes, événements privés, travaux, fermetures, congrès locaux absents des plateformes et informations transmises directement par l’hôtel.

## Architecture prévue

```text
OpenAgenda ─────┐
Ticketmaster ───┼──> Agrégateur serveur ──> dédoublonnage ──> score d’impact ──> moteur tarifaire
PredictHQ ──────┤
Saisie hôtel ───┘
```

L’agrégateur devra :

1. rechercher autour de l’hôtel dans un rayon configurable ;
2. normaliser les dates, lieux, catégories et affluences ;
3. fusionner les doublons présents chez plusieurs fournisseurs ;
4. conserver la source et la date de dernière vérification ;
5. rapprocher les événements récurrents entre N et N-1 ;
6. calculer un impact selon l’affluence, la distance, la durée et le type d’événement ;
7. mettre les résultats en cache pour respecter les quotas.

## Comparaison correcte

| Cette année | N-1 | Interprétation |
|---|---|---|
| Événement fort | Aucun | Potentiel de hausse et demande à surveiller |
| Aucun | Événement fort | La référence N-1 est gonflée ; baisse ou stimulation possible |
| Événement similaire | Événement similaire | Comparaison calendaire plus pertinente |
| Événements différents | Événements différents | Comparer leurs scores et affluences, pas seulement leur présence |

Une API ne doit jamais provoquer automatiquement une hausse. Le moteur combine événement, réservations réelles, occupation, prix du marché et délai avant l’arrivée.

## Sécurité

Les clés fournisseurs ne doivent jamais être placées dans le code React ou dans un fichier envoyé au navigateur. Elles seront stockées comme variables secrètes du serveur. Le fichier `app/src/events/provider.ts` contient déjà le point d’appel prévu côté interface.
