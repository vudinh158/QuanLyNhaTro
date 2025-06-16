// apps/client-nextjs/app/(dashboard)/tenants/[id]/page.tsx
"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { ArrowLeft, Edit, UserCircle, Mail, Phone, ShieldCheck, LinkIcon, FileText, Home as HomeIcon } from 'lucide-react';
import { getTenantById } from "@/services/tenantService";
import type { Tenant } from "@/types/tenant";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import Image from 'next/image';

export default function TenantDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const { user, isLoading: authLoading } = useAuth();

  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const tenantId = Number(params.id);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/login');
      return;
    }
    // Chủ trọ mới có quyền xem chi tiết khách thuê của mình (backend sẽ kiểm tra quyền sở hữu)
    if (user.role?.TenVaiTro !== 'Chủ trọ') {
        toast({ title: "Lỗi", description: "Bạn không có quyền truy cập trang này.", variant: "destructive" });
        router.push('/dashboard');
        return;
    }

    if (isNaN(tenantId)) {
      toast({ title: "Lỗi", description: "Mã khách thuê không hợp lệ.", variant: "destructive" });
      router.push('/dashboard/tenants');
      return;
    }

    const fetchTenantDetails = async () => {
      setIsLoading(true);
      try {
        // API backend getTenantById cần kiểm tra xem chủ trọ này có quyền xem khách thuê này không
        const data = await getTenantById(tenantId);
        setTenant(data);
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

    fetchTenantDetails();
  }, [tenantId, user, authLoading, router, toast]);

  const getAvatarFallback = (name?: string | null) => {
    if (!name) return "KT";
    const parts = name.split(" ");
    if (parts.length > 1) {
      return parts[0][0].toUpperCase() + parts[parts.length - 1][0].toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const renderDetailItem = (label: string, value?: string | number | null, icon?: React.ReactNode) => (
    value ? (
        <div className="flex items-start py-2">
        {icon && <div className="mr-3 pt-0.5 text-muted-foreground">{icon}</div>}
        <div>
            <span className="text-sm text-muted-foreground">{label}:</span>
            <p className="text-sm font-medium">{value}</p>
        </div>
        </div>
    ) : null
  );

  if (isLoading || authLoading || !tenant) {
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Skeleton className="h-10 w-10 mr-2 rounded-md" />
            <Skeleton className="h-8 w-60" />
          </div>
          <Skeleton className="h-10 w-28" />
        </div>
        <Card>
          <CardHeader className="flex flex-row items-center space-x-4">
            <Skeleton className="h-20 w-20 rounded-full" />
            <div className="space-y-1">
              <Skeleton className="h-7 w-48 mb-1" />
              <Skeleton className="h-4 w-32" />
            </div>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <Skeleton className="h-5 w-1/3 mb-2" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
                {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
            </div>
            <Separator className="my-4"/>
            <Skeleton className="h-5 w-1/4 mb-2" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Button variant="outline" size="icon" asChild className="mr-3">
            <Link href="/dashboard/tenants">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">Chi tiết khách thuê</h1>
        </div>
        <Button asChild variant="outline">
          <Link href={`/dashboard/tenants/${tenant.MaKhachThue}/edit`}>
            <Edit className="mr-2 h-4 w-4" /> Chỉnh sửa
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-col items-center text-center sm:flex-row sm:text-left sm:items-start gap-4">
          <Avatar className="h-24 w-24 border">
          <AvatarImage src={tenant.AnhGiayTo ? `http://localhost:5000/uploads/${tenant.AnhGiayTo}` : undefined} alt={tenant.HoTen} />
          <AvatarFallback>{getAvatarFallback(tenant.HoTen)}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <CardTitle className="text-2xl">{tenant.HoTen}</CardTitle>
            <CardDescription>
              {tenant.Email || "Chưa có email"}  {tenant.Email && tenant.SoDienThoai && "•"} {tenant.SoDienThoai}
            </CardDescription>
            <div className="mt-2">
                <Badge
                    variant={
                        tenant.TrangThai === 'Đang thuê' ? 'default' :
                        tenant.TrangThai === 'Đã rời đi' ? 'destructive' :
                        'secondary'
                    }
                    >
                    {tenant.TrangThai}
                </Badge>
                {tenant.userAccount && (
                    <Badge variant="outline" className="ml-2">
                        <ShieldCheck className="h-3 w-3 mr-1" /> Có tài khoản
                    </Badge>
                )}
            </div>
          </div>
        </CardHeader>
        <Separator />
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
            {renderDetailItem("Mã khách thuê", tenant.MaKhachThue)}
            {renderDetailItem("CCCD/CMND", tenant.CCCD)}
            {renderDetailItem("Ngày sinh", tenant.NgaySinh ? format(new Date(tenant.NgaySinh), 'dd/MM/yyyy', { locale: vi }) : null)}
            {renderDetailItem("Giới tính", tenant.GioiTinh)}
            {renderDetailItem("Quê quán", tenant.QueQuan)}
            {renderDetailItem("Tên đăng nhập", tenant.userAccount?.TenDangNhap)}
             {renderDetailItem("Trạng thái tài khoản", tenant.userAccount?.TrangThai)}
                  </div>
                  {tenant.AnhGiayTo && (
        <>
            <Separator className="my-4" />
            <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">Ảnh giấy tờ:</h4>
                <Link href={`http://localhost:5000/uploads/${tenant.AnhGiayTo}`} target="_blank" rel="noopener noreferrer">
                    <Image
                        src={`http://localhost:5000/uploads/${tenant.AnhGiayTo}`}
                        alt={`Giấy tờ của ${tenant.HoTen}`}
                        width={200}
                        height={120}
                        className="rounded-lg border object-cover hover:opacity-80 transition-opacity"
                    />
                </Link>
            </div>
        </>
    )}
          {tenant.GhiChu && (
            <>
              <Separator className="my-4" />
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Ghi chú:</h4>
                <p className="text-sm whitespace-pre-line">{tenant.GhiChu}</p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* TODO: Phần hiển thị danh sách hợp đồng của khách thuê này */}
      {/* <Card>
        <CardHeader>
          <CardTitle>Các hợp đồng đã/đang tham gia</CardTitle>
        </CardHeader>
        <CardContent>
          {tenant.occupancies && tenant.occupancies.length > 0 ? (
            <ul className="space-y-2">
              {tenant.occupancies.map((occ: any) => (
                <li key={occ.MaNOC} className="border p-3 rounded-md">
                  <Link href={`/dashboard/contracts/${occ.contract?.MaHopDong}`} className="font-medium hover:underline">
                    Hợp đồng {occ.contract?.MaHopDong}
                  </Link>
                  <p className="text-sm text-muted-foreground">
                    Phòng: {occ.contract?.room?.TenPhong} - Nhà trọ: {occ.contract?.room?.property?.TenNhaTro}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Từ {occ.contract?.NgayBatDau ? format(new Date(occ.contract.NgayBatDau), 'dd/MM/yyyy') : 'N/A'} đến {occ.contract?.NgayKetThuc ? format(new Date(occ.contract.NgayKetThuc), 'dd/MM/yyyy') : 'N/A'}
                  </p>
                  <Badge variant={occ.contract?.TrangThai === 'Có hiệu lực' ? 'default' : 'secondary' } className="mt-1">
                    {occ.contract?.TrangThai}
                  </Badge>
                   {occ.LaNguoiDaiDien && <Badge variant="outline" className="ml-2">Người đại diện</Badge>}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">Khách thuê này chưa tham gia hợp đồng nào.</p>
          )}
        </CardContent>
      </Card> */}
    </div>
  );
}