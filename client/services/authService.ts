import axiosInstance from '@/lib/axios';
import type {
  UserRegisterData,
  UserLoginData,
  AuthResponse,
  OtpResponse
} from '@/types/auth';

/**
 * Gửi OTP về email (hết hạn 10 phút)
 */
export const sendOtp = async (
  email: string
): Promise<OtpResponse> => {
  const res = await axiosInstance.post<OtpResponse>('/auth/send-otp', { email });
  return res.data;
};

/**
 * Xác thực mã OTP đã gửi
 */
export const verifyOtp = async (
  email: string,
  code: string
): Promise<OtpResponse> => {
  const res = await axiosInstance.post<OtpResponse>('/auth/verify-otp', { email, code });
  return res.data;
};

/** Đăng ký chủ trọ sau OTP */
export const registerUser = async (
  userData: UserRegisterData
): Promise<AuthResponse> => {
  const response = await axiosInstance.post<AuthResponse>('/auth/register-landlord', userData);
  return response.data;
};

/** Đăng nhập */
export const loginUser = async (
  credentials: UserLoginData
): Promise<AuthResponse> => {
  const response = await axiosInstance.post<AuthResponse>('/auth/login', credentials);
  return response.data;
};

/** Lấy thông tin người dùng hiện tại */
export const getMe = async (): Promise<AuthResponse> => {
  const response = await axiosInstance.get<AuthResponse>('/auth/me');
  return response.data;
};