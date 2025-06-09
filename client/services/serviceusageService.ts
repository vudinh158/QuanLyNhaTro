import api from '@/lib/axios'; // Import your axios instance
import { getToken } from '@/lib/utils'; // Assuming you have a utility to get the auth token

interface CreateServiceUsageData {
    MaPhong: number;
    MaDV: number;
    SoLuong: number;
    NgaySuDung: string; // YYYY-MM-DD format
}

interface ServiceUsage {
    MaSuDungDV: number;
    MaPhong: number;
    MaDV: number;
    SoLuong: number;
    DonGia: number; // Stored price at the time of usage
    ThanhTien: number;
    NgaySuDung: string;
    GhiChu?: string;
    MaHoaDon?: number; // Nullable, as it's set later during invoice generation
    TrangThai: 'Mới ghi' | 'Đã tính tiền'; // 'Mới ghi' or 'Đã tính tiền'
    createdAt: string;
    updatedAt: string;
    service: {
        TenDV: string;
        DonViTinh: string;
        LoaiDichVu: string;
        // ... other service details if needed for display
    };
}

export const createSuDungDichVu = async (data: CreateServiceUsageData): Promise<ServiceUsage> => {
    try {
        const token = getToken();
        const response = await api.post('/su-dung-dich-vu', data, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data.data; // Assuming API returns { status: 'success', data: serviceUsageObject }
    } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Lỗi khi tạo ghi nhận sử dụng dịch vụ');
    }
};

interface GetAllServiceUsagesParams {
    MaPhong?: number;
    MaDV?: number;
    startDate?: string;
    endDate?: string;
    status?: 'Mới ghi' | 'Đã tính tiền';
    limit?: number;
    offset?: number;
}

export const getAllSuDungDichVu = async (params?: GetAllServiceUsagesParams): Promise<ServiceUsage[]> => {
    try {
        const token = getToken();
        const response = await api.get('/su-dung-dich-vu', {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            params, // Pass parameters for filtering, pagination
        });
        return response.data.data; // Assuming API returns { status: 'success', data: arrayOfServiceUsage }
    } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Lỗi khi lấy danh sách ghi nhận sử dụng dịch vụ');
    }
};

// You might also need update and delete functions for `SuDungDichVu` later,
// especially if the spec allows modifying 'Mới ghi' entries.
/*
export const updateSuDungDichVu = async (id: number, data: Partial<CreateServiceUsageData>): Promise<ServiceUsage> => {
    try {
        const token = getToken();
        const response = await api.patch(`/su-dung-dich-vu/${id}`, data, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Lỗi khi cập nhật ghi nhận sử dụng dịch vụ');
    }
};

export const deleteSuDungDichVu = async (id: number): Promise<void> => {
    try {
        const token = getToken();
        await api.delete(`/su-dung-dich-vu/${id}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
    } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Lỗi khi xóa ghi nhận sử dụng dịch vụ');
    }
};
*/