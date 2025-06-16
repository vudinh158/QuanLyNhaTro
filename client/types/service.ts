export type ServiceType = 'Cố định hàng tháng' | 'Theo số lượng sử dụng' | 'Sự cố/Sửa chữa'; // Corrected values based on server/models/Service.js
export type ServiceStatus = 'Hoạt động' | 'Ngừng hoạt động'; // This type is for display, backend uses boolean from Service.js

export interface IServicePriceHistory {
    MaLichSuDV: number; // Corrected to MaLichSuDV as per ServicePriceHistory.js
    MaDV: number;
    DonGiaCu?: number | null; // Added as per ServicePriceHistory.js (optional)
    DonGiaMoi: number; // Corrected field name based on ServicePriceHistory model
    NgayApDung: string;
}

export interface IService {
    MaDV: number;
    MaChuTro: number;
    TenDV: string;
    LoaiDichVu: ServiceType; // <--- ĐÃ SỬA TÊN THUỘC TÍNH TỪ LoaiDV THÀNH LoaiDichVu
    DonViTinh: string;
    HoatDong: boolean; // Added based on Service model, HoatDong instead of TrangThai
    NgayNgungCungCap?: string | null; // Added based on Service model, optional
    GhiChu?: string | null; // From Service model as TEXT, optional

    appliedToProperties?: { MaNhaTro: number; TenNhaTro: string; }[]; // If applied to multiple properties
    priceHistories?: IServicePriceHistory[]; // From ServicePriceHistory model, fetched in dichVuController.js
}

export interface NewServiceData {
    TenDV: string;
    LoaiDichVu: ServiceType;
    DonViTinh: string;
    MaNhaTro?: number | null;
    DonGia: number; // Initial price to be recorded in history (DonGiaMoi in price history)
    GhiChu?: string | null; // Added GhiChu for creation
    propertyIds?: number[];
}

export interface UpdateServiceData {
    TenDV?: string;
    LoaiDichVu?: ServiceType;
    DonViTinh?: string;
    MaNhaTro?: number | null; // If service can be moved between properties or made global (unlikely for existing)
    HoatDong?: boolean; // To activate/deactivate
    GhiChu?: string | null; // Added as per the error screenshot and model
    propertyIds?: number[];
}