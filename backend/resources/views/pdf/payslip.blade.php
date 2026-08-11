<!doctype html>
<html lang="fr">
<head>
    <meta charset="utf-8">
    <title>Bulletin de paie</title>
    <style>
        @page { size: A4 portrait; margin: 14mm 12mm; }
        * { box-sizing: border-box; }
        body { margin: 0; font-family: DejaVu Sans, sans-serif; color: #17152b; font-size: 10px; }
        .header { background: #191a3d; color: white; padding: 14px 16px; border-radius: 8px 8px 0 0; }
        .header-table, .info-table, .lines, .summary { width: 100%; border-collapse: collapse; }
        .header-table td { vertical-align: middle; }
        .brand { font-size: 15px; font-weight: 700; }
        .muted-light { color: #c9c7e8; font-size: 8px; line-height: 1.45; }
        .title { text-align: center; padding: 12px 0 8px; }
        .title h1 { margin: 0; font-size: 16px; color: #191a3d; }
        .title p { margin: 3px 0 0; color: #77738e; font-size: 9px; }
        .info { background: #f7f6fb; border: 1px solid #e3e0f1; border-radius: 7px; padding: 9px; }
        .info-table td { padding: 3px 5px; width: 50%; }
        .label { color: #77738e; font-weight: 700; }
        .value { color: #191a3d; }
        .lines { margin-top: 12px; }
        .lines th { background: #f0effb; color: #5b4fe8; padding: 7px 6px; text-align: left; font-size: 8px; text-transform: uppercase; }
        .lines th:last-child, .lines td:last-child { text-align: right; }
        .lines td { padding: 6px; border-bottom: 1px solid #eceaf4; }
        .gain { color: #0b9b82; }
        .retenue { color: #d9474d; }
        .summary { margin-top: 12px; }
        .summary td { border: 1px solid #e3e0f1; padding: 8px; }
        .summary .net { background: #191a3d; color: white; width: 40%; }
        .summary .net .amount { color: #18c5a3; font-size: 16px; font-weight: 700; }
        .footer { margin-top: 12px; border-top: 1px dashed #d9d6e8; padding-top: 7px; color: #88849d; font-size: 7.5px; }
        .right { text-align: right; }
    </style>
</head>
<body>
    @php
        $employee = $payroll->employee;
        $tenant = $payroll->tenant;
        $items = $payroll->breakdown ?? [];
        $monthLabel = \Carbon\Carbon::createFromFormat('Y-m', $payroll->month)->translatedFormat('F Y');
        $employeeName = $employee?->full_name ?? trim(($employee?->user?->first_name ?? '') . ' ' . ($employee?->user?->last_name ?? ''));
        $totalGains = collect($items)->whereNotNull('gain')->sum('gain');
        $totalDeductions = collect($items)->whereNotNull('retenue')->where(fn($item) => empty($item['patronal']))->sum('retenue');
    @endphp

    <div class="header">
        <table class="header-table">
            <tr>
                <td>
                    <div class="brand">{{ $tenant?->emitting_authority ?: $tenant?->name ?: 'SDS-RH' }}</div>
                    <div class="muted-light">
                        {{ $tenant?->address }}
                        @if($tenant?->phone) · Tél. {{ $tenant->phone }} @endif
                        @if($tenant?->email) · {{ $tenant->email }} @endif
                        @if($tenant?->ifu) · IFU {{ $tenant->ifu }} @endif
                    </div>
                </td>
                <td class="right">
                    <strong>Bulletin n° {{ substr($payroll->qr_token ?: (string) $payroll->id, 0, 10) }}</strong><br>
                    <span class="muted-light">Émis le {{ now()->format('d/m/Y') }}</span>
                </td>
            </tr>
        </table>
    </div>

    <div class="title">
        <h1>BULLETIN DE PAIE</h1>
        <p>{{ ucfirst($monthLabel) }}</p>
    </div>

    <div class="info">
        <table class="info-table">
            <tr>
                <td><span class="label">Employé :</span> <span class="value">{{ $employeeName }}</span></td>
                <td><span class="label">Matricule :</span> <span class="value">{{ $employee?->employee_number }}</span></td>
            </tr>
            <tr>
                <td><span class="label">Département :</span> <span class="value">{{ $employee?->department?->name ?: '—' }}</span></td>
                <td><span class="label">Poste :</span> <span class="value">{{ $employee?->position?->title ?: '—' }}</span></td>
            </tr>
            <tr>
                <td><span class="label">Embauche :</span> <span class="value">{{ $employee?->hire_date?->format('d/m/Y') ?: '—' }}</span></td>
                <td><span class="label">Jours travaillés :</span> <span class="value">{{ $payroll->worked_days ?: '—' }}</span></td>
            </tr>
            <tr>
                <td><span class="label">Mode de paiement :</span> <span class="value">{{ $payroll->payment_method ?: '—' }}</span></td>
                <td><span class="label">Statut :</span> <span class="value">{{ $payroll->status }}</span></td>
            </tr>
        </table>
    </div>

    <table class="lines">
        <thead>
            <tr><th>Éléments de rémunération</th><th class="right">Montant</th></tr>
        </thead>
        <tbody>
            @forelse($items as $item)
                @if(($item['gain'] ?? null) !== null && $item['gain'] > 0)
                    <tr><td>{{ $item['label'] }} @if(!empty($item['patronal'])) <small>(charge patronale)</small> @endif</td><td class="gain">{{ number_format($item['gain'], 0, ',', ' ') }} FCFA</td></tr>
                @endif
                @if(($item['retenue'] ?? null) !== null && $item['retenue'] > 0 && empty($item['patronal']))
                    <tr><td>{{ $item['label'] }}</td><td class="retenue">- {{ number_format($item['retenue'], 0, ',', ' ') }} FCFA</td></tr>
                @endif
            @empty
                <tr><td colspan="2">Aucune ligne de paie disponible.</td></tr>
            @endforelse
        </tbody>
    </table>

    <table class="summary">
        <tr>
            <td><span class="label">Total gains</span><br><strong>{{ number_format($totalGains, 0, ',', ' ') }} FCFA</strong></td>
            <td><span class="label">Total retenues</span><br><strong>{{ number_format($totalDeductions, 0, ',', ' ') }} FCFA</strong></td>
            <td class="net"><span>NET À PAYER</span><br><span class="amount">{{ number_format($payroll->net_salary, 0, ',', ' ') }} FCFA</span></td>
        </tr>
    </table>

    <div class="footer">
        Document généré par SDS-RH. Ce bulletin est un document électronique officiel de l'organisation. Vérification possible via le QR/token associé au bulletin.
    </div>
</body>
</html>
