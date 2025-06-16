// clone nhatro/client/services/electricWaterPriceService.ts
import api from '@/lib/axios';
import { ApiResponse } from '@/types/api';
import { IElectricWaterPrice, NewElectricWaterPriceData } from '@/types/electricWaterPrice';

export const getElectricWaterPrices = async (propertyId: number): Promise<IElectricWaterPrice[]> => {
    try {
        const response = await api.get<ApiResponse<{ lichSuGiaDienNuoc: IElectricWaterPrice[] }>>(`/lich-su-gia-dien-nuoc?propertyId=${propertyId}`);
        // Giả định backend trả về mảng giá mới nhất cho mỗi loại
        return response.data.data.lichSuGiaDienNuoc;
    } catch (error: any) {
        console.error("Error fetching electric water prices:", error.response?.data || error.message);
        throw new Error(error.response?.data?.message || 'Không thể tải giá điện nước.');
    }
};

// Cập nhật hàm tạo mới
export const createElectricWaterPrice = async (data: NewElectricWaterPriceData): Promise<IElectricWaterPrice> => {
    try {
        // Cập nhật kiểu dữ liệu mong đợi từ API
        const response = await api.post<ApiResponse<{ lichSuGiaDienNuoc: IElectricWaterPrice }>>('/lich-su-gia-dien-nuoc', data);
        // Trích xuất đúng đối tượng từ cấu trúc lồng nhau
        return response.data.data.lichSuGiaDienNuoc;
    } catch (error: any) {
        console.error("Error creating electric/water price:", error.response?.data || error.message);
        throw new Error(error.response?.data?.message || 'Không thể cập nhật giá.');
    }
};

export const deleteElectricWaterPrice = async (id: number): Promise<void> => {
    await api.delete(`/lich-su-gia-dien-nuoc/${id}`);
  };