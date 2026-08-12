# Étape 11 — Temps & Présence

## État audité

Le backend expose déjà `AttendanceController` avec : liste/pagination des pointages, pointage entrée/sortie, présence du jour, historique mensuel d'un salarié, statistiques, génération et scan QR.

Le frontend expose `Attendance.tsx` et `QRClock.tsx`.

## Anomalies identifiées

1. `Attendance.tsx` utilise `useEffect/useState` et recharge manuellement les données à chaque changement de date. À migrer vers TanStack Query.
2. Après `clock-in` ou `clock-out`, la page appelle `fetchAttendance()` manuellement. Remplacer par invalidation des queries concernées.
3. Les boutons de pointage doivent explicitement être `type="button"`.
4. Le filtre département existe côté backend dans `/attendances/today`, mais n'est pas exposé dans l'écran actuel.
5. Le backend calcule `overtime_hours`, mais aucune page frontend dédiée aux heures supplémentaires n'est actuellement exposée dans l'arborescence auditée.
6. `QRClock.tsx` dépend actuellement de `api.qrserver.com` pour rendre l'image QR. À remplacer à terme par une génération locale maîtrisée.
7. `generate-qr` est un GET qui crée un jeton temporaire. À conserver pour compatibilité, mais à protéger clairement par accès/permission.
8. Le backend limite déjà les employés à leur propre pointage via `restrictToCurrentEmployee()` et `assertEmployeeAccess()`. Cette règle doit être conservée.
9. Les statistiques backend contiennent `avg_hours` et les historiques contiennent `overtime_hours`, mais l'interface générale ne les exploite pas encore.
10. Les statuts `present`, `absent`, `late`, `half_day`, `holiday`, `leave` doivent être validés avec les migrations/seeders avant d'ajouter des règles métier.

## Objectif

Stabiliser d'abord Présences sans changer inutilement le contrat API : navigation SPA sans reload, cache React Query, filtres réels, pointage sécurisé, historique salarié, puis créer le sous-module Heures supplémentaires si les modèles/migrations existants le permettent.

## Tests obligatoires

- changement de date sans reload navigateur ;
- pointage entrée sans reload ;
- pointage sortie sans reload ;
- double pointage correctement refusé ;
- salarié ne pouvant accéder qu'à son propre pointage ;
- RH/admin pouvant consulter les données autorisées ;
- filtre département ;
- historique mensuel ;
- statistiques ;
- QR expiré/refusé ;
- aucune navigation externe inutile ;
- aucune perte de session après navigation.
