import api from '@/lib/axios';
import { ApiResponse } from '@/types/api';
import {
  ElectricWaterUsage,
  CreateElectricWaterUsageData,
  IElectricWaterUsage
} from '@/types/electricWaterUsage';
import { getAccessToken } from './authService';


// === Tạo mới bản ghi điện/nước ===
export const createDienNuoc = async (
  data: CreateElectricWaterUsageData
): Promise<ElectricWaterUsage> => {
  try {
    const token = getAccessToken();
    const response = await api.post<ApiResponse<ElectricWaterUsage>>(
      '/dien-nuoc',
      data,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    // Thẳng lấy payload.data là object ElectricWaterUsage
    return response.data.data as ElectricWaterUsage;
  } catch (error: any) {
    console.error(
      'Error creating electric/water usage record:',
      error.response?.data || error.message
    );
    throw new Error(
      error.response?.data?.message || 'Không thể ghi nhận chỉ số điện nước.'
    );
  }
};


// === Tham số tìm kiếm bản ghi ===
export interface GetAllDienNuocParams {
  MaPhong?: number;
  Loai?: 'Điện' | 'Nước';
  startDate?: string;
  endDate?: string;
  status?: 'Mới ghi' | 'Đã tính tiền' | 'Đã hủy';
  limit?: number;
  offset?: number;
}


// === Lấy tất cả bản ghi điện/nước ===
export const getAllDienNuoc = async (
  params?: GetAllDienNuocParams
): Promise<ElectricWaterUsage[]> => {
  try {
    const response = await api.get<ApiResponse<any>>(
      '/dien-nuoc',
      { params }
    );

    const payload = response.data.data;
    if (payload == null) {
      return [];
    }
    // Trường hợp backend trả { records: [...] }
    if (Array.isArray((payload as any).records)) {
      return (payload as any).records;
    }
    // Trường hợp backend trả { data: [...] }
    if (Array.isArray((payload as any).data)) {
      return (payload as any).data;
    }
    // Trường hợp backend trả thẳng mảng
    if (Array.isArray(payload)) {
      return payload;
    }

    console.warn('Dữ liệu điện nước trả về không hợp lệ:', payload);
    return [];
  } catch (error: any) {
    console.error(
      'Error fetching electric/water usage records:',
      error.response?.data || error.message
    );
    throw new Error(
      error.response?.data?.message || 'Không thể tải lịch sử điện nước.'
    );
  }
};


// === Lấy chi tiết một bản ghi theo ID ===
export const getDienNuocById = async (
  id: number
): Promise<ElectricWaterUsage> => {
  try {
    const response = await api.get<ApiResponse<ElectricWaterUsage>>(
      `/dien-nuoc/${id}`
    );
    return response.data.data as ElectricWaterUsage;
  } catch (error: any) {
    console.error(
      `Error fetching electric/water usage record ${id}:`,
      error.response?.data || error.message
    );
    throw new Error(
      error.response?.data?.message || 'Không thể tải chi tiết chỉ số điện nước.'
    );
  }
};


// === Cập nhật bản ghi ===
export const updateDienNuoc = async (
  id: number,
  data: Partial<CreateElectricWaterUsageData>
): Promise<ElectricWaterUsage> => {
  try {
    const response = await api.patch<ApiResponse<ElectricWaterUsage>>(
      `/dien-nuoc/${id}`,
      data
    );
    return response.data.data as ElectricWaterUsage;
  } catch (error: any) {
    console.error(
      `Error updating electric/water usage record ${id}:`,
      error.response?.data || error.message
    );
    throw new Error(
      error.response?.data?.message || 'Không thể cập nhật chỉ số điện nước.'
    );
  }
};


// === Xóa bản ghi ===
export const deleteDienNuoc = async (
  id: number
): Promise<void> => {
  try {
    await api.delete(`/dien-nuoc/${id}`);
  } catch (error: any) {
    console.error(
      `Error deleting electric/water usage record ${id}:`,
      error.response?.data || error.message
    );
    throw new Error(
      error.response?.data?.message || 'Không thể xóa chỉ số điện nước.'
    );
  }
};


// === Lấy bản ghi thô (IElectricWaterUsage) ===
export const getElectricWaterUsages = async (
  params?: { roomId?: string }
): Promise<IElectricWaterUsage[]> => {
  try {
    const response = await api.get<ApiResponse<any>>(
      '/dien-nuoc',
      { params }
    );
    const payload = response.data.data;
    if (payload == null) {
      return [];
    }
    if (Array.isArray((payload as any).records)) {
      return (payload as any).records;
    }
    if (Array.isArray((payload as any).data)) {
      return (payload as any).data;
    }
    if (Array.isArray(payload)) {
      return payload as IElectricWaterUsage[];
    }
    console.warn('Dữ liệu điện nước trả về không hợp lệ:', payload);
    return [];
  } catch (error: any) {
    console.error(
      'Error fetching electric water usages:',
      error.response?.data || error.message
    );
    throw new Error(
      error.response?.data?.message || 'Không thể tải lịch sử điện nước.'
    );
  }
};
