// clone nhatro/client/services/roomTypeService.ts
import axiosInstance from '@/lib/axios';
import type { RoomType, NewRoomTypeData, UpdateRoomTypeData } from '@/types/roomType';
import type { ApiResponse } from '@/types/api';

export const getRoomTypesByPropertyId = async (propertyId: number): Promise<RoomType[]> => {
  try {
    const response = await axiosInstance.get<ApiResponse<{ roomTypes: RoomType[] }>>(`/properties/${propertyId}/room-types`);
    return response.data.data.roomTypes;
  } catch (error: any) {
    console.error(`Error fetching room types for property ${propertyId}:`, error);
    throw new Error(error.response?.data?.message || error.message || 'Không thể tải danh sách loại phòng.');
  }
};

export const getRoomTypeById = async (roomTypeId: number): Promise<RoomType> => {
  try {
    const response = await axiosInstance.get<ApiResponse<{ roomType: RoomType }>>(`/room-types/${roomTypeId}`);
    return response.data.data.roomType;
  } catch (error: any) {
    console.error(`Error fetching room type ${roomTypeId}:`, error);
    throw new Error(error.response?.data?.message || error.message || 'Không thể tải thông tin loại phòng.');
  }
};

export const createRoomType = async (propertyId: number, roomTypeData: NewRoomTypeData): Promise<RoomType> => {
  try {
    const response = await axiosInstance.post<ApiResponse<{ roomType: RoomType }>>(`/properties/${propertyId}/room-types`, roomTypeData);
    return response.data.data.roomType;
  } catch (error: any) {
    console.error(`Error creating room type for property ${propertyId}:`, error);
    throw new Error(error.response?.data?.message || error.message || 'Không thể tạo loại phòng mới.');
  }
};

export const updateRoomType = async (roomTypeId: number, updateData: UpdateRoomTypeData): Promise<RoomType> => {
  try {
    const response = await axiosInstance.patch<ApiResponse<{ roomType: RoomType }>>(`/room-types/${roomTypeId}`, updateData);
    return response.data.data.roomType;
  } catch (error: any) {
    console.error(`Error updating room type ${roomTypeId}:`, error);
    throw new Error(error.response?.data?.message || error.message || 'Không thể cập nhật loại phòng.');
  }
};

export const deleteRoomType = async (roomTypeId: number): Promise<void> => {
  try {
    await axiosInstance.delete(`/room-types/${roomTypeId}`);
  } catch (error: any) {
    console.error(`Error deleting room type ${roomTypeId}:`, error);
    throw new Error(error.response?.data?.message || error.message || 'Không thể xóa loại phòng.');
  }
};