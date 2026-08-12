# P1 — Employés : génération fiable des matricules

## Audit du code actuel

Le champ métier est `employees.employee_number`.

Le contrôleur génère actuellement le matricule avec :

```php
$count = Employee::where('tenant_id', $tenantId)->count() + 1;
return 'EMP-' . str_pad($tenantId, 5, '0', STR_PAD_LEFT) . '-' . str_pad($count, 4, '0', STR_PAD_LEFT);
```

La migration impose déjà `employee_number` en `UNIQUE` global :

```php
$table->string('employee_number')->unique();
```

## Défauts constatés

### 1. Risque de collision en concurrence

`COUNT(*) + 1` n'est pas une séquence fiable. Deux créations simultanées peuvent calculer le même numéro avant que l'une des transactions ne soit commitée.

La contrainte UNIQUE protège la base contre le doublon final, mais elle ne fournit pas une expérience métier fiable : une création peut échouer avec une violation SQL alors qu'un matricule libre devait être attribué.

### 2. Suppression d'un employé

Le `destroy()` ne supprime pas l'employé : il le passe à `terminated`. Le compteur ne doit donc jamais être basé sur les seuls employés actifs. Cependant, `COUNT(*) + 1` reste fragile en cas de données historiques supprimées/importées ou de concurrence.

### 3. Matricule globalement unique

La contrainte actuelle est unique sur toute la table, pas sur `(tenant_id, employee_number)`. Ce n'est pas nécessairement mauvais, car le format contient déjà le `tenant_id`, mais le périmètre doit être explicitement décidé et testé.

### 4. Matricule modifiable

Le `update()` utilise `$request->except(...)` et le champ `employee_number` est dans `$fillable`. Même si le frontend ne l'envoie pas, l'API permet actuellement potentiellement à un appelant autorisé de modifier le matricule.

Un matricule RH doit être stable après création, sauf procédure administrative dédiée.

## Correction recommandée

### A. Génération transactionnelle et monotone par tenant

Ne plus utiliser `COUNT(*) + 1`.

Le générateur doit chercher le plus grand numéro déjà utilisé pour ce tenant, puis proposer le suivant, tout en conservant une contrainte UNIQUE en base comme dernière protection.

Format conservé afin d'éviter une migration fonctionnelle inutile :

```text
EMP-{tenant_id sur 5 chiffres}-{séquence sur 4 chiffres}
```

Exemples :

```text
EMP-00001-0001
EMP-00001-0002
EMP-00002-0001
```

Si le projet exige que les matricules recommencent à `0001` pour chaque tenant, la génération doit filtrer par tenant et la contrainte de base devrait idéalement être `(tenant_id, employee_number)` avec un format ne contenant pas le tenant. Comme le format actuel encode déjà le tenant, conserver l'unicité globale est acceptable et minimise la migration.

### B. Ne jamais accepter `employee_number` depuis le payload de création

La valeur doit être générée exclusivement côté serveur.

### C. Ne jamais modifier le matricule via l'endpoint général `update`

Retirer `employee_number` du payload effectivement transmis à `$employee->update()` ou, mieux, définir explicitement la liste des champs modifiables au lieu de transmettre `$request->except(...)`.

### D. Gérer la collision résiduelle

Même avec une recherche du maximum, une collision reste théoriquement possible sous forte concurrence. La création doit donc conserver la contrainte UNIQUE et, si nécessaire, retenter la génération après une violation d'unicité dans une transaction contrôlée.

Une approche encore plus robuste consiste à utiliser une table de séquences par tenant avec verrouillage transactionnel (`lockForUpdate()`), par exemple :

```text
employee_number_sequences
- tenant_id (unique)
- next_value
```

La séquence est verrouillée pendant la création de l'employé, puis incrémentée dans la même transaction. Cette solution est recommandée si la plateforme doit supporter des créations concurrentes importantes.

## Recommandation pour SDS-RH

Pour une correction immédiate et peu invasive :

1. conserver le format `EMP-{tenant}-{sequence}` ;
2. remplacer `COUNT(*) + 1` par une recherche du maximum de séquence existante ;
3. ne jamais accepter/modifier `employee_number` via les endpoints CRUD standards ;
4. conserver la contrainte UNIQUE en base ;
5. ajouter une gestion de collision/retry ;
6. si le volume ou la concurrence augmente, migrer vers une table de séquences verrouillée.

## Validation obligatoire

Tester :

1. premier employé d'un tenant → `EMP-00001-0001` ;
2. deuxième → `EMP-00001-0002` ;
3. employé d'un autre tenant → séquence indépendante ;
4. employé terminé → le prochain numéro ne réutilise jamais son matricule ;
5. modification d'un employé sans changement de matricule ;
6. tentative de modification forcée de `employee_number` → ignorée/refusée ;
7. deux créations simultanées → deux matricules distincts ;
8. import ou ancien matricule existant → aucune collision ;
9. tenant avec plus de 9999 employés → la séquence ne doit pas casser à cause du padding sur 4 chiffres ;
10. aucune donnée d'un autre tenant ne doit influencer la séquence.

## Frontend

La création d'employé reste asynchrone : le frontend ne doit pas générer le matricule. Après `POST /employees`, il utilise le `employee.employee_number` retourné par l'API et met à jour la liste/fiche localement sans rechargement de page.
