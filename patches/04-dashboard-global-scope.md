# P1 — Dashboard : Global Scope `BelongsToTenant` et Super Admin global

## Audit

Le trait `BelongsToTenant` applique le Global Scope `tenant` uniquement lorsque `app()->has('tenant')` :

```php
if (app()->has('tenant')) {
    $builder->where($builder->getModel()->getTable() . '.tenant_id', app('tenant')->id);
}
```

Donc, si aucun tenant n'est installé, le Scope n'ajoute pas de filtre. Le trait fournit également `scopeWithoutTenantScope()`.

## Conclusion

Il n'est pas nécessaire de modifier `BelongsToTenant` pour obtenir la vision globale du Super Admin. Le comportement actuel permet déjà aux requêtes Eloquent de fonctionner sans filtre tenant lorsque le contexte `tenant` est absent.

En revanche, cette situation doit être rendue volontaire et explicite dans le Dashboard :

- seul le Super Admin peut arriver au Dashboard sans tenant ;
- les utilisateurs ordinaires doivent toujours passer par un tenant valide ;
- le Dashboard global doit être une méthode distincte afin de rendre visible l'absence volontaire de filtrage.

## Attention aux relations

Les relations Eloquent de modèles tenantisés peuvent également recevoir leur Global Scope. Le Dashboard global doit donc vérifier ses agrégations et ses `withCount()`/relations pour s'assurer qu'elles ne réintroduisent pas implicitement un filtre tenant.

Pour les requêtes explicitement globales, utiliser `withoutTenantScope()` sur les modèles concernés plutôt que modifier le trait globalement.

Exemple :

```php
Employee::withoutTenantScope()->where('status', 'active')->count();
```

et pour les départements :

```php
Department::withoutTenantScope()->withCount([
    'employees' => function ($query) {
        $query->withoutTenantScope()->where('status', 'active');
    },
])->get();
```

Les requêtes du Dashboard organisationnel ne doivent PAS utiliser `withoutTenantScope()`.

## Sécurité

Ne jamais modifier le Global Scope pour supprimer le filtrage tenant pour tous les utilisateurs. La distinction doit rester au niveau du contexte du Super Admin global et de la méthode dédiée du Dashboard.

## Validation

Après implémentation, vérifier que :

- Super Admin global compte les données de toutes les organisations ;
- Super Admin avec tenant compte uniquement le tenant sélectionné ;
- Admin/RH reste limité à son tenant ;
- Manager reste limité à son département dans son tenant ;
- Employé reste limité à ses propres données.

Aucun changement de `BelongsToTenant.php` n'est requis à ce stade.
