import axiosInstance from '@/lib/axios';
import type { UserLoginData, UserRegisterData, AuthResponse } from '@/types/auth';

export const registerUser = async (userData: UserRegisterData): Promise<AuthResponse> => {
  try {
    const response = await axiosInstance.post('/auth/register', userData);
    return response.data;
  } catch (error: any) {
    if (error.response && error.response.data) {
      throw new Error(error.response.data.message || error.response.data.error || 'Lỗi đăng ký');
    }
    throw new Error('Lỗi kết nối hoặc lỗi không xác định khi đăng ký.');
  }
};

export const loginUser = async (credentials: UserLoginData): Promise<AuthResponse> => {
  try {
    const response = await axiosInstance.post('/auth/login', credentials);
    return response.data;
  } catch (error: any) {
    if (error.response && error.response.data) {
      throw new Error(error.response.data.message || error.response.data.error || 'Lỗi đăng nhập');
    }
    throw new Error('Lỗi kết nối hoặc lỗi không xác định khi đăng nhập.');
  }
};

export const getMe = async (): Promise<AuthResponse> => {
    try {
        const response = await axiosInstance.get('/auth/me');
        return response.data;
    } catch (error: any) {
        if (error.response && error.response.data) {
            throw new Error(error.response.data.message || 'Không thể lấy thông tin người dùng.');
        }
        throw new Error('Lỗi kết nối hoặc lỗi không xác định.');
    }
};