// apps/client-nextjs/app/(dashboard)/rooms/[id]/page.tsx
"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { ArrowLeft, Edit, Home as HomeIcon, BedDouble, DollarSign, UserCircle, FileText, Zap, ShoppingBag, Settings2, PlusCircle } from 'lucide-react';
import { getRoomById } from "@/services/roomService";
import type { Room } from "@/types/room";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from '@/components/ui/separator';

// Giả định bạn có thể muốn lấy thông tin hợp đồng hiện tại của phòng
// import { getCurrentContractForRoom } from '@/services/contractService'; // Cần tạo service này
// import type { Contract } from '@/types/contract'; // Cần type này

export default function RoomDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const { user, isLoading: authLoading } = useAuth();

  const [room, setRoom] = useState<Room | null>(null);
  // const [currentContract, setCurrentContract] = useState<Contract | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const roomId = Number(params.id);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/login');
      return;
    }
    if (user.role?.TenVaiTro !== 'Chủ trọ') {
      toast({ title: "Lỗi", description: "Bạn không có quyền truy cập trang này.", variant: "destructive" });
      router.push('/dashboard');
      return;
    }
    if (isNaN(roomId)) {
      toast({ title: "Lỗi", description: "Mã phòng không hợp lệ.", variant: "destructive" });
      router.push(`/dashboard/rooms${room?.MaNhaTro ? `?propertyId=${room.MaNhaTro}` : ''}`);
      return;
    }

    const fetchRoomDetails = async () => {
      setIsLoading(true);
      try {
        const roomData = await getRoomById(roomId);
        setRoom(roomData);
        // (Tùy chọn) Lấy thông tin hợp đồng hiện tại của phòng
        // if (roomData.TrangThai === 'Đang thuê') {
        //   const contractData = await getCurrentContractForRoom(roomId);
        //   setCurrentContract(contractData);
        // }
      } catch (error: any) {
        toast({
          title: "Lỗi tải thông tin phòng",
          description: error.message || "Không thể tải dữ liệu. Vui lòng thử lại.",
          variant: "destructive",
        });
        router.push(`/dashboard/rooms${room ? `?propertyId=${room.MaNhaTro}` : ''}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRoomDetails();
  }, [roomId, user, authLoading, router, toast]);


  const renderDetailItem = (label: string, value?: string | number | null) => (
    <div className="flex justify-between py-2">
      <span className="text-sm text-muted-foreground">{label}:</span>
      <span className="text-sm font-medium text-right">{value || 'N/A'}</span>
    </div>
  );

  if (isLoading || authLoading || !room) {
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
          <CardHeader>
            <Skeleton className="h-7 w-3/4 mb-1" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-5 w-1/3" />
            <Skeleton className="h-12 w-full" />
            <Separator />
            <Skeleton className="h-5 w-1/4" />
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          </CardContent>
          <CardFooter className="border-t pt-4 mt-4 flex flex-wrap gap-2">
            <Skeleton className="h-10 w-36" />
            <Skeleton className="h-10 w-40" />
            <Skeleton className="h-10 w-44" />
          </CardFooter>
        </Card>
      </div>
    );
  }

  const propertyIdOfRoom = room.MaNhaTro;


  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Button variant="outline" size="icon" asChild className="mr-3">
            <Link href={`/dashboard/rooms?propertyId=${propertyIdOfRoom}`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{room.TenPhong}</h1>
            <p className="text-sm text-muted-foreground">{room.property?.TenNhaTro || `Nhà trọ ID: ${room.MaNhaTro}`}</p>
          </div>
        </div>
        <Button asChild variant="outline">
          <Link href={`/dashboard/rooms/${room.MaPhong}/edit`}>
            <Edit className="mr-2 h-4 w-4" /> Chỉnh sửa phòng
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>Thông tin chi tiết phòng</CardTitle>
              <CardDescription>Xem lại thông tin và các tiện ích của phòng.</CardDescription>
            </div>
            <Badge variant={
                room.TrangThai === 'Đang thuê' ? 'default' :
                room.TrangThai === 'Còn trống' ? 'outline' :
                'secondary'
            }>
                {room.TrangThai}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="divide-y">
          {renderDetailItem("Tên phòng", room.TenPhong)}
          {renderDetailItem("Loại phòng", room.roomType?.TenLoai)}
          {renderDetailItem("Giá đề xuất", room.roomType?.Gia ? `${room.roomType.Gia.toLocaleString()} VNĐ/tháng` : 'N/A')}
          {renderDetailItem("Diện tích", room.roomType?.DienTich ? `${room.roomType.DienTich} m²` : 'N/A')}
          {renderDetailItem("Số người tối đa", room.roomType?.SoNguoiToiDa)}
          {renderDetailItem("Mô tả loại phòng", room.roomType?.MoTa)}
          {renderDetailItem("Ghi chú phòng", room.GhiChu)}
          {renderDetailItem("Trạng thái", room.TrangThai)}
          {renderDetailItem("Thuộc nhà trọ", room.property?.TenNhaTro)}
        </CardContent>
      </Card>

      {/* Phần hợp đồng hiện tại (nếu có) */}
      {/* {room.TrangThai === 'Đang thuê' && currentContract && (
        <Card>
          <CardHeader>
            <CardTitle>Hợp đồng hiện tại</CardTitle>
            <CardDescription>Thông tin hợp đồng đang có hiệu lực cho phòng này.</CardDescription>
          </CardHeader>
          <CardContent className="divide-y">
            {renderDetailItem("Mã hợp đồng", currentContract.MaHopDong)}
            {renderDetailItem("Ngày bắt đầu", currentContract.NgayBatDau)}
            {renderDetailItem("Ngày kết thúc", currentContract.NgayKetThuc)}
            {renderDetailItem("Tiền thuê", `${currentContract.TienThueThoaThuan.toLocaleString()} VNĐ`)}
            {renderDetailItem("Tiền cọc", `${currentContract.TienCoc.toLocaleString()} VNĐ`)}
          </CardContent>
          <CardFooter className="border-t pt-4">
             <Button asChild variant="outline">
                <Link href={`/dashboard/contracts/${currentContract.MaHopDong}`}>
                    <FileText className="mr-2 h-4 w-4" /> Xem chi tiết hợp đồng
                </Link>
            </Button>
          </CardFooter>
        </Card>
      )}
      {room.TrangThai === 'Còn trống' && (
         <div className="text-center py-4">
            <Button asChild>
                <Link href={`/dashboard/contracts/new?roomId=${room.MaPhong}&propertyId=${propertyIdOfRoom}`}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Tạo hợp đồng mới
                </Link>
            </Button>
        </div>
      )} */}


      <Card>
        <CardHeader>
          <CardTitle>Quản lý & Tiện ích</CardTitle>
          <CardDescription>Truy cập các chức năng quản lý cho phòng này.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Button variant="outline" className="w-full justify-start p-4 h-auto" asChild>
            <Link href={`/dashboard/rooms/${room.MaPhong}/utilities`}>
              <Zap className="mr-3 h-5 w-5 text-primary" />
              <div>
                <p className="font-semibold">Ghi điện nước</p>
                <p className="text-xs text-muted-foreground">Ghi nhận chỉ số điện, nước hàng tháng.</p>
              </div>
            </Link>
          </Button>
          <Button variant="outline" className="w-full justify-start p-4 h-auto" asChild>
            <Link href={`/dashboard/rooms/${room.MaPhong}/services`}>
              <ShoppingBag className="mr-3 h-5 w-5 text-primary" />
               <div>
                <p className="font-semibold">Quản lý dịch vụ</p>
                <p className="text-xs text-muted-foreground">Đăng ký và theo dõi dịch vụ phòng.</p>
              </div>
            </Link>
          </Button>
           {room.TrangThai === 'Còn trống' && (
             <Button className="w-full justify-start p-4 h-auto col-span-full sm:col-span-1" asChild>
                <Link href={`/dashboard/contracts/new?roomId=${room.MaPhong}&propertyId=${propertyIdOfRoom}`}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Tạo hợp đồng mới
                </Link>
            </Button>
           )}
            {/* Thêm các nút khác nếu cần, ví dụ: Xem hóa đơn của phòng, Lịch sử sửa chữa,... */}
        </CardContent>
      </Card>
    </div>
  );
}