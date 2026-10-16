# Chargement et langues — 17 octobre 2026

## Diagnostic

Next.js installé : 16.3.8. La documentation de cette version dans
`node_modules/next/dist/docs/` a été consultée avant modification :

- `01-app/03-api-reference/04-functions/fetch.md` : les lectures ne sont pas mises
  en cache par défaut sur les routes dynamiques ; `next.revalidate` et `next.tags`
  permettent un cache explicite des données.
- `01-app/03-api-reference/03-file-conventions/loading.md` : une lecture attendue
  dans un layout bloque la navigation avant sa limite de chargement enfant.
- `01-app/02-guides/prefetching.md` : le préchargement automatique fonctionne en
  production ; `router.prefetch()` permet un préchargement à l'intention.
- `01-app/03-api-reference/04-functions/revalidateTag.md` : `{ expire: 0 }` expire
  immédiatement les données après une mutation, y compris dans un Route Handler.
- `01-app/02-guides/content-security-policy.md` : les nonces nécessitent un rendu
  dynamique. La protection est conservée ; seul le contenu public est mis en cache.

Les réglages du footer bloquaient le layout. L'accueil attendait l'ensemble de
ses lectures avant de rendre son premier écran. Changer de langue relisait les
mêmes données multilingues. Le mode développement ajoutait la compilation des
routes et désactive le préchargement automatique.

## Corrections

- Cache serveur de 60 secondes, explicitement activé pour les lectures publiées
  et les réglages publics. Les données brutes sont partagées entre les langues.
- Invalidation immédiate par tag après une modification admin réussie.
- Aucun cache ajouté aux lectures admin ni aux mutations. La vérification d'une
  offre par le formulaire reste une lecture actuelle sans ce cache.
- Projection publique des avis sans email, empreinte ou hash IP.
- Réglages de contact chargés dans leur propre limite Suspense ; premier écran
  d'accueil rendu avant les données des sections. Chargement de route léger.
- Préchargement des destinations de langue au survol, focus et toucher, avec
  conservation de la requête et de l'ancre lors de la navigation.
- Traductions admin retirées du fournisseur des pages publiques : catalogue FR
  sérialisé de 67 316 à 37 315 octets, avant compression.
- Ancres autorisées à attendre les sections diffusées en streaming, sans délai
  ajouté quand la cible est déjà présente ; annulation au scroll manuel conservée.

## Mesures et validation

Mesures HTTP locales ponctuelles avec curl, sans simulation de réseau mobile :

| Production, port de test 3001 | Premier octet | Réponse complète |
| --- | ---: | ---: |
| Accueil, premier passage | 429 ms | 1 772 ms |
| Accueil, cache rempli | 56 ms | 56 ms |
| Anglais, données déjà en cache | 46 ms | 46 ms |
| Arabe, données déjà en cache | 46 ms | 47 ms |
| Offres | 35 ms | 36 ms |

Le premier chargement à froid attend encore les données distantes pour les
sections, mais le premier écran est diffusé avant leur résolution. Ces mesures
ne sont pas des temps de rendu visuel ni une garantie de performances hébergées.
Avant modification, des réponses locales en développement avaient pris 8,26 s
pour l'accueil et 2,27 s pour l'anglais ; elles ne constituent pas un comparatif
de production à conditions identiques.

Validation : 714 tests réussis, ESLint ciblé, TypeScript et `npm run build` réussis.
Navigateur de production : FR → EN → AR conserve la FAQ, aucun message d'erreur,
rechargement sur le port 3000 vérifié. `/api/admin/projects` retourne toujours
401 sans session avec `Cache-Control: no-store, max-age=0`.

L'aperçu sur `http://localhost:3000/` utilise maintenant `npm run start -- --port 3000`.
Pour poursuivre le développement avec rechargement automatique, arrêter ce
serveur puis lancer `npm run dev -- --port 3000`. Après une modification de source,
un aperçu de production nécessite un nouveau `npm run build` et redémarrage.
