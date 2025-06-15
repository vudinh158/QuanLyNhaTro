// clone nhatro/client/types/serviceUsage.ts
import { IService } from './service'; // Đảm bảo đã import IService

export interface IServiceUsage {
    MaSuDungDV: number;
    MaPhong: number;
    MaDV: number;
    NgaySuDung: string; // YYYY-MM-DD
    SoLuong: number;
    DonGia: string; // Sử dụng string để giữ định dạng tiền tệ
    ThanhTien?: string; // Tính toán trên backend
    MaHoaDon?: number | null; // Có thể null nếu chưa tính vào hóa đơn
    GhiChu?: string | null;
    // Associated data
    service?: IService; // Thông tin chi tiết dịch vụ
}