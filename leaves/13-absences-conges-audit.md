# Étape 13 — Absences / Congés

## État vérifié

Le backend possède déjà `LeaveController` et les routes `/leaves`, `/leaves/{leave}`, `/approve`, `/reject` et `/balance/{employee}`. Le frontend possède `Leaves.tsx` et `LeaveCreate.tsx`.

## Corrections obligatoires

1. Remplacer `useEffect + fetchLeaves()` par TanStack Query.
2. Après approbation, rejet, suppression ou création, invalider les queries concernées au lieu de recharger manuellement la page.
3. Ajouter `type="button"` aux boutons d'action hors formulaire.
4. Brancher la pagination Laravel actuellement commentée dans `Leaves.tsx`.
5. Rendre l'icône Voir réellement navigable vers le détail.
6. Ne jamais utiliser `window.location.reload()`.
7. Conserver `view_leaves`, `create_leaves`, `edit_leaves`, `delete_leaves`, `approve_leaves`.
8. Conserver l'isolation tenant et la restriction d'un compte employé à son propre dossier.
9. Afficher le solde avant une demande annuelle et présenter clairement la validation du solde.
10. N'ajouter une annulation que si la règle métier et le statut la supportent réellement.
11. Traiter les pièces jointes comme de vrais fichiers téléchargeables, sans impression navigateur.
12. Garder le serveur comme source de vérité pour les dates et le nombre de jours.

## Point de vigilance backend

`approve()` et `reject()` doivent être vérifiés pour s'assurer que la demande appartient au tenant courant et que l'acteur est autorisé à la traiter. Les routes imposent `approve_leaves`, mais le contrôle métier doit rester cohérent avec les autres opérations.

## Solde

Le backend initialise actuellement 24 jours annuels et 10 jours maladie lorsqu'un solde n'existe pas. Cette valeur ne doit pas être transformée en règle universelle sans vérifier les paramètres prévus par le cahier des charges.

## Validation

- [ ] Liste sans reload
- [ ] Filtres sans reload
- [ ] Pagination sans reload
- [ ] Création sans reload
- [ ] Approbation sans reload
- [ ] Rejet sans reload
- [ ] Détail fonctionnel
- [ ] Solde correct
- [ ] Permissions correctes
- [ ] Isolation tenant vérifiée
- [ ] Pièces jointes téléchargeables directement
