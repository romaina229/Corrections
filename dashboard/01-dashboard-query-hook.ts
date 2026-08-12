import { useQuery } from '@tanstack/react-query';
import { dashboard } from '../../SDS-RH_frontend/src/api/dashboard';
import type { DashboardStats } from '../../SDS-RH_frontend/src/types';

export interface DashboardData {
  stats: DashboardStats;
  department_distribution: { name: string; count: number }[];
  hiring_trend: { month: string; count: number }[];
  attendance_today: Record<string, number>;
  recent_activities: any[];
}

export const dashboardQueryKey = ['dashboard'] as const;

export function useDashboardQuery() {
  return useQuery<DashboardData>({
    queryKey: dashboardQueryKey,
    queryFn: async () => {
      const response = await dashboard.index();
      return response.data as DashboardData;
    },
    staleTime: 60_000,
    refetchOnWindowFocus: false,
    retry: 1,
  });
}
