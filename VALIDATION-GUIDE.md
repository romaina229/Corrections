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
git apply /chemin/vers/Corrections/patches/16-admin-migrations.patch
git apply /chemin/vers/Corrections/patches/16-admin-user-controller.patch
git apply /chemin/vers/Corrections/patches/16-admin-role-controller.patch
git apply /chemin/vers/Corrections/patches/16-admin-routes-and-auth.patch
git apply /chemin/vers/Corrections/patches/17-reports-export-service.patch
git apply /chemin/vers/Corrections/patches/17-reports-controller.patch
git apply /chemin/vers/Corrections/patches/18-saas-subscription-backend.patch
git apply /chemin/vers/Corrections/patches/18-saas-seat-limit.patch
git apply /chemin/vers/Corrections/patches/19-fedapay-setup.patch
git apply /chemin/vers/Corrections/patches/19-fedapay-service.patch
git apply /chemin/vers/Corrections/patches/19-fedapay-controller-routes.patch

composer require barryvdh/laravel-dompdf:^3.1 simplesoftwareio/simple-qrcode:^4.2 phpoffice/phpspreadsheet:^3.5 fedapay/fedapay-php:^1.5
php artisan migrate
php artisan db:seed --class=RolePermissionSeeder

# Remplir FEDAPAY_SECRET_KEY, FEDAPAY_PUBLIC_KEY, FEDAPAY_WEBHOOK_SECRET
# dans .env (voir .env.example) avant tout test de paiement.
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
git apply /chemin/vers/Corrections/patches/16-admin-frontend-api.patch
git apply /chemin/vers/Corrections/patches/16-admin-frontend-users-page.patch
git apply /chemin/vers/Corrections/patches/16-admin-frontend-roles-page.patch
git apply /chemin/vers/Corrections/patches/16-admin-frontend-integration.patch
git apply /chemin/vers/Corrections/patches/17-reports-frontend.patch
git apply /chemin/vers/Corrections/patches/18-saas-subscription-frontend-page.patch
git apply /chemin/vers/Corrections/patches/18-saas-subscription-frontend-integration.patch
git apply /chemin/vers/Corrections/patches/19-fedapay-frontend-subscription-page.patch
git apply /chemin/vers/Corrections/patches/19-fedapay-frontend-callback.patch

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

**Module 16 — Administration Utilisateurs / Rôles / Permissions**
- [ ] `php artisan migrate` exécuté avant tout test (colonnes `roles.tenant_id`, `users.invited_at`, `users.last_login_at` requises)
- [ ] `php artisan db:seed --class=RolePermissionSeeder` exécuté pour activer les 8 nouvelles permissions sur les rôles admin_org/super_admin
- [ ] Créer un utilisateur en mode « Créer directement » → connexion immédiate possible avec le mot de passe saisi
- [ ] Créer un utilisateur en mode « Inviter par e-mail » → vérifier dans `storage/logs/laravel.log` (si `MAIL_MAILER=log`) qu'un e-mail de définition de mot de passe a bien été généré
- [ ] Renvoyer une invitation à un utilisateur non encore activé
- [ ] Changer le rôle d'un utilisateur en ligne depuis la liste
- [ ] Désactiver un utilisateur, vérifier qu'il ne peut plus se connecter (`403` avec message clair)
- [ ] Tenter de se désactiver soi-même → doit être refusé
- [ ] Tenter de retirer le rôle `admin_org` au dernier administrateur actif du tenant → doit être refusé
- [ ] Créer un rôle personnalisé avec quelques permissions, l'attribuer à un utilisateur, vérifier que l'accès aux menus correspond exactement aux permissions choisies
- [ ] Tenter de modifier ou supprimer un rôle système (`admin_org`, `manager`...) → doit être refusé (403)
- [ ] Créer un rôle personnalisé avec le même nom depuis deux tenants différents → doit fonctionner sans conflit (test d'isolation le plus important de ce module)

**Module 17 — Rapports / Exports**
- [ ] Générer le rapport Employés en PDF → fichier réel téléchargé, résumé + tableau lisibles
- [ ] Générer le rapport Présences en Excel → fichier `.xlsx` réel (pas un `.csv` renommé), 2 feuilles (Résumé, Détail)
- [ ] Générer le rapport Paie (sélecteur de mois, plus de plage de dates) en PDF et Excel
- [ ] Générer le rapport Congés en PDF → vérifier que le détail par type de congé apparaît bien dans le résumé
- [ ] Vérifier qu'aucune fenêtre d'impression ne s'ouvre plus (comportement `window.print()` entièrement retiré)

**Module 18 — Préparation SaaS (limite de sièges + espace client)**
- [ ] Sur un tenant au forfait gratuit (5 employés max), créer des employés jusqu'à la limite → le 6e doit être refusé avec un message clair (422)
- [ ] Faire sortir un employé (module 10) sur un tenant à la limite → un siège doit se libérer immédiatement (vérifier qu'un nouvel employé peut être créé juste après)
- [ ] Page « Mon abonnement » : vérifier que la barre d'usage des sièges reflète le bon compte
- [ ] Faire expirer manuellement `subscription_expires_at` dans les 7 prochains jours pour un tenant de test → l'alerte d'expiration proche doit apparaître
- [ ] Vérifier qu'un tenant au forfait « enterprise » n'a jamais de limite affichée ni appliquée

**Module 19 — Paiement FedaPay (nécessite un compte Sandbox actif et des clés dans `.env`)**
- [ ] Configurer un endpoint webhook dans le tableau de bord FedaPay (Workbench → Webhooks) pointant vers `https://votre-domaine/api/webhooks/fedapay` — nécessite une URL publique HTTPS (utiliser `ngrok` en local pour tester avant déploiement)
- [ ] Copier le secret webhook généré par FedaPay dans `FEDAPAY_WEBHOOK_SECRET`
- [ ] Depuis « Mon abonnement », cliquer « Choisir ce forfait » sur Starter → vérifier la redirection vers une vraie page de paiement FedaPay
- [ ] Réaliser un paiement de test (voir les numéros/cartes de test fournis par FedaPay dans leur documentation Sandbox)
- [ ] **Vérifier dans les logs Laravel (`storage/logs/laravel.log`) le format exact du payload webhook reçu** — si `FedaPayService::handleEvent()` ne trouve pas l'identifiant de transaction, un avertissement `Webhook FedaPay : impossible de déterminer l'identifiant de transaction` apparaît avec le payload brut ; ajuster le chemin d'extraction dans le code si nécessaire à ce moment-là
- [ ] Une fois le paiement confirmé, vérifier que `subscription_expires_at` du tenant a bien été prolongé et que `subscription_plan` correspond au forfait acheté
- [ ] Retester un paiement refusé (carte de test dédiée) → le statut du `Payment` doit passer à `declined`, l'abonnement ne doit pas être modifié
- [ ] Rejouer manuellement le même webhook depuis le tableau de bord FedaPay (bouton « Redeliver ») → l'abonnement ne doit pas être prolongé une seconde fois (test d'idempotence)

## En cas d'échec d'un `git apply`

Si un patch ne s'applique pas dans votre copie (par exemple parce que
vous avez déjà modifié un des fichiers concernés depuis le dernier
commit observé par cet audit), ne forcez pas `--reject` : signalez-le
ici et je régénère un patch adapté à l'état réel de votre branche.
