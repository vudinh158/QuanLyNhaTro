import type { Room } from './room'; // Assuming Room type is defined and can be imported

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