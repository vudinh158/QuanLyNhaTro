import axiosInstance from '@/lib/axios';
import type { OtpResponse, UserRegisterData, AuthResponse } from '@/types/auth';

/** Gửi OTP */
export const sendOtp = async (email: string): Promise<OtpResponse> => {
  const res = await axiosInstance.post<OtpResponse>('/auth/send-otp', { email });
  return res.data;
};

/** Xác thực OTP */
export const verifyOtp = async (
    code: string,
    otpToken: string // Thay `email` bằng `otpToken`
  ): Promise<OtpResponse> => {
    // Gửi `code` và `otpToken` lên server
    const res = await axiosInstance.post<OtpResponse>('/auth/verify-otp', { code, otpToken });
    return res.data;
  };

/** Đăng ký Chủ Trọ sau OTP */
export const registerUser = async (data: UserRegisterData): Promise<AuthResponse> => {
  const res = await axiosInstance.post<AuthResponse>('/auth/register-landlord', data);
  return res.data;
};

/** Đăng nhập */
export const loginUser = async (credentials: any): Promise<AuthResponse> => {
  const res = await axiosInstance.post<AuthResponse>('/auth/login', credentials);
  return res.data;
};

/** Lấy profile */
export const getMe = async (): Promise<AuthResponse> => {
  const res = await axiosInstance.get<AuthResponse>('/auth/me');
  return res.data;
};