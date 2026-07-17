# Architecture et trajectoire du MVP

## Version actuelle

- React et TypeScript pour l’interface ;
- Vite pour le développement et la construction ;
- Recharts pour la visualisation ;
- Papa Parse pour les imports CSV ;
- moteur de règles transparent exécuté localement ;
- Vitest pour les tests automatisés.

Le générateur reproductible crée 12 215 réservations couvrant 2024 à 2026, puis reconstruit une photographie « on the books » au 14 juillet 2026. Il tient compte de la date de réservation et de la date d’annulation pour éviter d’utiliser des informations futures dans les comparaisons.

Les données importées restent dans la mémoire du navigateur pendant la démonstration. Elles ne sont envoyées vers aucun serveur.

## Pourquoi commencer ainsi

Le risque principal n’est pas encore la performance technique. Il faut d’abord vérifier que les hôtels comprennent les alertes, font confiance aux explications et acceptent de tester le produit avec leurs données.

## Étapes après validation

1. Ajouter une API Python pour normaliser les exports réservation par réservation.
2. Ajouter PostgreSQL et une séparation stricte des données par hôtel.
3. Ajouter l’authentification et les rôles.
4. Formaliser l’hébergement, les sauvegardes, la journalisation et le RGPD.
5. Connecter un premier PMS ou automatiser son export.
6. Brancher l’agrégateur d’événements simulé sur OpenAgenda, Ticketmaster et/ou PredictHQ.
7. Remplacer progressivement les règles par des prévisions mesurées, tout en conservant les explications.

## Garde-fous produit

- aucune modification tarifaire automatique pendant les pilotes ;
- données personnelles non nécessaires exclues des imports ;
- recommandations traçables ;
- le surbooking est traité avant toute recommandation de prix ;
- hypothèses et potentiel financier affichés comme estimations ;
- possibilité d’ignorer chaque recommandation.
