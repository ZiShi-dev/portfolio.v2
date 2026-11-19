# Audit UI/UX VORZIX — Phase 3

Audit de finition à partir du relevé de phase 2. Les numéros de ligne correspondent au relevé initial de la phase 3. Les composants privés ont été inspectés dans le code. Leur présence dans le relevé ne confirme pas leur rendu en session authentifiée.

## Avoid AI Design

| Nº | Règle | Source | Classement | Décision |
|---:|---|---|---|---|
| 1 | I3 | `src/app/admin/page.tsx:4` | Choix justifié | Flèche vers une vue de gestion. |
| 2 | I3 | `src/app/admin/services/preview/[id]/page.tsx:4` | Choix justifié | Coche d’inclusion dans l’aperçu. |
| 3 | SD4w | `src/app/api/admin/reviews/[id]/route.ts:27` | Faux positif | Commentaire d’API hors rendu. |
| 4 | SD9 | `src/app/globals.css:10` | Choix justifié | Palette Nuit Céleste prescrite. |
| 5 | M8 | `src/app/globals.css:442` | Choix justifié | Déplacement de 2 px réservé à la souris et au mouvement autorisé. |
| 6 | SD4w | `src/app/globals.css:7` | Faux positif | Titre de commentaire CSS. |
| 7 | I3 | `src/app/[locale]/(site)/offres/[slug]/page.tsx:4` | Choix justifié | Coche dans la liste d’inclusions. |
| 8 | I3 | `src/components/admin/admin-about-stats-form.tsx:7` | Choix justifié | Pictogramme de statistiques. |
| 9 | I3 | `src/components/admin/admin-dashboard-overview.tsx:2` | Choix justifié | Destination et statut d’action. |
| 10 | SD4d | `src/components/admin/admin-faqs-panel.tsx:602, 609` | Choix justifié | Séparateurs de métadonnées et services. |
| 11 | I3 | `src/components/admin/admin-password-change-form.tsx:8` | Choix justifié | Pictogramme de sécurité. |
| 12 | I3 | `src/components/admin/admin-project-inquiries-panel.tsx:5` | Choix justifié | Repère d’action dans la boîte de demandes. |
| 13 | SD4d | `src/components/admin/admin-project-inquiries-panel.tsx:429, 607, 608` | Choix justifié | Séparation de valeurs de contact distinctes. |
| 14 | SD5 | `src/components/admin/admin-projects-panel.tsx:656` | Faux positif | Nombre de projets à côté du titre. |
| 15 | SD4m | `src/components/admin/admin-projects-panel.tsx:712, 1109, 1303` | Choix justifié | Identification des références et catégories. |
| 16 | I3 | `src/components/admin/admin-reviews-panel.tsx:5` | Choix justifié | Modération et note. |
| 17 | SD5 | `src/components/admin/admin-reviews-panel.tsx:319` | Faux positif | Compteur des avis en attente. |
| 18 | SD5 | `src/components/admin/admin-services-panel.tsx:528` | Faux positif | Compteur des services. |
| 19 | SD4m | `src/components/admin/admin-services-panel.tsx:592, 1162, 1317` | Choix justifié | Identifiants et compteurs techniques. |
| 20 | I3 | `src/components/admin/admin-shell.tsx:8` | Choix justifié | Repères de navigation latérale. |
| 21 | I3 | `src/components/navbar.tsx:7` | Choix justifié | Navigation et accès aux offres. |
| 22 | K3 | `src/components/navbar.tsx:225` | Choix justifié | Voile du menu ouvert, limité à l’interaction. |
| 23 | SD4w | `src/components/navbar.tsx:56` | Faux positif | Commentaire technique hors rendu. |
| 24 | I3 | `src/components/project-inquiry/project-inquiry-flow.tsx:7` | Choix justifié | État sélectionné d’une réponse. |
| 25 | I3 | `src/components/project-inquiry/project-inquiry-type-icons.tsx:2` | Choix justifié | Repère de catégorie de projet. |
| 26 | SD4 | `src/components/sections/case-study-detail.tsx:56, 67, 297, 323` | Problème mineur | Libellé descriptif de type d’application en 10 px et capitales espacées. Passé en police de lecture à 12 px. Références éditoriales et titres voisins conservés. |
| 27 | SD4m | `src/components/sections/case-study-detail.tsx:56, 67, 297, 323` | Problème mineur | Libellé descriptif de type d’application en 10 px et capitales espacées. Passé en police de lecture à 12 px. Références éditoriales et titres voisins conservés. |
| 28 | I3 | `src/components/sections/contact.tsx:9` | Choix justifié | Confirmation d’envoi. |
| 29 | I3 | `src/components/sections/hero-banner-3d.tsx:14` | Faux positif | Ancienne variante 3D absente de l’accueil courant. |
| 30 | K3 | `src/components/sections/leave-review-modal.tsx:131, 164` | Choix justifié | Séparation modale du formulaire. |
| 31 | I3 | `src/components/sections/project-detail-more-projects.tsx:5` | Choix justifié | Flèche vers les autres réalisations. |
| 32 | I3 | `src/components/sections/project-home-showcase.tsx:3` | Choix justifié | Flèche vers le détail. |
| 33 | K3 | `src/components/sections/project-modal.tsx:121` | Choix justifié | Voile du détail modal. |
| 34 | SD4w | `src/components/sections/project-modal.tsx:30` | Faux positif | Commentaire sur le slug. |
| 35 | I3 | `src/components/sections/project-sale-detail.tsx:6` | Choix justifié | Coche d’inclusion. |
| 36 | K3 | `src/components/sections/review-detail-modal.tsx:97` | Choix justifié | Voile de lecture de l’avis. |
| 37 | SD5 | `src/components/sections/review-form-page.tsx:267, 335, 366` | Faux positif | Trois groupes utiles au remplissage du formulaire. |
| 38 | I3 | `src/components/sections/spotlight-plate.tsx:5` | Choix justifié | Flèche de la réalisation vedette. |
| 39 | I3 | `src/components/sections/testimonials.tsx:4` | Choix justifié | Lien vers la liste des avis. |
| 40 | I3 | `src/components/ui/animated-star-rating.tsx:6` | Choix justifié | Étoile de notation. |
| 41 | I3 | `src/components/ui/app-toast.tsx:7` | Choix justifié | Confirmation sémantique de la notification. |
| 42 | SD4d | `src/components/ui/code-scroll-background.tsx:17, 75` | Choix justifié | Ponctuation du code d’arrière-plan. |
| 43 | I3 | `src/components/ui/process-stepper.tsx:3` | Choix justifié | Pictogramme de progression. |
| 44 | I3 | `src/components/ui/select.tsx:5` | Choix justifié | Sélection dans une liste. |
| 45 | I3 | `src/components/ui/star-rating.tsx:4` | Choix justifié | Unité graphique de la note. |
| 46 | IM5 | `src/components/ui/star-rating.tsx:53` | Faux positif | Cinq positions sur une échelle, dont le remplissage reflète la note. |

## Hallmark

| Point | Classement | Décision |
|---|---|---|
| 3 — colonnes régulières | Choix justifié | Les éléments comparables du catalogue utilisent une grille stable. |
| 25 — largeur de lecture | Défaut visuel confirmé | Les longues réponses de la FAQ sont limitées à 65 ch. |
| 39b — taille des contrôles | Défaut visuel confirmé pour le pied de page | Les cartes de 87 px comportent plusieurs lignes et leur taille est justifiée. Le nouveau rendu a signalé une action « Laisser un avis » de 20 px dans le pied de page. Cible portée à 44 px avec contour de focus laiton. |
| 75 — références et libellés en 10 px | Problème mineur | Conserver les références courtes en mono selon la charte. Relever le libellé descriptif de l’étude de cas et privilégier le gris bleuté lisible dans les vues administratives. |
| 80 — formes dessinées | Choix justifié | Le fond vectoriel appartient au langage cartographique Atlas Céleste. |
| 26b — état actif | Faux positif | Le scanner du fichier de section ne voit pas le style du bouton partagé. |
| 26b — état désactivé | Faux positif | Les CTA de navigation du hero sont des liens. Le bouton partagé gère les états désactivés des actions. |

## Administration

| Surface | Éléments examinés dans le code |
|---|---|
| Tableau de bord et À propos | Navigation par cartes, résumés, formulaire de statistiques et squelettes. |
| Demandes | Liste, date, détails, chargement annoncé, erreur, état vide et confirmation. Date et texte secondaire renforcés. |
| Services et aperçu | Compteurs, catalogue, sections du formulaire, panneaux, chargement et aperçu protégé. |
| FAQ et engagements | Filtres et listes, édition, réorganisation, état vide et chargement. |
| Projets et avis | Compteurs, listes, détails, aides de saisie, absence d’image et état vide. |
| Paramètres et MFA | Réseaux et ordre des contacts, aides secondaires, retours du formulaire et actions de déconnexion de la vérification MFA. |

Aucun compte de test autorisé n’a été trouvé. Le moteur Linux Docker Desktop est indisponible. Les pages authentifiées et les états alimentés par Supabase restent à valider dans un environnement isolé. Les vérifications browser s’arrêtent à la connexion, aux redirections publiques et aux parcours simulés ou sans soumission.

Les textes opérationnels auparavant à 40 % ou 45 % d’ivoire atteignaient environ 3,51:1 ou 4,10:1 sur `surface-high`. Le token retenu `muted-foreground` donne environ 5,77:1 sur cette même surface opaque. Ce calcul ne couvre pas les arrière-plans d’image ni les autres combinaisons de tokens.

## Parcours contrôlés

Matrice de 13 pages par moteur, à 360, 390, 768, 1024 et 1440 px. Accueil FR/AR, catalogue FR/AR, projets et Quotishop, contact FR/AR, démarrage de projet FR/AR, avis, mentions légales et connexion admin. La couverture inclut le chargement des familles de polices utilisées, le RTL, la préférence de mouvement réduit et la largeur du document. Les FAQ alimentées par Supabase sont absentes du jeu de données isolé.

Contrôles à 390 px : menu au clavier et retour du focus, chemin contact vers projet, première étape du parcours, modale d’avis et validation du formulaire vide, cible de 44 px et contour de 2 px dans le pied de page, 404 et redirections des dix routes administratives protégées. Les tests automatisés des routes de contact, d’avis et de demande couvrent séparément validation, persistance et réponses d’échec avec des dépendances simulées. Aucun formulaire valide n’a été soumis au serveur lors de la passe navigateur.

Le rendu a passé les 65 combinaisons par moteur dans Chrome, Firefox et WebKit Playwright. Les tests utilisent HTTPS local pour respecter la politique de ressources du build. Le changement de langue côté client passe dans Chrome et Firefox. Dans WebKit, les entrées FR et AR directes rendent correctement, mais le changement via le sélecteur reste non validé. Des requêtes RSC échouent au contrôle d’accès dans le montage HTTPS local. Safari réel reste à vérifier.

TypeScript, ESLint, build de production, 744 tests de régression et 557 tests de sécurité réussis. Avoid AI Design reste à 35 P1 et 11 P2. Le rendu Hallmark final relève 0 échec, 0 avertissement et 4 points de revue. La cible du pied de page ne figure plus dans ses signalements. Impeccable a terminé son analyse statique.
