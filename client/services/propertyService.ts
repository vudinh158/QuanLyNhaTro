import axiosInstance from '@/lib/axios';
import type { Property, NewPropertyData, UpdatePropertyData } from '@/types/property';
import type { ApiResponse } from '@/types/api';

export const getMyProperties = async (queryParams?: { search?: string, status?: string }): Promise<Property[]> => {
  try {
    const response = await axiosInstance.get<ApiResponse<Property[]>>('/properties', { params: queryParams });
    return response.data.data.properties as Property[];
  } catch (error: any) {
    console.error("Error fetching properties:", error);
    throw new Error(error.response?.data?.message || error.message || 'Không thể tải danh sách nhà trọ.');
  }
};

export const getPropertyById = async (propertyId: number): Promise<Property> => {
  try {
    const response = await axiosInstance.get<ApiResponse<{ property: Property }>>(`/properties/${propertyId}`);
    return response.data.data.property as Property;
  } catch (error: any) {
    console.error(`Error fetching property ${propertyId}:`, error);
    throw new Error(error.response?.data?.message || error.message || 'Không thể tải thông tin nhà trọ.');
  }
};

export const createProperty = async (propertyData: NewPropertyData): Promise<Property> => {
  try {
    const response = await axiosInstance.post<ApiResponse<Property>>('/properties', propertyData);
    return response.data.data.property as Property;
  } catch (error: any) {
    console.error("Error creating property:", error);
    throw new Error(error.response?.data?.message || error.message || 'Không thể tạo nhà trọ mới.');
  }
};

export const updateProperty = async (propertyId: number, propertyData: UpdatePropertyData): Promise<Property> => {
  try {
    const response = await axiosInstance.patch<ApiResponse<Property>>(`/properties/${propertyId}`, propertyData);
    return response.data.data.property as Property;
  } catch (error: any) {
    console.error(`Error updating property ${propertyId}:`, error);
    throw new Error(error.response?.data?.message || error.message || 'Không thể cập nhật nhà trọ.');
  }
};

export const deleteProperty = async (propertyId: number): Promise<void> => {
  try {
    await axiosInstance.delete(`/properties/${propertyId}`);
  } catch (error: any) {
    console.error(`Error deleting property ${propertyId}:`, error);
    throw new Error(error.response?.data?.message || error.message || 'Không thể xóa nhà trọ.');
  }
};