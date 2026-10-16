# Accueil VORZIX — visuel et animation

Le visuel B est le visuel de production. Les paramètres sont centralisés dans `src/lib/hero-artwork.ts` :

- Ordinateur : `public/images/hero-glass-preview.webp` (1600 × 900, 53 484 octets).
- Téléphone : `public/images/hero-glass-mobile-v1.webp` (841 × 1870, 58 174 octets).

Le navigateur sélectionne un seul fichier avec `<picture>`. Le reflet utilise la même sélection ; aucune requête vers l’optimiseur d’images n’est nécessaire.

## Animation

L’entrée est pilotée uniquement par CSS : premier plan, émergence du texte et recul léger en 1,2 seconde. Elle démarre après décodage de l’image, avec un délai de secours de 700 ms. Les chemins et les dimensions restent indépendants du code d’animation.

Le décor garde une échelle fixe pendant le défilement. La hauteur minimale utilise `svh` pour éviter les changements de cadrage provoqués par la barre du navigateur mobile. Aucun défilement forcé, aucune scène 3D supplémentaire.

Les reflets sont suspendus hors écran et dans un onglet masqué. Les animations respectent `prefers-reduced-motion`. Le carrousel reste manuel sur téléphone ; son défilement automatique est suspendu hors écran, dans un onglet masqué et pendant une interaction.

## Origine du visuel

Image ordinateur créée avec l’outil intégré imagegen, puis optimisée en WebP. Direction : sculptures flottantes en verre fumé, arcs en laiton, nuit bleu marine, horizon et eau réfléchissante, centre calme pour le texte. La composition mobile reprend ces éléments dans un cadre vertical.

Inspiration de mouvement : https://moon-shine.fr/. Aucun asset tiers copié. Les variantes et le sélecteur de comparaison ne sont pas exposés en production.
