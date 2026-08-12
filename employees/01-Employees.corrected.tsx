import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import Card from '../../components/common/Card';
import Loading from '../../components/common/Loading';
import { employees } from '../../api/employees';
import axios from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import type { Employee, PaginatedResponse } from '../../types';
import toast from 'react-hot-toast';
import { PlusIcon, MagnifyingGlassIcon, PencilIcon, EyeIcon, TrashIcon } from '@heroicons/react/24/outline';

interface Filters {
  search: string;
  department_id: string;
  status: string;
  page: number;
}
interface DepartmentOption { id: number; name: string; }

const initialFilters: Filters = { search: '', department_id: '', status: '', page: 1 };

const Employees: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { hasPermission } = useAuth();
  const [filters, setFilters] = React.useState<Filters>(initialFilters);

  const employeesQuery = useQuery({
    queryKey: ['employees', filters],
    queryFn: async () => {
      const response = await employees.list(filters);
      return response.data as PaginatedResponse<Employee>;
    },
    placeholderData: (previous) => previous,
    staleTime: 30_000,
  });

  const departmentsQuery = useQuery({
    queryKey: ['departments', 'employee-filter'],
    queryFn: async () => {
      const response = await axios.get('/departments', { params: { is_active: 1 } });
      return (response.data ?? []) as DepartmentOption[];
    },
    staleTime: 5 * 60_000,
  });

  const data = employeesQuery.data;
  const employeesData = data?.data ?? [];
  const pagination = {
    current_page: data?.current_page ?? filters.page,
    last_page: data?.last_page ?? 1,
    per_page: data?.per_page ?? 15,
    total: data?.total ?? 0,
  };

  const updateFilter = (name: keyof Omit<Filters, 'page'>, value: string) => {
    setFilters((current) => ({ ...current, [name]: value, page: 1 }));
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Êtes-vous sûr de vouloir terminer cet employé ?')) return;
    try {
      await employees.delete(id);
      toast.success('Employé terminé avec succès');
      await queryClient.invalidateQueries({ queryKey: ['employees'] });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur lors de la terminaison');
    }
  };

  if (employeesQuery.isPending && !data) return <Loading fullScreen />;

  if (employeesQuery.isError && !data) {
    return (
      <Card>
        <div className="py-10 text-center">
          <p className="text-gray-600">Impossible de charger les employés.</p>
          <button type="button" onClick={() => employeesQuery.refetch()} className="mt-4 px-4 py-2 rounded-md bg-primary-600 text-white">
            Réessayer
          </button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Employés</h1>
          <p className="text-gray-500 mt-1">Gestion du personnel de l'organisation</p>
        </div>
        {hasPermission('create_employees') && (
          <button type="button" onClick={() => navigate('/employees/create')} className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 rounded-md text-sm font-medium text-white bg-primary-600 hover:bg-primary-700">
            <PlusIcon className="h-5 w-5 mr-2" /> Nouvel employé
          </button>
        )}
      </div>

      <Card>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <input
              type="search"
              name="search"
              placeholder="Rechercher un employé..."
              value={filters.search}
              onChange={(e) => updateFilter('search', e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            />
            <MagnifyingGlassIcon className="absolute inset-y-0 left-3 my-auto h-5 w-5 text-gray-400 pointer-events-none" />
          </div>
          <div className="flex gap-4">
            <select name="department_id" value={filters.department_id} onChange={(e) => updateFilter('department_id', e.target.value)} className="px-3 py-2 border border-gray-300 rounded-md sm:text-sm">
              <option value="">Tous les départements</option>
              {departmentsQuery.data?.map((department) => <option key={department.id} value={department.id}>{department.name}</option>)}
            </select>
            <select name="status" value={filters.status} onChange={(e) => updateFilter('status', e.target.value)} className="px-3 py-2 border border-gray-300 rounded-md sm:text-sm">
              <option value="">Tous les statuts</option>
              <option value="active">Actif</option>
              <option value="on_leave">En congé</option>
              <option value="terminated">Terminé</option>
              <option value="suspended">Suspendu</option>
            </select>
          </div>
        </div>
      </Card>

      <Card>
        {employeesQuery.isFetching && <div className="text-xs text-gray-500 mb-2">Mise à jour...</div>}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead><tr>
              <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase">Employé</th>
              <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase">Matricule</th>
              <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase">Département</th>
              <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
              <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr></thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {employeesData.map((employee) => (
                <tr key={employee.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap"><div className="flex items-center"><div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center"><span className="text-primary-600 font-semibold">{employee.user?.first_name?.[0]}{employee.user?.last_name?.[0]}</span></div><div className="ml-4"><div className="text-sm font-medium text-gray-900">{employee.user?.first_name} {employee.user?.last_name}</div><div className="text-sm text-gray-500">{employee.user?.email}</div></div></div></td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{employee.employee_number}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{employee.department?.name || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{employee.status === 'active' ? 'Actif' : employee.status === 'on_leave' ? 'En congé' : employee.status === 'terminated' ? 'Terminé' : 'Suspendu'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <button type="button" title="Voir" onClick={() => navigate(`/employees/${employee.id}`)} className="text-primary-600 mr-3"><EyeIcon className="h-5 w-5" /></button>
                    {hasPermission('edit_employees') && <button type="button" title="Modifier" onClick={() => navigate(`/employees/${employee.id}/edit`)} className="text-blue-600 mr-3"><PencilIcon className="h-5 w-5" /></button>}
                    {hasPermission('delete_employees') && <button type="button" title="Terminer" onClick={() => handleDelete(employee.id)} className="text-danger-600"><TrashIcon className="h-5 w-5" /></button>}
                  </td>
                </tr>
              ))}
              {employeesData.length === 0 && <tr><td colSpan={5} className="px-6 py-10 text-center text-gray-500">Aucun employé trouvé.</td></tr>}
            </tbody>
          </table>
        </div>

        {pagination.total > 0 && <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
          <p className="text-sm text-gray-700">Page {pagination.current_page} sur {pagination.last_page} — {pagination.total} employé(s)</p>
          <div className="flex gap-2">
            <button type="button" disabled={pagination.current_page <= 1} onClick={() => setFilters((f) => ({ ...f, page: f.page - 1 }))} className="px-3 py-2 border rounded disabled:opacity-50">Précédent</button>
            <button type="button" disabled={pagination.current_page >= pagination.last_page} onClick={() => setFilters((f) => ({ ...f, page: f.page + 1 }))} className="px-3 py-2 border rounded disabled:opacity-50">Suivant</button>
          </div>
        </div>}
      </Card>
    </div>
  );
};

export default Employees;
