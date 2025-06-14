// clone nhatro/client/types/roomType.ts
export interface RoomType {
    MaLoaiPhong: number;
    MaNhaTro: number;
    TenLoai: string;
    Gia: number;
    DienTich?: number | null;
    MoTa?: string | null;
}

export interface NewRoomTypeData {
    TenLoai: string;
    Gia: number;
    DienTich?: number;
    MoTa?: string;
    // MaNhaTro sẽ được thêm tự động từ URL trên frontend
}

export interface UpdateRoomTypeData {
    TenLoai?: string;
    Gia?: number;
    DienTich?: number;
    MoTa?: string;
}