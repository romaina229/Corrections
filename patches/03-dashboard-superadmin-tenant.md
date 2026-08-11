# P1 — Dashboard : Super Admin global vs tenant sélectionné

## Problème confirmé

`/api/dashboard` est actuellement placé derrière le middleware `tenant`. Ce middleware exige toujours un tenant et installe toujours `app('tenant')`. Par conséquent, le `DashboardController` ne peut jamais recevoir un Super Admin sans tenant sélectionné, alors que la règle fonctionnelle validée exige une vision globale dans ce cas.

## Règle fonctionnelle

- `super_admin` sans `X-Tenant-Id` : vision globale de la plateforme.
- `super_admin` avec `X-Tenant-Id` : vision de l'organisation sélectionnée.
- `admin_org` : vision complète de son organisation.
- `manager` : vision limitée à son département.
- `employee` : vision personnelle.

## Correction recommandée

Le middleware `tenant` doit autoriser uniquement le cas suivant sans installer de tenant :

- utilisateur authentifié ;
- rôle `super_admin` ;
- route explicitement autorisée au mode global (`/dashboard` dans cette phase) ;
- absence de `X-Tenant-Id`.

Pour toutes les autres routes, le comportement actuel doit rester inchangé : un tenant valide est obligatoire.

Lorsque `X-Tenant-Id` est fourni au Super Admin, le middleware continue à charger et valider ce tenant et à l'installer dans le contexte de requête.

## Point critique sur les Global Scopes

En mode global Super Admin, aucun tenant ne doit être installé. Les modèles utilisant `BelongsToTenant` doivent donc permettre au Super Admin global de voir toutes les organisations. Il faut vérifier le comportement exact du Global Scope avant intégration et éviter tout contournement global qui pourrait affecter les utilisateurs ordinaires.

La solution doit être explicitement limitée au contexte du Super Admin global et ne doit pas supprimer l'isolation tenant pour `admin_org`, `manager` ou `employee`.

## DashboardController

Le `DashboardController` peut alors conserver la distinction :

```php
if ($user->hasRole('employee')) {
    return $this->employeeDashboard($user->employee);
}

if ($user->hasRole('super_admin') && ! app()->has('tenant')) {
    return $this->globalSuperAdminDashboard($today);
}

if ($user->hasRole('manager')) {
    return $this->managerDashboard($user->employee, $today);
}

return $this->organizationDashboard($today);
```

Il est préférable de distinguer explicitement `globalSuperAdminDashboard()` de `organizationDashboard()` : les statistiques globales doivent agréger les données multi-tenant, alors que `organizationDashboard()` doit rester soumis au tenant courant.

## Validation obligatoire

Tester au minimum :

1. Super Admin sans `X-Tenant-Id` → toutes les organisations ;
2. Super Admin avec `X-Tenant-Id=A` → uniquement A ;
3. Super Admin avec `X-Tenant-Id=B` → uniquement B ;
4. Admin A → uniquement A ;
5. Manager A département X → uniquement X ;
6. Employé A → uniquement ses données ;
7. Admin A avec `X-Tenant-Id=B` → refusé ;
8. Manager A avec `X-Tenant-Id=B` → refusé ;
9. Employé A avec `X-Tenant-Id=B` → refusé.

Aucun changement ne doit être envoyé dans `SDS-RH_backend` ou `SDS-RH_frontend` tant que cette correction n'est pas validée dans le dépôt `Corrections`.
