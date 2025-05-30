"use client";

import type React from "react"; // Không cần thiết với Next.js mới, nhưng giữ lại cũng không sao
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast"; // Đảm bảo import đúng từ thư mục ui
import { registerUser } from '@/services/authService';
import type { UserRegisterData } from '@/types/auth';

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const [tenDangNhap, setTenDangNhap] = useState("");
  const [matKhau, setMatKhau] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loaiTaiKhoan, setLoaiTaiKhoan] = useState<'Chủ trọ' | 'Khách thuê'>("Khách thuê");
  const [hoTen, setHoTen] = useState("");
  const [cccd, setCccd] = useState("");
  const [ngaySinh, setNgaySinh] = useState(""); // Format YYYY-MM-DD
  const [gioiTinh, setGioiTinh] = useState<'Nam' | 'Nữ' | 'Khác' | undefined>(undefined);
  const [soDienThoai, setSoDienThoai] = useState("");
  const [email, setEmail] = useState("");
  const [queQuan, setQueQuan] = useState(""); // Cho Khách thuê

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    if (matKhau !== confirmPassword) {
      toast({
        title: "Lỗi",
        description: "Mật khẩu xác nhận không khớp.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    // Backend service `register` của bạn mong muốn MaVaiTro là number
    // Giả sử: 2 là Chủ trọ, 3 là Khách thuê (cần map từ string 'Chủ trọ'/'Khách thuê')
    let maVaiTroValue: number;
    if (loaiTaiKhoan === 'Chủ trọ') {
      maVaiTroValue = 2; // Cần đảm bảo giá trị này khớp với MaVaiTro trong CSDL của bạn
    } else if (loaiTaiKhoan === 'Khách thuê') {
      maVaiTroValue = 3; // Cần đảm bảo giá trị này khớp với MaVaiTro trong CSDL của bạn
    } else {
      toast({ title: "Lỗi", description: "Loại tài khoản không hợp lệ.", variant: "destructive" });
      setIsLoading(false);
      return;
    }

    const userData: UserRegisterData = {
      TenDangNhap: tenDangNhap,
      MatKhau: matKhau,
      // confirmPassword không cần gửi nếu backend không xử lý (controller cũ có xử lý)
      MaVaiTro: maVaiTroValue, // Gửi MaVaiTro là number
      HoTen: hoTen,
      SoDienThoai: soDienThoai,
      // Các trường tùy chọn, chỉ gửi nếu có giá trị
      ...(email && { Email: email }),
      ...(cccd && { CCCD: cccd }),
      ...(ngaySinh && { NgaySinh: ngaySinh }),
      ...(gioiTinh && { GioiTinh: gioiTinh }),
      ...(loaiTaiKhoan === 'Khách thuê' && queQuan && { QueQuan: queQuan }),
    };

    try {
      const response = await registerUser(userData);
      toast({
        title: "Đăng ký thành công!",
        description: response.message || "Tài khoản của bạn đã được tạo.",
      });

      // Backend service 'register' không trả về token, nên chỉ chuyển hướng sang login
      router.push("/login");

    } catch (error: any) {
      toast({
        title: "Đăng ký thất bại",
        description: error.message || "Đã có lỗi xảy ra. Vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/50 p-4">
      <Card className="w-full max-w-lg"> {/* Tăng max-w một chút để chứa nhiều trường hơn */}
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">Đăng ký tài khoản</CardTitle>
          <CardDescription>Nhập thông tin để tạo tài khoản mới</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tenDangNhap">Tên đăng nhập *</Label>
                <Input id="tenDangNhap" placeholder="Ít nhất 4 ký tự" required value={tenDangNhap} onChange={(e) => setTenDangNhap(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hoTen">Họ và tên *</Label>
                <Input id="hoTen" placeholder="Nguyễn Văn A" required value={hoTen} onChange={(e) => setHoTen(e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="matKhau">Mật khẩu *</Label>
                <Input id="matKhau" type="password" placeholder="Ít nhất 6 ký tự" required value={matKhau} onChange={(e) => setMatKhau(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Xác nhận mật khẩu *</Label>
                <Input id="confirmPassword" type="password" placeholder="Nhập lại mật khẩu" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Loại tài khoản *</Label>
              <RadioGroup value={loaiTaiKhoan} onValueChange={(value: 'Chủ trọ' | 'Khách thuê') => setLoaiTaiKhoan(value)} className="flex gap-4 pt-2">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Chủ trọ" id="landlord" />
                  <Label htmlFor="landlord">Chủ trọ</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Khách thuê" id="tenant" />
                  <Label htmlFor="tenant">Khách thuê</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="soDienThoai">Số điện thoại *</Label>
                <Input id="soDienThoai" placeholder="09xxxxxxxx" required value={soDienThoai} onChange={(e) => setSoDienThoai(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="example@email.com" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cccd">CCCD</Label>
                <Input id="cccd" placeholder="Số căn cước công dân" value={cccd} onChange={(e) => setCccd(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ngaySinh">Ngày Sinh</Label>
                <Input id="ngaySinh" type="date" value={ngaySinh} onChange={(e) => setNgaySinh(e.target.value)} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Giới tính</Label>
              <RadioGroup value={gioiTinh} onValueChange={(value: 'Nam' | 'Nữ' | 'Khác') => setGioiTinh(value)} className="flex gap-4 pt-2">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Nam" id="male" />
                  <Label htmlFor="male">Nam</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Nữ" id="female" />
                  <Label htmlFor="female">Nữ</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Khác" id="other" />
                  <Label htmlFor="other">Khác</Label>
                </div>
              </RadioGroup>
            </div>

            {loaiTaiKhoan === 'Khách thuê' && (
              <div className="space-y-2">
                <Label htmlFor="queQuan">Quê quán (Khách thuê)</Label>
                <Input id="queQuan" placeholder="Ví dụ: TP. Hồ Chí Minh" value={queQuan} onChange={(e) => setQueQuan(e.target.value)} />
              </div>
            )}
             {/* Bạn có thể thêm các trường khác cho Chủ trọ nếu API service `register` yêu cầu */}

          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Đang xử lý..." : "Đăng ký"}
            </Button>
            <div className="text-center text-sm">
              Đã có tài khoản?{" "}
              <Link href="/login" className="text-primary hover:underline">
                Đăng nhập
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}