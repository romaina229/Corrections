<?php

namespace App\Services;

use App\Models\Payroll;
use Barryvdh\DomPDF\Facade\Pdf;

class PayslipPdfService
{
    /**
     * Génère le bulletin de paie en PDF portrait A4.
     */
    public function generate(Payroll $payroll)
    {
        $payroll->load([
            'employee.user',
            'employee.department',
            'employee.position',
            'tenant',
        ]);

        return Pdf::loadView('pdf.payslip', [
            'payroll' => $payroll,
        ])
            ->setPaper('a4', 'portrait')
            ->setOptions([
                'isRemoteEnabled' => true,
                'defaultFont' => 'DejaVu Sans',
            ]);
    }
}
