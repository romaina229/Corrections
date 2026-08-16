# SDS-RH — matrice de correction initiale

## Sources vérifiées

- Backend : `romaina229/SDS-RH_backend`, branche `main`, dernier commit observé `96e5773ee02c471d3ba6955b825ba44cf6079deb`.
- Frontend : `romaina229/SDS-RH_frontend`, branche `main`, dernier commit observé `dfcc919968406e2d104bdb6d5e8b745433a84ed7`.
- Cahier/audit fourni : `rapport_audit_cahier_des_charges.pdf`.

## Constat fonctionnel

Le rapport demande en priorité la correction des incohérences `Sidebar ↔ AppRoutes` et la vérification des API appelées. Il cible ensuite les notifications, le portail employé et l'historique salarié. Il prévoit aussi une arborescence plus complète : Organisation (Départements, Postes, Organigramme), Employés (Liste, Historique carrière, Documents, Sorties), Temps & Présence (Pointage, Absences, Heures supplémentaires), Congés, Paie (Salaires, Bulletins, Avances, Primes), Recrutement, Formation, Performance, Portail employé, Rapports, Notifications et Administration (Utilisateurs, Rôles, Permissions, Paramètres).

## État observé

| Domaine | État observé | Priorité |
|---|---|---:|
| Authentification | Présente, token Sanctum côté frontend | P1 |
| Dashboard | API + page présentes | P1 |
| Employés | CRUD + historique déjà présents | P1 |
| Départements | API + page présentes | P1 |
| Postes | API backend présente, menu/page frontend à compléter | P1 |
| Organigramme | API + page présentes | P1 |
| Contrats | CRUD présent | P1 |
| Congés | Présent | P1 |
| Présences | Présent | P1 |
| Paie | Présente, téléchargement actuellement passe par `window.print()` | P0 |
| Documents | Présent, téléchargement direct déjà disponible | P0 |
| Recrutement | Présent | P2 |
| Formation | Présent | P2 |
| Performance | Présent | P2 |
| Notifications | API + UI présentes | P1 |
| Portail employé | Présent : profil, congés, documents, bulletins, historique | P1 |
| Administration SaaS | Tenants/stats présents ; utilisateurs/rôles/permissions à compléter | P2 |

## Anomalies précises relevées

### 1. Téléchargement bulletin de paie

Le backend `/payrolls/{payroll}/download` renvoie actuellement du JSON avec `format: print`, puis le frontend ouvre une fenêtre et appelle `printWindow.print()`. Même logique côté `MyPayslips`. Cela explique le passage par l'impression au lieu d'un téléchargement PDF direct.

Correction préparée dans `patches/01-pdf-direct-download.patch`, `patches/02-frontend-pdf-download.patch` et `patches/03-portal-payslip-api.patch`.

### 2. Dépendance PDF

Le backend n'avait pas de moteur PDF identifié dans `composer.json`. Le projet utilise PHP 8.3 et Laravel 13.8. La version actuelle `barryvdh/laravel-dompdf` v3.1.2 annonce la compatibilité Laravel 13.x ; la correction cible donc `^3.1`. Cette dépendance devra être installée et le `composer.lock` régénéré dans le dépôt backend au moment de l'intégration.

### 3. Menu cible incomplet

Le Sidebar actuel contient notamment Employés, Départements, Organigramme, Contrats, Performances, Présences, Congés, Paie, Formations, Recrutement, Documents, Rapports, Notifications et Paramètres. Il ne matérialise pas encore toutes les sous-fonctions demandées par le rapport : Postes, Historique carrière comme menu dédié, Sorties employés, Heures supplémentaires, Salaires, Bulletins, Avances et Primes.

### 4. Administration

Les routes backend `admin` exposent actuellement les statistiques et la gestion des organisations/tenants. Les menus/capacités Utilisateurs, Rôles et Permissions prévus par le rapport ne sont pas encore exposés comme modules frontend/backend dédiés dans les routes observées.

### 5. Dashboard

Le dashboard actuel expose six cartes : employés, départements, contrats actifs, présents aujourd'hui, congés en attente et masse salariale. L'API calcule également absents aujourd'hui, nouveaux recrutements et contrats arrivant à échéance, mais ces indicateurs ne sont pas tous affichés dans `StatsCards`. C'est une amélioration P1 à faire après sécurisation des routes.

## Ordre de travail retenu

1. P0 — PDF direct A4 portrait pour bulletins.
2. P1 — audit exhaustif Sidebar ↔ AppRoutes ↔ API backend.
3. P1 — correction des pages qui existent mais dont les routes/API divergent.
4. P1 — Dashboard complet selon le cahier/audit.
5. P1 — Postes + carrière + sorties employés + présence détaillée.
6. P1 — notifications et compteur non lu.
7. P2 — administration utilisateurs/rôles/permissions.
8. P2 — rapports/exports et finition visuelle.
9. P3 — préparation SaaS (abonnements, limitations par plan, espace client).

## Bloc Fiche Employé — état au dépôt des patchs 06/07/08

| Sous-module | État |
|---|---|
| Dashboard | ✅ validé |
| Employés (liste/CRUD) | ✅ validé |
| Matricules fiables | ✅ validé |
| Documents employé | Patch déposé : `patches/06-employee-documents-backend.patch`, `patches/06-employee-documents-frontend.patch` |
| Contrats employé | Patch déposé : `patches/07-employee-contracts-backend.patch`, `patches/07-employee-contracts-frontend.patch` |
| Historique employé | Patch déposé : `patches/08-employee-history-backend.patch` |

Détail et critères de validation : `employees/06-08-README.md`.
Prochain module après validation : **Postes** (menu Organisation).

## Module Postes — état au dépôt du patch 09

| Élément | État |
|---|---|
| API backend | Déjà présente ; contrôle tenant explicite ajouté (défense en profondeur) |
| Menu + page frontend | Patch déposé : `patches/09-positions-backend.patch`, `patches/09-positions-frontend.patch` |

Détail et critères de validation : `positions/README.md`.
Prochain module après validation : **Sorties employés** (archivage).

## Validation automatisée finale (2026-08-13)

Une passe de validation complète a été exécutée directement contre
le contenu poussé dans ce dépôt (et non contre des fichiers
intermédiaires) :

- **26/26 patchs** (10 backend + 16 frontend) appliqués avec succès
  via `git apply` réel, dans l'ordre officiel ci-dessus, sur des
  copies fraîches de `SDS-RH_backend` et `SDS-RH_frontend`.
- **Contrôle de typage TypeScript strict** (`tsc -b --force`) sur le
  frontend complet une fois les 16 patchs appliqués : une erreur
  réelle trouvée et corrigée (`Payrolls.tsx`, cast `content-type` en
  `string` — le type Axios `AxiosHeaderValue` n'était pas assignable
  au paramètre `Blob`). `patches/02-frontend-pdf-download.patch` mis
  à jour en conséquence et re-testé : 0 erreur.
- **Lint** (`oxlint`) : 0 erreur, 4 avertissements cosmétiques sans
  impact fonctionnel (paramètre `catch (error)` non utilisé).
- Aucun outil PHP n'étant disponible dans cet environnement de
  préparation, `php -l` sur les fichiers backend modifiés n'a pas pu
  être exécuté ici — à faire en priorité dans votre environnement
  (commande fournie dans `VALIDATION-GUIDE.md`).

Guide de validation détaillé, procédure d'intégration et checklist
de test manuel module par module : voir `VALIDATION-GUIDE.md` à la
racine de ce dépôt.

## Règle de sécurité du chantier

Aucune correction n'est écrite dans `SDS-RH_backend/main` ou `SDS-RH_frontend/main`. Les propositions sont conservées dans `romaina229/Corrections` jusqu'à validation et intégration explicite.

## Éléments hors patchs numérotés — audit et intégration (module 15, 2026-08-14)

En plus des patchs 01 à 14, le dépôt contenait des dossiers non
encore convertis en `.patch` valides ou jamais vérifiés contre le
code source réel : `dashboard/01-03`, `employees/01-04`,
`frontend/01-spa-navigation`, `backend/app/Services/PayslipPdfService.php`.
Audit complet effectué :

| Élément | Verdict |
|---|---|
| `backend/app/Services/PayslipPdfService.php` | Redondant — déjà intégralement repris dans `01-pdf-direct-download.patch`. Aucune action. |
| `dashboard/02-stats-cards.patch` | Redondant — déjà couvert par `14-dashboard-stats-frontend.patch` (grille et libellés légèrement différents, fonctionnellement équivalent ou supérieur). Aucune action. |
| `employees/01`, `03` | Convertis en `15-employees-frontend-query-filter.patch` |
| `employees/02` | Converti en `15-employees-backend-tenant.patch` |
| `employees/04` | Converti en `15-employee-show-frontend-query.patch` |
| `dashboard/01` | Converti en `15-dashboard-frontend-query.patch` |
| `dashboard/03` | Converti en `15-dashboard-employee-payroll.patch` |
| `frontend/01-spa-navigation` | Converti en `15-spa-navigation-guard.patch` |

### Détail des 6 patchs du module 15

| Patch | Contenu |
|---|---|
| `15-employees-backend-tenant.patch` | **Bug réel confirmé** : `EmployeeController::store()` ne scopait pas la validation `department_id`/`position_id` au tenant courant (contrairement à `update()`, qui le faisait déjà) — un identifiant existant chez un autre tenant pouvait être accepté à la création. Corrigé. Contrôle tenant explicite ajouté sur `show()` et `update()` (absent malgré le tout premier checkpoint « Employés ✅ » du projet — ces deux méthodes ne s'appuyaient jusqu'ici que sur le scope global implicite). |
| `15-dashboard-employee-payroll.patch` | **Bug réel confirmé** : `DashboardController::index()`, branche self-service employé, n'incluait pas `payroll_total` dans les stats retournées — contrairement à la branche admin/manager. Un employé consultant son propre tableau de bord ne voyait donc jamais son propre montant de paie du mois. Corrigé. |
| `15-employees-frontend-query-filter.patch` | `Employees.tsx` migré vers TanStack Query. **Filtre département enfin fonctionnel** : le `<select>` n'était jamais alimenté (`<option value="">Tous les départements</option>` seul, aucune liste réelle). Tous les boutons passés en `type="button"`. Reconstruit en tenant compte du bouton « Sortir » déjà posé par le module 10 (pas de régression). |
| `15-employee-show-frontend-query.patch` | `EmployeeShow.tsx` migré vers TanStack Query (fiche employé + historique de carrière + mutation d'ajout d'événement), en préservant les téléchargements Documents/Contrats déjà ajoutés par les modules 06/07. |
| `15-dashboard-frontend-query.patch` | `Dashboard.tsx` migré vers TanStack Query, avec état d'erreur explicite et bouton « Réessayer » au lieu d'un simple toast silencieux. |
| `15-spa-navigation-guard.patch` | Nouveau composant `SpaNavigationGuard.tsx` monté au niveau racine (`AppRoutes.tsx`) : intercepte les clics sur les liens `<a href="/...">` internes qui n'ont pas encore été migrés vers `Link`/`navigate()`, pour éviter un rechargement complet de page. Ignore explicitement les téléchargements, nouveaux onglets, ancres, liens externes et endpoints `/api/`. |

### Validation

- **20/20 patchs frontend** (02 → 15) appliqués en cumulé réel sur
  une copie fraîche de `SDS-RH_frontend`.
- **10 patchs backend de base + 2 patchs 15** appliqués en cumulé
  réel sur une copie fraîche de `SDS-RH_backend`.
- **`tsc -b --force` sur le frontend complet (01 → 15) : 0 erreur.**
- **`oxlint` : 0 erreur**, 6 avertissements cosmétiques préexistants
  sans rapport avec ces patchs (dont un dans `EmployeeEdit.tsx`, non
  modifié ici).

Chaque `.patch` de ce dépôt a été testé avec `git apply --check` puis
`git apply` réel sur une copie fraîche de `SDS-RH_backend` et
`SDS-RH_frontend`, en cumulé et dans l'ordre indiqué. Les patchs 01,
02, 03 et 10 avaient été déposés dans un format non standard (proche
du format `apply_patch`, avec des en-têtes `@@` sans numéros de ligne
et, pour plusieurs fichiers, un préfixe `+` parasite qui cassait le
parsing `git apply` au-delà du premier fichier). Ils ont été
intégralement réécrits au format `git diff` standard, testés, puis
remplacés dans ce dépôt.

| Patch | Statut au 2026-08-13 |
|---|---|
| `01-pdf-direct-download.patch` | ✅ Réécrit et validé — génère un vrai PDF (dompdf) avec logo tenant et QR code de vérification, `composer.json` mis à jour. |
| `02-frontend-pdf-download.patch` | ✅ Réécrit et validé — téléchargement direct en `Blob` sur `Payrolls.tsx` et `MyPayslips.tsx`, fini `window.print()`. |
| `03-portal-payslip-api.patch` (+ `03-portal-payslip-api-frontend.patch`) | ✅ Réécrit et validé — route `/portal/payslips/{payroll}/download` isolée par employé, client `portal.ts` mis à jour. |
| `06` à `09` | ✅ Déjà valides depuis leur dépôt initial (aucune correction nécessaire). |
| `10-employee-exits-backend.patch` | ✅ Réécrit et validé — migration `termination_type`/`termination_reason`, méthodes `exits()` et `terminate()`, route `/employees/exits` positionnée avant `/employees/{employee}`. `destroy()` existant conservé pour compatibilité, avec contrôle tenant explicite ajouté. |
| `10-employee-exits-frontend.patch` | ✅ Réécrit et validé — page `EmployeeExits.tsx`, utilise le vrai endpoint `/employees/exits` (plus de contournement `status=terminated`). |
| `10-employee-terminate-page.patch` | ✅ Réécrit et validé — page `EmployeeTerminate.tsx` + route `/employees/:id/terminate`. |
| `10-employee-exits-integration.patch` (nouveau) | ✅ Ajouté — regroupe les changements transverses que le patch cassé ne portait pas correctement : `types/index.ts`, `api/employees.ts`, menu `Sidebar.tsx`, bouton « Sortir » dans `Employees.tsx` (remplace « Supprimer »). |
| `11-attendance-*.patch` (3 fichiers) | ✅ Réécrits (2026-08-13, suite) et validés en cumulé avec 02/03/10. `Attendance.tsx` migré vers TanStack Query (plus de `fetchAttendance()` manuel, invalidation de query après clock-in/out), filtre département intégré directement (le patch séparé `11-attendance-department-filter.patch` est donc supprimé, devenu redondant), stats complètes (ajout Fériés/Congés + heures sup. dans le tableau), boutons `type="button"`. `QRClock.tsx` génère le QR 100% localement avec `qrcode.react` (fin de la dépendance à `api.qrserver.com`), `package.json` mis à jour. |
| `11-attendance-double-clockin.patch` | ✅ Réécrit et validé — un second patch déposé après coup sur ce même module avait, lui aussi, des en-têtes `@@` avec des compteurs de lignes erronés (`corrupt patch at line 12`). Bug réel confirmé et corrigé : un double pointage d'entrée (`clockIn()` direct ou via `scanQR()`) renvoyait un statut 200 au lieu de 422, car `recordClockIn()` incluait la clé `attendance` aussi bien en cas de succès qu'en cas de doublon — ajout d'un flag `error` explicite désormais vérifié aux deux endroits. Correction d'une coquille de message au passage. |

### Conflit détecté et résolu entre les patchs 09 et 10 (frontend)

Les patchs `09-positions-frontend.patch` et `10-employee-exits-integration.patch`
modifiaient tous les deux, indépendamment, le même bloc d'imports
d'icônes de `Sidebar.tsx`. Les trois fichiers frontend du module 10
(`10-employee-exits-frontend.patch`, `10-employee-terminate-page.patch`,
`10-employee-exits-integration.patch`) ont été régénérés en rebasant
leur base sur l'état obtenu **après** application du patch 09 —
l'ordre d'application ci-dessous n'est donc plus seulement recommandé,
il est **requis**.

### Point métier volontairement non traité

Le calcul des heures supplémentaires (`overtime_hours`) reste calculé côté backend existant sans règle journalière arbitraire imposée (pas de « 8h fixes » inventées) — conforme à la remarque du README `attendance/11-temps-presence-10-etapes-finales.md`. Un sous-module **Heures supplémentaires** dédié reste à faire séparément, une fois la règle de calcul validée avec vous.

### Ordre d'application requis (testé cumulé, sans conflit au 2026-08-13)

Backend : `01` → `03` → `06` → `07-backend` → `08` → `09-backend` → `10-employee-exits-backend` → `11-attendance-double-clockin` → `12-overtime-backend` → `13-leaves-backend` → `15-employees-backend-tenant` → `15-dashboard-employee-payroll` → `16-admin-migrations` → `16-admin-user-controller` → `16-admin-role-controller` → `16-admin-routes-and-auth` → `17-reports-export-service` → `17-reports-controller` → `18-saas-subscription-backend` → `18-saas-seat-limit` → `19-fedapay-setup` → `19-fedapay-service` → `19-fedapay-controller-routes` → `20-downloads-cors-backend` → `20-trainings-enroll-fix`.
Frontend : `02` → `03-portal-payslip-api-frontend` → `06-frontend` → `07-frontend` → `09-frontend` → `10-employee-exits-frontend` → `10-employee-terminate-page` → `10-employee-exits-integration` → `11-attendance-frontend` → `11-attendance-qr-local` → `12-overtime-frontend-page` → `12-overtime-frontend-integration` → `13-leaves-frontend-list` → `13-leaves-frontend-create` → `13-leaves-frontend-show` → `14-dashboard-stats-frontend` → `15-employees-frontend-query-filter` → `15-employee-show-frontend-query` → `15-dashboard-frontend-query` → `15-spa-navigation-guard` → `16-admin-frontend-api` → `16-admin-frontend-users-page` → `16-admin-frontend-roles-page` → `16-admin-frontend-integration` → `17-reports-frontend` → `18-saas-subscription-frontend-page` → `18-saas-subscription-frontend-integration` → `19-fedapay-frontend-subscription-page` → `19-fedapay-frontend-callback` → `20-downloads-frontend` → `20-register-cedeao-and-password` → `20-login-password-toggle`.

## Module Corrections signalées par l'utilisateur (20) — état au dépôt du 2026-08-16

Quatre bugs remontés en conditions d'usage réel, tous confirmés et
corrigés.

### 1. Téléchargements de pièces jointes en `.txt` (site entier)

**Cause racine** : `config/cors.php` avait `'exposed_headers' => []` —
le navigateur ne pouvait jamais lire l'en-tête `Content-Disposition`
renvoyé par le serveur, même quand celui-ci contenait le bon nom de
fichier. Le nom de téléchargement retombait sur une valeur par défaut
sans extension, et le navigateur ajoutait `.txt` de lui-même.

En creusant, **6 points de téléchargement distincts** étaient
concernés, pas un seul :
- `Documents.tsx` et `MyDocuments.tsx` (portail employé) : dépendaient
  de l'en-tête CORS bloqué, avec un parsing fragile en repli.
- `EmployeeShow.tsx` (téléchargement de contrat) : extension `.pdf`
  **codée en dur**, fausse si le fichier réel était un `.docx` ou une
  image (le formulaire de contrat accepte pdf/jpg/jpeg/png/doc/docx).
- `ContractShow.tsx` et `LeaveShow.tsx` : **aucune extension du
  tout**.

| Patch | Contenu |
|---|---|
| `20-downloads-cors-backend.patch` | `config/cors.php` expose désormais `Content-Disposition`. |
| `20-downloads-frontend.patch` | Nouvel utilitaire partagé `src/utils/downloadFile.ts` (lit le vrai nom de fichier si disponible via l'en-tête, sinon utilise un nom de repli qui inclut toujours la vraie extension — déduite du chemin de stockage réel côté serveur, jamais devinée ni codée en dur). Les 5 pages concernées migrées vers cet utilitaire commun. |

### 2. Inscription aux formations inaccessible pour les employés

**Cause racine confirmée** : dans `TrainingController::enroll()`, la
validation qui exige `employee_id` s'exécutait **avant** le code qui
remplit automatiquement ce champ pour un employé s'inscrivant
lui-même. Tout employé cliquant sur « S'inscrire » recevait donc une
erreur 422 immédiate (« le champ employee_id est requis »), avant
même que la logique d'auto-remplissage ne s'exécute — d'où
l'impression d'un lien « inaccessible ».

| Patch | Contenu |
|---|---|
| `20-trainings-enroll-fix.patch` | Inversion de l'ordre : l'auto-remplissage de `employee_id` pour un compte employé s'exécute désormais avant la validation, pas après. |

**Bug apparenté trouvé mais non corrigé (hors périmètre demandé)** :
`TrainingController::complete()` exige aussi `employee_id` en
paramètre, mais le bouton frontend correspondant (`handleComplete`,
visible par les managers/RH sur `Trainings.tsx`) ne l'envoie jamais et
ne propose aucune sélection de participant — ce flux semble
structurellement incomplet. Non traité ici faute de décision produit
claire (quel participant marquer comme complété, et comment le
sélectionner dans l'UI) ; à reprendre sur demande explicite.

### 3. Page d'inscription — restriction aux pays CEDEAO

Liste des pays remplacée par les **15 pays membres actuels ou
historiques de la CEDEAO** (dont Mali, Burkina Faso, Niger — retirés
officiellement en 2025 mais réintégrés à la liste à la demande
explicite de l'utilisateur, marchés jugés toujours pertinents
commercialement), chacun avec son indicatif téléphonique réel.

**Point d'architecture clarifié avant modification** : le champ
`country` envoyé au backend n'a jamais été un vrai identifiant
géographique — c'est historiquement un **alias de la devise de
facturation**, validé côté serveur en `in:XOF,EUR,USD` uniquement (le
moteur de paiement FedaPay du module 19 ne facture qu'en XOF). Le
sélecteur « Pays » et le sélecteur « Devise de facturation » étaient
donc couplés à tort dans le code d'origine.

**Décision prise** : découplage propre plutôt que branchement
approximatif sur un mécanisme de devise qui ne le supporte pas
réellement.
- Le sélecteur « Pays » pilote désormais uniquement l'affichage et
  préremplit l'indicatif téléphonique du champ Téléphone.
- Le sélecteur « Devise de facturation » (étape 2, déjà existant,
  XOF/EUR/USD) reste seul responsable du champ `country` envoyé au
  backend — comportement de facturation inchangé et donc sans risque
  pour le moteur de paiement.
- Aucune conversion de change n'a été inventée pour les devises non
  supportées (GHS, NGN, GMD, GNF, LRD, SLL, CVE) : les organisations
  de ces pays peuvent s'inscrire et choisir leur pays réel, mais sont
  facturées en XOF (ou EUR/USD) comme aujourd'hui, faute de moteur de
  change fiable en place.

| Patch | Contenu |
|---|---|
| `20-register-cedeao-and-password.patch` | Liste `COUNTRIES` remplacée par les 15 pays CEDEAO (nom, devise informative, indicatif téléphonique). Sélecteur Pays découplé de la devise de facturation. Placeholder du champ téléphone dynamique selon le pays choisi, préremplissage de l'indicatif si le champ est vide. Contient aussi le correctif du point 4 (voir ci-dessous) pour `Register.tsx`. |

### 4. Icône œil sur les champs mot de passe (connexion + inscription)

Nouveau composant réutilisable `PasswordInput.tsx` (bascule
afficher/masquer, compatible `react-hook-form` via `{...register()}`
comme un `<input>` classique). Appliqué à `Login.tsx` et aux deux
champs mot de passe de `Register.tsx`, conformément à la demande.

**Autres emplacements avec un champ mot de passe repérés mais non
modifiés** (hors périmètre explicitement demandé — « page inscription
ou page de connexion ») : `ResetPassword.tsx`, `Profile.tsx`,
formulaire de création directe d'utilisateur dans `admin/Users.tsx`.
Le composant `PasswordInput` est prêt à y être réutilisé sur simple
demande.

| Patch | Contenu |
|---|---|
| `20-login-password-toggle.patch` | Nouveau `PasswordInput.tsx`, appliqué à `Login.tsx`. |

### Validation

- **24/24 patchs backend** (01 → 20) appliqués en cumulé réel.
- **31/31 patchs frontend** (02 → 20) appliqués en cumulé réel.
- **`tsc -b --force` : 0 erreur. `oxlint` : 0 erreur** (avertissements
  restants tous préexistants, sans rapport avec ce module).

## Module Paiement FedaPay (19) — état au dépôt du 2026-08-16

Premier prestataire de paiement intégré parmi ceux listés dans
`config/sds_rh.php` (`fedapay`, `kkiapay`, `card`, `paypal`,
`transfer`). Choix de l'utilisateur : FedaPay en premier. Compte
marchand pas encore créé au moment du développement — l'intégration
a donc été construite à partir de la **documentation officielle
vérifiée** (`docs.fedapay.com`), pas testée avec de vraies clés.

### Pattern retenu : redirection (Feda Checkout hébergé)

Conforme à la recommandation officielle FedaPay (« nous recommandons
de préférer le mode redirection [...] afin de bénéficier de tous les
moyens de paiement »). Flux : `Transaction::create()` →
`generateToken()` → redirection du navigateur vers `token->url`,
page de paiement hébergée par FedaPay elle-même. Aucune donnée de
carte ou de mobile money ne transite jamais par nos serveurs.

### Contenu des patchs

| Patch | Contenu |
|---|---|
| `19-fedapay-setup.patch` | SDK `fedapay/fedapay-php` ajouté à `composer.json`. Config `services.fedapay` (clé secrète, clé publique, environnement, secret webhook — tout lu depuis `.env`, jamais codé en dur). `.env.example` documenté. Migration `payments` (traçabilité de chaque tentative : statut, montant, transaction FedaPay, payload brut reçu). Modèle `Payment`. |
| `19-fedapay-service.patch` | `FedaPayService` : `createCheckout()` (calcule le montant depuis `config('sds_rh.plans')`, crée la transaction FedaPay, génère le lien de paiement, trace la tentative), `verifyWebhookSignature()` (utilise `\FedaPay\Webhook::constructEvent()`, la vérification officielle du SDK — jamais de vérification de signature « maison »), `handleEvent()` (idempotent : un même événement rejoué par FedaPay ne prolonge jamais deux fois l'abonnement), `markApproved()` (prolonge `subscription_expires_at`, crée un enregistrement `Subscription`, réactive le tenant si besoin). |
| `19-fedapay-controller-routes.patch` | `PaymentController::checkout()` (authentifié, `permission:view_settings`, refuse les forfaits gratuit/entreprise). `PaymentController::webhook()` — **route publique**, hors `auth:sanctum` et hors middleware tenant (FedaPay n'a aucune session utilisateur), sécurité entièrement assurée par la vérification de signature SDK. Répond toujours `200` même en cas d'erreur de traitement interne pour éviter une boucle de nouvelles tentatives FedaPay, l'erreur étant tout de même journalisée (`report()`). |
| `19-fedapay-frontend-subscription-page.patch` | Page `Subscription.tsx` complétée : 3 forfaits payants affichés avec leur tarif exact (`config/sds_rh.php`), bouton redirigeant vers la page de paiement FedaPay hébergée. |
| `19-fedapay-frontend-callback.patch` | Nouvelle page `SubscriptionCallback.tsx` (`/subscription/callback`, URL de retour FedaPay) : sondage court (jusqu'à 10 tentatives, 3 s d'intervalle) de `GET /subscription` pour détecter la confirmation avant que le webhook n'ait fini d'être traité côté serveur. |

### ⚠️ Points à vérifier obligatoirement avec de vraies clés Sandbox avant mise en production

1. **Format exact du payload webhook** : la documentation FedaPay ne détaille pas explicitement le nom du champ contenant l'identifiant de transaction dans l'objet `$event`. `FedaPayService::handleEvent()` essaie plusieurs chemins probables (`$event->object->id`, `$event->entity->id`, `$event->data->id`) et **journalise le payload brut dans tous les cas** (`Log::warning` + colonne `raw_payload`) pour permettre l'ajustement dès le premier vrai webhook reçu en Sandbox.
2. **Numéro de téléphone du client** : `createCheckout()` suppose un indicatif pays `'bj'` (Bénin) par défaut — à adapter si vos organisations clientes sont dans d'autres pays UEMOA.
3. **`FRONTEND_URL`** doit être une URL **publique et joignable par FedaPay** en production (pas `localhost`) pour que la redirection de callback fonctionne — sans lien avec le webhook lui-même, qui nécessite en plus une URL backend HTTPS publique déclarée manuellement dans le tableau de bord FedaPay (Workbench → Webhooks), étape non automatisable et à faire une fois le backend déployé.
4. Aucune option **annuelle avec remise** n'existe dans `config/sds_rh.php` (seul `price_xof_monthly` est défini) — le cycle « yearly » actuel se contente de multiplier par 12 sans remise. À ajuster si une politique de remise annuelle est souhaitée.

### Explicitement non couvert par ce module

Kkiapay, carte bancaire directe (hors FedaPay), PayPal, virement manuel — à intégrer séparément, un prestataire à la fois, selon la même méthode (vérification documentation officielle avant tout code).

## Module Préparation SaaS — limite de sièges + espace client (18) — état au dépôt du 2026-08-15

Portée validée avec l'utilisateur : correction de la limite
d'employés par plan (bug réel) + espace client self-service en
lecture seule, **sans intégration de paiement** (choix explicite,
à traiter séparément une fois le prestataire de paiement choisi).

### Bug réel confirmé

`Subscription.features.employee_limit_max` était calculé et stocké
à l'inscription (`AuthController::register()`) mais **jamais
vérifié** ensuite : un tenant au forfait « gratuit » (5 employés
max) pouvait en créer un nombre illimité. Aucune limite n'était
appliquée nulle part dans le code.

### Contenu des patchs

| Patch | Contenu |
|---|---|
| `18-saas-subscription-backend.patch` | `Tenant::seatLimit()` (lit `current_subscription.features.employee_limit_max`, avec repli sur `config('sds_rh.plans')` par nom de plan) et `Tenant::occupiedSeats()` (employés actifs/en congé/suspendus — un employé définitivement sorti libère son siège). Nouveau `SubscriptionController::show()` : vue self-service complète (plan, statut, échéance, usage, jours restants, indicateur période d'essai). Route `GET /subscription`. |
| `18-saas-seat-limit.patch` | `EmployeeController::store()` refuse désormais la création (`422`, message explicite) si le tenant a atteint la limite de son forfait. |
| `18-saas-subscription-frontend-page.patch` | Nouvelle page `Subscription.tsx` : alertes si limite atteinte ou expiration proche (≤ 7 jours), barre d'usage des sièges, détail complet de la souscription. Type `SubscriptionInfo` ajouté. |
| `18-saas-subscription-frontend-integration.patch` | Entrée de menu « Mon abonnement » (section Système), route `/subscription`. |

### Validation

- **20/20 patchs backend** (01 → 18) appliqués en cumulé réel.
- **26/26 patchs frontend** (02 → 18) appliqués en cumulé réel.
- **`tsc -b --force` : 0 erreur. `oxlint` : 0 erreur.**

### Explicitement hors périmètre (décision utilisateur)

Aucune intégration de paiement (FedaPay, Kkiapay, carte, PayPal,
virement — tous déjà listés dans `config/sds_rh.php` mais non
implémentés). Aucun flux de changement de forfait en libre-service
(upgrade/downgrade). À reprendre une fois le prestataire de paiement
confirmé.

## Module Rapports / Exports (17) — état au dépôt du 2026-08-15

Anomalie confirmée : les 4 rapports (Employés, Présences, Paie,
Congés) acceptaient un paramètre `format=pdf|excel` mais le
renvoyaient toujours en JSON brut, quel que soit le format demandé.
Côté frontend, un contournement fragile compensait (fenêtre
`window.print()` limitée à 4 colonnes pour le « PDF », CSV maison
sans le résumé pour l'« Excel »).

**Bug additionnel découvert et corrigé au passage** : le rapport Paie
envoyait `start_date`/`end_date` alors que le backend exige
`month` (`required|date_format:Y-m`) — toute tentative de génération
du rapport Paie échouait donc systématiquement avec une erreur 422,
invisible dans l'aperçu JSON puisque jamais testée jusqu'ici.

| Patch | Contenu |
|---|---|
| `17-reports-export-service.patch` | Nouveau `ReportExportService` : PDF réel (dompdf, paysage A4, résumé + tableau détaillé) et Excel réel (`phpoffice/phpspreadsheet`, feuille Résumé + feuille Détail avec en-têtes figés). `composer.json` mis à jour. Vue `resources/views/pdf/report.blade.php` générique et réutilisable pour les 4 rapports. |
| `17-reports-controller.patch` | `ReportController` : les 4 méthodes construisent désormais un résumé et un tableau détaillé formatés (libellés français, montants FCFA) et déclenchent un vrai téléchargement quand `format=pdf` ou `format=excel` ; comportement JSON par défaut conservé (rétrocompatibilité) si aucun format n'est fourni. |
| `17-reports-frontend.patch` | `Reports.tsx` : téléchargement direct en `Blob` du vrai fichier généré côté serveur (fini `window.print()` et le CSV maison). Le rapport Paie utilise désormais un sélecteur de mois au lieu d'une plage de dates, corrigeant le bug de paramètre ci-dessus. |

### Validation

- **18/18 patchs backend** (01 → 17) appliqués en cumulé réel.
- **25/25 patchs frontend** (02 → 17) appliqués en cumulé réel.
- **`tsc -b --force` : 0 erreur. `oxlint` : 0 erreur.**

⚠️ `16-admin-migrations.patch` doit être appliqué avant `16-admin-user-controller.patch`/`16-admin-role-controller.patch` (colonnes `tenant_id`, `invited_at`, `last_login_at` requises). Après application, exécuter `php artisan migrate` avant tout test.

## Module Administration Utilisateurs / Rôles / Permissions (16) — état au dépôt du 2026-08-15

Nouveau module, absent du cahier des charges initial sous cette
forme précise mais couvrant l'anomalie P2 « Administration
Utilisateurs / Rôles / Permissions » de l'ordre de travail retenu.
Portée validée avec l'utilisateur : création directe **et**
invitation par e-mail, rôles personnalisables à la carte.

### Découverte critique avant construction

La table `roles` (Spatie Permission) est **globale à toute
l'installation**, sans `tenant_id`. Construire des rôles
personnalisés dessus sans correction aurait exposé un risque réel de
fuite entre organisations (deux tenants ne pouvant même pas nommer un
rôle personnalisé de la même façon, et rien n'empêchant
techniquement qu'un rôle créé par un tenant soit visible/assignable
par un autre). Corrigé par migration avant toute autre modification.

### Contenu des patchs

| Patch | Contenu |
|---|---|
| `16-admin-migrations.patch` | `roles.tenant_id` nullable (`null` = rôle système partagé en lecture seule, valeur = rôle personnalisé scopé au tenant), contrainte d'unicité ajustée (`tenant_id`+`name`+`guard_name`). `users.invited_at`/`users.last_login_at` nullable. |
| `16-admin-user-controller.patch` | `UserController` : liste (recherche, filtre rôle/statut, exclusion des comptes `super_admin` de la vue tenant), création directe (mot de passe posé par l'admin), **invitation** (réutilise `Password::sendResetLink()` — le mécanisme standard « mot de passe oublié » de Laravel, aucune nouvelle table ni notification à maintenir), modification (rôle/statut), désactivation logique (`destroy()` ne supprime jamais physiquement), renvoi d'invitation. Protections : impossible de se désactiver soi-même, impossible de retirer le rôle `admin_org` au dernier administrateur actif du tenant. |
| `16-admin-role-controller.patch` | `RoleController` : liste (rôles système + personnalisés du tenant courant, avec compteur d'utilisateurs), création/modification/suppression de rôles personnalisés uniquement (rôles système protégés par `assertCustomRole()`), suppression bloquée si le rôle est encore attribué à des utilisateurs, endpoint permissions groupées par domaine pour l'éditeur de permissions du frontend. |
| `16-admin-routes-and-auth.patch` | Routes `/users`, `/users/invite`, `/users/{user}/resend-invitation`, `/roles`, `/permissions` (nouvelles permissions `view_users`/`create_users`/`edit_users`/`delete_users`/`view_roles`/`create_roles`/`edit_roles`/`delete_roles` ajoutées au seeder). `AuthController::login()` met à jour `last_login_at`. |
| `16-admin-frontend-api.patch` | Types `Role`, `PermissionGroup`, `AdminUser` + client `src/api/administration.ts`. |
| `16-admin-frontend-users-page.patch` | Page `Users.tsx` : liste avec recherche, formulaire à bascule Invitation/Création directe, changement de rôle en ligne, désactivation/réactivation, renvoi d'invitation, badge « Invité, non activé ». |
| `16-admin-frontend-roles-page.patch` | Page `Roles.tsx` : cartes rôles système (verrouillées) + personnalisés, éditeur de permissions groupées par domaine avec sélection de groupe entier en un clic, suppression protégée. |
| `16-admin-frontend-integration.patch` | Entrées de menu « Utilisateurs » et « Rôles & permissions » (section Système), routes `/users` et `/roles`. |

### Validation

- **24/24 patchs frontend** (02 → 16) appliqués en cumulé réel.
- **16/16 patchs backend** (01 → 16) appliqués en cumulé réel.
- **`tsc -b --force` sur le frontend complet : 0 erreur** — une
  erreur réelle trouvée et corrigée en cours de route (import
  `ArrowPathIcon` inutilisé dans `Users.tsx`).
- **`oxlint` : 0 erreur**, 1 avertissement préexistant dans
  `AdminDashboard.tsx` (fichier non modifié par ce module).

### Point d'attention pour l'intégration

L'envoi réel des e-mails d'invitation dépend de la configuration
`MAIL_MAILER` de l'environnement cible. Avec la valeur par défaut du
`.env.example` (`log`), les invitations sont écrites dans les logs
Laravel au lieu d'être réellement envoyées — comportement normal en
développement, à changer (`smtp`, `ses`, etc.) avant mise en
production.

⚠️ Pour le frontend, l'ordre entre `09-frontend` et les trois patchs `10-employee-exits-*` est obligatoire (pas seulement recommandé) : ils modifient le même bloc de `Sidebar.tsx` et ont été rebasés les uns sur les autres dans cet ordre précis.

## Module Dashboard complet (14) — état au dépôt du 2026-08-13

L'API `/dashboard` calcule déjà 9 indicateurs mais `StatsCards.tsx`
n'en affichait que 6 — `absent_today`, `new_hires` et
`contracts_expiring` étaient calculés côté backend puis ignorés côté
UI, exactement comme relevé dans l'anomalie n°5 de l'audit initial.

| Patch | Contenu |
|---|---|
| `14-dashboard-stats-frontend.patch` | Ajout des 3 cartes manquantes : Absents aujourd'hui, Nouvelles embauches (30j), Contrats à échéance (30j). Grille repassée de `xl:grid-cols-6` (6 cartes) à `lg:grid-cols-3` (9 cartes, 3×3 équilibré). Aucune modification backend nécessaire : les champs existaient déjà dans la réponse API et dans le type `DashboardStats` du frontend. |

Testé en application cumulée réelle avec l'intégralité de la chaîne
02 → 14 frontend, sans aucun conflit.

## Module Congés / Absences (13) — état au dépôt du 2026-08-13

Les fichiers `leaves/13-absences-conges-audit.md` et
`leaves/13-corrections-prioritaires.md` étaient des audits texte
(pas de code cassé cette fois), très bien ciblés. Convertis en 4
patchs `.patch` réels :

| Patch | Contenu |
|---|---|
| `13-leaves-backend.patch` | Isolation tenant explicite sur `index`, `approve`, `reject` (`assertEmployeeAccess()` déjà appelée par `show`/`update`/`destroy` étendue avec le contrôle tenant). Pièce jointe réellement stockée dans `store()` (stockage privé `leaves/{tenant}/{employee}`) avec contrainte de type MIME. Nouvelle méthode `downloadAttachment()` + route `GET /leaves/{leave}/attachment`. Suppression d'une route `GET /leaves/{leave}` déclarée deux fois dans `routes/api.php`. |
| `13-leaves-frontend-list.patch` | `Leaves.tsx` migré vers TanStack Query, pagination Laravel enfin branchée (elle était intégralement commentée), bouton Voir désormais navigable (`onClick` manquant), boutons `type="button"`, `invalidateQueries` après approbation/rejet au lieu de rappeler `fetchLeaves()`. |
| `13-leaves-frontend-create.patch` | **Bug critique corrigé** : `onSubmit()` remplaçait systématiquement `employee_id` par celui du compte connecté, même quand un RH/manager avait sélectionné un autre employé dans le formulaire — une demande pouvait donc être soumise pour la mauvaise personne. Un employé standard utilise désormais son propre dossier (comme avant), un RH/manager autorisé utilise l'employé qu'il a réellement sélectionné. Ajout du champ pièce jointe (`multipart/form-data`). L'estimation locale de jours (`Math.abs`) reste affichée mais explicitement labellisée comme estimation — le serveur reste seul juge du nombre de jours final. |
| `13-leaves-frontend-show.patch` | Nouvelle page `LeaveShow.tsx` (détail, motif de rejet, téléchargement de pièce jointe en `Blob`, actions Approuver/Rejeter), route `/leaves/:id`. |

Aucune règle de solde n'a été modifiée (24 jours annuels / 10 jours
maladie par défaut conservés tels quels, conformément à la consigne
de prudence des deux audits) et aucune fonctionnalité d'annulation
n'a été ajoutée (règle métier non spécifiée par le cahier des
charges à ce stade).

Testé en application cumulée réelle avec l'intégralité de la chaîne
01 → 13, backend et frontend, sans aucun conflit.

## Module Heures supplémentaires (12) — état au dépôt du 2026-08-13

Les spécifications `overtime/12-backend-overtime.patch.md` et
`overtime/12-frontend-page.md` déposées précédemment étaient déjà du
code PHP/TSX complet et correct dans un bloc markdown (contrairement
aux modules 01/02/03/10/11, ce n'était pas un format de patch cassé,
juste pas encore converti en `.patch` réel). Elles ont été converties
telles quelles en patchs `git diff` fonctionnels, sans changement de
logique :

| Patch | Contenu |
|---|---|
| `12-overtime-backend.patch` | Route `GET /overtime` (racine, hors préfixe `/attendances`), méthode `AttendanceController::overtime()` : filtres mois/date/employé/département, isolation tenant, `restrictToCurrentEmployee()`, agrégats (total, employés, jours), regroupement par employé, pagination max 100. Aucun seuil d'heures supplémentaires n'est inventé — seul `overtime_hours` déjà enregistré est exploité. |
| `12-overtime-frontend-page.patch` | Nouvelle page `Overtime.tsx` (TanStack Query), filtres Mois/Du/Au/Département, regroupement par employé cliquable, tableau détaillé, pagination sans reload, message d'accès refusé si `view_attendance` absent. |
| `12-overtime-frontend-integration.patch` | Route `/overtime` dans `AppRoutes.tsx`, entrée de menu « Heures supplémentaires ». **Bug corrigé au passage** : le menu « Présences » utilisait la permission `view_employees` au lieu de `view_attendance` — un utilisateur avec accès aux présences mais pas à la fiche employé n'aurait pas vu le menu, et inversement. Corrigé pour correspondre à la permission réellement vérifiée par l'API. |

Testé en application cumulée réelle avec l'intégralité de la chaîne
01 → 12, backend et frontend, sans aucun conflit.

