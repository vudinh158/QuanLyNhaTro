// clone nhatro/client/services/roomTypeService.ts
import axiosInstance from '@/lib/axios';
import type { RoomType, NewRoomTypeData, UpdateRoomTypeData } from '@/types/roomType';
import type { ApiResponse } from '@/types/api';

// Lấy danh sách loại phòng của một nhà trọ
export const getRoomTypesByProperty = async (propertyId: number): Promise<RoomType[]> => {
  const response = await axiosInstance.get<ApiResponse<{ roomTypes: RoomType[] }>>(`/room-types/property/${propertyId}`);
  return response.data.data.roomTypes;
};

// Lấy chi tiết một loại phòng
export const getRoomTypeById = async (id: number): Promise<RoomType> => {
  const response = await axiosInstance.get<ApiResponse<{ roomType: RoomType }>>(`/room-types/${id}`);
  return response.data.data.roomType;
};

// Tạo loại phòng mới
export const createRoomType = async (data: NewRoomTypeData): Promise<RoomType> => {
  const response = await axiosInstance.post<ApiResponse<{ roomType: RoomType }>>('/room-types', data);
  return response.data.data.roomType;
};

// Cập nhật loại phòng
export const updateRoomType = async (id: number, data: UpdateRoomTypeData): Promise<RoomType> => {
  const response = await axiosInstance.patch<ApiResponse<{ roomType: RoomType }>>(`/room-types/${id}`, data);
  return response.data.data.roomType;
};

// Xóa loại phòng
export const deleteRoomType = async (id: number): Promise<void> => {
  await axiosInstance.delete(`/room-types/${id}`);
};