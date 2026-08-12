# Patch 08 — Historique Employé

## Source audit

Le backend possède déjà `EmployeeHistoryController` et `EmployeeHistoryService`, ainsi que les routes :

- `GET /employees/{employee}/history`
- `POST /employees/{employee}/history`
- `DELETE /employee-history/{employeeHistory}`
- `GET /portal/history`

La chronologie est déjà triée par `effective_date` puis `id`, avec chargement des départements, postes et initiateur.

## Corrections

### 1. Isolation tenant sur l'historique

Avant toute lecture, création ou suppression, vérifier que l'employé et l'événement appartiennent au tenant courant.

Pour l'employé :

```php
abort_unless(
    (int) $employee->tenant_id === (int) app('tenant')->id,
    404
);
```

Pour une suppression :

```php
abort_unless(
    (int) $employeeHistory->tenant_id === (int) app('tenant')->id,
    404
);
```

Le route-model binding ne doit pas être considéré comme une protection tenant suffisante.

### 2. Historique automatique

Les événements suivants doivent rester journalisés par `EmployeeHistoryService` :

- embauche ;
- changement de département ;
- changement de poste ;
- changement de salaire ;
- création/modification importante d'un contrat ;
- fin de contrat ;
- réintégration.

Éviter les doublons lorsque le même événement est déclenché par une seule opération métier.

### 3. Événement manuel

`EmployeeHistoryController@store` conserve les types existants :

`hire`, `promotion`, `transfer`, `salary_change`, `title_change`, `contract_change`, `suspension`, `warning`, `commendation`, `termination`, `reinstatement`, `other`.

Les `department_id` et `position_id` doivent toujours être validés avec le `tenant_id` courant, comme dans la validation existante.

### 4. Suppression sécurisée

La suppression d'un événement doit être réservée à la permission `edit_employees` et limitée au tenant courant. Les événements automatiques critiques peuvent être rendus non supprimables si la politique de traçabilité du cahier des charges l'exige.

### 5. Frontend — fiche Employé

Dans `src/pages/employees/EmployeeShow.tsx` :
- charger `/employees/{id}/history` lors de l'ouverture de la fiche ;
- afficher les événements du plus récent au plus ancien ;
- afficher date effective, type, titre, description, ancien/nouveau département, ancien/nouveau poste et salaire si disponibles ;
- après ajout ou suppression d'un événement, mettre à jour la liste locale ou effectuer un refetch ciblé ;
- ne jamais recharger toute la page.

### 6. Portail Employé

Le portail doit continuer à utiliser `/portal/history` pour l'employé connecté. Il ne doit jamais accepter un `employee_id` fourni par le navigateur pour choisir un autre dossier.

## Critères de validation

- La chronologie d'un employé est complète et stable.
- Aucun événement d'un autre tenant n'est visible.
- Un employé ne peut consulter que son propre historique.
- Les changements de poste/département/salaire/contrat produisent une trace cohérente.
- Les actions de la fiche employé restent SPA : aucune navigation complète ni `window.location.reload()`.
