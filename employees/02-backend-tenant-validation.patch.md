# Employés — correction backend tenant

Source vérifiée : `SDS-RH_backend/main/app/Http/Controllers/Api/EmployeeController.php`.

## Correction obligatoire dans `store()`

Remplacer :

```php
'department_id' => 'nullable|exists:departments,id',
'position_id' => 'nullable|exists:positions,id',
```

par :

```php
'department_id' => [
    'nullable',
    Rule::exists('departments', 'id')
        ->where(fn ($q) => $q->where('tenant_id', app('tenant')->id)),
],
'position_id' => [
    'nullable',
    Rule::exists('positions', 'id')
        ->where(fn ($q) => $q->where('tenant_id', app('tenant')->id)),
],
```

Cela aligne la création sur la validation déjà utilisée dans `update()` et empêche qu'un utilisateur d'une organisation référence un département ou un poste d'une autre organisation.

## Correction de l'intitulé de l'action

`destroy()` ne supprime pas réellement l'employé : il désactive l'utilisateur, passe l'employé à `terminated`, termine les contrats actifs et ajoute un événement d'historique.

L'interface doit donc présenter cette action comme **Terminer l'employé**, avec une confirmation explicite, et non comme une suppression destructive.

## Point à traiter ensuite

`generateEmployeeNumber()` utilise `count() + 1`. Ce mécanisme doit être remplacé par une génération robuste contre les créations concurrentes avant validation finale du module Employés.
