// file: client/types/notification.ts
export interface INotification {
    MaThongBao: number;
    LoaiNguoiGui: 'Chủ trọ' | 'Khách thuê';
    MaNguoiGui: number;
    TieuDe: string;
    NoiDung: string;
    ThoiGianGui: string;
    isRead?: boolean;
}
  
export interface INotificationReadStatus {
      MaThongBao: number;
      DaDoc: boolean;
      notification: INotification;
}
  
export interface ICreateNotificationPayload {
    TieuDe: string;
    NoiDung: string;
    // LoaiNguoiNhan sẽ được xác định ở form, ví dụ gửi cho khách thuê thì giá trị là 'Khách thuê'
    LoaiNguoiNhan: 'Chủ trọ' | 'Khách thuê';
    // Một trong các trường này sẽ có giá trị, tùy thuộc vào đối tượng nhận
    MaNhaTroNhan?: number;
    MaPhongNhan?: number;
    MaNguoiNhan?: number;
}