# P1 — Dashboard : correspondance des rôles et périmètres

## Source

- Dépôt : `romaina229/SDS-RH_backend`
- Fichier : `app/Http/Controllers/Api/DashboardController.php`
- Commit de correction préparé puis annulé sur le dépôt source : `ef42b2387a437fa3f5de7c96066c491c34cbfbca`
- Parent/restauration du dépôt source : `d180d79c3afd1d945a2f6d14da6fe4a4c8bea27b`

## Règle fonctionnelle validée

| Rôle | Périmètre Dashboard |
|---|---|
| `super_admin` | Vision globale de la plateforme sans tenant sélectionné ; organisation sélectionnée avec `X-Tenant-Id` |
| `admin_org` | Dashboard complet de son organisation |
| `manager` | Dashboard limité à son département de responsabilité |
| `employee` | Dashboard strictement personnel |

## Correctif à intégrer dans DashboardController

La méthode `index()` doit router vers quatre comportements :

```php
if ($user->hasRole('employee')) {
    return $this->employeeDashboard($user->employee);
}

if ($user->hasRole('super_admin') && ! app()->has('tenant')) {
    return $this->organizationDashboard($today);
}

if ($user->hasRole('manager')) {
    return $this->managerDashboard($user->employee, $today);
}

return $this->organizationDashboard($today);
```

### Employé

Créer `employeeDashboard(?Employee $employee)` avec contrôle d'absence de fiche employé et uniquement les requêtes concernant cet employé : présence du jour, congés en attente, contrat actif, recrutement récent, expiration de contrat et activités personnelles.

### Manager

Créer `managerDashboard(?Employee $manager, string $today)`.

Le département de responsabilité est `department_id` du compte manager. Toutes les statistiques doivent être calculées avec les employés de ce département : effectif actif, contrats, présence, absence, congés, recrutements récents, contrats arrivant à échéance et paie du mois. Les activités récentes, la répartition des départements et la tendance des recrutements doivent également être filtrées sur ce département.

Si le manager n'a pas de fiche employé ou de `department_id`, retourner HTTP 422 avec :

`Aucun périmètre de responsabilité n’est associé à ce manager.`

### Organisation

Déplacer la logique actuelle du Dashboard organisationnel dans `organizationDashboard(string $today)` afin qu'elle soit réutilisable par `admin_org` et par le `super_admin` lorsqu'un tenant est sélectionné.

## Isolation tenant

Ne pas ajouter de `where('tenant_id', ...)` redondant dans chaque requête : les modèles concernés utilisent déjà le Global Scope `BelongsToTenant`. Le Super Admin sans tenant sélectionné reste le seul cas de vision globale.

## Validation obligatoire avant intégration

Tester `/api/dashboard` avec quatre profils :

1. `super_admin` sans `X-Tenant-Id` → données globales ;
2. `super_admin` avec `X-Tenant-Id` → données de l'organisation sélectionnée ;
3. `admin_org` → uniquement son organisation ;
4. `manager` → uniquement son département ;
5. `employee` → uniquement ses propres données.

Aucune donnée d'une autre organisation ou d'un autre périmètre ne doit apparaître.

## État du dépôt source

Le commit `ef42b2387a437fa3f5de7c96066c491c34cbfbca` a été annulé en remettant la branche `fix/dashboard-role-scope` sur son parent `d180d79c3afd1d945a2f6d14da6fe4a4c8bea27b`. Aucun commit de cette correction n'a été ajouté à `main` du dépôt source.
