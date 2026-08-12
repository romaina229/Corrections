# Patch 06 — Documents Employé

## Source audit

Sources vérifiées : `romaina229/SDS-RH_backend` et `romaina229/SDS-RH_frontend`.

Le backend possède déjà `documents`, `DocumentController`, `Document` et les routes de documents. La migration `2026_08_04_000010_create_documents_table.php` contient déjà `tenant_id`, `employee_id`, métadonnées du fichier et stockage local.

## Corrections obligatoires

### 1. Isolation tenant sur toutes les opérations

`DocumentController` doit appliquer le tenant courant aux lectures et aux téléchargements. Le contrôle actuel limite explicitement les employés à leur propre document, mais ne protège pas suffisamment les profils RH/Admin contre un identifiant provenant d'un autre tenant.

Utiliser systématiquement :

```php
$tenantId = app('tenant')->id;

$query->where('tenant_id', $tenantId);
```

Pour les opérations sur un document déjà résolu par route-model binding :

```php
abort_unless(
    (int) $document->tenant_id === (int) app('tenant')->id,
    404
);
```

Conserver en plus le contrôle `employee` → uniquement ses propres documents.

### 2. Validation de l'employé lors de l'upload

Le contrôle `exists('employees', 'id')` doit rester conditionné par `tenant_id`. Après la validation, pour le rôle `employee`, ignorer toute valeur envoyée par le navigateur et utiliser l'employé associé au compte authentifié.

### 3. Téléchargement sécurisé

Le fichier doit rester sur le disque `local`, jamais dans un répertoire public. Le téléchargement doit toujours passer par :

`GET /api/documents/{document}/download`

avec authentification + tenant + permission + contrôle de l'employé.

### 4. Suppression sécurisée

Même contrôle tenant avant suppression du fichier physique et de la ligne SQL.

### 5. Fiche Employé sans rechargement

Dans `src/pages/employees/EmployeeShow.tsx`, charger les documents à l'ouverture de la fiche et mettre à jour l'état local après upload/suppression. Le téléchargement doit utiliser l'API protégée et créer un `Blob` côté navigateur, sans `window.location` ni navigation complète.

Pattern recommandé :

```ts
const response = await api.get(`/documents/${id}/download`, {
  responseType: 'blob',
});
const url = URL.createObjectURL(response.data);
const link = document.createElement('a');
link.href = url;
link.download = fileName;
link.click();
URL.revokeObjectURL(url);
```

Après upload/suppression : mettre à jour la liste locale ou refetch ciblé, jamais `window.location.reload()`.

## Types pris en charge

Conserver les types existants : `contract`, `diploma`, `id_card`, `pay_slip`, `certificate`, `cv`, `photo`, `medical`, `other`.

## Critères de validation

- Un utilisateur d'un tenant A ne peut ni voir ni télécharger un document du tenant B.
- Un employé ne peut accéder qu'à ses propres documents.
- Un document reste téléchargeable directement en PDF ou fichier original.
- Upload, suppression et téléchargement ne provoquent aucun rechargement de page.
- Le fichier n'est pas exposé par une URL publique.
