# VORZIX — Atlas Céleste (implémentation actuelle)

Document de référence pour agents et outils de design (Impeccable, etc.). La charte normative complète est dans `.cursor/rules/vorzix-design-system.mdc`.

## Mode produit

- **Experience / Persuade** : portfolio et pages publiques — interface qui recule au profit du contenu et des réalisations.
- **Operate** : admin — lisibilité et tâches d’abord.

## Surfaces

- **Thème** : Nuit Céleste uniquement (pas de light mode). Fond `#070A12` → surfaces `#0A0E1A` / `#0D1322` / `#101828`.
- **Accent** : laiton `#C9A96A` (CTA, focus, détails), pas comme remplissage large.
- **Texte** : ivoire `#F4F1E8`, secondaire gris bleutés tokenisés.

## Typographie

- Display : Fraunces (titres).
- Corps : Instrument Sans ; mono : IBM Plex Mono (étiquettes, références).
- Arabe : Amiri / IBM Plex Sans Arabic selon contexte (règles i18n du projet).

## Motion

- Court, discret, `prefers-reduced-motion` respecté.
- Pas d’animations sur actions ultra-répétées sans besoin fonctionnel.

## Formulaire avis client (`ReviewFormPage` + modale)

- **Page** : carte type **fiche catalogue** (`border-border-gold`, `surface-elevated`), référence mono `CAT · RV—01`, titres **Fraunces** (`font-display`).
- **Modale** : un seul panneau (`max-w-xl` → `sm:max-w-2xl`) — pas de **carte dans la carte** sur l’en-tête ; titre et formulaire sur la même surface, séparés par un simple `border-b`.
- **Trois blocs** : identité (nom, email obligatoire, activité), appréciation (étoiles + magnitude mono **en direct** dès la sélection + revalidation champ), récit (textarea + compteur caractères).
- **Note** : puces étoiles en cadres `rounded-xl` border hairline ; pas d’ombre lourde sur la modale (ombre sombre douce + `border-gold` léger).
- Messages **succès / sous-titre** : alignés sur le flux réel (publication après validation).

## Parcours « Démarrer un projet » (`/demarrer-un-projet`)

Surface **Operate** plein écran : clarté des choix, repères de progression, motion minimal.

- **Progression** : `ProjectConstellation` (SVG atlas) à partir de `sm` ; liste d’étapes horizontale (`ProjectInquiryStepStrip`) en `< sm` pour le pouce et l’a11y — évite la perte de contexte quand la constellation serait trop petite. La zone scrollable des **questions** n’utilise pas `justify-center` (sinon le bloc est centré verticalement et le haut — la bande d’étapes — sort du premier écran quand la liste est longue).
- **Choix** : `ChoiceCards` — grille responsive, carte sélectionnée avec bordure laiton et halo discret ; apparition en léger décalage vertical échelonné (`framer-motion`), désactivée si `prefers-reduced-motion`.
- **Transitions d’étape** : fade + léger translate (entrée/sortie) sur le bloc question, cohérent avec la charte (pas de bounce, pas de rotation permanente).
- **Fichiers** : `src/components/project-inquiry/project-inquiry-flow.tsx`, `choice-cards.tsx`, `project-constellation.tsx`.

## Navigation (mobile / menu)

- Barre : conteneur **large** habituel (`max-w-6xl`).
- **Panneau « Menu »** : popover de **18rem** (`w-[min(18rem,100%)]`) aligné au bord de fin sous le bouton, identique sur tous les breakpoints ; animation depuis le coin du bouton (`origin-top-right`, RTL inversé).
- **Contenu minimal** : pas d’en-tête visible (titre `sr-only` pour l’a11y), une seule fermeture (le bouton « Menu ✕ », Échap ou clic hors panneau). Chaque entrée = icône outline 1.5 + libellé sur **une ligne** + chevron ; lignes de 48px, état actif en fond laiton très léger.
- « Laisser un avis » en action secondaire sous un filet ; CTA « Travaillons ensemble » en bouton laiton arrondi dans le pied du panneau.
- Tout tient sans défilement sur un écran de téléphone standard (7 entrées + CTA).
- Barre **hors scroll** du site : bordure et surface `surface-elevated` ; bouton « Menu » : bordaire hairline, état ouvert avec laiton discret.

## Fichiers clés

- Tokens / thème : `src/app/globals.css`
- Composants UI : `src/components/ui/`
- Composants **skeleton** (chargement route) : `src/components/skeletons/`
- Marque / assets : `src/lib/brand.ts`, `public/images/`

## États de chargement

- Chaque segment de route « page » dispose d’un **`loading.tsx`** App Router : structure proche du contenu attendu (hero, grille, formulaire, admin), palette Nuit Céleste, `prefers-reduced-motion` via `motion-safe:animate-pulse` sur les blocs.

## Dernière passe « craft » (manuelle)

- Titres contact / avis : accent titre en **couleur primary** (pas de dégradé sur le texte).
- Curseur de saisie : `caret-color` aligné sur le laiton.

Contexte produit minimal : `PRODUCT.md` (faits vérifiables dans le dépôt). Pour enrichir avec une interview structurée : `/impeccable init` dans le chat Cursor (skills activés).
