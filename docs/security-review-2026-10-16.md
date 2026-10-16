# Revue sécurité et UX — 16 octobre 2026

## Périmètre et limites

Revue du code des routes API publiques et admin, gardes de session/MFA, validation et lecture des requêtes, uploads, destinations des notifications, rendu des données, en-têtes HTTP, dépendances, migrations SQL et animations partagées. Tests automatisés et vérifications HTTP sur un serveur de production local.

Cette revue ne certifie pas l’absence de vulnérabilités. Elle ne constitue pas un test d’intrusion du site déployé. La configuration réelle de Supabase (politiques appliquées, privilèges, sauvegardes) et de l’hébergeur n’a pas été auditée depuis leur console. Les migrations ont été relues sans être exécutées ni modifier de données distantes.

## Corrections réalisées

| Sujet | Constat | Correction |
| --- | --- | --- |
| Dépendances de production | Avis critiques Next.js et alertes élevées de traitement d’images | Next.js et eslint-config-next épinglés à 16.3.8 ; sharp 0.35.5 ; source-map-js 1.2.2 ; baseline-browser-mapping 2.11.29 dans le verrouillage |
| Upload admin | Le Content-Length pouvait être absent ou trompeur avant le parsing multipart | Lecture du flux bornée en octets réels, annulation au dépassement, parsing après validation de taille |
| Lecture JSON | Lecture bornée déjà présente mais spécifique au JSON | Mutualisation du lecteur borné avec les uploads, conservation des contrôles de forme/profondeur/clés dangereuses |
| Notifications Web Push | Une URL HTTPS arbitraire, ou un préfixe localhost trompeur, pouvait être enregistré | Fournisseurs de navigateurs autorisés explicitement ; refus des credentials, ports inhabituels et adresses privées ; nouvelle vérification des abonnements stockés avant l’envoi ; timeout de 10 secondes |
| Pages admin | La vérification MFA de lecture dépendait du proxy | Session, allowlist et MFA vérifiées aussi dans la garde appelée avant lecture des données de chaque page admin |
| Animations et contrôles | Effets de pointeur encore calculés avec réduction des mouvements ; transitions génériques | Calculs de glow désactivés selon les préférences ; propriétés animées ciblées ; micro-déplacement des boutons/flèches uniquement avec souris et sans réduction des mouvements |

## Contrôles existants vérifiés

- API admin : vérification serveur de session, allowlist, MFA et origine pour les mutations.
- Formulaires publics : validation, anti-CSRF, honeypot, Turnstile requis par défaut en production et protections contre les soumissions répétées.
- XSS : échappement des templates email, rendu React et neutralisation de `<` dans les données JSON-LD.
- Images : types autorisés et signatures binaires ; noms générés côté serveur ; aucun SVG uploadé accepté.
- En-têtes : CSP avec nonce sur les documents, anti-framing, nosniff, HSTS en production, réponses API/admin sans cache.
- Données : RLS présente dans les migrations des tables sensibles ; accès service_role côté serveur ; seules les données publiques appropriées sont transmises aux composants publics examinés.
- Git : les fichiers `.env` locaux ne sont pas suivis ; seul `.env.example` l’est. Ce contrôle ne remplace pas une analyse de tout l’historique Git à la recherche de secrets.

## Vérifications effectuées

- `npm run lint` et `npm run typecheck` réussis.
- 708 tests de régression et 552 tests de sécurité réussis. Le test de performance JSON passe sous 300 ms pour 500 lectures. Une passe sous charge avait dépassé ce seuil ; le lecteur évite désormais une copie pour les corps en un bloc et la suite complète limite la concurrence à deux processus. Aucun seuil de test n’a été assoupli.
- Suite de sécurité, régression complète et nouveaux scénarios adversariaux : session absente, administrateur non autorisé, MFA absente sans passage par le proxy, corps chunked trop volumineux, faux Content-Length, corps verrouillé et destinations push trompeuses.
- Build de production Next.js 16.3.8 réussi.
- `npm run audit:production` : aucune vulnérabilité connue remontée par npm le jour de la revue.
- HTTP local : accueil 200 avec CSP/nosniff/DENY ; API projets admin sans session 401 ; page admin sans session redirigée vers la connexion ; cache admin/API désactivé.
- Navigateur de production : accueil et section offres visibles, aucune erreur console observée ; absence de débordement à 360 px ; apparitions au scroll et commandes conservées.

## Points restant à suivre

1. **Cinq alertes élevées dans les outils de développement**, liées à la chaîne `eslint-config-next → fast-glob → micromatch → braces`. `braces` 3.0.3 est toujours la dernière version disponible pour cette chaîne lors de la revue. npm propose un retour à eslint-config-next 14.2.35 : ce changement majeur incompatible avec le projet Next.js 16 n’a pas été appliqué. Ne pas traiter de motifs glob non fiables avec ces outils ; suivre le correctif amont. Les dépendances de production ne contiennent pas ces alertes.
2. Les compteurs IP et verrouillages en mémoire sont locaux à une instance : une protection partagée doit compléter ces contrôles si le service est déployé sur plusieurs instances. Les limites journalières persistées restent un contrôle complémentaire.
3. Vérifier les politiques RLS réellement déployées, les accès au stockage, les sauvegardes et la rotation des clés dans Supabase. Aucune clé privée n’a été affichée ni modifiée pendant cette revue.
4. Vérifier sur l’hébergement les origines déclarées, Turnstile, les administrateurs autorisés et l’absence d’override `FORM_ALLOW_INSECURE=true`. Ces réglages n’ont pas été changés par l’audit.
5. La liste des fournisseurs Web Push doit être revue si un nouveau navigateur utilise un autre service ; ne pas réautoriser des endpoints arbitraires.

## Références

- [Avis critique Next.js sur Windows](https://github.com/advisories/GHSA-p293-qw3h-jr36)
- [Avis sharp/libheif](https://github.com/advisories/GHSA-rgj7-g3m4-5g8c)
- [Next.js : contrôle d’authentification à la frontière des données](https://nextjs.org/docs/app/guides/authentication)
- [web.dev : transitions et réduction des mouvements](https://web.dev/learn/css/transitions)
- [Avis résiduel braces](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm)
