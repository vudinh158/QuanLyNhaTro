export interface IElectricWaterPrice {
    MaLichSuGiaDienNuoc: number;
    MaNhaTro: number;
    LoaiChiPhi: 'Điện' | 'Nước'; // Or 'Tiền điện' | 'Tiền nước' based on backend enum
    DonGiaMoi: number;
    NgayApDung: string;
    GhiChu?: string | null;
}

// file: client/services/electricWaterPriceService.ts
