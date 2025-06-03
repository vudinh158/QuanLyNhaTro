"use client";

import type React from "react"; // Không cần thiết với Next.js mới
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { loginUser } from '@/services/authService';
import type { UserLoginData } from '@/types/auth';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const [tenDangNhapOrEmail, setTenDangNhapOrEmail] = useState("");
  const [matKhau, setMatKhau] = useState("");
  const { login: contextLogin } = useAuth();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const credentials: UserLoginData = {
      tenDangNhapOrEmail,
      matKhau,
    };

    try {
        const response = await loginUser(credentials);
        console.log("LoginPage: API Response:", response); // DEBUG
        toast({
          title: "Đăng nhập thành công",
          description: response.message || "Chào mừng bạn quay trở lại!",
        });
  
        if (response.token && response.data?.user) {
          localStorage.setItem('token', response.token)
          console.log("LoginPage: Calling contextLogin with user:", response.data.user, "and token:", response.token); // DEBUG
          contextLogin(response.data.user, response.token);
        } else {
           console.error("LoginPage: Missing token or user data in response", response); // DEBUG
           toast({
              title: "Đăng nhập thất bại",
              description: response.message || "Không nhận được thông tin xác thực từ server.",
              variant: "destructive",
            });
        }
      } catch (error: any) {
        console.error("LoginPage: Login API error:", error); // DEBUG
        toast({
          title: "Đăng nhập thất bại",
          description: error.message || "Tên đăng nhập, email hoặc mật khẩu không đúng.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">Đăng nhập</CardTitle>
          <CardDescription>Nhập thông tin đăng nhập của bạn để tiếp tục</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="tenDangNhapOrEmail">Tên đăng nhập hoặc Email *</Label>
              <Input
                id="tenDangNhapOrEmail"
                placeholder="Nhập tên đăng nhập hoặc email"
                required
                value={tenDangNhapOrEmail}
                onChange={(e) => setTenDangNhapOrEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Mật khẩu *</Label>
                {/* <Link href="/auth/forgot-password" // Đảm bảo route này tồn tại nếu bạn có chức năng quên mật khẩu
                  className="text-xs text-primary hover:underline">
                  Quên mật khẩu?
                </Link> */}
              </div>
              <Input
                id="password"
                type="password"
                placeholder="Nhập mật khẩu"
                required
                value={matKhau}
                onChange={(e) => setMatKhau(e.target.value)}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
            </Button>
            <div className="text-center text-sm">
              Chưa có tài khoản?{" "}
              <Link href="/register" className="text-primary hover:underline">
                Đăng ký
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}