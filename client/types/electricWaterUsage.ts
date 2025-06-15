import type { Room } from './room'; // Assuming Room type is defined and can be imported
import type { IContract } from './contract';
export interface ElectricWaterUsage {
    MaDienNuoc: number;
    MaPhong: number;
    Loai: 'Điện' | 'Nước';
    ChiSoDau: number;
    ChiSoCuoi: number;
    SoLuongTieuThu: number;
    DonGia: number;
    ThanhTien: number;
    NgayGhi: string; // ISO 8601 date string
    MaHoaDon?: number | null; // Nullable if not yet invoiced
    TrangThai: 'Mới ghi' | 'Đã tính tiền' | 'Đã hủy';
    GhiChu?: string | null;
    room?: Room; // Include room details if backend provides them
}

export interface CreateElectricWaterUsageData {
    MaPhong: number;
    Loai: 'Điện' | 'Nước';
    ChiSoDau: number;
    ChiSoCuoi: number;
    NgayGhi: string; // YYYY-MM-DD
    GhiChu?: string;
}

export interface IElectricWaterUsage {
    MaDienNuoc: number;
    MaPhong: number;
    Loai: 'Điện' | 'Nước';
    ChiSoDau: number; // API trả về number
    ChiSoCuoi: number; // API trả về number
    SoLuongTieuThu: number; // API trả về number
    DonGia: string; // API trả về string "3800.00"
    ThanhTien: string; // API trả về string "247000.00"
    NgayGhi: string; // "YYYY-MM-DD"
    MaHoaDon: number | null; // Có thể null nếu chưa được tính tiền vào hóa đơn
    TrangThai: 'Mới ghi' | 'Đã tính tiền'; // API trả về "Đã tính tiền"
    GhiChu?: string | null;

    // Các mối quan hệ (associations)
    room?: Room & { // Mở rộng IRoom để bao gồm contracts và property nếu cần
        property?: {
            MaNhaTro: number;
            TenNhaTro: string;
            MaChuTro: number;
            DiaChi: string;
            GhiChu?: string | null;
        },
        contracts?: IContract[]; // Có thể là IContract[] hoặc chỉ một phần của IContract
    };
}