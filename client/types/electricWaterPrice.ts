export interface IElectricWaterPrice {
    MaLichSuGiaDienNuoc: number;
    MaNhaTro: number;
    Loai: 'Điện' | 'Nước'; // Or 'Tiền điện' | 'Tiền nước' based on backend enum
    DonGiaMoi: number;
    NgayApDung: string;
}

export interface NewElectricWaterPriceData {
    MaNhaTro: number;
    Loai: 'Điện' | 'Nước';
    DonGiaMoi: number;
    NgayApDung: Date;
  }