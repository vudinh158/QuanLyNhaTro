export interface UserRegisterData {
    TenDangNhap: string;
    MatKhau: string;
    MaVaiTro: number; 
    HoTen: string;
    CCCD?: string;
    SoDienThoai: string;
    NgaySinh?: string; 
    GioiTinh?: 'Nam' | 'Nữ' | 'Khác';
    Email?: string;
    QueQuan?: string;
}

export interface UserLoginData {
    tenDangNhapOrEmail: string;
    matKhau: string;
}
  
export interface UserProfile {
    HoTen?: string;
    CCCD?: string;
    SoDienThoai?: string;
    NgaySinh?: string;
    GioiTinh?: 'Nam' | 'Nữ' | 'Khác';
    Email?: string;
    QueQuan?: string;
    DiaChi?: string;
}

export interface User {
    MaTK: number;
    TenDangNhap: string;
    Email?: string;
    MaVaiTro: number;
    TrangThai: string;
    vaiTro: {
      MaVaiTro: number;
      TenVaiTro: string;
    };
    chuTroProfile?: UserProfile;
    khachThueProfile?: UserProfile;
}
  
export interface AuthResponse {
    status: string;
    token?: string;
    data?: {
      user: User;
    };
    message?: string;
}