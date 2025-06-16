// apps/client-nextjs/types/room.ts
import type { Property } from './property';
import type { IContract } from './contract';
export interface RoomType {
  MaLoaiPhong: number;
  TenLoai: string;
  Gia?: number;
  DienTich?: number;
  SoNguoiToiDa?: number;
  MoTa?: string | null;
}

export interface Room {
  MaPhong: number;
  MaNhaTro: number;
  MaLoaiPhong: number;
  TenPhong: string;
  TrangThai: 'Còn trống' | 'Đang thuê' | 'Đang sửa chữa' | 'Khác';
  GhiChu?: string | null;
  roomType?: Partial<RoomType>; 
  property?: Partial<Property>; 
  contracts?: IContract[];
}

export interface NewRoomData {
  MaNhaTro: number;
  MaLoaiPhong: number;
  TenPhong: string;
  TrangThai?: 'Còn trống' | 'Đang thuê' | 'Đang sửa chữa' | 'Khác';
  GhiChu?: string;
}

export interface UpdateRoomData {
  MaLoaiPhong?: number;
  TenPhong?: string;
  TrangThai?: 'Còn trống' | 'Đang thuê' | 'Đang sửa chữa' | 'Khác';
  GhiChu?: string;
}