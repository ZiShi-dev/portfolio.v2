# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Product identity (dépôt)

- **Nom public** : VORZIX — *Solutions digitales* (voir `src/lib/brand.ts`).
- **Proposition courte** : conception de sites web, applications et produits digitaux sur-mesure (texte marketing aligné sur `brand.description`).

## Stack (constaté)

- **Framework** : Next.js 16 (App Router), React 19 (`package.json`).
- **i18n** : `next-intl`, locales `fr`, `en`, `ar` (`src/i18n/routing.ts`).
- **UI** : Tailwind CSS v4, composants Radix (dialog, select, etc.), Framer Motion pour le motion ciblé.
- **Données optionnelles** : Supabase pour contenus admin (projets, avis, paramètres) lorsque configuré.

## Capacités livrées par l’application (routes)

**Site public (locale)** :

- Accueil, offres (liste + détail), portfolio (liste + détail projet), contact, avis, laisser un avis, démarrer un projet (parcours), mentions légales.

**Administration** (`/admin`, auth requise) :

- Tableau de bord, projets, avis, demandes, FAQ, engagements, services, paramètres, à propos, prévisualisation services.

## Utilisateurs (à préciser avec le porteur de produit)

- **Visiteurs** : découverte de l’agence, du portfolio et des offres ; prise de contact ou demande de projet.
- **Administrateur** : gestion du contenu publié via l’espace admin.

*Les personas détaillés, segments prioritaires et objectifs business chiffrés ne sont pas consignés dans ce dépôt — à compléter si nécessaire.*

## Contraintes de marque (non négociables dans le code)

- Direction **Atlas Céleste** : thème **Nuit Céleste** unique, palette et typo définies dans `.cursor/rules/vorzix-design-system.mdc` et `DESIGN.md`.
- Assets de marque : chemins et usage décrits dans `.cursor/rules/vorzix-brand-assets.mdc`.

## Open decisions

- Métriques de succès produit et utilisateurs prioritaires non documentées dans le dépôt.
- Email public et réseaux : partiellement dynamiques via configuration (fallbacks dans `brand` / settings).
