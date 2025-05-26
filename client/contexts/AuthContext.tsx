// apps/client-nextjs/contexts/AuthContext.tsx
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import type { User } from '@/types/auth'; // Import User type bạn đã định nghĩa
import { getMe } from '@/services/authService'; // Service để lấy thông tin user từ token

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (userData: User, authToken: string) => void;
  logout: () => void;
  setUserAndToken: (userData: User | null, authToken: string | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Ban đầu là true để check token
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const storedToken = localStorage.getItem('authToken');
    if (storedToken) {
      setToken(storedToken);
      // Xác thực token và lấy thông tin người dùng
      getMe()
        .then(response => {
          if (response.status === 'success' && response.data?.user) {
            setUser(response.data.user);
          } else {
            // Token không hợp lệ hoặc có lỗi, xóa token
            localStorage.removeItem('authToken');
            setToken(null);
            setUser(null);
          }
        })
        .catch(() => {
          localStorage.removeItem('authToken');
          setToken(null);
          setUser(null);
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setIsLoading(false); // Không có token, không cần load
    }
  }, []);

  const login = (userData: User, authToken: string) => {
    localStorage.setItem('authToken', authToken);
    setUser(userData);
    setToken(authToken);
    // Chuyển hướng dựa trên vai trò sau khi login thành công
    const userRole = userData.vaiTro?.TenVaiTro;
    if (userRole === 'Chủ trọ') {
      router.push("/dashboard");
    } else if (userRole === 'Khách thuê') {
      router.push("/tenant/dashboard");
    } else {
      router.push("/");
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setUser(null);
    setToken(null);
    // Chuyển hướng về trang đăng nhập hoặc trang chủ
    // Kiểm tra để tránh chuyển hướng vô hạn nếu đang ở trang công khai
    if (pathname.startsWith('/dashboard') || pathname.startsWith('/tenant')) {
        router.push('/login');
    }
  };

  const setUserAndToken = (userData: User | null, authToken: string | null) => {
    setUser(userData);
    setToken(authToken);
    if (authToken) {
        localStorage.setItem('authToken', authToken);
    } else {
        localStorage.removeItem('authToken');
    }
  }

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout, setUserAndToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};