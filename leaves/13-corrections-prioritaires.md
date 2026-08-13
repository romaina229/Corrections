# Étape 13 — Corrections prioritaires Absences / Congés

## Bugs confirmés sur le code source

### 1. Erreur de cible dans `LeaveCreate.tsx`

Le formulaire permet à un administrateur/manager de sélectionner un employé, mais `onSubmit()` remplace ensuite systématiquement `employee_id` par l'employé du compte connecté. Résultat : un manager peut sélectionner A, voir le solde de A, puis envoyer la demande pour B (le compte connecté).

Correction :
- pour un employé : utiliser uniquement son `employee_id` serveur/compte ;
- pour RH/manager autorisé : utiliser `data.employee_id` sélectionné ;
- ne jamais faire confiance à un `employee_id` fourni par le navigateur sans contrôle tenant/permission côté serveur.

### 2. Navigation Voir inactive

`Leaves.tsx` affiche un bouton avec `EyeIcon`, mais aucun `onClick`. Le bouton ne fait donc rien.

Correction : créer une page de détail et utiliser `navigate('/leaves/{id}')`.

### 3. Pagination désactivée

`Leaves.tsx` reçoit une réponse paginée Laravel (`response.data.data`) mais le bloc de pagination est commenté. La page affiche donc seulement la première page.

Correction : exposer `current_page`, `last_page`, `per_page`, `total` et piloter `page` via React Query.

### 4. Rechargement manuel

`Leaves.tsx` utilise `useEffect` + `fetchLeaves()` et rappelle directement `fetchLeaves()` après approbation/rejet.

Correction : TanStack Query + `invalidateQueries({ queryKey: ['leaves'] })`.

### 5. Pièce jointe non exposée dans le formulaire

Le backend accepte `attachment` jusqu'à 5 Mo, mais le formulaire frontend montré ne fournit pas de champ fichier et envoie du JSON via Axios. Le flux de pièce jointe est donc incomplet.

Correction : si la pièce jointe est requise par le cahier des charges, utiliser `FormData` avec `multipart/form-data` et ajouter le téléchargement direct côté détail.

### 6. Calcul local des jours

Le frontend calcule les jours avec `Math.abs(...)`. Le backend recalcule déjà le nombre de jours et impose `end_date >= start_date`.

Le frontend doit afficher une estimation, mais le résultat serveur doit rester la source de vérité. Ne pas utiliser `Math.abs` comme validation métier.

### 7. Solde

Le backend crée actuellement un solde par défaut de 24 jours annuels et 10 jours maladie. Cette valeur doit rester une valeur existante du code tant qu'une configuration RH n'est pas introduite. Ne pas inventer de règle supplémentaire.

## Validation attendue

- [ ] Employé crée sa propre demande uniquement
- [ ] Manager/RH crée pour l'employé sélectionné si autorisé
- [ ] Solde affiché pour la bonne personne
- [ ] Pagination fonctionnelle
- [ ] Détail fonctionnel
- [ ] Approbation sans reload
- [ ] Rejet sans reload
- [ ] Création sans reload
- [ ] Pièce jointe fonctionnelle si activée
- [ ] Isolation tenant
- [ ] Permissions
