export type ServiceType = 'Điện' | 'Nước' | 'Xe' | 'Rác' | 'Wifi' | 'Khác';
export type ServiceStatus = 'Đang áp dụng' | 'Ngừng áp dụng';

export interface IServicePriceHistory {
    MaLichSuGia: number;
    MaDV: number;
    DonGia: number;
    NgayApDung: string;
}

export interface IService {
    MaDV: number;
    TenDV: string;
    LoaiDV: ServiceType;
    DonViTinh: string;
    TrangThai: ServiceStatus;
    MaNhaTro: number;
    LichSuGiaDichVuGanNhat?: IServicePriceHistory[];
}