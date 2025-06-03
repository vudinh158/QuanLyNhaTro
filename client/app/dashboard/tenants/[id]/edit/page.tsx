// apps/client-nextjs/app/(dashboard)/tenants/[id]/edit/page.tsx
"use client";

import { useEffect, useState, FormEvent } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { CalendarIcon, ArrowLeft, Save } from "lucide-react";
import { format, parseISO, isValid as isValidDate } from 'date-fns';
import { vi } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { getTenantById, updateTenant } from '@/services/tenantService';
import type { Tenant, UpdateTenantData } from '@/types/tenant';
import { useAuth } from '@/contexts/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';

export default function EditTenantPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const { user, isLoading: authLoading } = useAuth();

  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [hoTen, setHoTen] = useState("");
  const [cccd, setCccd] = useState("");
  const [soDienThoai, setSoDienThoai] = useState("");
  const [email, setEmail] = useState("");
  const [ngaySinh, setNgaySinh] = useState<Date | undefined>(undefined);
  const [gioiTinh, setGioiTinh] = useState<'Nam' | 'Nữ' | 'Khác' | undefined>(undefined);
  const [queQuan, setQueQuan] = useState("");
  const [ghiChu, setGhiChu] = useState("");
  const [trangThai, setTrangThai] = useState<'Đang thuê' | 'Đã rời đi'>("Đang thuê");
  // AnhGiayTo và thông tin tài khoản có thể được quản lý riêng biệt hoặc thêm vào đây nếu cần

  const tenantId = Number(params.id);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/login');
      return;
    }
    if (user.role?.TenVaiTro !== 'Chủ trọ') {
      toast({ title: "Lỗi", description: "Bạn không có quyền sửa thông tin khách thuê.", variant: "destructive" });
      router.push('/dashboard');
      return;
    }
    if (isNaN(tenantId)) {
      toast({ title: "Lỗi", description: "Mã khách thuê không hợp lệ.", variant: "destructive" });
      router.push('/dashboard/tenants');
      return;
    }

    const fetchTenantData = async () => {
      setIsLoading(true);
      try {
        const data = await getTenantById(tenantId);
        setTenant(data);
        // Populate form
        setHoTen(data.HoTen);
        setSoDienThoai(data.SoDienThoai);
        setCccd(data.CCCD || "");
        setEmail(data.Email || "");
        setNgaySinh(data.NgaySinh && isValidDate(parseISO(data.NgaySinh)) ? parseISO(data.NgaySinh) : undefined);
        setGioiTinh(data.GioiTinh || undefined);
        setQueQuan(data.QueQuan || "");
        setGhiChu(data.GhiChu || "");
        setTrangThai(data.TrangThai);
      } catch (error: any) {
        toast({
          title: "Lỗi tải thông tin khách thuê",
          description: error.message || "Không thể tải dữ liệu. Vui lòng thử lại.",
          variant: "destructive",
        });
        router.push('/dashboard/tenants');
      } finally {
        setIsLoading(false);
      }
    };
    fetchTenantData();
  }, [tenantId, user, authLoading, router, toast]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
     if (!hoTen || !soDienThoai) {
      toast({ title: "Thông tin bắt buộc", description: "Vui lòng nhập Họ tên và Số điện thoại.", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);

    const tenantUpdateData: UpdateTenantData = {
      HoTen: hoTen,
      SoDienThoai: soDienThoai,
      TrangThai: trangThai,
      CCCD: cccd || undefined,
      Email: email || undefined,
      NgaySinh: ngaySinh ? format(ngaySinh, "yyyy-MM-dd") : undefined,
      GioiTinh: gioiTinh || undefined,
      QueQuan: queQuan || undefined,
      GhiChu: ghiChu || undefined,
    };

    try {
      await updateTenant(tenantId, tenantUpdateData);
      toast({
        title: "Thành công",
        description: "Đã cập nhật thông tin khách thuê.",
      });
      router.push(`/dashboard/tenants/${tenantId}`); // Quay về trang chi tiết
    } catch (error: any) {
      toast({
        title: "Lỗi cập nhật khách thuê",
        description: error.message || "Không thể cập nhật. Vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || authLoading || !tenant) {
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
                {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
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
          <Link href={`/dashboard/tenants/${tenantId}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">Chỉnh sửa: {tenant?.HoTen}</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Thông tin cá nhân</CardTitle>
            <CardDescription>Cập nhật thông tin chi tiết cho khách thuê.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="hoTen">Họ và tên <span className="text-red-500">*</span></Label>
                    <Input id="hoTen" required value={hoTen} onChange={(e) => setHoTen(e.target.value)} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="soDienThoai">Số điện thoại <span className="text-red-500">*</span></Label>
                    <Input id="soDienThoai" required value={soDienThoai} onChange={(e) => setSoDienThoai(e.target.value)} />
                </div>
            </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="cccd">Số CCCD/CMND</Label>
                    <Input id="cccd" value={cccd} onChange={(e) => setCccd(e.target.value)} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
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
                    <div className="flex items-center space-x-2"><RadioGroupItem value="Nam" id="male" /><Label htmlFor="male">Nam</Label></div>
                    <div className="flex items-center space-x-2"><RadioGroupItem value="Nữ" id="female" /><Label htmlFor="female">Nữ</Label></div>
                    <div className="flex items-center space-x-2"><RadioGroupItem value="Khác" id="other" /><Label htmlFor="other">Khác</Label></div>
                </RadioGroup>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="queQuan">Quê quán</Label>
              <Input id="queQuan" value={queQuan} onChange={(e) => setQueQuan(e.target.value)} />
            </div>
            <div className="space-y-2">
                <Label htmlFor="statusEdit">Trạng thái Khách thuê</Label>
                <Select value={trangThai} onValueChange={(value: 'Đang thuê' | 'Đã rời đi') => setTrangThai(value)}>
                    <SelectTrigger id="statusEdit"><SelectValue placeholder="Chọn trạng thái" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Tiềm năng">Tiềm năng</SelectItem>
                        <SelectItem value="Đang thuê">Đang thuê</SelectItem>
                        <SelectItem value="Đã rời đi">Đã rời đi</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="note">Ghi chú</Label>
              <Textarea id="note" value={ghiChu} onChange={(e) => setGhiChu(e.target.value)} />
            </div>
            {/* Phần cập nhật tài khoản đăng nhập có thể phức tạp hơn và cần API riêng nếu muốn đổi TenDangNhap/MatKhau */}
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Hủy
            </Button>
            <Button type="submit" disabled={isSubmitting || isLoading}>
              {isSubmitting ? "Đang lưu..." : <><Save className="mr-2 h-4 w-4" /> Lưu thay đổi</>}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}