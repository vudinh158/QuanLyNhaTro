import api from '@/lib/axios'; // Đảm bảo rằng bạn đã cấu hình axios instance đúng cách
import { ApiResponse } from '@/types/api'; // Đảm bảo rằng bạn có kiểu ApiResponse
import { IElectricWaterPrice } from '@/types/electricWaterPrice';

export const getElectricWaterPrices = async (): Promise<IElectricWaterPrice[]> => {
    try {
        const response = await api.get<ApiResponse<{ lichSuGiaDienNuoc: IElectricWaterPrice[] }>>('/lich-su-gia-dien-nuoc');
        return response.data.data.lichSuGiaDienNuoc;
    } catch (error: any) {
        console.error("Error fetching electric water prices:", error.response?.data || error.message);
        throw new Error(error.response?.data?.message || 'Không thể tải giá điện nước.');
    }
};