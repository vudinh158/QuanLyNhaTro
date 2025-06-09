import api from '@/lib/axios';
import { ApiResponse } from '@/types/api';
import { IContract, IContractPayload } from '@/types/contract';

// Lấy danh sách hợp đồng (có thể lọc)
// SỬA ĐỔI: Thay đổi tên tham số `roomId` thành `MaPhong`
export const getContracts = async (params?: { MaPhong?: string, status?: string, search?: string }): Promise<IContract[]> => {
  const response = await api.get<ApiResponse<{ contracts: IContract[] }>>('/contracts', { params });
  return response.data.data.contracts;
};

// Lấy chi tiết một hợp đồng bằng ID
export const getContractById = async (id: number, user: any): Promise<IContract> => { // Added user param for consistency
  const response = await api.get<ApiResponse<{ contract: IContract }>>(`/contracts/${id}`);
  return response.data.data.contract;
};

// Tạo một hợp đồng mới
export const createContract = async (data: IContractPayload): Promise<IContract> => {
  const response = await api.post<ApiResponse<{ contract: IContract }>>('/contracts', data);
  return response.data.data.contract;
};

// Cập nhật một hợp đồng (bạn cần tạo route và controller cho việc này ở backend)
export const updateContract = async (id: number, data: IContractPayload): Promise<IContract> => {
    const response = await api.patch<ApiResponse<{ contract: IContract }>>(`/contracts/${id}`, data);
    return response.data.data.contract;
};

// Thanh lý (chấm dứt) một hợp đồng
export const terminateContract = async (id: number): Promise<IContract> => {
  const response = await api.post<ApiResponse<{ contract: IContract }>>(`/contracts/${id}/terminate`);
  return response.data.data.contract;
};