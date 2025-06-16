import api from '@/lib/axios'; //
import { ApiResponse } from '@/types/api'; //
import { IService, NewServiceData, UpdateServiceData } from '@/types/service'; // Import new types

// Hàm này trả về một mảng IService
export const getAllServices = async (): Promise<IService[]> => {
    const response = await api.get('/dich-vu');
    return response.data.data.services || []; // Trả về trực tiếp mảng services
  };
  
  // Hàm này trả về một đối tượng IService duy nhất
  export const getServiceById = async (id: number): Promise<IService> => {
      const response = await api.get(`/dich-vu/${id}`);
      return response.data.data.service; // Trả về trực tiếp đối tượng service
  };
  

export const createService = async (serviceData: NewServiceData): Promise<IService> => {
    try {
        const response = await api.post<ApiResponse<{ service: IService }>>('/dich-vu', serviceData); //
        return response.data.data.service; //
    } catch (error: any) {
        console.error("Error creating service:", error);
        throw new Error(error.response?.data?.message || error.message || 'Không thể tạo dịch vụ mới.');
    }
};


export const updateService = async (id: number, updateData: UpdateServiceData): Promise<IService> => {
    try {
        const response = await api.patch<ApiResponse<{ service: IService }>>(`/dich-vu/${id}`, updateData); //
        return response.data.data.service; //
    } catch (error: any) {
        console.error(`Error updating service ${id}:`, error);
        throw new Error(error.response?.data?.message || error.message || 'Không thể cập nhật dịch vụ.');
    }
};

export const updateServicePrice = async (id: number, newPrice: number): Promise<void> => {
    try {
        const response = await api.patch<ApiResponse<any>>(`/dich-vu/${id}/update-price`, { DonGiaMoi: newPrice }); //
        if (response.data.status !== 'success' && response.data.status !== 'no_change') { //
            throw new Error(response.data.message || 'Cập nhật giá dịch vụ thất bại.'); //
        }
        return;
    } catch (error: any) {
        console.error(`Error updating service price ${id}:`, error);
        throw new Error(error.response?.data?.message || error.message || 'Không thể cập nhật giá dịch vụ.');
    }
};

export const deleteService = async (id: number): Promise<void> => {
    try {
        await api.delete(`/dich-vu/${id}`); //
    } catch (error: any) {
        console.error(`Error deleting service ${id}:`, error);
        throw new Error(error.response?.data?.message || error.message || 'Không thể xóa dịch vụ.');
    }
};

// Lấy danh sách dịch vụ theo propertyId (cần thêm endpoint trên backend nếu chưa có)
// Exported this as 'getServicesByProperty' in previous changes. Keep that one.
export const getServicesByProperty = async (propertyId: number): Promise<IService[]> => {
    try {
        const response = await api.get<ApiResponse<{ services: IService[] }>>(`/dich-vu?propertyId=${propertyId}`); //
        return response.data.data.services; //
    } catch (error: any) {
        console.error(`Error fetching services for property ${propertyId}:`, error);
        throw new Error(error.response?.data?.message || 'Không thể tải danh sách dịch vụ cho nhà trọ này.');
    }
};

export const addPriceToService = async (serviceId: number, data: { DonGiaMoi: number; NgayApDung: Date; }) => {
    return await api.post(`/dich-vu/${serviceId}/prices`, data);
  };