# VORZIX — Recette finale avant production

Date : 19 novembre 2026. Aucun déploiement n’a été effectué. L’identité Atlas Céleste et les parcours existants sont conservés. Aucune refonte visuelle n’a été entreprise.

Décision : **READY WITH RESERVATIONS**.

Le site public se construit, se teste et se parcourt. Le changement de langue FR → AR fonctionne dans WebKit lorsque le certificat est accepté. Les réserves portent sur ce qui n’a pas pu être exercé sans toucher aux données réelles, et sur un contrôle d’environnement à faire avant la mise en ligne.

## Éléments validés

### Rapports de phase, charte et produit

`docs/audit-visuel-phase-3.md`, `DESIGN.md` et `PRODUCT.md` ont été relus, puis confrontés au code actuel. Les 46 signalements Avoid AI Design restants ne cachent pas un défaut encore ouvert.

| Classe | Nombre | Constat |
|---|---:|---|
| I3 — icône ou flèche qui porte une action | 24 | Repères de navigation, de sélection, de note ou de confirmation. Conformes à la charte. |
| SD4 / SD4d / SD4m / SD4w — mono, capitales, séparateurs | 10 | Références de catalogue, identifiants, ponctuation de fond ou commentaires hors rendu. Le libellé descriptif de type d’application dans l’étude de cas est en police de lecture à 12 px (`text-xs`). Les références `VZ—CASE` et les sourcils de catalogue restent en mono 10 px, comme la charte le demande. |
| SD5 — compteurs | 4 | Nombre à côté d’un titre, ou groupes utiles d’un formulaire. Pas une métrique décorative. |
| K3 — voile d’une interaction ouverte | 4 | Menu, modales d’avis et de projet. Limité à l’interaction. |
| M8 — déplacement au survol | 1 | 2 px, souris fine, mouvement autorisé seulement. |
| SD9 — palette | 1 | Nuit Céleste prescrite. |
| IM5 — étoiles | 1 | Cinq positions d’une échelle, le remplissage reflète la note. |
| Faux positifs hors rendu | 1 | Commentaires ou ancienne variante 3D absente de l’accueil. |

Les 4 points de revue Hallmark encore ouverts après la phase 3 restent des choix, pas des défauts à corriger :

- Colonnes régulières du catalogue : la grille stable est en place.
- Références et libellés en 10 px : les références courtes restent en IBM Plex Mono. Le libellé descriptif relevé en phase 3 n’est plus en 10 px.
- Formes dessinées : le fond vectoriel appartient au langage Atlas Céleste.
- États actif et désactivé du bouton partagé : le scanner de section ne voit pas le style commun. Les liens du hero n’ont pas d’état désactivé ; le bouton partagé le gère.

Les deux défauts Hallmark confirmés en phase 3 sont toujours corrigés dans le code : les réponses de FAQ sont limitées à 65 caractères (`max-w-[65ch]`), et « Laisser un avis » dans le pied de page a une cible d’au moins 44 px avec un contour de focus laiton.

### Qualité automatisée

| Contrôle | Résultat |
|---|---|
| TypeScript | réussi |
| ESLint | réussi |
| Tests de régression | 744 réussis, 0 échec |
| Tests de sécurité | 557 réussis, 0 échec |
| Build de production | réussi |

### Parcours publics

Contrôles sur le serveur de développement, puis sur le build de production servi localement.

- Accueil, catalogue, contact, avis, démarrage de projet, mentions et les dix routes admin non authentifiées répondent. Sans session, chaque route `/admin/**` redirige vers `/admin/connexion` (307) avec le chemin demandé dans `next`. La page de connexion affiche un champ mot de passe. Aucune donnée admin n’est exposée.
- FR → AR → FR par le sélecteur : WebKit et Firefox, en HTTP sur le serveur de développement, puis en HTTPS local sur le build de production. L’URL, `lang` et `dir` suivent. Le HTML servi contient les titres « Sites et applications pour votre activité » et « مواقع وتطبيقات لنشاطك ».
- RTL à 390 px sur `/`, `/ar` et `/en` : pas de défilement horizontal. `/ar` est `lang=ar` et `dir=rtl`.
- Contact « Démarrer un projet » ouvre le parcours. Les choix Site vitrine, objectif, budget et délai avancent. Un contact vide est bloqué. Des coordonnées fictives mènent au récapitulatif. Le bouton d’envoi final n’a pas été activé. Aucun `POST` vers `/api/` n’est parti.
- Avis : un email invalide affiche l’erreur du champ. Échap ferme la modale.
- Firefox : Tab atteint « Aller au contenu », Entrée place le focus sur `main-content`, Entrée ouvre le menu, Échap le ferme et rend le focus au bouton. Le contour de focus est un filet laiton de 2 px (`rgb(201, 169, 106)`).
- Polices : Fraunces, Instrument Sans et IBM Plex Mono se chargent sans échec. Les familles arabes sont auto-hébergées par `next/font` et servies depuis le site (`font-src 'self'`). Aucune erreur console sur ces parcours.

## Défaut corrigé

Un seul changement de code.

`src/app/globals.css` — la classe `.sr-only` utilisait `clip: rect(0, 0, 0, 0)`. Cette forme retire les éléments du parcours clavier de WebKit, donc le lien « Aller au contenu ». Le masquage passe à `clip-path: inset(50%)`, annulé à la prise de focus. Le rendu hors focus reste un carré d’un pixel. Firefox continue d’atteindre ce lien en premier.

## Cause du FR → AR WebKit signalé en phase 3

Le sélecteur n’échoue pas à cause du code applicatif.

| Montage | WebKit | Firefox |
|---|---|---|
| HTTP, application hydratée | FR → AR → FR réussi | réussi |
| HTTPS local, certificat refusé | la navigation documentaire elle-même est refusée : `SSL peer certificate or SSH remote key was not OK` | même refus sans exception de certificat |
| HTTPS local, certificat accepté, build de production | FR → AR → FR réussi, aucune requête RSC en échec | réussi |
| HTTPS local devant `next dev`, proxy sans WebSocket | le client ne s’hydrate pas : le WebSocket HMR répond 502 | identique |

La phase 3 voyait les URL directes `/` et `/ar` correctes, et le sélecteur non validé, avec des requêtes RSC en échec de contrôle d’accès. C’est le comportement d’un certificat local non fiable, ou d’un proxy de développement qui empêche l’hydratation. Chrome et Firefox du montage précédent acceptaient le certificat pour les `fetch` RSC ; WebKit, non. Avec un certificat accepté, WebKit exécute le même `router.replace` que les autres moteurs.

Aucune protection n’a été relâchée. Il ne faut pas désactiver HSTS, la CSP ni la vérification de certificat pour « faire passer » WebKit. En production, le certificat public est émis par une autorité reconnue : ce blocage de laboratoire ne se reproduit pas.

Safari réel sur macOS ou iOS n’était pas disponible sur cette machine Windows. Le moteur utilisé est WebKit Playwright 27.2.

## Tests impossibles

| Test demandé | Raison |
|---|---|
| Tableau de bord, demandes, services, FAQ, paramètres, états vides, filtres, erreurs authentifiées, déconnexion | Pas d’environnement isolé. Docker Desktop est indisponible. Le Supabase configuré est le projet distant `wckozrlgngkdcjnfssdi.supabase.co`, pas une base locale. Aucun compte de test ni secret TOTP n’a été fourni. Se connecter ou modifier un contenu aurait touché les données réelles. L’authentification n’a pas été contournée. |
| Envoi complet d’un formulaire vers un service de test | Les clés Turnstile locales sont les clés de test Cloudflare (le widget réussit toujours). Supabase et Resend pointent vers le projet réel. Un envoi valide aurait écrit un message, un avis ou une demande, et aurait pu envoyer un email réel. La validation navigateur et les tests automatisés couvrent le refus, la persistance simulée et les échecs. |
| Safari installé | Absent de ce poste Windows. |

## Problèmes non résolus

Aucun défaut fonctionnel du dépôt ne reste ouvert après cette passe.

Le parcours clavier de WebKit Playwright sous Windows saute les liens, y compris des liens visibles de la barre, alors que le focus programmé sur ces liens fonctionne et que Firefox parcourt l’ordre attendu. Ce comportement n’a pas été reproduit comme un défaut du balisage : le même WebKit change de langue, ouvre le menu avec Entrée et affiche le contour laiton. Il ne doit pas servir à conclure que les liens sont inaccessibles dans Safari.

## Risques avant production

- Confirmer que l’environnement de production n’utilise pas les clés Turnstile de test présentes dans `.env.local`. Ici `FORM_REQUIRE_TURNSTILE=true`, mais une clé de test laisse passer tout le monde. `FORM_ALLOW_INSECURE` n’est pas activé.
- L’administration et les formulaires réels n’ont pas été rejoués sur une base isolée. Le premier contrôle après mise en ligne doit être une connexion admin de bout en bout, sans réutiliser un mot de passe dans un outil, puis un formulaire fictif sur un projet de test si les clés de production sont déjà branchées.
- Les notifications push, le cron de relance et la révocation de session dépendent des secrets de production (`VAPID`, `CRON_SECRET`, Supabase). Ils n’ont pas été appelés.
- Playwright WebKit n’est pas un substitut à une passe Safari sur téléphone pour le RTL et le sélecteur de langue.

## Décision

**READY WITH RESERVATIONS**

Le build, les tests, les parcours publics, le clavier Firefox, le RTL et le changement de langue WebKit sur le build de production sont au niveau d’une mise en ligne. Les réserves sont externes au code corrigé ici : pas de répétition authentifiée sur une base isolée, pas d’envoi réel de formulaire, et une vérification obligatoire que la production n’emploie pas les clés Turnstile de test.
