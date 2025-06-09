export interface IPaymentDetail {
    MaThanhToan: number;
    MaHoaDon: number;
    SoTien: number;
    NgayThanhToan: string;
    MaPTTT: number; // Mã phương thức thanh toán
    MaGiaoDich?: string | null; // Mã giao dịch (ví dụ: mã giao dịch ngân hàng)
    GhiChu?: string | null;
    paymentMethod?: { // Thông tin phương thức thanh toán được include từ backend
      MaPTTT: number;
      TenPTTT: string;
    };
}