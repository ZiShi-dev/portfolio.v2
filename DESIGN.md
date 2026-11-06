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
