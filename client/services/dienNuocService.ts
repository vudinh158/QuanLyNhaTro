import api from '@/lib/axios';
import { ApiResponse } from '@/types/api';
import { ElectricWaterUsage, CreateElectricWaterUsageData } from '@/types/electricWaterUsage';
import { getAccessToken } from './authService';



export const createDienNuoc = async (
    data: CreateElectricWaterUsageData
  ): Promise<ElectricWaterUsage> => {
    try {
        const token = getAccessToken()
      const response = await api.post<ApiResponse<any>>("/dien-nuoc", data,{
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
  
      const raw = response.data.data;
  
      // Kiểm tra các trường bắt buộc có tồn tại
      if (
        typeof raw.MaDienNuoc !== 'number' ||
        typeof raw.MaPhong !== 'number' ||
        typeof raw.Loai !== 'string' ||
        typeof raw.ChiSoDau !== 'number' ||
        typeof raw.ChiSoCuoi !== 'number' ||
        typeof raw.SoLuongTieuThu !== 'number' ||
        typeof raw.DonGia !== 'number' ||
        typeof raw.ThanhTien !== 'number' ||
        typeof raw.NgayGhi !== 'string' ||
        typeof raw.TrangThai !== 'string'
      ) {
        throw new Error("Dữ liệu trả về từ API không hợp lệ.");
      }
  
      return raw as ElectricWaterUsage;
  
    } catch (error: any) {
      console.error(
        "Error creating electric/water usage record:",
        error.response?.data || error.message
      );
      throw new Error(
        error.response?.data?.message || "Không thể ghi nhận chỉ số điện nước."
      );
    }
  };

interface GetAllDienNuocParams {
    MaPhong?: number;
    Loai?: 'Điện' | 'Nước';
    startDate?: string;
    endDate?: string;
    status?: 'Mới ghi' | 'Đã tính tiền' | 'Đã hủy';
    limit?: number;
    offset?: number;
}

export const getAllDienNuoc = async (params?: GetAllDienNuocParams): Promise<ElectricWaterUsage[]> => {
    try {
        // The backend returns an object like { status: 'success', results: ..., data: [...] }
        // So, we need to explicitly type the inner 'data' as an array of ElectricWaterUsage.
        const response = await api.get<ApiResponse<{ data: ElectricWaterUsage[] }>>('/dien-nuoc', { params });
        // The actual array is within response.data.data
        return response.data.data.data; // Corrected: Access the nested 'data' property that holds the array
    } catch (error: any) {
        console.error("Error fetching electric/water usage records:", error.response?.data || error.message);
        throw new Error(error.response?.data?.message || 'Không thể tải lịch sử chỉ số điện nước.');
    }
};

export const getDienNuocById = async (id: number): Promise<ElectricWaterUsage> => {
    try {
        const response = await api.get<ApiResponse<{ data: ElectricWaterUsage }>>(`/dien-nuoc/${id}`);
        return response.data.data.data; // Corrected: Access the nested 'data' property
    } catch (error: any) {
        console.error(`Error fetching electric/water usage record ${id}:`, error.response?.data || error.message);
        throw new Error(error.response?.data?.message || 'Không thể tải chi tiết chỉ số điện nước.');
    }
};

export const updateDienNuoc = async (id: number, data: Partial<CreateElectricWaterUsageData>): Promise<ElectricWaterUsage> => {
    try {
        const response = await api.patch<ApiResponse<{ data: ElectricWaterUsage }>>(`/dien-nuoc/${id}`, data);
        return response.data.data.data; // Corrected: Access the nested 'data' property
    } catch (error: any) {
        console.error(`Error updating electric/water usage record ${id}:`, error.response?.data || error.message);
        throw new Error(error.response?.data?.message || 'Không thể cập nhật chỉ số điện nước.');
    }
};

export const deleteDienNuoc = async (id: number): Promise<void> => {
    try {
        await api.delete(`/dien-nuoc/${id}`);
    } catch (error: any) {
        console.error(`Error deleting electric/water usage record ${id}:`, error.response?.data || error.message);
        throw new Error(error.response?.data?.message || 'Không thể xóa chỉ số điện nước.');
    }
};