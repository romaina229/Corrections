# Module 10 — Sorties employés

## État vérifié

Le dépôt source possède déjà le statut `terminated` sur `employees`, le champ `terminated_at`, et `EmployeeController@destroy()` réalise actuellement une terminaison logique : désactivation de l'utilisateur, passage de l'employé à `terminated`, clôture des contrats actifs et écriture d'un événement `termination` dans l'historique.

Le problème fonctionnel est que cette opération est exposée comme « Supprimer l'employé ». Il manque un véritable espace RH « Sorties employés » permettant de consulter les salariés sortis et les informations de sortie.

## Correction proposée

1. Ne plus présenter la terminaison comme une suppression métier.
2. Ajouter un endpoint dédié `GET /employees/exits` réutilisant l'isolation tenant et les permissions employé.
3. Ajouter une action `POST /employees/{employee}/terminate` permettant de saisir :
   - type de sortie : resignation, dismissal, contract_end, retirement, death, other ;
   - date de sortie ;
   - motif/commentaire facultatif.
4. Conserver la compatibilité avec le statut existant `terminated` et l'historique carrière.
5. Ajouter les champs `termination_type`, `termination_reason` et utiliser `terminated_at` comme date de sortie.
6. Ajouter la page frontend `/employees/exits` avec recherche, filtre type et consultation de la fiche employé.
7. Remplacer progressivement l'action « Supprimer » de la liste active par « Sortir / Terminer ».
8. Toutes les mutations doivent rester SPA : Axios + invalidation/rafraîchissement local, jamais `window.location.reload()`.

## Sécurité

- L'employé doit appartenir au tenant courant.
- L'action de terminaison reste protégée par `delete_employees` tant qu'aucune permission métier dédiée n'existe dans les sources.
- Un employé déjà `terminated` ne doit pas être terminé une seconde fois.

## Critères de validation

- [ ] `/employees/exits` affiche uniquement les employés `terminated` du tenant courant.
- [ ] Une sortie peut être enregistrée avec type, date et motif.
- [ ] L'utilisateur est désactivé et les contrats actifs sont clôturés.
- [ ] Une entrée `termination` est conservée dans l'historique.
- [ ] La date de sortie affichée correspond à `terminated_at`.
- [ ] La fiche employé reste consultable depuis les sorties.
- [ ] Aucun clic interne ne recharge la page.
- [ ] Un employé du tenant B ne peut jamais voir ou terminer un employé du tenant A.
- [ ] Une double terminaison est refusée proprement.
