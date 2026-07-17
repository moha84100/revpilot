# RevPilot — vidéo commerciale V6

Cette version remplace l'introduction de deux secondes par un témoignage IA de 15 secondes généré avec sa propre voix et sa synchronisation labiale.

Le montage enchaîne ensuite cinq enregistrements produit : potentiel de chiffre d'affaires, recommandation, validation humaine, événements et appel à l'action. Les captures brutes remplacent les anciens effets noirs. La jonction à 15 secondes est une coupe franche, sans fondu ni chevauchement sonore.

La piste française corrigée verrouille les prononciations de « RevPilot » et « trop tard ». Quatre zooms progressifs mettent ensuite en avant les éléments expliqués sans secousse.

## Construire et contrôler

Le fichier Higgsfield doit être présent dans `generated/influenceuse-margot.mp4`, puis :

```bash
npm run build
```

La vidéo finale est créée dans `video/output/RevPilot_demo_V6_influenceuse_sync.mp4`.
