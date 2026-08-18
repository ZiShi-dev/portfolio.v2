# VORZIX — Description complète du site (brief pour conseil IA)

> Document destiné à être donné à une autre IA pour obtenir des conseils de design, UX, branding ou produit.
> Il décrit le site **tel qu’il existe aujourd’hui**, comme si on le racontait à quelqu’un qui ne peut pas le voir.
> Langue : français. Marque : **VORZIX**. Positionnement : maison technologique premium.

---

## 1. Qui est VORZIX et que vend-elle ?

VORZIX est une **marque / agence technologique** (pas un portfolio personnel nommé).

Elle vend et conçoit :

* des sites web ;
* des applications ;
* des plateformes digitales ;
* des produits numériques sur-mesure.

Le ton est celui d’une **équipe** (« nous »), pas d’un freelance solo.

La promesse commerciale doit rester claire en quelques secondes : VORZIX crée des produits digitaux haut de gamme.

L’astronomie n’est **pas** le produit. C’est uniquement le **langage graphique** de la marque.

---

## 2. Concept artistique officiel : « L’Atlas Céleste »

L’identité visuelle s’inspire des grands atlas et instruments d’astronomie anciens, réinterprétés en design numérique contemporain :

* Livre des Étoiles Fixes d’al-Soufi (964) ;
* Uranométrie de Bayer (1603) ;
* Harmonia Macrocosmica de Cellarius (1660).

Métaphore de marque :

> Chaque produit VORZIX est une étoile : cartographiée avec précision, nommée, mesurée, éternelle.

Ce que VORZIX doit faire ressentir :

* précision scientifique ;
* héritage savant (astronomie / cartographie) ;
* rareté (ne ressemble pas à Linear / Vercel / startup SaaS classique) ;
* technologie premium ;
* confiance ;
* sobriété.

Ce que VORZIX ne doit **jamais** devenir :

* un site « space / NASA / sci-fi » (fusées, astronautes, galaxies violettes, néons, planètes 3D) ;
* un template SaaS sombre + bleu électrique ;
* un site gaming / cyberpunk ;
* un portfolio étudiant coloré ;
* une interface saturée d’effets.

Référence correcte :

**Atlas céleste + astrolabe + instrument scientifique + maison tech premium.**

Référence incorrecte :

**Science-fiction + jeu vidéo + vaisseau spatial.**

---

## 3. Thème unique : Nuit Céleste

Il n’existe **plus qu’un seul thème**.

* Pas de mode clair.
* Pas de « parchemin diurne » sur le site public.
* Pas de bouton Light/Dark.
* Le système d’exploitation (`prefers-color-scheme: light`) **ne doit pas** rendre le site clair.

L’environnement nocturne fait partie de l’identité de marque, comme le noir d’une maison de luxe ou le bleu d’une marque historique.

---

## 4. Palette de couleurs (tokens)

Hiérarchie visuelle approximative :

* **75–85 %** : noir nuit / surfaces sombres ;
* **10–20 %** : ivoire et gris bleutés ;
* **≤ 5 %** : laiton / or (matériau précieux, pas un remplissage).

| Rôle | Couleur | Hex |
|------|---------|-----|
| Fond principal (Noir Nuit) | Background | `#070A12` |
| Surface | Card / surface | `#0A0E1A` |
| Surface élevée | Muted / elevated | `#0D1322` |
| Surface haute | High | `#101828` |
| Texte principal (Ivoire Céleste) | Foreground | `#F4F1E8` |
| Texte secondaire | Muted | `#8B93A7` |
| Texte tertiaire | Subtle / faint | `#6E7789` / `#4F586B` |
| Accent (Laiton Céleste) | Primary | `#C9A96A` |
| Accent hover | Primary hover | `#E5C98F` |
| Accent clair (détails) | Primary light | `#D4AF7A` |
| Bordure ivoire | Border | `rgba(244,241,232,0.10)` |
| Bordure noble or | Border gold | `rgba(212,175,122,0.18)` |

L’or évoque le **laiton des instruments d’astronomie**, pas une marque de bijoux.

Le blanc pur `#FFFFFF` n’est pas la norme : on privilégie l’ivoire chaud `#F4F1E8`.

---

## 5. Typographie

| Rôle | Police | Usage |
|------|--------|--------|
| Display / grands titres | **Fraunces** (serif) | H1, H2 de sections |
| Corps / UI | **Instrument Sans** | Paragraphes, navigation, formulaires |
| Technique / catalogue | **IBM Plex Mono** | Coordonnées, refs `VZ—01`, eyebrows, labels |
| Arabe display | **Amiri** | Titres en arabe |
| Arabe corps | **IBM Plex Sans Arabic** | Textes arabes |

Le mono ne doit **pas** être la police principale. Il sert aux micro-données techniques, comme des inscriptions sur un instrument.

Pattern de titre fréquent :

> Phrase en ivoire + **un mot important en laiton**.

Exemple actuel Services :

> « Des produits numériques conçus avec **précision.** »

---

## 6. Structure du site (parcours utilisateur)

### 6.1 Coque commune

Sur toutes les pages publiques :

1. **Navbar** fixe en haut, centrée, forme de pilule arrondie.
2. **Contenu** de la page.
3. **Footer** sombre avec logo, description, navigation, contact, réseaux.
4. Modales possibles : contact, laisser un avis.

Langues disponibles : **français (défaut)**, anglais, arabe (RTL).
Le switcher de langue est dans la navbar. Il n’y a plus de switcher de thème.

### 6.2 Page d’accueil — ordre des sections

De haut en bas :

1. **Hero / Accueil** (`#accueil`)
2. **Services** (`#services`)
3. **Parcours** (`#parcours`) — cube 3D interactif
4. **Projets** (`#projets`)
5. **Avis** (`#avis`)
6. **À propos** (`#a-propos`)
7. **Contact** (`#contact`)

Autres pages : `/projets`, `/avis`, `/laisser-un-avis`, `/contact`, `/mentions-legales`, plus une zone `/admin`.

---

## 7. Description section par section (comme si on ne voyait pas)

### 7.1 Navbar

Imagine une barre flottante en haut de l’écran, comme une plaque d’instrument.

* À gauche : le **logo** (petit carré arrondi avec monogramme ivoire + or) + le mot **VORZIX**.
* Au centre (desktop) : liens Services, Projets, Avis, À propos, Laisser un avis.
* À droite : sélecteur de langue (FR / EN / AR) + bouton CTA laiton « Travaillons ensemble ».
* Au scroll : la barre gagne un fond sombre translucide et un flou, comme du verre nocturne.

Sensation : premium, compact, un peu « SaaS », mais dans les couleurs VORZIX.

### 7.2 Hero (`#accueil`)

Fond : noir nuit `#070A12`.

En arrière-plan, très discrètement :

* quelques étoiles ;
* une petite constellation tracée en traits fins ;
* des arcs de cercle comme un astrolabe ;
* des micro-labels techniques du type `RA 05h 55m`, `DEC +07° 24′`, `CAT. VZ—ATLAS` (visibles surtout sur grand écran).

Composition desktop : **deux colonnes**.

**Colonne gauche (texte)**

* Petit badge mono : « Agence technologique ».
* Grand titre Fraunces : sites, apps et plateformes + un fragment en laiton (« mesurés au dixième. »).
* Sous-titre qui explique que VORZIX conçoit des produits numériques haut de gamme.
* Deux boutons :
  * primaire laiton : démarrer un projet ;
  * secondaire bordure : voir les réalisations.
* Ligne de confiance avec une petite référence catalogue `CAT. VZ—HOME`.

**Colonne droite (visuel)**

* Une **bannière image** large (carte céleste avec logo VORZIX, texte « WEB • APPS • DIGITAL SOLUTIONS », citations d’atlas historiques).
* Cette image est dans une **carte inset** (coins arrondis, fine bordure or), pas en plein écran edge-to-edge.

Sous le hero :

* flèche « Découvrir » vers les services ;
* une bande **TechStrip** : logos / technologies (ressemble encore à un bandeau stack classique d’agence).

### 7.3 Services (`#services`)

Fond : noir nuit + décor atlas très léger.

Titre actuel :

> Des produits numériques conçus avec **précision.**

Six cartes en grille (3 colonnes desktop), comme des **fiches de catalogue astronomique** :

| Ref | Service |
|-----|---------|
| `VZ—01` | Site ou application web |
| `VZ—02` | Back-office & automatisation |
| `VZ—03` | Design UX/UI |
| `VZ—04` | Expérience mobile-first |
| `VZ—05` | Référencement de base |
| `VZ—06` | Suivi après lancement |

Chaque carte :

* fond surface élevée `#0D1322` ;
* bordure ivoire fine ;
* au hover : bordure légèrement laiton + halo or très faible ;
* icône outline Lucide ;
* lien mono « Découvrir » ;
* CTA global en bas pour parler du besoin.

Entre le titre et la grille : séparateur `CelestialDivider` (trait — petite étoile — trait).

### 7.4 Parcours (`#parcours`)

Fond : surface `#0A0E1A` (une nuance plus claire que le noir absolu — profondeur de ciel).

Titre autour de « De l’idée au site en ligne ».

Élément central distinctif : un **cube 3D interactif** à 6 faces :

1. Votre idée  
2. Design  
3. Création  
4. Mise en ligne  
5. Croissance  
6. Accompagnement  

L’utilisateur peut faire tourner le cube (drag) ou cliquer des points. Une légende sous le cube décrit l’étape active.

C’est l’un des éléments les plus originaux du site — mais ce n’est plus dans le hero ; il vit dans sa propre section.

### 7.5 Projets (`#projets`)

Fond : surface `#0A0E1A`.

Grille / carousel de cartes projets (image, titre, type, stack). Au clic : modal de détail.

Sensation : portfolio d’agence classique, habillé aux couleurs VORZIX. Moins « atlas » que Services/Hero.

### 7.6 Avis (`#avis`)

Fond : surface élevée `#0D1322` (encore une couche de profondeur).

Cartes témoignages avec notes étoiles, initiales, textes. Boutons pour voir plus d’avis ou laisser un avis.

Sensation : section preuve sociale standard, cohérente en couleurs mais pas très « céleste ».

### 7.7 À propos (`#a-propos`)

Fond : surface `#0A0E1A`.

Texte sur la méthode VORZIX + stepper (échange → design → lancement) + statistiques animées (années, clients, projets…).

Sensation : section « about agency » classique, bien typographiée.

### 7.8 Contact (`#contact`)

Fond : noir nuit + halo laiton très flou au centre.

Grande carte centrale avec titre, sous-titre, bouton pour ouvrir le formulaire (modale), et lien email.

Sensation : CTA final premium, sobre.

### 7.9 Footer

Fond nuit, bordure or discrète en haut.

Logo + description + colonnes navigation / contact / réseaux + copyright.

---

## 8. Composants de style récurrents

### Cartes (`GlowCard`)

* Coins `10–16px` (plutôt `rounded-xl`) ;
* fond `#0D1322` ;
* bordure ivoire ; hover laiton ;
* léger spotlight qui suit la souris (or très transparent) ;
* pas de grosses ombres colorées.

### Boutons

* **Primaire** : fond `#C9A96A`, texte `#070A12`, hover `#E5C98F`.
* **Secondaire / outline** : fond transparent ou sombre, bordure or/ivoire, texte ivoire.
* Pas tous les boutons en or.

### Séparateur céleste

Ligne fine — petite étoile — ligne fine. Utilisé avec parcimonie.

### Décor atlas (`CelestialAtlas`)

SVG décoratif (arcs, constellation, étoiles, labels). Opacité globale basse (~0.08–0.14). Sur mobile, beaucoup d’éléments techniques sont masqués.

### Animations autorisées / présentes

* apparition fade / translate / léger blur (`Reveal`) ;
* scintillement très lent de quelques étoiles ;
* tracé d’arc au hero ;
* hover des cartes ;
* cube 3D (parcours) ;
* respect de `prefers-reduced-motion`.

Interdit dans la charte : bouncing agressif, particules partout, rotations permanentes inutiles, effets gaming.

---

## 9. Logo et assets

* **Logo** : monogramme stylisé (fusion V/X), **ivoire + laiton** sur fond nuit opaque, fichier `public/images/logo-vorzix.png`.
* Affiché dans navbar et footer dans une petite tuile carrée arrondie.
* **Bannière hero** : `public/images/hero-banner-atlas.jpg` — composition atlas céleste.
* Favicons dérivés du même monogramme.

Le logo n’est **pas** répété en énorme dans le H1 : le branding hero repose surtout sur la bannière + le nom en nav.

---

## 10. Ce qui est déjà fort (distinctif)

* Palette nuit / ivoire / laiton cohérente et rare.
* Thème unique Nuit Céleste (décision de marque claire).
* Langage catalogue (`VZ—01`, coords, mono technique).
* Décor atlas discret (pas sci-fi).
* Typographie Fraunces + Instrument Sans + Plex Mono bien hiérarchisée.
* Cube parcours original.
* Charte écrite et règles Cursor strictes.

---

## 11. Ce qui reste encore générique (points à challenger)

Ces points sont utiles pour demander des conseils à une autre IA :

1. **Hero encore « agence SaaS »** : badge « Agence technologique », layout texte | carte inset, bandeau tech logos en dessous. Le nom VORZIX n’est pas un signal hero-level hors navbar/bannière.
2. **Bannière inset** : la carte céleste est dans un cadre arrondi, pas un plan full-bleed immersif.
3. **Grilles de cards** Services / Projets / Avis : pattern très répandu (icône + titre + texte).
4. **About + stats + stepper** : structure d’agence classique.
5. **Contact** : grande card CTA centrée, très courante.
6. **Navbar pilule glass** : look proche de nombreux sites premium 2024–2026.
7. **TechStrip** : bandeau technologies typique portfolio / SaaS.
8. Tension possible entre **rareté Atlas Céleste** et **efficacité commerciale** (le site doit toujours expliquer clairement qu’on vend des sites/apps).

---

## 12. Contraintes techniques (pour conseils réalistes)

* Stack : **Next.js** (App Router), **React**, **Tailwind CSS v4**, **Framer Motion**, **next-intl**.
* Design tokens centralisés dans `src/app/globals.css` (`@theme`).
* Contenu i18n : `messages/fr.json`, `en.json`, `ar.json`.
* Branding central : `src/lib/brand.ts`.
* Règles agents : `.cursor/rules/vorzix-design-system.mdc`, `.cursor/rules/vorzix-brand-assets.mdc`.
* Accessibilité : contraste ivoire/nuit, focus visible, reduced motion, CTA assez grands.
* Mobile : décorations célestes réduites ; contenu et CTA prioritaires ; pas d’overflow horizontal.

---

## 13. Prompt suggéré pour une autre IA

Tu peux coller ce document puis demander par exemple :

```text
Voici la description complète du site VORZIX (ci-dessus).

Je veux des conseils concrets pour renforcer l’identité « Atlas Céleste »
SANS perdre la clarté commerciale (sites, apps, plateformes).

Donne-moi :
1. les 5 problèmes de design/UX les plus importants ;
2. ce qu’il faut absolument garder ;
3. 8 améliorations prioritaires classées par impact ;
4. des idées pour le hero (sans virer en site science-fiction) ;
5. comment différencier davantage les sections sans tout reconstruire ;
6. ce qu’il ne faut surtout pas faire.

Reste dans la charte : Nuit Céleste uniquement, laiton ≤ 5 %, pas de néon, pas de fusées.
```

---

## 14. Résumé en une phrase

**VORZIX est un site d’agence digitale premium, exclusivement nocturne, habillé comme un atlas astronomique de précision — déjà cohérent en couleurs et typographie, encore trop proche d’un portfolio SaaS classique dans sa composition de page (hero inset, grilles de cards, bandeau tech, about/stats).**

---

*Document généré pour conseil externe. Source de vérité visuelle du projet : charte VORZIX « Atlas Céleste » + thème unique Nuit Céleste.*
