# Conception — RevPilot V4 avec voix Vivienne et vidéos contextuelles

## Objectif

Corriger le pré-montage V4 en réutilisant la voix féminine appréciée dans une version précédente et en réintégrant les vidéos les plus pertinentes. Le résultat doit rester une démonstration compréhensible du logiciel, plus chaleureuse et plus dynamique, sans tremblement ni surcharge visuelle.

## Durée et équilibre

- durée finale visée : 69 à 72 secondes ;
- l’interface RevPilot reste visible pendant environ 75 % du montage ;
- les vidéos contextuelles occupent environ 25 % du montage ;
- le CTA final reste affiché huit secondes.

## Voix

La narration V4 utilise `fr-FR-VivienneMultilingualNeural`, la même famille de voix que la vidéo `RevPilot_demo_commerciale_voix_feminine_recalee.mp4`.

Réglages retenus :

- débit plus énergique, proche de `+8 %` ;
- hauteur légèrement abaissée pour conserver un ton posé ;
- une piste distincte par scène ;
- recalage par scène avec pauses courtes, sans couper la fin des phrases ;
- aucune clé ElevenLabs nécessaire.

## Vidéos retenues

Quatre séquences déjà produites sont réutilisées :

1. `hotel-intro.mp4` pendant l’accroche ;
2. `manager-decision.mp4` pendant la validation humaine ;
3. `city-event.mp4` pendant l’explication des événements locaux ;
4. `phone-alert.mp4` pendant les notifications et le surbooking.

`manager-dashboard.mp4` est écartée car elle répète ce que montre l’enregistrement réel de RevPilot. `surbooking-reception.mp4` est écartée comme séquence autonome afin de ne pas donner au produit une tonalité trop anxiogène ; le surbooking reste clairement visible dans l’interface et la scène d’alerte.

## Construction des scènes

### Accroche

La vidéo d’hôtel occupe l’écran. Le copilote apparaît brièvement et le sous-titre « Décider au bon moment » reste lisible.

### Potentiel et recommandation

L’enregistrement réel de RevPilot reprend la priorité. Les zooms restent limités à 135 % et ciblent `+5 296 €`, puis la recommandation de hausse.

### Validation humaine

La scène alterne brièvement entre le directeur d’hôtel et le tiroir de décision RevPilot. La saisie du prix, le niveau de confiance et le clic d’acceptation restent visibles.

### Événements locaux

Une courte vue de ville/concert introduit le sujet, puis RevPilot montre la comparaison avec les événements détectés.

### Alertes

Une courte vue du téléphone introduit l’alerte, puis le centre de notifications RevPilot montre le surbooking et les canaux disponibles.

### CTA

L’écran final existant est conservé avec :

- `07 55 68 32 85` ;
- `mohamed.echchkoubi@gmail.com` ;
- `moha84100.github.io/revpilot/`.

## Mouvement et transitions

- aucun tremblement d’écran ;
- zooms progressifs et centrés sur l’information racontée ;
- fondus courts entre vidéo réelle et interface ;
- coupes franches uniquement lorsqu’elles améliorent le rythme ;
- copilote 2D limité à quatre apparitions de moins de trois secondes ;
- sous-titres courts, synchronisés avec chaque scène.

## Chaîne de production

La timeline V4 reste la source de vérité. La génération vocale locale crée les sept pistes Vivienne. Le compositeur choisit, pour chaque scène, l’enregistrement RevPilot ou la vidéo contextuelle, applique les transitions et produit :

- `video/output/RevPilot_demo_V4_dynamique.mp4` ;
- `video/output/RevPilot_demo_V4_partage.mp4` ;
- `video/output/RevPilot_demo_V4_miniature.png`.

## Contrôles

- durée comprise entre 60 et 75 secondes ;
- format 1920 × 1080, 30 images par seconde, H.264/AAC ;
- aucune phrase coupée ;
- présence des quatre vidéos retenues ;
- présence du potentiel estimé et de la mention de validation humaine ;
- notification et événement visibles ;
- CTA lisible pendant au moins cinq secondes ;
- vérification visuelle à plusieurs instants avant livraison.
