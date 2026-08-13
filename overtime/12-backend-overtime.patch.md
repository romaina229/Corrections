# Etape 12 — Patch backend Heures supplémentaires

Cible : `romaina229/SDS-RH_backend` — branche `main`.

## 1. `routes/api.php`

Dans le groupe `tenant`, ajouter la route suivante avec les autres routes de présence :

```diff
@@
         Route::middleware('permission:view_attendance')->prefix('attendances')->group(function () {
             Route::get('/', [AttendanceController::class, 'index']);
@@
             Route::post('/scan/{qrCode}', [AttendanceController::class, 'scanQR']);
         });
+
+        Route::middleware('permission:view_attendance')->get('/overtime', [AttendanceController::class, 'overtime']);
```

La route est volontairement à la racine `/overtime` et non dans le préfixe `/attendances`.

## 2. `app/Http/Controllers/Api/AttendanceController.php`

Ajouter cette méthode dans `AttendanceController` :

```php
public function overtime(Request $request)
{
    $data = $request->validate([
        'month' => ['nullable', 'date_format:Y-m'],
        'date_from' => ['nullable', 'date'],
        'date_to' => ['nullable', 'date', 'after_or_equal:date_from'],
        'employee_id' => [
            'nullable',
            Rule::exists('employees', 'id')->where(
                fn ($q) => $q->where('tenant_id', app('tenant')->id)
            ),
        ],
        'department_id' => [
            'nullable',
            Rule::exists('departments', 'id')->where(
                fn ($q) => $q->where('tenant_id', app('tenant')->id)
            ),
        ],
        'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
    ]);

    $query = Attendance::query()
        ->with(['employee.user', 'employee.department'])
        ->where('tenant_id', app('tenant')->id)
        ->where('overtime_hours', '>', 0);

    $this->restrictToCurrentEmployee($query);

    if (! empty($data['month'])) {
        $month = Carbon::createFromFormat('Y-m', $data['month']);
        $query->whereBetween('date', [
            $month->copy()->startOfMonth(),
            $month->copy()->endOfMonth(),
        ]);
    }

    if (! empty($data['date_from'])) {
        $query->whereDate('date', '>=', $data['date_from']);
    }

    if (! empty($data['date_to'])) {
        $query->whereDate('date', '<=', $data['date_to']);
    }

    if (! empty($data['department_id'])) {
        $query->whereHas('employee', function ($q) use ($data) {
            $q->where('department_id', $data['department_id']);
        });
    }

    if (! empty($data['employee_id'])) {
        // restrictToCurrentEmployee() a déjà appliqué la restriction employé.
        $query->where('employee_id', $data['employee_id']);
    }

    $summaryQuery = clone $query;
    $summary = [
        'total_hours' => round((float) $summaryQuery->sum('overtime_hours'), 2),
        'employees' => (clone $summaryQuery)->distinct('employee_id')->count('employee_id'),
        'days' => (clone $summaryQuery)->distinct('date')->count('date'),
    ];

    $byEmployeeRows = (clone $query)
        ->select('employee_id')
        ->selectRaw('SUM(overtime_hours) as total_hours')
        ->selectRaw('COUNT(*) as days')
        ->groupBy('employee_id')
        ->orderByDesc('total_hours')
        ->get();

    $employees = Employee::with('user')
        ->whereIn('id', $byEmployeeRows->pluck('employee_id'))
        ->get()
        ->keyBy('id');

    $byEmployee = $byEmployeeRows->map(function ($row) use ($employees) {
        $employee = $employees->get($row->employee_id);

        return [
            'employee_id' => (int) $row->employee_id,
            'employee' => $employee,
            'total_hours' => round((float) $row->total_hours, 2),
            'days' => (int) $row->days,
        ];
    })->values();

    $paginator = $query
        ->latest('date')
        ->latest('id')
        ->paginate(min((int) ($data['per_page'] ?? 50), 100));

    return response()->json([
        'data' => $paginator->items(),
        'meta' => [
            'current_page' => $paginator->currentPage(),
            'last_page' => $paginator->lastPage(),
            'per_page' => $paginator->perPage(),
            'total' => $paginator->total(),
        ],
        'summary' => $summary,
        'by_employee' => $byEmployee,
    ]);
}
```

## Règles respectées

- Aucun calcul automatique d'heures supplémentaires n'est ajouté.
- `overtime_hours` existant est la seule source de vérité.
- Isolation `tenant_id` explicite.
- `restrictToCurrentEmployee()` est appliqué avant le filtre `employee_id`.
- Permission `view_attendance` portée par la route.
- Filtres mois/date/employé/département.
- Pagination maximum 100.
- Agrégats calculés sur l'ensemble filtré et non sur la seule page courante.

## Validation attendue

```text
GET /api/overtime
GET /api/overtime?month=2026-08
GET /api/overtime?date_from=2026-08-01&date_to=2026-08-31
GET /api/overtime?employee_id=1
GET /api/overtime?department_id=2
GET /api/overtime?month=2026-08&per_page=25
```

Un utilisateur `employee` ne doit jamais pouvoir voir les heures supplémentaires d'un autre salarié, même en transmettant son `employee_id` dans la requête.
