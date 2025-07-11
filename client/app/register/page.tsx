"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/components/ui/use-toast";
import { sendOtp, verifyOtp, registerUser } from "@/services/authService";
import type { UserRegisterData } from "@/types/auth";

export default function RegisterPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [step, setStep] = useState<"email"|"otp"|"form">("email");
  const [isLoading, setIsLoading] = useState(false);

  // Dữ liệu
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpToken, setOtpToken] = useState("");

  const [errors, setErrors] = useState<Record<string,string>>({});

  function validateForm() {
  const newErrors: Record<string,string> = {};
  if (!tenDangNhap || tenDangNhap.trim().length < 4) {
    newErrors.tenDangNhap = 'Tên đăng nhập tối thiểu 4 ký tự';
  }
  if (!hoTen || hoTen.trim() === '') {
    newErrors.hoTen = 'Họ và tên không được để trống';
  }
  if (!matKhau || matKhau.length < 6) {
    newErrors.matKhau = 'Mật khẩu tối thiểu 6 ký tự';
  }
  if (matKhau !== confirmPassword) {
    newErrors.confirmPassword = 'Xác nhận mật khẩu không khớp';
  }
  if (!/^[0-9]{10}$/.test(soDienThoai)) {
    newErrors.soDienThoai = 'Số điện thoại phải gồm 10 chữ số';
  }
  if (!email || !/^[^@]+@[^@]+\.[^@]+$/.test(email)) {
    newErrors.email = 'Email không hợp lệ';
  }
  if (cccd && !/^[0-9]{12}$/.test(cccd)) {
    newErrors.cccd = 'CCCD phải gồm 12 chữ số';
  }
  if (!gioiTinh) {
    newErrors.gioiTinh = 'Vui lòng chọn giới tính';
  }
  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
}
  // Form chủ trọ
  const [tenDangNhap, setTenDangNhap] = useState("");
  const [hoTen, setHoTen] = useState("");
  const [matKhau, setMatKhau] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [soDienThoai, setSoDienThoai] = useState("");
  const [cccd, setCccd] = useState("");
  const [ngaySinh, setNgaySinh] = useState("");
  const [gioiTinh, setGioiTinh] = useState<"Nam"|"Nữ"|"Khác"|undefined>(undefined);

  // 1) Gửi OTP - Cập nhật để lưu token
  const handleSendOtp = async () => {
    if (!email) return toast({ title: "Lỗi", description: "Nhập email.", variant: "destructive" });
    setIsLoading(true);
    try {
      // ---- LƯU LẠI TOKEN TỪ RESPONSE ----
      const response = await sendOtp(email);
      if (response.otpToken) {
        setOtpToken(response.otpToken); // Lưu token vào state
        toast({ title: "OTP đã gửi", description: "Kiểm tra email." });
        setStep("otp");
      } else {
        throw new Error("Không nhận được token xác thực.");
      }
    } catch (err: any) {
      toast({ title: "Gửi OTP thất bại", description: err.message, variant: "destructive" });
    } finally { setIsLoading(false); }
  };

  // 2) Xác thực OTP - Cập nhật để gửi token
  const handleVerifyOtp = async () => {
    if (!otp) return toast({ title: "Lỗi", description: "Nhập OTP.", variant: "destructive" });
    // ---- VALIDATE THÊM TOKEN ----
    if (!otpToken) return toast({ title: "Lỗi", description: "Thiếu token xác thực. Vui lòng thử lại.", variant: "destructive" });
    setIsLoading(true);
    try {
      // ---- GỬI OTP VÀ TOKEN ĐÃ LƯU ----
      await verifyOtp(otp, otpToken); 
      toast({ title: "Xác thực thành công" });
      setStep("form");
    } catch (err: any) {
      toast({ title: "OTP không hợp lệ", description: err.message, variant: "destructive" });
    } finally { setIsLoading(false); }
  };

  // 3) Hoàn tất đăng ký (giữ nguyên)
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (matKhau !== confirmPassword) {
      return toast({ title: "Lỗi", description: "Mật khẩu không khớp.", variant: "destructive" });
    }
    setIsLoading(true);
    const data: UserRegisterData = {
      TenDangNhap: tenDangNhap,
      MatKhau: matKhau,
      MaVaiTro: 1,
      HoTen: hoTen,
      SoDienThoai: soDienThoai,
      Email: email,
      ...(cccd && { CCCD: cccd }),
      ...(ngaySinh && { NgaySinh: ngaySinh }),
      ...(gioiTinh && { GioiTinh: gioiTinh }),
    };
    try {
      await registerUser(data);
      toast({ title: "Đăng ký thành công" });
      router.push("/login");
    } catch (err: any) {
      toast({ title: "Đăng ký thất bại", description: err.message, variant: "destructive" });
    } finally { setIsLoading(false); }
  };
  
  // Phần JSX trả về giữ nguyên
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/50 p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center space-y-1">
          <CardTitle className="text-2xl">Đăng ký chủ trọ</CardTitle>
          <CardDescription>
            {step === "email" ? "Nhập email để nhận OTP"
             : step === "otp"   ? "Nhập mã OTP"
             :                        "Hoàn tất thông tin"}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {step === "email" && (
            <div className="space-y-4">
              <Label htmlFor="email">Email *</Label>
              <Input id="email" type="email" placeholder="example@mail.com"
                value={email} onChange={e=>setEmail(e.target.value)} />
              <Button type="button" onClick={handleSendOtp} disabled={isLoading} className="w-full">Gửi mã OTP</Button>
            </div>
          )}

          {step === "otp" && (
            <div className="space-y-4">
              <Label htmlFor="otp">Mã OTP *</Label>
              <Input
                id="otp"
                placeholder="Nhập mã 6 chữ số"
                value={otp}
                onChange={e => setOtp(e.target.value)}
              />
              <Button
                type="button"
                onClick={handleVerifyOtp}
                disabled={isLoading}
                className="w-full"
              >
                Xác thực OTP
              </Button>
            </div>
          )}
          
          {/* Form đăng ký giữ nguyên không đổi */}
          {step === "form" && (
            <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
              {/* ...các input của form... */}
                 {/* Tên đăng nhập */}
                 <div className="space-y-2">
                <Label htmlFor="tenDangNhap">Tên đăng nhập *</Label>
                <Input
                  id="tenDangNhap"
                  placeholder="Ít nhất 4 ký tự"
                  required
                  value={tenDangNhap}
                  onChange={e => setTenDangNhap(e.target.value)}
                />
              </div>

              {/* Họ và tên */}
              <div className="space-y-2">
                <Label htmlFor="hoTen">Họ và tên *</Label>
                <Input
                  id="hoTen"
                  placeholder="Nguyễn Văn A"
                  required
                  value={hoTen}
                  onChange={e => setHoTen(e.target.value)}
                />
              </div>

              {/* Mật khẩu */}
              <div className="space-y-2">
                <Label htmlFor="matKhau">Mật khẩu *</Label>
                <Input
                  id="matKhau"
                  type="password"
                  placeholder="Ít nhất 6 ký tự"
                  required
                  value={matKhau}
                  onChange={e => setMatKhau(e.target.value)}
                />
              </div>

              {/* Xác nhận mật khẩu */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Xác nhận mật khẩu *</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Nhập lại mật khẩu"
                  required
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                />
              </div>

              {/* Số điện thoại */}
              <div className="space-y-2">
                <Label htmlFor="soDienThoai">Số điện thoại *</Label>
                <Input
                  id="soDienThoai"
                  placeholder="09xxxxxxxx"
                  required
                  value={soDienThoai}
                  onChange={e => setSoDienThoai(e.target.value)}
                />
              </div>

              {/* Email (repeat) hoặc ẩn */}
              <div className="space-y-2">
                <Label>Email</Label>
                <p className="px-3 py-2 bg-gray-50 rounded">{email}</p>
                <input type="hidden" name="Email" value={email} />
              </div>

              {/* CCCD */}
              <div className="space-y-2">
                <Label htmlFor="cccd">CCCD</Label>
                <Input
                  id="cccd"
                  placeholder="Số căn cước"
                  value={cccd}
                  onChange={e => setCccd(e.target.value)}
                />
              </div>

              {/* Ngày sinh */}
              <div className="space-y-2">
                <Label htmlFor="ngaySinh">Ngày sinh</Label>
                <Input
                  id="ngaySinh"
                  type="date"
                  value={ngaySinh}
                  onChange={e => setNgaySinh(e.target.value)}
                />
              </div>

              {/* Giới tính */}
              <div className="col-span-2 space-y-2">
                <Label>Giới tính</Label>
                <RadioGroup
                  value={gioiTinh}
                  onValueChange={v => setGioiTinh(v as any)}
                  className="flex gap-4"
                >
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

              {/* Button hoàn tất */}
              <div className="col-span-2">
                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading ? "Đang xử lý..." : "Hoàn tất đăng ký"}
                </Button>
              </div>
            </form>
          )}
        </CardContent>

        {step !== "form" && (
          <CardFooter className="text-center">
            <Button variant="link" onClick={()=>router.push("/login")}>Đã có tài khoản? Đăng nhập</Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}