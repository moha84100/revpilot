# RevPilot V5 — success story Higgsfield

Cette production met en scène deux responsables d’hôtels fictifs, puis montre la véritable interface RevPilot. La mention `Mise en situation fictive` est obligatoire sur tous les plans joués.

## Chaîne retenue

1. `GPT Image 2` crée l’image de casting de référence en 16:9.
2. `Nano Banana 2 Lite` produit les nouveaux cadrages en conservant les personnages.
3. `Kling 3.0 Turbo` anime les cadrages à partir de leurs images initiales.
4. Les voix françaises et le lip-sync sont produits après validation visuelle du plan pilote.
5. FFmpeg assemble les plans, les captures RevPilot, les sous-titres et le CTA.

Les médias générés restent dans `generated/`, ignoré par Git. Les prompts, le scénario et les règles de contrôle sont versionnés.

## Garde-fou crédits

Le compte et le prix doivent être relus avec la CLI avant chaque lot. Le plan pilote autorisé par le manifeste coûte au maximum 16 crédits : 7 crédits pour l’image de casting et 9 crédits pour une vidéo de six secondes. Aucun lot complet ne démarre avant validation du pilote.

## Montage hybride disponible

Le montage V5 intègre le plan Higgsfield validé au début de la démonstration V4 sans acheter de génération supplémentaire. Un dialogue bref entre les deux hôteliers introduit RevPilot, puis la narration Vivienne et les captures du produit reprennent avec un fondu audio/vidéo. Le plan joué porte la mention `Mise en situation fictive`, et le CTA complet de la V4 est conservé.

```bash
cd video/v5
PATH='../../.tools/node/bin:/usr/bin:/bin:/usr/sbin:/sbin' npm run build
```

Fichiers produits dans `video/output/` :

- `RevPilot_demo_V5_success_story.mp4` ;
- `RevPilot_demo_V5_success_story_partage.mp4` ;
- `RevPilot_demo_V5_success_story_miniature.png` ;
- `RevPilot_demo_V5_success_story_controle.json`.

## Commande Higgsfield locale

```bash
../../.tools/higgsfield/bin/higgsfield account status
../../.tools/higgsfield/bin/higgsfield generate cost gpt_image_2 --prompt "$(cat prompts/pilot-casting.txt)" --aspect_ratio 16:9 --resolution 2k
```
