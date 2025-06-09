"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import DashboardLayout from "@/components/dashboard/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Edit, Trash2, ArrowLeft, Zap } from "lucide-react"
import Link from "next/link"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/components/ui/use-toast"
import { getServiceById, deleteService } from '@/services/serviceService';
import type { IService } from '@/types/service';
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { Separator } from "@/components/ui/separator";

export default function ServiceDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const { user, isLoading: authLoading } = useAuth(); // Assuming auth context provides user info and loading state

  const [service, setService] = useState<IService | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)

  const serviceId = Number(params.id);

  useEffect(() => {
    if (authLoading) return; // Wait for auth to load
    if (!user) {
      router.push('/login'); // Redirect to login if not authenticated
      return;
    }
    // Check for specific permission if necessary, e.g., 'service_definition:manage_own_property'
    // For now, we rely on backend to restrict access based on MaChuTro
    
    if (isNaN(serviceId)) {
        toast({ title: "Lỗi", description: "Mã dịch vụ không hợp lệ.", variant: "destructive" });
        router.push('/dashboard/services'); // Redirect back to services list
        return;
    }

    const fetchServiceDetails = async () => {
      setIsLoading(true);
      try {
        const data = await getServiceById(serviceId);
        setService(data);
      } catch (error: any) {
        toast({
          title: "Lỗi tải thông tin dịch vụ",
          description: error.message || "Không thể tải dữ liệu. Vui lòng thử lại.",
          variant: "destructive",
        });
        router.push('/dashboard/services'); // Redirect back to list on error
      } finally {
        setIsLoading(false);
      }
    };

    fetchServiceDetails();
  }, [serviceId, user, authLoading, router, toast]); // Add dependencies

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteService(serviceId); // Soft delete, sets HoatDong = false
      toast({
        title: "Xóa dịch vụ thành công",
        description: "Dịch vụ đã được ngừng cung cấp.",
      });
      router.push("/dashboard/services");
    } catch (error: any) {
      toast({
        title: "Lỗi xóa dịch vụ",
        description: error.message || "Không thể xóa dịch vụ. Vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const getBadgeVariant = (type: string) => {
    switch (type) {
      case 'Cố định hàng tháng':
        return 'default'
      case 'Theo số lượng sử dụng':
        return 'outline'
      case 'Sự cố/Sửa chữa':
        return 'secondary'
      default:
        return 'default'
    }
  }

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? <Badge variant="success">Đang hoạt động</Badge> : <Badge variant="destructive">Ngừng hoạt động</Badge>;
  }


  if (isLoading || authLoading || !service) {
    return (
        <DashboardLayout>
            <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <Skeleton className="h-8 w-48" />
                    <div className="flex gap-2">
                        <Skeleton className="h-10 w-24" />
                        <Skeleton className="h-10 w-24" />
                    </div>
                </div>
                <Card>
                    <CardHeader>
                        <Skeleton className="h-7 w-3/4 mb-1" />
                        <Skeleton className="h-4 w-1/2" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-4">
                                <Skeleton className="h-5 w-1/3 mb-2" />
                                <Skeleton className="h-10 w-full" />
                                <Skeleton className="h-10 w-full" />
                                <Skeleton className="h-10 w-full" />
                                <Skeleton className="h-10 w-full" />
                            </div>
                            <div className="space-y-4">
                                <Skeleton className="h-5 w-1/3 mb-2" />
                                <Skeleton className="h-10 w-full" />
                                <Skeleton className="h-10 w-full" />
                                <Skeleton className="h-24 w-full" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" asChild className="mr-2">
              <Link href="/dashboard/services">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <Zap className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold tracking-tight">Chi tiết dịch vụ: {service.TenDV}</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" asChild>
              <Link href={`/dashboard/services/${service.MaDV}/edit`}>
                <Edit className="mr-2 h-4 w-4" />
                Chỉnh sửa
              </Link>
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" disabled={isDeleting || !service.HoatDong}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  {service.HoatDong ? 'Ngừng cung cấp' : 'Đã ngừng'}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Bạn có chắc chắn muốn ngừng cung cấp dịch vụ này?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Hành động này sẽ đánh dấu dịch vụ "{service.TenDV}" là ngừng hoạt động. Dịch vụ này sẽ không xuất hiện trong các hóa đơn mới.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Hủy</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    disabled={isDeleting}
                  >
                    {isDeleting ? "Đang xử lý..." : "Xác nhận ngừng"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Thông tin dịch vụ</CardTitle>
                <CardDescription>Chi tiết về dịch vụ {service.TenDV}</CardDescription>
              </div>
              <div className="flex flex-col items-end">
                {getStatusBadge(service.HoatDong)}
                <Badge variant={getBadgeVariant(service.LoaiDichVu)} className="mt-1">
                    {service.LoaiDichVu}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Thông tin cơ bản</h3>
                  <div className="grid gap-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Mã dịch vụ:</span>
                      <span>{service.MaDV}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tên dịch vụ:</span>
                      <span>{service.TenDV}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Đơn vị tính:</span>
                      <span>{service.DonViTinh}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Áp dụng cho nhà trọ:</span>
                        <span>
                            {service.propertySpecific?.TenNhaTro || 
                            (service.appliedToProperties && service.appliedToProperties.length > 0
                                ? service.appliedToProperties.map(p => p.TenNhaTro).join(', ')
                                : 'Tất cả nhà trọ (chung)')}
                        </span>
                    </div>
                    {service.NgayNgungCungCap && (
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Ngày ngừng cung cấp:</span>
                            <span>{format(new Date(service.NgayNgungCungCap), 'dd/MM/yyyy')}</span>
                        </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Giá hiện tại</h3>
                  <div className="grid gap-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Đơn giá hiện tại:</span>
                      <span>
                        {service.priceHistories?.[0]?.DonGiaMoi
                          ? `${Number(service.priceHistories[0].DonGiaMoi).toLocaleString('vi-VN')} VNĐ/${service.DonViTinh}`
                          : 'Chưa thiết lập'}
                      </span>
                    </div>
                    {service.priceHistories?.[0]?.NgayApDung && (
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Áp dụng từ ngày:</span>
                            <span>{format(new Date(service.priceHistories[0].NgayApDung), 'dd/MM/yyyy')}</span>
                        </div>
                    )}
                  </div>
                </div>
                {service.GhiChu && (
                  <div>
                    <h3 className="font-medium mb-2">Mô tả/Ghi chú</h3>
                    <p className="text-sm">{service.GhiChu}</p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
            <CardHeader>
                <CardTitle>Lịch sử giá dịch vụ</CardTitle>
                <CardDescription>Theo dõi thay đổi giá của dịch vụ này.</CardDescription>
            </CardHeader>
            <CardContent>
                {service.priceHistories && service.priceHistories.length > 0 ? (
                    <div className="rounded-md border overflow-hidden">
                        <div className="grid grid-cols-3 gap-2 p-3 font-medium text-sm border-b">
                            <div>Ngày áp dụng</div>
                            <div className="text-right">Đơn giá mới</div>
                            {/* <div>Người cập nhật</div> */}
                        </div>
                        {service.priceHistories.map((history, index) => (
                            <div key={history.MaLichSuDV || index} className="grid grid-cols-3 gap-2 p-3 border-b last:border-0 items-center">
                                <div>{format(new Date(history.NgayApDung), 'dd/MM/yyyy')}</div>
                                <div className="text-right">{Number(history.DonGiaMoi).toLocaleString('vi-VN')} VNĐ/{service.DonViTinh}</div>
                                {/* <div>{history.updatedBy?.HoTen || 'N/A'}</div> */}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-4 text-muted-foreground">Chưa có lịch sử giá.</div>
                )}
            </CardContent>
        </Card>

      </div>
    </DashboardLayout>
  )
}