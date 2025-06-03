// apps/client-nextjs/types/tenant.ts
import type { User } from './auth'; // Giả sử bạn có UserAccount type

export interface Tenant {
  MaKhachThue: number;
  MaTK?: number | null; // Khóa ngoại đến UserAccount
  HoTen: string;
  CCCD?: string | null;
  SoDienThoai: string;
  Email?: string | null;
  NgaySinh?: string | null; // Format YYYY-MM-DD
  GioiTinh?: 'Nam' | 'Nữ' | 'Khác' | null;
  QueQuan?: string | null;
  GhiChu?: string | null;
  AnhGiayTo?: string | null;
  TrangThai: 'Đang thuê' | 'Đã rời đi';

  // Thông tin được include từ backend
  userAccount?: Partial<User>; // Thông tin tài khoản nếu có
  // Thông tin về phòng/hợp đồng hiện tại nếu API trả về
  currentRoom?: {
      TenPhong?: string;
      property?: { TenNhaTro?: string };
  } | null;
   occupancies?: any[]; // Dữ liệu từ bảng NguoiOCung nếu cần
}

export interface NewTenantData {
  HoTen: string;
  SoDienThoai: string;
  CCCD?: string;
  Email?: string;
  NgaySinh?: string;
  GioiTinh?: 'Nam' | 'Nữ' | 'Khác';
  QueQuan?: string;
  GhiChu?: string;
  AnhGiayTo?: string; // Có thể là URL sau khi upload
  TrangThai?: 'Đang thuê' | 'Đã rời đi' | 'Tiềm năng';

  // Thông tin để tạo UserAccount nếu có
  TenDangNhap?: string;
  MatKhau?: string;
  // MaVaiTro sẽ được set ở backend là "Khách thuê" nếu tạo tài khoản
}

export interface UpdateTenantData {
  HoTen?: string;
  CCCD?: string;
  SoDienThoai?: string;
  Email?: string;
  NgaySinh?: string;
  GioiTinh?: 'Nam' | 'Nữ' | 'Khác';
  QueQuan?: string;
  GhiChu?: string;
  AnhGiayTo?: string;
  TrangThai?: 'Đang thuê' | 'Đã rời đi' | 'Tiềm năng';
  // Có thể có các trường để cập nhật thông tin tài khoản nếu cần
}