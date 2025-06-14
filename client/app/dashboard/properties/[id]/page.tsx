// client/app/dashboard/properties/[id]/page.tsx
"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { ArrowLeft, Edit, Home as HomeIcon, Users, FileText as ContractIcon, Plus, Eye, Trash2 } from 'lucide-react';
import { getPropertyById } from '@/services/propertyService';
import type { Property } from '@/types/property'; 
import { useAuth } from '@/contexts/AuthContext';
import { Skeleton } from '@/components/ui/skeleton'; 
import { Badge } from '@/components/ui/badge'; 
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
} from "@/components/ui/alert-dialog"; 
import { deleteRoom } from '@/services/roomService'; 

export default function PropertyDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const { user, isLoading: authLoading } = useAuth();

  const [property, setProperty] = useState<Property | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const propertyId = Number(params.id);

  useEffect(() => {
    if (authLoading) return; 
    if (!user) {
      router.push('/login');
      return;
    }
    // Đảm bảo chỉ chủ trọ mới có quyền truy cập trang này
    if (user.role?.TenVaiTro !== 'Chủ trọ') {
        toast({ title: "Lỗi", description: "Bạn không có quyền truy cập trang này.", variant: "destructive" });
        router.push('/dashboard');
        return;
    }
    if (isNaN(propertyId)) {
      toast({ title: "Lỗi", description: "Mã nhà trọ không hợp lệ.", variant: "destructive" });
      router.push('/dashboard/properties');
      return;
    }

    const fetchPropertyDetails = async () => {
      setIsLoading(true);
      try {
        const data = await getPropertyById(propertyId);
        setProperty(data);
      } catch (error: any) {
        toast({
          title: "Lỗi tải thông tin nhà trọ",
          description: error.message || "Không thể tải dữ liệu. Vui lòng thử lại.",
          variant: "destructive",
        });
        router.push('/dashboard/properties');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPropertyDetails();
  }, [propertyId, user, authLoading, router, toast]);

    const handleDeleteRoom = async (roomId: number, roomName: string) => {
        try {
            await deleteRoom(roomId);
            toast({
                title: "Thành công",
                description: `Phòng "${roomName}" đã được xóa thành công.`,
            });
            // Cập nhật lại danh sách phòng sau khi xóa thành công
            if (property) {
                setProperty(prev => ({
                    ...prev!,
                    rooms: prev!.rooms?.filter(r => r.MaPhong !== roomId)
                }));
            }
        } catch (error: any) {
            toast({
                title: "Lỗi xóa phòng",
                description: error.message || "Không thể xóa phòng. Vui lòng thử lại.",
                variant: "destructive",
            });
        }
    };

  if (isLoading || authLoading || !property) {
    return (
      <div className="mx-auto max-w-4xl">
        <div className="flex items-center mb-6">
          <Skeleton className="h-10 w-10 mr-2 rounded-md" />
          <Skeleton className="h-8 w-64" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-1/2 mb-2" />
            <Skeleton className="h-4 w-3/4" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
            <Skeleton className="h-10 w-full" />
             {/* Skeleton cho danh sách phòng */}
            <Skeleton className="h-48 w-full" />
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-24" />
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Tính tổng số phòng trống và đang thuê
  const totalRooms = property.rooms?.length || 0;
  const vacantRooms = property.rooms?.filter(room => room.TrangThai === 'Còn trống').length || 0;
  const occupiedRooms = property.rooms?.filter(room => room.TrangThai === 'Đang thuê').length || 0;


  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Button variant="outline" size="icon" asChild className="mr-2">
            <Link href="/dashboard/properties">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">{property.TenNhaTro}</h1>
        </div>
        <Button asChild>
          <Link href={`/dashboard/properties/${property.MaNhaTro}/edit`}>
            <Edit className="mr-2 h-4 w-4" /> Chỉnh sửa
          </Link>
        </Button>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{property.TenNhaTro}</CardTitle>
          <CardDescription>{property.DiaChi}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-medium mb-1">Ghi chú:</h3>
            <p className="text-sm text-muted-foreground">
              {property.GhiChu || "Không có ghi chú."}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t pt-4">
            <div className="flex items-center gap-2">
              <HomeIcon className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Tổng số phòng</p>
                <p className="font-semibold">{totalRooms}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Phòng đang thuê</p>
                <p className="font-semibold">{occupiedRooms}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ContractIcon className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Phòng còn trống</p>
                <p className="font-semibold">{vacantRooms}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Danh sách phòng trong nhà trọ */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
              <CardTitle>Danh sách phòng</CardTitle>
              <Button variant="default" size="sm" asChild>
                  <Link href={`/dashboard/rooms/new?propertyId=${property.MaNhaTro}`}>
                      <Plus className="mr-2 h-4 w-4" /> Thêm phòng
                  </Link>
              </Button>
          </div>
          <CardDescription>Quản lý các phòng thuộc nhà trọ này.</CardDescription>
        </CardHeader>
        <CardContent>
          {property.rooms && property.rooms.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {property.rooms.map(room => (
                <Card key={room.MaPhong}>
                  <CardHeader>
                    <CardTitle className="flex justify-between items-center">
                        {room.TenPhong}
                        <Badge variant={
                            room.TrangThai === 'Đang thuê' ? 'default' :
                            room.TrangThai === 'Còn trống' ? 'outline' :
                            'secondary'
                        }>
                            {room.TrangThai}
                        </Badge>
                    </CardTitle>
                    <CardDescription>
                        {/* Hiển thị loại phòng và giá nếu có */}
                        {room.roomType?.TenLoai ? `${room.roomType.TenLoai} - ` : ''}
                        {room.roomType?.Gia ? `${room.roomType.Gia.toLocaleString()} VNĐ/tháng` : 'Chưa có giá'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                          {room.GhiChu || "Không có ghi chú cho phòng này."}
                      </p>
                  </CardContent>
                  <CardFooter className="flex justify-end border-t pt-4 px-4"> {/* THÊM px-4 vào đây */}
                      {/* Bọc các nút trong một div mới để kiểm soát flex tốt hơn */}
                      <div className="flex flex-wrap justify-end gap-1 sm:gap-2">
                          <Button variant="outline" size="sm" asChild>
                              <Link href={`/dashboard/rooms/${room.MaPhong}`}>
                                  <Eye className="mr-1 h-4 w-4" /> Chi tiết
                              </Link>
                          </Button>
                          <Button variant="outline" size="sm" asChild>
                              <Link href={`/dashboard/rooms/${room.MaPhong}/edit`}>
                                  <Edit className="mr-1 h-4 w-4" /> Sửa
                              </Link>
                          </Button>
                          <AlertDialog>
                              <AlertDialogTrigger asChild>
                                  <Button variant="destructive" size="sm" disabled={room.TrangThai === 'Đang thuê'}>
                                      <Trash2 className="mr-1 h-4 w-4" /> Xóa
                                  </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                  <AlertDialogHeader>
                                      <AlertDialogTitle>Xác nhận xóa phòng?</AlertDialogTitle>
                                      <AlertDialogDescription>
                                          Hành động này không thể hoàn tác. Phòng "{room.TenPhong}" sẽ bị xóa.
                                          Nếu phòng này đang có hợp đồng hiệu lực hoặc đặt cọc, bạn không thể xóa.
                                      </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                      <AlertDialogCancel>Hủy</AlertDialogCancel>
                                      <AlertDialogAction onClick={() => handleDeleteRoom(room.MaPhong, room.TenPhong)}>
                                          Xóa
                                      </AlertDialogAction>
                                  </AlertDialogFooter>
                              </AlertDialogContent>
                          </AlertDialog>
                      </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <HomeIcon className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-medium">Chưa có phòng nào</h3>
              <p className="mt-2 text-sm text-muted-foreground">Nhà trọ này hiện chưa có phòng nào.</p>
              <Button asChild className="mt-4">
                 <Link href={`/dashboard/rooms/new?propertyId=${property.MaNhaTro}`}>Thêm phòng ngay</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}