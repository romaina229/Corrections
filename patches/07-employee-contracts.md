# Patch 07 — Contrats Employé

## Source audit

Le backend possède déjà :
- `Contract` ;
- `ContractController` ;
- `ContractAmendmentController` ;
- migration `2026_08_04_000006_create_contracts_table.php` ;
- routes CRUD `/contracts`.

La table contient déjà `contract_file`, mais le contrôleur actuel ne gère pas réellement l'upload/téléchargement de ce fichier et les routes ne proposent pas de route dédiée au téléchargement du contrat.

## Corrections

### 1. Upload du contrat signé

Modifier `ContractController@store` pour accepter un champ multipart `contract_file` :

```php
'contract_file' => 'nullable|file|max:15360|mimes:pdf,jpg,jpeg,png,doc,docx',
```

Stocker sur le disque privé `local`, par exemple :

```php
$path = $request->file('contract_file')?->store(
    'contracts/' . app('tenant')->id . '/' . $request->employee_id,
    'local'
);
```

Enregistrer uniquement le chemin privé dans `contracts.contract_file`.

### 2. Téléchargement sécurisé

Ajouter :

```php
public function download(Contract $contract)
{
    abort_unless(
        (int) $contract->tenant_id === (int) app('tenant')->id,
        404
    );

    abort_unless(
        Storage::disk('local')->exists($contract->contract_file),
        404,
        'Fichier du contrat introuvable.'
    );

    return response()->download(
        Storage::disk('local')->path($contract->contract_file),
        'contrat-' . $contract->employee_id . '-' . $contract->id . '.pdf'
    );
}
```

Adapter le nom de fichier à l'extension réellement stockée plutôt que de forcer `.pdf` si le fichier est DOC/DOCX.

### 3. Upload lors d'une modification

`update()` doit accepter `multipart/form-data`, remplacer l'ancien fichier uniquement après succès du nouveau stockage, puis supprimer l'ancien fichier privé.

### 4. Tenant sur les contrats

Même si `Contract` utilise `BelongsToTenant`, les actions `show`, `update`, `destroy`, `download` et `amendments` doivent refuser explicitement un contrat d'un autre tenant avant toute opération.

La validation de `employee_id` doit rester conditionnée par le tenant courant.

### 5. Statut et dates

Conserver les valeurs existantes :
- `pending`
- `active`
- `expired`
- `terminated`

Règles : `end_date` doit être postérieure à `start_date` lorsqu'elle est renseignée ; la date de probation doit également être postérieure au début.

### 6. Routes

Ajouter dans le groupe protégé `tenant` :

```php
Route::get('/contracts/{contract}/download', [ContractController::class, 'download'])
    ->middleware('permission:view_contracts');
```

La route doit rester après les routes statiques éventuelles et sous `auth:sanctum` + `tenant`.

### 7. Frontend sans rechargement

Dans les écrans contrats et la fiche `EmployeeShow.tsx` :
- utiliser `FormData` pour l'upload ;
- rafraîchir uniquement la requête contrats de l'employé après création/modification ;
- télécharger le fichier avec `responseType: 'blob'` ;
- supprimer l'ancien fichier seulement après confirmation du remplacement ;
- ne jamais utiliser `window.location.reload()`.

### 8. Historique automatique

Conserver l'appel à `EmployeeHistoryService` lors de la création/modification d'un contrat. Un changement de salaire doit créer l'événement `salary_change` uniquement lorsque la valeur change réellement.

## Critères de validation

- Création d'un contrat avec ou sans fichier.
- Contrat signé téléchargeable directement.
- Un tenant ne peut jamais télécharger le contrat d'un autre tenant.
- L'employé ne voit que ses propres contrats via le portail.
- Modification/remplacement du fichier sans rechargement.
- Suppression du contrat nettoie le fichier privé associé.
- Les événements de carrière restent cohérents avec les changements de contrat.
