
import { Tenant } from './tenant';

export interface IOccupant {
    MaNguoiOCung: number;
    MaHopDong: number;
    MaKhachThue: number;
    LaNguoiDaiDien: boolean;
    tenant: Tenant; // Lồng thông tin Khách thuê
  }