import axiosInstance from '@/lib/axios';
import type { Room, RoomType, NewRoomData, UpdateRoomData } from '@/types/room';

interface ApiResponse<T> {
  status: string;
  results?: number;
  data: {
    [key: string]: T | T[] | any;
  };
  message?: string;
}

export const getAllRoomTypes = async (): Promise<RoomType[]> => {
  try {
    const response = await axiosInstance.get<ApiResponse<RoomType[]>>('/rooms/types');
    return response.data.data.roomTypes as RoomType[];
  } catch (error: any) {
    console.error("Error fetching room types:", error);
    throw new Error(error.response?.data?.message || error.message || 'Không thể tải danh sách loại phòng.');
  }
};

export const getRoomsByProperty = async (propertyId: number): Promise<Room[]> => {
  try {
    const response = await axiosInstance.get<ApiResponse<Room[]>>(`/rooms/property/${propertyId}`);
    return response.data.data.rooms as Room[];
  } catch (error: any) {
    console.error(`Error fetching rooms for property ${propertyId}:`, error);
    throw new Error(error.response?.data?.message || error.message || 'Không thể tải danh sách phòng.');
  }
};

export const getRoomById = async (roomId: number): Promise<Room> => {
  try {
    const response = await axiosInstance.get<ApiResponse<Room>>(`/rooms/${roomId}`);
    return response.data.data.room as Room;
  } catch (error: any) {
    console.error(`Error fetching room ${roomId}:`, error);
    throw new Error(error.response?.data?.message || error.message || 'Không thể tải thông tin phòng.');
  }
};

export const createRoom = async (roomData: NewRoomData): Promise<Room> => {
  try {
    const response = await axiosInstance.post<ApiResponse<Room>>('/rooms', roomData);
    return response.data.data.room as Room;
  } catch (error: any) {
    console.error("Error creating room:", error);
    throw new Error(error.response?.data?.message || error.message || 'Không thể tạo phòng mới.');
  }
};

export const updateRoom = async (roomId: number, roomData: UpdateRoomData): Promise<Room> => {
  try {
    const response = await axiosInstance.patch<ApiResponse<Room>>(`/rooms/${roomId}`, roomData);
    return response.data.data.room as Room;
  } catch (error: any) {
    console.error(`Error updating room ${roomId}:`, error);
    throw new Error(error.response?.data?.message || error.message || 'Không thể cập nhật thông tin phòng.');
  }
};

export const deleteRoom = async (roomId: number): Promise<void> => {
  try {
    await axiosInstance.delete(`/rooms/${roomId}`);
  } catch (error: any) {
    console.error(`Error deleting room ${roomId}:`, error);
    throw new Error(error.response?.data?.message || error.message || 'Không thể xóa phòng.');
  }
};