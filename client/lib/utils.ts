export function getToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('authToken'); // Hoặc tên key bạn dùng để lưu token
  }
  return null;
}

import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
