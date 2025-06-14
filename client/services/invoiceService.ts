import api from '@/lib/axios';
import { ApiResponse } from '@/types/api';
import { IInvoice, IInvoiceDetail } from '@/types/invoice';
import { IPaymentDetail } from '@/types/payment' // Đảm bảo đã có file client/types/payment.ts
import { format } from 'date-fns';

interface GetInvoicesParams {
    propertyId?: number;
    roomId?: number;
    tenantId?: number;
    status?: 'Chưa thanh toán' | 'Đã thanh toán' | 'Quá hạn' | 'Đã hủy' | 'all'; // Added 'Đã hủy' based on client/types/invoice.ts
    period?: string; // Format YYYY-MM
    search?: string;
}

// Service to fetch invoices for landlord and tenant
export const getInvoices = async (params?: GetInvoicesParams): Promise<IInvoice[]> => {
    try {
        const queryParams: { [key: string]: any } = {};
        if (params?.propertyId) queryParams.propertyId = params.propertyId;
        if (params?.roomId) queryParams.roomId = params.roomId;
        if (params?.tenantId) queryParams.tenantId = params.tenantId;
        if (params?.status && params.status !== 'all') queryParams.status = params.status;
        if (params?.period) queryParams.period = params.period;
        if (params?.search) queryParams.search = params.search;

        // Giả sử server trả về { data: { hoaDons: [...] } } (như đã sửa ở lần trước)
        const response = await api.get<ApiResponse<{ hoaDons: IInvoice[] }>>('/hoa-don', { params: queryParams });
        
        // SỬA LỖI TIỀM TÀNG: Kiểm tra dữ liệu trước khi trả về
        if (response.data && response.data.data && Array.isArray(response.data.data.hoaDons)) {
            return response.data.data.hoaDons;
        }
        
        // Nếu server trả về { data: [...] }, sử dụng dòng dưới đây và thay đổi generic của api.get
        // const response = await api.get<ApiResponse<IInvoice[]>>('/hoa-don', { params: queryParams });
        // if (response.data && Array.isArray(response.data.data)) {
        //     return response.data.data;
        // }

        throw new Error("Cấu trúc dữ liệu hóa đơn trả về không hợp lệ.");

    } catch (error: any) {
        console.error("Error fetching invoices:", error.response?.data || error.message);
        throw new Error(error.response?.data?.message || 'Không thể tải danh sách hóa đơn.');
    }
};

// Service to fetch a single invoice by ID
export const getInvoiceById = async (id: number): Promise<IInvoice> => {
    try {
        // API getHoaDon của server trả về { status: 'success', data: hoaDon }
        const response = await api.get<ApiResponse<{ hoaDon: IInvoice }>>(`/hoa-don/${id}`);
        // Chú ý: Cần thêm include paymentDetails trên backend (hoaDonController) để client có thể sử dụng.
        // Hiện tại, hoaDonController.js chỉ include 'contract' và 'details'.
        // Bạn cần sửa thêm server/controllers/hoaDonController.js và server/models/Invoice.js để include paymentDetails.
        return response.data.data.hoaDon;
    } catch (error: any) {
        console.error(`Error fetching invoice ${id}:`, error.response?.data || error.message);
        throw new Error(error.response?.data?.message || 'Không thể tải chi tiết hóa đơn.');
    }
};

// Service to create a new invoice (manual creation by landlord)
interface CreateInvoicePayload {
    MaHopDong: number;
    // According to client/types/invoice.ts, KyThanhToan is a string like '2025-06-01', but server uses KyThanhToan_TuNgay/DenNgay
    // Assuming server side still expects KyThanhToan_TuNgay and KyThanhToan_DenNgay based on previous server models provided.
    KyThanhToan_TuNgay: string;
    KyThanhToan_DenNgay: string;
    NgayLap: string;
    NgayHanThanhToan: string;
    TongTienPhaiTra: number; // Client-calculated total, backend will re-verify/recalculate
    GhiChu?: string | null;
    details: { // Array of invoice details (line items)
        LoaiChiPhi: IInvoiceDetail['LoaiChiPhi'];
        MoTaChiTiet: string;
        ChiSoCu?: number | null;
        ChiSoMoi?: number | null;
        SoLuong: number;
        DonGia: number;
        ThanhTien: number;
        MaDV_LienQuan?: number | null;
    }[];
}

export const createInvoice = async (data: CreateInvoicePayload): Promise<IInvoice> => {
    try {
        // The backend's /hoa-don POST route should handle saving both HoaDon and ChiTietHoaDon
        const response = await api.post<ApiResponse<{ hoaDon: IInvoice }>>('/hoa-don', data);
        return response.data.data.hoaDon;
    } catch (error: any) {
        console.error("Error creating invoice:", error.response?.data || error.message);
        throw new Error(error.response?.data?.message || 'Không thể tạo hóa đơn.');
    }
};

// Service to record a payment for an invoice (full payment only)
interface CreatePaymentPayload {
    MaHoaDon: number;
    SoTien: number; // As per spec, this will be the total amount due for full payment
    MaPTTT: number;
    MaGiaoDich?: string;
    GhiChu?: string;
}

export const createPayment = async (data: CreatePaymentPayload): Promise<IPaymentDetail> => {
    try {
        // Sửa lỗi ở đây: Thay đổi kiểu Generic của ApiResponse để khớp với cấu trúc backend
        // Backend (chiTietThanhToanController.js) trả về { status: 'success', data: paymentObject }
        const response = await api.post<ApiResponse<IPaymentDetail>>('/chi-tiet-thanh-toan', data);
        return response.data.data as IPaymentDetail; // response.data.data bây giờ sẽ có kiểu IPaymentDetail
    } catch (error: any) {
        console.error("Error creating payment:", error.response?.data || error.message);
        throw new Error(error.response?.data?.message || 'Không thể ghi nhận thanh toán.');
    }
};

// Service to fetch payment methods
export const getPaymentMethods = async (): Promise<{ MaPTTT: number; TenPTTT: string }[]> => {
    try {
        // SỬA LỖI 1: Thay đổi generic để khớp với cấu trúc server trả về { data: [...] }
        const response = await api.get<ApiResponse<{ MaPTTT: number; TenPTTT: string }[]>>('/phuong-thuc-thanh-toan');
        
        // SỬA LỖI 2: Truy cập trực tiếp vào mảng data
        // Dữ liệu đúng nằm trong `response.data.data`
        if (response.data && Array.isArray(response.data.data)) {
            return response.data.data;
        }

        // Nếu không có dữ liệu hoặc không phải mảng, trả về mảng rỗng để tránh lỗi
        console.warn("Dữ liệu phương thức thanh toán trả về không hợp lệ, trả về mảng rỗng.");
        return [];

    } catch (error: any) {
        console.error("Error fetching payment methods:", error.response?.data || error.message);
        throw new Error(error.response?.data?.message || 'Không thể tải phương thức thanh toán.');
    }
};