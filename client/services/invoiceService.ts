// clone nhatro/client/services/invoiceService.ts

import api from '@/lib/axios';
import { ApiResponse } from '@/types/api';
import { IInvoice, IInvoiceDetail } from '@/types/invoice';
import { IPaymentDetail } from '@/types/payment';
import { format } from 'date-fns';

interface GetInvoicesParams {
    propertyId?: number;
    roomId?: number;
    tenantId?: number;
    status?: 'Chưa thanh toán' | 'Đã thanh toán' | 'Quá hạn' | 'Đã hủy' | 'all';
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

        const response = await api.get<ApiResponse<{ hoaDons: IInvoice[] }>>('/hoa-don', { params: queryParams });

        if (response.data && response.data.data && Array.isArray(response.data.data.hoaDons)) {
            return response.data.data.hoaDons;
        }

        throw new Error("Cấu trúc dữ liệu hóa đơn trả về không hợp lệ.");

    } catch (error: any) {
        console.error("Error fetching invoices:", error.response?.data || error.message);
        throw new Error(error.response?.data?.message || 'Không thể tải danh sách hóa đơn.');
    }
};

// Service to fetch a single invoice by ID
export const getInvoiceById = async (id: number): Promise<IInvoice> => {
    try {

        const response = await api.get<ApiResponse<IInvoice>>(`/hoa-don/${id}`);


        console.log("Response data:", response.data);
        return response.data.data; //
    } catch (error: any) {
        console.error(`Error fetching invoice ${id}:`, error.response?.data || error.message);
        throw new Error(error.response?.data?.message || 'Không thể tải chi tiết hóa đơn.');
    }
};

// Service to create a new invoice (manual creation by landlord)
interface CreateInvoicePayload {
    MaHopDong: number;
    KyThanhToan_TuNgay: string;
    KyThanhToan_DenNgay: string;
    NgayLap: string;
    NgayHanThanhToan: string;
    TongTienPhaiTra: number;
    GhiChu?: string | null;
    details: {
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
    SoTien: number;
    MaPTTT: number;
    MaGiaoDich?: string;
    GhiChu?: string;
}

export const createPayment = async (data: CreatePaymentPayload): Promise<IPaymentDetail> => {
    try {
        const response = await api.post<ApiResponse<IPaymentDetail>>('/chi-tiet-thanh-toan', data);
        return response.data.data as IPaymentDetail;
    } catch (error: any) {
        console.error("Error creating payment:", error.response?.data || error.message);
        throw new Error(error.response?.data?.message || 'Không thể ghi nhận thanh toán.');
    }
};

// Service to fetch payment methods
export const getPaymentMethods = async (): Promise<{ MaPTTT: number; TenPTTT: string }[]> => {
    try {
        const response = await api.get<ApiResponse<{ MaPTTT: number; TenPTTT: string }[]>>('/phuong-thuc-thanh-toan');

        if (response.data && Array.isArray(response.data.data)) {
            return response.data.data;
        }

        console.warn("Dữ liệu phương thức thanh toán trả về không hợp lệ, trả về mảng rỗng.");
        return [];

    } catch (error: any) {
        console.error("Error fetching payment methods:", error.response?.data || error.message);
        throw new Error(error.response?.data?.message || 'Không thể tải phương thức thanh toán.');
    }
};