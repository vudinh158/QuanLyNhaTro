// apps/client-nextjs/services/tenantService.ts
import axiosInstance from '@/lib/axios';
import type { Tenant, NewTenantData, UpdateTenantData } from '@/types/tenant';
import type { ApiResponse } from '@/types/api';

// Lấy danh sách khách thuê (chủ trọ sẽ thấy khách thuê liên quan đến họ)
export const getAllTenantsForLandlord = async (queryParams?: { search?: string, status?: string }): Promise<Tenant[]> => {
  try {
    const response = await axiosInstance.get<ApiResponse<Tenant[]>>('/tenants', { params: queryParams });
    return response.data.data.tenants as Tenant[];
  } catch (error: any) {
    console.error("Error fetching tenants:", error);
    throw new Error(error.response?.data?.message || error.message || 'Không thể tải danh sách khách thuê.');
  }
};

// Lấy chi tiết một khách thuê
export const getTenantById = async (tenantId: number): Promise<Tenant> => {
  try {
    const response = await axiosInstance.get<ApiResponse<Tenant>>(`/tenants/${tenantId}`);
    return response.data.data.tenant as Tenant;
  } catch (error: any) {
    console.error(`Error fetching tenant ${tenantId}:`, error);
    throw new Error(error.response?.data?.message || error.message || 'Không thể tải thông tin khách thuê.');
  }
};

// Tạo khách thuê mới
export const createTenant = async (tenantData: NewTenantData): Promise<Tenant> => {
  try {
    // Nếu có AnhGiayTo là file, cần xử lý FormData
    // Hiện tại giả sử AnhGiayTo là URL hoặc không có
    const response = await axiosInstance.post<ApiResponse<Tenant>>('/tenants', tenantData);
    return response.data.data.tenant as Tenant;
  } catch (error: any) {
    console.error("Error creating tenant:", error);
    throw new Error(error.response?.data?.message || error.message || 'Không thể tạo khách thuê mới.');
  }
};

// Cập nhật thông tin khách thuê
export const updateTenant = async (tenantId: number, tenantData: UpdateTenantData): Promise<Tenant> => {
  try {
    const response = await axiosInstance.patch<ApiResponse<Tenant>>(`/tenants/${tenantId}`, tenantData);
    return response.data.data.tenant as Tenant;
  } catch (error: any) {
    console.error(`Error updating tenant ${tenantId}:`, error);
    throw new Error(error.response?.data?.message || error.message || 'Không thể cập nhật thông tin khách thuê.');
  }
};

// Xóa khách thuê
export const deleteTenant = async (tenantId: number): Promise<void> => {
  try {
    await axiosInstance.delete(`/tenants/${tenantId}`);
  } catch (error: any) {
    console.error(`Error deleting tenant ${tenantId}:`, error);
    throw new Error(error.response?.data?.message || error.message || 'Không thể xóa khách thuê.');
  }
};