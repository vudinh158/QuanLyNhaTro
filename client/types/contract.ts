// file: client/types/contract.ts

import { Room } from './room';
import { Property } from './property';
import { Tenant } from './tenant';
import { IService } from './service';

// Dữ liệu Người ở cùng trả về từ API
export interface IOccupant {
  MaNguoiOCung: number;
  MaHopDong: number;
  MaKhachThue: number;
  LaNguoiDaiDien: boolean;
  tenant: Tenant; // Lồng thông tin Khách thuê
}

// Dữ liệu Hợp đồng chi tiết trả về từ API
export interface IContract {
  MaHopDong: number;
  MaPhong: number;
  NgayLap: string;
  NgayBatDau: string;
  NgayKetThuc: string;
  TienCoc: number;
  TienThueThoaThuan: number;
  KyThanhToan: 'Đầu kỳ' | 'Cuối kỳ';
  HanThanhToan: number;
  TrangThai: 'Mới tạo' | 'Có hiệu lực' | 'Hết hiệu lực' | 'Đã thanh lý';
  FileHopDong?: string;
  GhiChu?: string;
  createdAt?: string;
  updatedAt?: string;

  // Dữ liệu liên quan được include
    room: Room;
    property: Property;
  occupants: IOccupant[];
  registeredServices: IService[];
}

// Dữ liệu để tạo hoặc cập nhật hợp đồng
export interface IContractPayload {
  MaPhong: number;
  NgayLap: string;
  NgayBatDau: string;
  NgayKetThuc: string;
  TienCoc: number;
  TienThueThoaThuan: number;
  KyThanhToan: 'Đầu kỳ' | 'Cuối kỳ';
  HanThanhToan: number;
  TrangThai: 'Mới tạo' | 'Có hiệu lực' | 'Hết hiệu lực' | 'Đã thanh lý';
  GhiChu?: string;
  
  occupants: {
    MaKhachThue: number;
    LaNguoiDaiDien: boolean;
  }[];

  registeredServices: number[];
}