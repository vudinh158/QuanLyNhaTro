import type { IContract } from './contract';
import type { Room } from './room';
import type { IPaymentDetail } from './payment'; // Assuming you have a payment type

// Định nghĩa cấu trúc cho một Hóa đơn
export interface IInvoice {
    MaHoaDon: number;
    MaHopDong: number;
    KyThanhToan: string; // Ví dụ: '2025-06-01' (This seems to be a date for the period start)
    TuNgay: string; // Start date of the billing period
    DenNgay: string; // End date of the billing period
    TongTienPhaiTra: number;
    TrangThaiThanhToan: 'Chưa thanh toán' | 'Đã thanh toán' | 'Quá hạn' | 'Đã hủy';
    NgayHanThanhToan: string;
    NgayThanhToan?: string | null; // Date when the invoice was fully paid (optional)
    GhiChu?: string | null;

    // Dữ liệu được đính kèm (include) từ backend
    contract?: IContract;
    room?: Room; // Mặc dù phòng có thể lấy qua hợp đồng, đôi khi có thể include trực tiếp
    details?: IInvoiceDetail[]; // Details from ChiTietHoaDon
    paymentDetails?: IPaymentDetail[]; // Payment history for this invoice (assuming this is still desired via include)
}

// Định nghĩa cấu trúc cho chi tiết một hóa đơn
export interface IInvoiceDetail {
    MaChiTiet: number;
    MaHoaDon: number;
    LoaiChiPhi: 'Tiền phòng' | 'Điện' | 'Nước' | 'Dịch vụ cố định' | 'Dịch vụ sử dụng' | 'Khác';
    MoTaChiTiet: string;
    ChiSoCu?: number | null; // Old reading for utilities
    ChiSoMoi?: number | null; // New reading for utilities
    SoLuong: number;
    DonGia: number;
    ThanhTien: number;
}