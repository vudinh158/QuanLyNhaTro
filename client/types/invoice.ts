// file: client/types/invoice.ts

import type { IContract } from './contract';
import type { Room } from './room';

// Định nghĩa cấu trúc cho một Hóa đơn
export interface IInvoice {
    MaHoaDon: number;
    MaHopDong: number;
    KyThanhToan: string; // Ví dụ: '2025-06-01'
    TuNgay: string;
    DenNgay: string;
    TongTienPhaiTra: number;
    TrangThaiThanhToan: 'Chưa thanh toán' | 'Đã thanh toán' | 'Quá hạn' | 'Đã hủy';
    NgayHanThanhToan: string;
    NgayThanhToan?: string;
    GhiChu?: string;

    // Dữ liệu được đính kèm (include) từ backend
    contract?: IContract;
    room?: Room; // Mặc dù phòng có thể lấy qua hợp đồng, đôi khi có thể include trực tiếp
}

// Định nghĩa cấu trúc cho chi tiết một hóa đơn
export interface IInvoiceDetail {
    MaChiTiet: number;
    MaHoaDon: number;
    LoaiChiPhi: 'Tiền phòng' | 'Điện' | 'Nước' | 'Dịch vụ cố định' | 'Dịch vụ sử dụng' | 'Khác';
    MoTaChiTiet: string;
    ChiSoCu?: number;
    ChiSoMoi?: number;
    SoLuong: number;
    DonGia: number;
    ThanhTien: number;
}