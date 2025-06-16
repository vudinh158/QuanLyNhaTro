import api from '@/lib/axios'; //
import { ApiResponse } from '@/types/api'; //
import { IService, NewServiceData, UpdateServiceData } from '@/types/service'; // Import new types

/**
 * Lấy danh sách tất cả các dịch vụ (chung và riêng của chủ trọ).
 * Param `params` có thể bao gồm `propertyId`, `search`, `type`, v.v.
 * @param params - Các tham số lọc, tìm kiếm
 * @returns Promise<IService[]> - Danh sách dịch vụ
 */
export const getAllServices = async (params?: { propertyId?: number; search?: string; type?: string }): Promise<IService[]> => {
    try {
        // Sửa kiểu Generic của ApiResponse để khớp với cấu trúc server { data: [...] }
        const response = await api.get<ApiResponse<IService[]>>('/dich-vu', { params });

        // SỬA LỖI Ở ĐÂY:
        // Lấy mảng services trực tiếp từ response.data.data
        const services = response.data.data as IService[];

        if (Array.isArray(services)) {
            return services;
        }

        // Nếu dữ liệu không phải là mảng, trả về mảng rỗng để tránh lỗi
        console.warn("Dữ liệu dịch vụ trả về không phải là một mảng:", response.data.data);
        return response.data.data.services;

    } catch (error: any) {
        console.error("Error fetching services:", error.response?.data || error.message);
        throw new Error(error.response?.data?.message || 'Không thể tải danh sách dịch vụ.');
    }
};

/**
 * Lấy chi tiết một dịch vụ bằng ID.
 * @param id - Mã dịch vụ (MaDV)
 * @returns Promise<IService> - Chi tiết dịch vụ
 */
export const getServiceById = async (id: number): Promise<IService> => {
    try {
        console.log(`Đang gọi API để lấy dịch vụ với ID: ${id}`); //
        
        // --- PHẦN SỬA LỖI CHÍNH: THAY ĐỔI KIỂU GENERIC CỦA APIRESPONSE VÀ CÁCH TRUY CẬP DỮ LIỆU ---
        // Dựa trên log của bạn (image_c53912.png), backend trả về { status: 'success', data: IService }
        // chứ không phải data: { service: IService }.
        const response = await api.get<ApiResponse<IService>>(`/dich-vu/${id}`); // Thay đổi kiểu ở đây

        console.log('Phản hồi Axios nhận được:', response); //
        console.log('Phản hồi data:', response.data); //
        console.log('Phản hồi data.data:', response.data?.data); //
        
        if (!response.data || !response.data.data) { // Kiểm tra response.data.data có tồn tại không
            throw new Error("Dữ liệu dịch vụ không được tìm thấy trong phản hồi API hoặc cấu trúc không hợp lệ."); //
        }

        return response.data.data as IService; // Truy cập trực tiếp data.data
        // --- KẾT THÚC PHẦN SỬA LỖI ---

    } catch (error: any) {
        console.error(`Lỗi trong getServiceById (ID: ${id}):`, error.response?.data || error.message || error); //
        throw new Error(error.response?.data?.message || error.message || 'Không thể tải thông tin dịch vụ.'); //
    }
};

/**
 * Tạo dịch vụ mới.
 * @param serviceData - Dữ liệu dịch vụ mới
 * @returns Promise<IService> - Dịch vụ đã tạo
 */
export const createService = async (serviceData: NewServiceData): Promise<IService> => {
    try {
        const response = await api.post<ApiResponse<{ service: IService }>>('/dich-vu', serviceData); //
        return response.data.data.service; //
    } catch (error: any) {
        console.error("Error creating service:", error);
        throw new Error(error.response?.data?.message || error.message || 'Không thể tạo dịch vụ mới.');
    }
};

/**
 * Cập nhật thông tin dịch vụ.
 * @param id - Mã dịch vụ (MaDV)
 * @param updateData - Dữ liệu cập nhật
 * @returns Promise<IService> - Dịch vụ đã cập nhật
 */
export const updateService = async (id: number, updateData: UpdateServiceData): Promise<IService> => {
    try {
        const response = await api.patch<ApiResponse<{ service: IService }>>(`/dich-vu/${id}`, updateData); //
        return response.data.data.service; //
    } catch (error: any) {
        console.error(`Error updating service ${id}:`, error);
        throw new Error(error.response?.data?.message || error.message || 'Không thể cập nhật dịch vụ.');
    }
};

/**
 * Cập nhật giá dịch vụ. (Endpoint riêng trên backend `dichVuController.js`)
 * @param id - Mã dịch vụ (MaDV)
 * @param newPrice - Giá mới
 * @returns Promise<void>
 */
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


/**
 * Xóa (đánh dấu ngừng hoạt động) một dịch vụ.
 * @param id - Mã dịch vụ (MaDV)
 * @returns Promise<void>
 */
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