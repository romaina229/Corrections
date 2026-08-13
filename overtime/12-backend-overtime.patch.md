# Backend patch - GET /api/overtime

## routes/api.php
Ajouter la route AVANT toute route dynamique `/attendances/{employee}` si elle est placee sous le prefix attendances, ou utiliser le prefix racine `overtime` comme ci-dessous :

```php
Route::middleware('permission:view_attendance')->get('/overtime', [AttendanceController::class, 'overtime']);
```

## AttendanceController.php
Ajouter une methode `overtime(Request $request)` qui :

1. valide `month` (`Y-m`), `date_from`, `date_to`, `employee_id`, `department_id` et `per_page` ;
2. part de `Attendance::query()->where('tenant_id', app('tenant')->id)` ;
3. applique `restrictToCurrentEmployee($query)` ;
4. filtre `overtime_hours > 0` ;
5. applique les filtres de dates ;
6. pour `department_id`, filtre via `whereHas('employee', fn ($q) => $q->where('department_id', ...))` ;
7. pour `employee_id`, applique le filtre seulement apres le controle d'acces employe ;
8. retourne les lignes avec `employee.user` et une pagination ;
9. retourne aussi `total_overtime_hours` et un agregat par employe.

Exemple de structure de reponse :

```json
{
  "data": [],
  "meta": {},
  "summary": {
    "total_hours": 0,
    "employees": 0,
    "days": 0
  },
  "by_employee": []
}
```

## Important
Ne pas calculer automatiquement les heures supplementaires dans cette methode. Elle doit lire `overtime_hours` existant. La regle de calcul sera introduite apres configuration de la duree normale de travail par organisation.
