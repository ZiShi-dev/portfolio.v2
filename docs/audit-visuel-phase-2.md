# Audit visuel VORZIX — Phase 2

Relevé initial de `avoid-ai-design` 0.5.0 sur `src/app` et `src/components` : 199 fichiers, 52 P1 et 20 P2. Les lignes ci-dessous correspondent au relevé avant corrections. Un motif détecté est un point de départ. Les décisions s’appuient sur la fonction du composant, la charte Atlas Céleste et le rendu accessible dans Chrome. Pour l’administration protégée et les variantes sans données locales, le diagnostic repose sur la lecture du code.

Le relevé après retouches compte 35 P1 et 11 P2, sans règle d’exclusion ajoutée. Les cas conservés comprennent les icônes d’action, les références catalogue et les voiles modaux. Le contrôle rendu Hallmark a complété la lecture de code en repérant une description d’offre tronquée et une coupure de titre sur mobile. Les descriptions s’affichent en entier et le titre du parcours équilibre ses lignes. Le nouveau rendu de l’accueil a donné 0 échec, 0 avertissement et 7 points de revue. Parmi ceux-ci, les formes vectorielles de l’Atlas sont volontaires et les deux signalements d’état concernent des contrôles stylés dans leurs composants partagés. Les autres points concernent la densité, la taille des références et la longueur de ligne.

Design Taste a dépassé le délai sur l’accueil complet. Le contrôle ciblé sur le catalogue à 390 px a révélé un saut de titre de H1 à H3 et des indicateurs de focus trop atténués. Les fiches utilisent désormais H2 sur le catalogue, H3 sous la section de l’accueil, et les contrôles concernés reçoivent un contour laiton opaque. Certains critères du profil « service » sont propres aux pages de vente à action unique. Le catalogue propose délibérément une action contextualisée par offre et des pictogrammes de domaine. Le SVG d’ambiance est décoratif, sans fonction d’illustration principale.

| Nº | Priorité | Règle | Fichier et lignes d’origine | Diagnostic et décision |
|---:|:---:|:---:|---|---|
| 1 | P1 | I3 | `src/app/admin/page.tsx:4` | Conservé — flèche de navigation vers une vue de gestion. |
| 2 | P1 | I3 | `src/app/admin/services/preview/[id]/page.tsx:4` | Conservé — coche d’inclusion dans l’aperçu d’une offre. |
| 3 | P2 | SD4w | `src/app/api/admin/reviews/[id]/route.ts:27` | Faux positif — commentaire de route HTTP, jamais affiché. |
| 4 | P1 | SD9 | `src/app/globals.css:10` | Conservé — la palette nuit et laiton est l’identité prescrite par la charte. |
| 5 | P2 | M8 | `src/app/globals.css:452` | Conservé — le survol déplace la carte de 2 px, uniquement avec pointeur précis et mouvement autorisé. |
| 6 | P2 | M9 | `src/app/globals.css:66` | Corrigé — animation de défilement continu sans consommateur dans le code applicatif, retirée. |
| 7 | P2 | SD4w | `src/app/globals.css:7` | Faux positif — titre de commentaire CSS. |
| 8 | P1 | I3 | `src/app/[locale]/(site)/offres/[slug]/page.tsx:4` | Conservé — retour, inclusions et prise de contact utilisent des pictogrammes fonctionnels. |
| 9 | P1 | SD4 | `src/app/[locale]/(site)/offres/[slug]/page.tsx:146, 154, 195, 228` | Corrigé en partie — retour et titres d’inclusions agrandis. La référence catalogue reste en mono. |
| 10 | P2 | SD4m | `src/app/[locale]/(site)/offres/[slug]/page.tsx:146, 154, 195, 228` | Doublon du signalement 9 — les mêmes libellés changent de traitement typographique. |
| 11 | P1 | I3 | `src/components/admin/admin-about-stats-form.tsx:7` | Conservé — le pictogramme de graphique identifie le réglage des statistiques. |
| 12 | P1 | I3 | `src/components/admin/admin-dashboard-overview.tsx:2` | Conservé — les pictogrammes du tableau de bord distinguent les destinations. |
| 13 | P1 | SD4 | `src/components/admin/admin-engagements-panel.tsx:415, 418, 625` | Corrigé — petits états et contrôles éditoriaux passent à une taille lisible sans capitales espacées. |
| 14 | P2 | SD4m | `src/components/admin/admin-engagements-panel.tsx:415, 418, 625` | Doublon du signalement 13 — les valeurs éditoriales ont une typographie de lecture. |
| 15 | P1 | SD4 | `src/components/admin/admin-faqs-panel.tsx:550, 582, 585, 588, 592, 885` | Corrigé en partie — filtres et commandes FAQ agrandis. Les marques courtes gardent leur rôle. |
| 16 | P2 | SD4d | `src/components/admin/admin-faqs-panel.tsx:602, 609` | Conservé — séparateurs entre métadonnées et services associés. |
| 17 | P2 | SD4m | `src/components/admin/admin-faqs-panel.tsx:550, 582, 585, 588, 592, 864, 885` | Doublon du signalement 15 — améliorer la lecture des filtres avant les métadonnées. |
| 18 | P1 | I3 | `src/components/admin/admin-password-change-form.tsx:8` | Conservé — cadenas et commandes de visibilité du mot de passe identifient leur fonction. |
| 19 | P1 | I3 | `src/components/admin/admin-project-inquiries-panel.tsx:5` | Conservé — pictogrammes d’actions dans la boîte de demandes. |
| 20 | P1 | SD4 | `src/components/admin/admin-project-inquiries-panel.tsx:431, 559, 568, 717` | Corrigé — libellés et données secondaires agrandis, avec gris bleuté lisible. |
| 21 | P2 | SD4d | `src/components/admin/admin-project-inquiries-panel.tsx:429, 607, 608` | Conservé — séparateurs entre valeurs de contact. Ils matérialisent des données distinctes. |
| 22 | P1 | SD5 | `src/components/admin/admin-projects-panel.tsx:656` | Faux positif — le titre du panneau de projets annonce les éléments gérés. |
| 23 | P2 | SD4m | `src/components/admin/admin-projects-panel.tsx:712, 1109, 1303` | Conservé — les identifiants, catégories et actions compactes se distinguent par leur usage. |
| 24 | P1 | I3 | `src/components/admin/admin-reviews-panel.tsx:5` | Conservé — les pictogrammes distinguent les actions de modération. |
| 25 | P1 | SD5 | `src/components/admin/admin-reviews-panel.tsx:319` | Faux positif — titre du panneau d’avis, nécessaire à l’orientation. |
| 26 | P1 | SD4 | `src/components/admin/admin-services-panel.tsx:583, 623, 629, 783, 797, 887, 906, 1015, 1134, 1222` | Corrigé — sous-titres et libellés de formulaire plus lisibles, références conservées. |
| 27 | P1 | SD5 | `src/components/admin/admin-services-panel.tsx:528` | Faux positif — titre et compteur du catalogue d’administration. |
| 28 | P2 | SD4m | `src/components/admin/admin-services-panel.tsx:583, 592, 623, 629, 783, 797, 887, 906, 1015, 1134, 1162, 1222, 1317` | Corrigé en partie — les titres et libellés de données sont agrandis. Les références courtes restent en mono. |
| 29 | P1 | I3 | `src/components/admin/admin-shell.tsx:8` | Conservé — les pictogrammes de l’administration distinguent les sections et commandes. |
| 30 | P1 | K3 | `src/components/admin/admin-shell.tsx:117, 150` | Corrigé — en-têtes administratifs opaques pour une surface stable au défilement. |
| 31 | P1 | SD4 | `src/components/admin/admin-shell.tsx:128, 191, 220` | Corrigé — intitulés de navigation moins petits et sans capitales espacées. |
| 32 | P2 | SD4m | `src/components/admin/admin-shell.tsx:128, 191, 220` | Doublon du signalement 31 — le réglage reste identifiable en typographie de corps. |
| 33 | P1 | K3 | `src/components/floating-contact-button.tsx:154` | Corrigé — commande de contact plus compacte et opaque, panneau moins éloigné et défilable. |
| 34 | P1 | K3 | `src/components/floating-language-button.tsx:50, 58` | Corrigé — commande de langue réduite, panneau opaque et suppression du contour intérieur. |
| 35 | P1 | I3 | `src/components/navbar.tsx:7` | Conservé — les pictogrammes aident à scanner les entrées du menu. |
| 36 | P1 | K3 | `src/components/navbar.tsx:225` | Conservé — le voile flouté est temporaire et isole le menu ouvert du contenu. |
| 37 | P2 | SD4w | `src/components/navbar.tsx:56` | Faux positif — commentaire d’implémentation de la navigation. |
| 38 | P1 | I3 | `src/components/project-inquiry/project-inquiry-flow.tsx:7` | Conservé — la coche indique une sélection et la croix permet de quitter le parcours. |
| 39 | P1 | K3 | `src/components/project-inquiry/project-inquiry-flow.tsx:1691` | Corrigé — le pied du parcours est opaque sans flou permanent. |
| 40 | P1 | SD4 | `src/components/project-inquiry/project-inquiry-flow.tsx:683, 1379, 1490, 1791, 1849` | Corrigé en partie — libellés de progression et récapitulatifs agrandis. Les références sont conservées. |
| 41 | P2 | SD4m | `src/components/project-inquiry/project-inquiry-flow.tsx:683, 960, 1379, 1490, 1505, 1791, 1849` | Conservé en partie — l’unité d’un champ et le nom VORZIX représentent des données courtes. |
| 42 | P1 | I3 | `src/components/project-inquiry/project-inquiry-type-icons.tsx:2` | Conservé — les pictogrammes distinguent les catégories de projet. |
| 43 | P1 | K3 | `src/components/sections/about.tsx:58` | Corrigé — statistiques de présentation sur fond opaque, sans flou sur chaque cellule. |
| 44 | P1 | SD4 | `src/components/sections/case-study-detail.tsx:56, 67, 297, 307, 323, 333` | Corrigé en partie — valeurs de comparaison plus lisibles. Le marquage des études reste éditorial. |
| 45 | P2 | SD4m | `src/components/sections/case-study-detail.tsx:56, 67, 169, 297, 307, 323, 333` | Corrigé — légendes de captures plus faciles à lire. |
| 46 | P1 | I3 | `src/components/sections/contact.tsx:9` | Conservé — les pictogrammes indiquent l’envoi, le contact et la confirmation. |
| 47 | P1 | I3 | `src/components/sections/hero-banner-3d.tsx:14` | Conservé — le signalement vise un import du décor 3D. Aucun défaut d’interface établi par ce motif seul. |
| 48 | P1 | K3 | `src/components/sections/leave-review-modal.tsx:131, 164` | Conservé — le voile isole le formulaire modal du reste de la page. |
| 49 | P1 | SD4 | `src/components/sections/project-card.tsx:63, 67, 82` | Corrigé en partie — catégorie et action plus lisibles. La référence catalogue reste en mono. |
| 50 | P1 | K3 | `src/components/sections/project-carousel.tsx:117` | Corrigé — commandes du carrousel sur une surface opaque et stable. |
| 51 | P1 | I3 | `src/components/sections/project-detail-more-projects.tsx:5` | Conservé — flèche de navigation vers les autres projets. |
| 52 | P1 | I3 | `src/components/sections/project-home-showcase.tsx:3` | Conservé — flèche indiquant l’accès à une réalisation. |
| 53 | P1 | K3 | `src/components/sections/project-modal.tsx:121, 337` | Corrigé en partie — étiquette d’image opaque et texte renforcé. Le voile modal garde son rôle. |
| 54 | P2 | SD4w | `src/components/sections/project-modal.tsx:30` | Faux positif — commentaire relatif au slug, absent du rendu. |
| 55 | P1 | I3 | `src/components/sections/project-sale-detail.tsx:6` | Conservé — pictogrammes pour inclusions, accordéons et lien externe. |
| 56 | P1 | SD4 | `src/components/sections/project-sale-detail.tsx:159, 286, 383, 393, 403, 444, 455` | Corrigé en partie — libellés descriptifs agrandis. La référence du projet reste identifiable. |
| 57 | P2 | SD4m | `src/components/sections/project-sale-detail.tsx:159, 286, 383, 393, 403, 444, 455, 550` | Corrigé en partie — légendes et descriptions en typographie de lecture, références conservées. |
| 58 | P1 | K3 | `src/components/sections/review-detail-modal.tsx:97` | Conservé — le voile délimite la lecture de l’avis ouvert. |
| 59 | P1 | SD4 | `src/components/sections/review-form-page.tsx:268, 336, 367, 398` | Corrigé — les trois groupes du formulaire sont identifiables avec de vrais titres lisibles. |
| 60 | P1 | SD5 | `src/components/sections/review-form-page.tsx:267, 335, 366` | Doublon du signalement 59 — les titres désignent des groupes utiles au remplissage. |
| 61 | P2 | SD4m | `src/components/sections/review-form-page.tsx:268, 336, 367, 398` | Corrigé — compteur en chiffres tabulaires et titres en typographie de corps. |
| 62 | P1 | I3 | `src/components/sections/spotlight-plate.tsx:5` | Conservé — flèche indiquant une sortie vers le détail mis en avant. |
| 63 | P1 | I3 | `src/components/sections/testimonials.tsx:4` | Conservé — plume pour l’action d’écrire un avis et flèche pour accéder aux avis. |
| 64 | P2 | SD4m | `src/components/services/service-offer-card.tsx:53, 83, 106` | Corrigé en partie — action secondaire agrandie. Les références et les données d’offre restent distinctes. |
| 65 | P1 | I3 | `src/components/ui/animated-star-rating.tsx:6` | Conservé — l’étoile encode une note. |
| 66 | P1 | I3 | `src/components/ui/app-toast.tsx:7` | Conservé — les pictogrammes différencient erreur, succès, information et fermeture. |
| 67 | P2 | SD4d | `src/components/ui/code-scroll-background.tsx:17, 75` | Conservé — les points médians appartiennent au texte du visuel de code et à ses commentaires. |
| 68 | P1 | K3 | `src/components/ui/dialog.tsx:41` | Corrigé en partie — bouton de fermeture opaque. Seul le voile de fond conserve le flou. |
| 69 | P1 | I3 | `src/components/ui/process-stepper.tsx:3` | Conservé — les pictogrammes différencient les étapes du parcours. |
| 70 | P1 | I3 | `src/components/ui/select.tsx:5` | Conservé — la coche indique l’option sélectionnée et les chevrons indiquent le contrôle. |
| 71 | P1 | I3 | `src/components/ui/star-rating.tsx:4` | Conservé — l’étoile est l’unité de notation. |
| 72 | P1 | IM5 | `src/components/ui/star-rating.tsx:53` | Faux positif — cinq positions représentent l’échelle. Le remplissage dépend de la note. |
