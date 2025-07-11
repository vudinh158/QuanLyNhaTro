// file: clone nhatro/client/types/contract.ts
import { Room } from './room';
import { Property } from './property';
import { Tenant } from './tenant';
import { IService } from './service';
import { IOccupant } from './occupant';

// Dữ liệu Người ở cùng trả về từ API


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
  TrangThai?: 'Mới tạo' | 'Có hiệu lực' | 'Hết hiệu lực' | 'Đã thanh lý'; // Make TrangThai optional
  GhiChu?: string;
  
  // Update occupants to allow either existing tenant ID or new tenant data
  occupants: ({
    MaKhachThue: number; // For existing tenant
    LaNguoiDaiDien: boolean;
  } | {
    isNew: true; // Flag for new tenant
    HoTen: string;
    SoDienThoai: string;
    CCCD?: string;
    Email?: string;
    GioiTinh?: 'Nam' | 'Nữ' | 'Khác';
    QueQuan?: string;
    LaNguoiDaiDien: boolean;
  })[];

  registeredServices: number[];
}