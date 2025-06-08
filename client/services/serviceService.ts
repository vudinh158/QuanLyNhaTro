// file: client/services/serviceService.ts

import api from '@/lib/axios';
import { ApiResponse } from '@/types/api';
import { IService } from '@/types/service';

/**
 * Lấy danh sách các dịch vụ được áp dụng cho một nhà trọ cụ thể.
 * @param propertyId - Mã nhà trọ
 * @returns Promise<IService[]> - Danh sách dịch vụ
 */
export const getServicesByProperty = async (propertyId: number): Promise<IService[]> => {
    try {
        // Backend cần có một endpoint như thế này để trả về các dịch vụ
        // bao gồm cả dịch vụ chung và dịch vụ riêng của nhà trọ đó.
        const response = await api.get<ApiResponse<{ services: IService[] }>>(`/services/property/${propertyId}`);
        return response.data.data.services;
    } catch (error: any) {
        console.error(`Error fetching services for property ${propertyId}:`, error);
        throw new Error(error.response?.data?.message || 'Không thể tải danh sách dịch vụ.');
    }
};