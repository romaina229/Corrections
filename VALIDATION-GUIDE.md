# Guide de validation — patchs 01 à 14

Ce document liste ce qui a déjà été vérifié automatiquement, et ce
qui reste à valider manuellement dans votre environnement réel
(base de données, artisan, serveur de dev) avant de fusionner ces
patchs dans `SDS-RH_backend`/`SDS-RH_frontend`.

## Déjà vérifié automatiquement (2026-08-13)

- **Application cumulée réelle** : les 10 patchs backend et les 16
  patchs frontend s'appliquent tous avec `git apply` (pas seulement
  `--check`) sur des copies fraîches des deux dépôts, dans l'ordre
  exact documenté plus bas — 26/26 réussis.
- **Contrôle de typage TypeScript strict** (`tsc -b --force`) sur le
  frontend complet une fois tous les patchs appliqués : **0 erreur**.
  Une erreur de typage réelle a été trouvée et corrigée à cette
  occasion (`Payrolls.tsx`, cast `content-type` en `string`) —
  `patches/02-frontend-pdf-download.patch` a été mis à jour en
  conséquence.
- **Lint** (`oxlint`) sur les fichiers nouveaux/modifiés : 0 erreur,
  4 avertissements cosmétiques (paramètre `catch (error)` non
  utilisé — pattern déjà présent ailleurs dans le code, sans impact
  fonctionnel).
- **Équilibre syntaxique** (accolades PHP/TSX) vérifié fichier par
  fichier au moment de la construction de chaque patch. Aucun outil
  PHP n'étant disponible dans cet environnement de préparation, un
  `php -l` sur chaque fichier backend reste à faire dans le vôtre
  (voir ci-dessous).

## À faire dans votre environnement avant fusion

### 1. Backend

```bash
cd SDS-RH_backend
git checkout -b integration/corrections-01-14
git apply /chemin/vers/Corrections/patches/01-pdf-direct-download.patch
git apply /chemin/vers/Corrections/patches/03-portal-payslip-api.patch
git apply /chemin/vers/Corrections/patches/06-employee-documents-backend.patch
git apply /chemin/vers/Corrections/patches/07-employee-contracts-backend.patch
git apply /chemin/vers/Corrections/patches/08-employee-history-backend.patch
git apply /chemin/vers/Corrections/patches/09-positions-backend.patch
git apply /chemin/vers/Corrections/patches/10-employee-exits-backend.patch
git apply /chemin/vers/Corrections/patches/11-attendance-double-clockin.patch
git apply /chemin/vers/Corrections/patches/12-overtime-backend.patch
git apply /chemin/vers/Corrections/patches/13-leaves-backend.patch
git apply /chemin/vers/Corrections/patches/15-employees-backend-tenant.patch
git apply /chemin/vers/Corrections/patches/15-dashboard-employee-payroll.patch

composer require barryvdh/laravel-dompdf:^3.1 simplesoftwareio/simple-qrcode:^4.2
php artisan migrate
php -l app/Http/Controllers/Api/*.php   # sanity check syntaxe
php artisan route:list --path=leaves
php artisan route:list --path=contracts
php artisan route:list --path=employees
php artisan route:list --path=overtime
```

### 2. Frontend

```bash
cd SDS-RH_frontend
git checkout -b integration/corrections-01-14
git apply /chemin/vers/Corrections/patches/02-frontend-pdf-download.patch
git apply /chemin/vers/Corrections/patches/03-portal-payslip-api-frontend.patch
git apply /chemin/vers/Corrections/patches/06-employee-documents-frontend.patch
git apply /chemin/vers/Corrections/patches/07-employee-contracts-frontend.patch
git apply /chemin/vers/Corrections/patches/09-positions-frontend.patch
git apply /chemin/vers/Corrections/patches/10-employee-exits-frontend.patch
git apply /chemin/vers/Corrections/patches/10-employee-terminate-page.patch
git apply /chemin/vers/Corrections/patches/10-employee-exits-integration.patch
git apply /chemin/vers/Corrections/patches/11-attendance-frontend.patch
git apply /chemin/vers/Corrections/patches/11-attendance-qr-local.patch
git apply /chemin/vers/Corrections/patches/12-overtime-frontend-page.patch
git apply /chemin/vers/Corrections/patches/12-overtime-frontend-integration.patch
git apply /chemin/vers/Corrections/patches/13-leaves-frontend-list.patch
git apply /chemin/vers/Corrections/patches/13-leaves-frontend-create.patch
git apply /chemin/vers/Corrections/patches/13-leaves-frontend-show.patch
git apply /chemin/vers/Corrections/patches/14-dashboard-stats-frontend.patch
git apply /chemin/vers/Corrections/patches/15-employees-frontend-query-filter.patch
git apply /chemin/vers/Corrections/patches/15-employee-show-frontend-query.patch
git apply /chemin/vers/Corrections/patches/15-dashboard-frontend-query.patch
git apply /chemin/vers/Corrections/patches/15-spa-navigation-guard.patch

npm install
npm run build   # tsc -b && vite build : doit passer sans erreur
```

⚠️ L'ordre ci-dessus est obligatoire, pas seulement recommandé —
plusieurs patchs modifient les mêmes fichiers (`Sidebar.tsx`,
`AppRoutes.tsx`, `routes/api.php`) et ont été construits en tenant
compte des patchs précédents dans cette séquence exacte.

### 3. Checklist de test manuel, module par module

**Bulletin de paie (01/02/03)**
- [ ] Télécharger un bulletin depuis Paie → un vrai fichier PDF est téléchargé, pas d'onglet d'impression
- [ ] Le PDF affiche le logo de l'organisation (si un logo est configuré) et un QR code lisible
- [ ] Scanner le QR (ou ouvrir son URL) renvoie la vérification du bulletin
- [ ] Même test depuis Mon espace → Mes bulletins (portail employé)
- [ ] Un employé ne peut pas télécharger le bulletin d'un collègue (tester avec l'ID d'un autre bulletin dans l'URL)

**Documents / Contrats / Historique (06/07/08)**
- [ ] Téléchargement direct d'un document depuis la fiche employé
- [ ] Upload d'un contrat avec fichier, téléchargement, remplacement du fichier
- [ ] Isolation tenant : un utilisateur du tenant B reçoit 404 sur les ressources du tenant A

**Postes (09)**
- [ ] Le menu « Postes » apparaît, CRUD complet fonctionnel
- [ ] Suppression refusée si le poste est occupé par un employé

**Sorties employés (10)**
- [ ] Le bouton « Sortir » (liste Employés) mène au formulaire de sortie structurée
- [ ] La sortie apparaît dans le menu « Sorties employés » avec le bon motif
- [ ] `destroy()` (ancienne route) fonctionne toujours si vous l'utilisez encore ailleurs

**Présences (11)**
- [ ] Le filtre département fonctionne sans reload
- [ ] Le QR affiché sur `/attendance/qr` se génère sans appel réseau externe
- [ ] Un double pointage d'entrée renvoie une erreur claire (422), pas un succès silencieux

**Heures supplémentaires (12)**
- [ ] Le menu apparaît pour les utilisateurs avec `view_attendance`
- [ ] Les filtres (mois, dates, département, clic sur un employé) fonctionnent sans reload

**Congés (13) — priorité de test**
- [ ] **Test critique** : en tant que RH/manager, sélectionner l'employé A dans le formulaire, vérifier que la demande créée appartient bien à A (et pas à votre propre compte)
- [ ] Pagination de la liste des congés fonctionne
- [ ] Bouton « Voir » ouvre le détail
- [ ] Upload d'une pièce jointe à la création, téléchargement depuis le détail
- [ ] Approbation/rejet sans reload, solde mis à jour correctement

**Dashboard (14)**
- [ ] Les 9 cartes s'affichent avec des valeurs cohérentes

**Module 15 — corrections transverses**
- [ ] Filtre département sur la liste Employés : les options se chargent réellement et filtrent la liste
- [ ] En tant qu'employé standard, le Dashboard personnel affiche bien un montant de paie du mois (`payroll_total`), pas seulement en vue admin
- [ ] Un utilisateur du tenant B reçoit 404 sur `GET /employees/{id}` et `PUT /employees/{id}` d'un employé du tenant A (déjà testé en module 06/07/08, à revérifier ici puisque `show`/`update` avaient un contrôle tenant manquant jusqu'à ce module)
- [ ] Créer un employé avec un `department_id` appartenant à un autre tenant (via l'API directement) → doit être refusé en validation
- [ ] Cliquer un lien `<a href="/...">` interne resté non migré (s'il en existe encore) → doit naviguer en SPA, sans rechargement complet de page (vérifier dans les DevTools réseau : pas de requête de document HTML)

## En cas d'échec d'un `git apply`

Si un patch ne s'applique pas dans votre copie (par exemple parce que
vous avez déjà modifié un des fichiers concernés depuis le dernier
commit observé par cet audit), ne forcez pas `--reject` : signalez-le
ici et je régénère un patch adapté à l'état réel de votre branche.
