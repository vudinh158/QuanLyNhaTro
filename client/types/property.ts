import { Room } from './room';
export interface Property {
    MaNhaTro: number;
    MaChuTro: number;
    TenNhaTro: string;
    DiaChi: string;
    GhiChu?: string | null;
    rooms?: Room[];
  }

  export interface NewPropertyData {
    TenNhaTro: string;
    DiaChi: string;
    GhiChu?: string;
  }

  export interface UpdatePropertyData {
    TenNhaTro?: string;
    DiaChi?: string;
    GhiChu?: string;
  }
  
  // export interface Room {
  //   MaPhong: number;
  //   TenPhong: string;
  //   TrangThai: string;
  // }