// file: client/services/dashboardService.ts
import api from '@/lib/axios';
import { ApiResponse } from '@/types/api';
import { IDashboardSummary, ITenantDashboardSummary } from '@/types/dashboard';

export const getLandlordDashboardSummary = async (): Promise<IDashboardSummary> => {
    const response = await api.get<ApiResponse<{ summary: IDashboardSummary }>>('/dashboard/landlord-summary');
    return response.data.data.summary;
};

export const getTenantDashboardSummary = async (): Promise<ITenantDashboardSummary> => {
    const response = await api.get<ApiResponse<{ summary: ITenantDashboardSummary }>>('/dashboard/tenant-summary');
    return response.data.data.summary;
};