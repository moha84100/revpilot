# Conception de la vidéo commerciale dynamique RevPilot

Date : 17 juillet 2026

Statut : conception validée par l’utilisateur

Durée cible : 60 à 75 secondes

Format principal : 1920 × 1080, 30 images par seconde, MP4 H.264

## 1. Objectif

La vidéo doit convaincre un directeur d’hôtel contacté par email ou LinkedIn de demander une démonstration personnalisée de RevPilot.

La promesse principale est : **RevPilot détecte dans les réservations des opportunités de chiffre d’affaires que l’hôtelier peut examiner et valider.**

La preuve montrée à l’écran est le potentiel fictif de `+5 296 €`, toujours accompagné de la mention `Estimation à valider`. La vidéo ne promet aucun pourcentage d’augmentation ni résultat garanti, car RevPilot ne dispose pas encore de résultats mesurés auprès d’un hôtel pilote.

## 2. Public et canal

Le public prioritaire est un directeur ou responsable revenue d’un hôtel indépendant découvrant RevPilot pour la première fois. La vidéo sera envoyée dans un message de prospection froide. Elle doit donc :

- accrocher en moins de cinq secondes ;
- être comprise sans connaissance préalable du revenue management ;
- prouver rapidement que le logiciel est interactif ;
- fonctionner avec et sans le son ;
- terminer par une demande de démonstration explicite.

## 3. Direction retenue

La direction retenue est **la démo guidée vivante** :

- environ 80 % de véritable enregistrement de l’interface RevPilot ;
- environ 20 % de plans d’ambiance hôteliers courts ;
- clics, ouvertures de panneaux et défilements réels ;
- mouvements de caméra ajoutés au montage, synchronisés avec la narration ;
- copilote humain 2D présent seulement aux moments clés ;
- voix féminine française naturelle en voix off.

Les directions entièrement animées ou centrées en permanence sur un avatar sont exclues. Elles montreraient moins bien le produit ou risqueraient de diminuer son image premium.

## 4. Structure narrative

### 0 à 5 secondes — Accroche

Un plan court montre une réception d’hôtel active. Le copilote 2D apparaît brièvement.

Message : les réservations existantes peuvent déjà contenir plusieurs milliers d’euros de potentiel inexploité.

### 5 à 13 secondes — Preuve immédiate

Transition vers le véritable logiciel. Le curseur entre dans RevPilot. Un zoom progressif isole `+5 296 € de potentiel estimé` et la mention `Estimation à valider`.

### 13 à 25 secondes — Opportunité tarifaire

Le curseur ouvre une date à forte demande. Le panneau de recommandation apparaît. Le cadrage montre successivement l’occupation, le rythme de réservation et la hausse tarifaire recommandée.

### 25 à 36 secondes — Décision humaine

Le curseur ajuste légèrement le prix puis valide la décision. Le copilote pointe le niveau de confiance. La narration précise que l’hôtelier reste décisionnaire.

### 36 à 47 secondes — Contexte événementiel

La page défile jusqu’aux événements locaux. Le logiciel montre qu’un concert présent cette année, ou absent par rapport à l’année précédente, peut changer la décision tarifaire.

### 47 à 57 secondes — Protection du revenu

Le centre d’alertes s’ouvre. Un zoom bref montre un risque de surbooking puis les canaux de notification. Cette séquence présente la prévention des pertes comme complément à la recherche de revenu.

### 57 à 70 secondes — Conversion

Retour visuel sur le potentiel estimé, puis écran final distinct de l’ouverture.

CTA : `Découvrez le potentiel de votre hôtel — demandez votre démonstration personnalisée.`

Coordonnées affichées pendant au moins cinq secondes :

- téléphone : `07 55 68 32 85` ;
- email : `mohamed.echchkoubi@gmail.com` ;
- site : `https://moha84100.github.io/revpilot/`.

## 5. Traitement visuel

### Enregistrement d’écran

L’interface est enregistrée en Full HD avec un curseur visible. Un halo bref matérialise chaque clic. Les défilements sont réguliers et les panneaux sont réellement ouverts pendant la capture.

Chaque séquence fonctionnelle est enregistrée séparément. Une erreur sur un clic ou un chargement ne doit jamais imposer de refaire la vidéo entière.

### Mouvements de caméra

- zoom initial : 100 % ;
- zoom d’attention : entre 105 % et 135 % ;
- durée d’un zoom : entre 0,45 et 0,9 seconde ;
- pause de lecture sur un chiffre important : environ une seconde ;
- retour au plan général avant de changer de sujet ;
- aucun tremblement, secousse artificielle ou effet de caméra à main levée.

Chaque zoom doit commencer sur le mot de narration correspondant, avec un décalage maximal de 0,2 seconde.

### Texte à l’écran

Les grands bandeaux permanents de la vidéo précédente sont supprimés. La nouvelle vidéo utilise :

- des sous-titres courts placés en bas ;
- un maximum d’un mot-clé animé à la fois ;
- des encadrements ou halos sobres sur la zone commentée ;
- la mention discrète `Données de démonstration` pendant les captures.

Les mots-clés autorisés sont : `+5 296 €`, `Demande forte`, `Décision humaine` et `Alerte surbooking`.

### Transitions

Les transitions autorisées sont le fondu court, le déplacement latéral et le raccord sur un clic. Les effets de tremblement, flash agressif et rotation sont interdits.

## 6. Copilote 2D

Le personnage est un guide humain stylisé, professionnel et chaleureux. Sa palette reprend le bleu nuit, le bleu RevPilot et une petite touche dorée. Le rendu doit rester premium et ne pas évoquer un dessin animé destiné aux enfants.

Le personnage possède exactement quatre animations :

1. entrée dans le cadre ;
2. geste vers une zone de l’interface ;
3. réaction positive discrète ;
4. sortie du cadre.

Il intervient au maximum quatre fois, pendant une à trois secondes, et ne dépasse jamais 15 % de la surface de l’image. Il ne couvre aucun chiffre, texte ou bouton utile.

Le personnage ne synchronise pas ses lèvres. La narration reste une voix off afin d’éviter un rendu d’avatar artificiel.

## 7. Audio et narration

La narration utilise une voix féminine française ElevenLabs, naturelle et premium, à environ 150 mots par minute. Le texte doit comporter des variations d’intonation et des pauses liées au sens, et non une pause mécanique après chaque phrase.

La clé ElevenLabs est un prérequis privé de production. Elle reste dans un fichier `.env.local` ignoré par Git. Si aucune clé n’est disponible, la génération audio s’arrête et demande la clé à l’utilisateur ; elle ne revient pas automatiquement à la voix Edge TTS déjà jugée trop robotique.

La narration est produite avant l’enregistrement final. Elle devient la référence temporelle pour les clics, les zooms, les apparitions du personnage et les sous-titres.

## 8. Mode présentation RevPilot

Une URL de présentation dédiée charge un scénario reproductible. Elle doit :

- utiliser toujours les mêmes dates et valeurs ;
- afficher le potentiel de `+5 296 €` ;
- permettre l’ouverture contrôlée de la recommandation, des événements et des alertes ;
- masquer les bandeaux `Mode simulation` et `Clé API absente` ;
- afficher à la place la seule mention `Données de démonstration` ;
- ne jamais exposer de clé ou donnée réelle d’un hôtel.

Ce mode ne doit pas modifier le comportement normal de l’application en dehors de l’URL de présentation.

## 9. Composants de production

### Scénario de présentation

Responsabilité : fournir un état stable de l’interface destiné à la capture.

Dépendance : application RevPilot et données fictives intégrées.

### Pilote de navigateur

Responsabilité : lancer le navigateur à la bonne résolution, attendre les éléments, déplacer le curseur, cliquer, défiler et enregistrer chaque plan.

Dépendance : sélecteurs stables exposés par le mode présentation.

### Narration et repères temporels

Responsabilité : produire l’audio final et un manifeste indiquant le début de chaque phrase, clic, zoom et apparition du personnage.

Dépendance : texte final et fichier audio ElevenLabs.

### Personnage

Responsabilité : fournir quatre animations transparentes réutilisables.

Dépendance : charte visuelle RevPilot, sans dépendance à l’application.

### Compositeur vidéo

Responsabilité : assembler captures, plans hôteliers, voix, sous-titres, mouvements de caméra, personnage et CTA.

Dépendance : manifeste temporel et médias validés.

Ces unités doivent rester séparées afin qu’une nouvelle voix, une nouvelle capture ou une correction du CTA puisse être remplacée sans reconstruire tous les autres éléments.

## 10. Flux de production

1. Verrouiller le texte de narration.
2. Générer et valider la voix ElevenLabs.
3. Créer le manifeste temporel à partir de l’audio.
4. Lancer le mode présentation RevPilot.
5. Enregistrer séparément chaque parcours d’interface.
6. Produire les quatre animations transparentes du copilote.
7. Assembler une première version sans CTA final.
8. Contrôler la synchronisation voix, clics et zooms.
9. Ajouter le CTA final et les coordonnées.
10. Exporter et vérifier les livrables finaux.

## 11. Gestion des erreurs

- Si un élément attendu ne s’affiche pas, le pilote de navigateur arrête uniquement le plan concerné et indique le sélecteur absent.
- Si un clic ouvre le mauvais panneau, le plan est rejeté automatiquement avant montage.
- Si la durée audio change, les repères temporels sont recalculés avant tout nouvel export.
- Si le personnage masque une information, sa position est déplacée ; l’interface ne doit pas être recadrée pour lui faire de la place.
- Si la vidéo dépasse 75 secondes, les pauses et transitions sont raccourcies avant de supprimer une preuve produit.
- Si un texte devient illisible sur téléphone, sa taille augmente ou la phrase est raccourcie.

## 12. Critères d’acceptation

La vidéo finale est acceptée lorsque :

- sa durée est comprise entre 60 et 75 secondes ;
- aucune capture fixe ne reste inchangée plus de trois secondes ;
- une action visuelle utile se produit toutes les deux à quatre secondes ;
- aucun tremblement ou zoom brutal n’est visible ;
- les clics et zooms correspondent à la narration avec un écart maximal de 0,2 seconde ;
- le copilote intervient au maximum quatre fois et occupe moins de 15 % de l’écran ;
- `+5 296 €` et `Estimation à valider` sont lisibles ;
- aucun avertissement de simulation ou de clé absente n’apparaît ;
- les sous-titres permettent de comprendre l’histoire sans le son ;
- le CTA, le téléphone, l’email et le site restent visibles au moins cinq secondes ;
- le visionnage sur téléphone conserve des chiffres et sous-titres lisibles.

Trois visionnages sont obligatoires : sans son, avec son à vitesse normale et sur un écran de téléphone.

## 13. Livrables

- `video/output/RevPilot_demo_V4_dynamique.mp4` : master Full HD ;
- `video/output/RevPilot_demo_V4_partage.mp4` : version compressée pour le partage ;
- `video/output/RevPilot_demo_V4_miniature.png` : miniature `Découvrez le potentiel de votre hôtel` ;
- `video/SCRIPT_VIDEO_V4.md` : narration finale et découpage temporel ;
- les sources reproductibles du mode présentation, du pilote de capture, du personnage et du montage.

## 14. Hors périmètre

- témoignage ou logo d’un véritable hôtel ;
- promesse de gain garanti ou pourcentage de revenu ;
- personnage parlant avec synchronisation labiale ;
- version verticale pour réseaux sociaux ;
- connexion de clés API réelles uniquement pour la vidéo ;
- remplacement du serveur de production nécessaire aux intégrations PMS et notifications.
