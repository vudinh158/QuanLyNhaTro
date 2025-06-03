// apps/client-nextjs/app/(dashboard)/tenants/new/page.tsx
"use client";

import type React from "react";
import { useState, FormEvent, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox"; // Import Checkbox
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"; // Import Select components
import { useToast } from "@/components/ui/use-toast";
import { CalendarIcon, ArrowLeft, UserPlus } from "lucide-react";
import { format, parseISO } from "date-fns"; // Import parseISO for date input
import { vi } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { createTenant } from "@/services/tenantService"; // Import service
import type { NewTenantData } from "@/types/tenant"; // Import type
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";

export default function NewTenantPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, isLoading: authLoading } = useAuth();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingPage, setIsLoadingPage] = useState(true);


  // Form states
  const [hoTen, setHoTen] = useState("");
  const [cccd, setCccd] = useState("");
  const [soDienThoai, setSoDienThoai] = useState("");
  const [email, setEmail] = useState("");
  const [ngaySinh, setNgaySinh] = useState<Date | undefined>(undefined);
  const [gioiTinh, setGioiTinh] = useState<'Nam' | 'Nữ' | 'Khác' | undefined>(undefined);
  const [queQuan, setQueQuan] = useState("");
  const [ghiChu, setGhiChu] = useState("");
  const [trangThai, setTrangThai] = useState<'Đang thuê' | 'Đã rời đi'>('Đang thuê'); // Mặc định là 'Đang thuê'
  // AnhGiayTo sẽ cần xử lý upload file riêng, tạm thời bỏ qua hoặc chỉ nhập URL

  // States for creating UserAccount
  const [createAccount, setCreateAccount] = useState(false);
  const [tenDangNhap, setTenDangNhap] = useState("");
  const [matKhau, setMatKhau] = useState("");
  // MaVaiTro cho KhachThue sẽ được set ở backend hoặc là một hằng số

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/login");
      return;
    }
    if (user.role?.TenVaiTro !== 'Chủ trọ') {
      toast({ title: "Lỗi", description: "Bạn không có quyền tạo khách thuê.", variant: "destructive" });
      router.push('/dashboard');
      return;
    }
    setIsLoadingPage(false);
  }, [user, authLoading, router, toast]);


  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!hoTen || !soDienThoai) {
      toast({ title: "Thông tin bắt buộc", description: "Vui lòng nhập Họ tên và Số điện thoại.", variant: "destructive" });
      return;
    }
    if (createAccount && (!tenDangNhap || !matKhau)) {
      toast({ title: "Thông tin tài khoản", description: "Nếu tạo tài khoản, vui lòng nhập Tên đăng nhập và Mật khẩu.", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);

    const tenantData: NewTenantData = {
      HoTen: hoTen,
      SoDienThoai: soDienThoai,
      TrangThai: trangThai,
      ...(cccd && { CCCD: cccd }),
      ...(email && { Email: email }),
      ...(ngaySinh && { NgaySinh: format(ngaySinh, "yyyy-MM-dd") }), // Format date
      ...(gioiTinh && { GioiTinh: gioiTinh }),
      ...(queQuan && { QueQuan: queQuan }),
      ...(ghiChu && { GhiChu: ghiChu }),
      // AnhGiayTo: ... // Xử lý upload file nếu có
    };

    if (createAccount) {
      tenantData.TenDangNhap = tenDangNhap;
      tenantData.MatKhau = matKhau;
      // MaVaiTro cho khách thuê sẽ được backend tự động gán hoặc bạn có thể gửi nếu API yêu cầu
    }

    try {
      await createTenant(tenantData);
      toast({
        title: "Thành công",
        description: "Đã thêm khách thuê mới.",
      });
      router.push("/dashboard/tenants"); // Chuyển về trang danh sách
    } catch (error: any) {
      toast({
        title: "Lỗi thêm khách thuê",
        description: error.message || "Không thể thêm khách thuê. Vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading || isLoadingPage) {
     return (
      <div className="mx-auto max-w-2xl space-y-6">
         <div className="flex items-center">
            <Skeleton className="h-10 w-10 mr-2 rounded-md" />
            <Skeleton className="h-8 w-48" />
        </div>
        <Card>
            <CardHeader>
                <Skeleton className="h-7 w-1/2 mb-1" />
                <Skeleton className="h-4 w-3/4" />
            </CardHeader>
            <CardContent className="space-y-4">
                {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
                <Skeleton className="h-20 w-full" />
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
                <Skeleton className="h-10 w-20" />
                <Skeleton className="h-10 w-36" />
            </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="flex items-center mb-6">
          <Button variant="outline" size="icon" asChild className="mr-2">
            <Link href="/dashboard/tenants">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">Thêm khách thuê mới</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Thông tin cá nhân</CardTitle>
            <CardDescription>Nhập thông tin chi tiết về khách thuê mới.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="hoTen">Họ và tên <span className="text-red-500">*</span></Label>
                    <Input id="hoTen" placeholder="Nguyễn Văn A" required value={hoTen} onChange={(e) => setHoTen(e.target.value)} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="soDienThoai">Số điện thoại <span className="text-red-500">*</span></Label>
                    <Input id="soDienThoai" placeholder="09xxxxxxxx" required value={soDienThoai} onChange={(e) => setSoDienThoai(e.target.value)} />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="cccd">Số CCCD/CMND</Label>
                    <Input id="cccd" placeholder="Nhập số CCCD/CMND" value={cccd} onChange={(e) => setCccd(e.target.value)} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="example@email.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ngaySinh">Ngày sinh</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn("w-full justify-start text-left font-normal", !ngaySinh && "text-muted-foreground")}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {ngaySinh ? format(ngaySinh, "dd/MM/yyyy", { locale: vi }) : <span>Chọn ngày sinh</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={ngaySinh} onSelect={setNgaySinh} initialFocus captionLayout="dropdown-buttons" fromYear={1950} toYear={new Date().getFullYear() - 10}/>
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label>Giới tính</Label>
                <RadioGroup value={gioiTinh} onValueChange={(value: 'Nam' | 'Nữ' | 'Khác') => setGioiTinh(value)} className="flex gap-4 pt-2">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Nam" id="male" /> <Label htmlFor="male">Nam</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Nữ" id="female" /> <Label htmlFor="female">Nữ</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Khác" id="other" /> <Label htmlFor="other">Khác</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="queQuan">Quê quán</Label>
              <Input id="queQuan" placeholder="Tỉnh/Thành phố" value={queQuan} onChange={(e) => setQueQuan(e.target.value)} />
            </div>
             <div className="space-y-2">
                <Label htmlFor="status">Trạng thái Khách thuê</Label>
                <Select value={trangThai} onValueChange={(value:'Đang thuê' | 'Đã rời đi') => setTrangThai(value)}>
                    <SelectTrigger id="status">
                        <SelectValue placeholder="Chọn trạng thái" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Đang thuê">Đang thuê</SelectItem>
                        <SelectItem value="Đã rời đi">Đã rời đi</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="note">Ghi chú</Label>
              <Textarea id="note" placeholder="Ghi chú thêm về khách thuê (nếu có)" value={ghiChu} onChange={(e) => setGhiChu(e.target.value)} />
            </div>
            {/* TODO: Thêm input cho AnhGiayTo (file upload) */}
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Tài khoản đăng nhập (Tùy chọn)</CardTitle>
            <CardDescription>Tạo tài khoản để khách thuê có thể đăng nhập vào hệ thống.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="createAccount"
                checked={createAccount}
                onCheckedChange={(checked) => setCreateAccount(Boolean(checked))}
              />
              <Label htmlFor="createAccount" className="cursor-pointer">Tạo tài khoản đăng nhập cho khách thuê này</Label>
            </div>

            {createAccount && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="username">Tên đăng nhập <span className="text-red-500">*</span></Label>
                  <Input id="username" placeholder="Nhập tên đăng nhập (ít nhất 4 ký tự)" value={tenDangNhap} onChange={(e) => setTenDangNhap(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Mật khẩu <span className="text-red-500">*</span></Label>
                  <Input id="password" type="password" placeholder="Nhập mật khẩu (ít nhất 6 ký tự)" value={matKhau} onChange={(e) => setMatKhau(e.target.value)} />
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <CardFooter className="flex justify-end gap-2 mt-6">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Hủy
          </Button>
          <Button type="submit" disabled={isSubmitting || isLoadingPage}>
            {isSubmitting ? "Đang lưu..." : <><UserPlus className="mr-2 h-4 w-4" /> Thêm khách thuê</>}
          </Button>
        </CardFooter>
      </form>
    </div>
  );
}