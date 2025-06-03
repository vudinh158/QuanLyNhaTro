"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { ArrowLeft, Edit, Home as HomeIcon, Users, FileText as ContractIcon, Plus } from 'lucide-react';
import { getPropertyById } from '@/services/propertyService';
import type { Property } from '@/types/property'; 
import { useAuth } from '@/contexts/AuthContext';
import { Skeleton } from '@/components/ui/skeleton'; 

// (Tùy chọn) Giả sử bạn có type cho Room nếu muốn hiển thị danh sách phòng
// interface RoomSimplified {
//   MaPhong: number;
//   TenPhong: string;
//   TrangThai: string;
//   // ...
// }

export default function PropertyDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const { user, isLoading: authLoading } = useAuth();

  const [property, setProperty] = useState<Property | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  // const [rooms, setRooms] = useState<RoomSimplified[]>([]); // Nếu muốn hiển thị phòng

  const propertyId = Number(params.id);

  useEffect(() => {
    if (authLoading) return; 
    if (!user) {
      router.push('/login');
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
        // (Tùy chọn) Gọi API lấy danh sách phòng của nhà trọ này
        // const roomsData = await getRoomsByPropertyId(propertyId);
        // setRooms(roomsData);
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
            {/* Skeleton cho danh sách phòng nếu có */}
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-24" />
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
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

      <Card>
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
                <p className="text-sm text-muted-foreground">Số phòng</p>
                <p className="font-semibold">N/A</p> {/* TODO: Lấy từ API */}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Khách thuê</p>
                <p className="font-semibold">N/A</p> {/* TODO: Lấy từ API */}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ContractIcon className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Hợp đồng</p>
                <p className="font-semibold">N/A</p> {/* TODO: Lấy từ API */}
              </div>
            </div>
          </div>

          {/* (Tùy chọn) Danh sách phòng trong nhà trọ */}
          {/* <div className="border-t pt-4">
            <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold">Danh sách phòng</h3>
                <Button variant="outline" size="sm" asChild>
                    <Link href={`/dashboard/rooms/new?propertyId=${property.MaNhaTro}`}>
                        <Plus className="mr-2 h-4 w-4" /> Thêm phòng
                    </Link>
                </Button>
            </div>
            {rooms.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {rooms.map(room => (
                  <Card key={room.MaPhong}>
                    <CardHeader>
                      <CardTitle>{room.TenPhong}</CardTitle>
                      <CardDescription>Trạng thái: {room.TrangThai}</CardDescription>
                    </CardHeader>
                    <CardFooter>
                        <Button variant="outline" size="sm" asChild className="w-full">
                            <Link href={`/dashboard/rooms/${room.MaPhong}`}>Xem chi tiết</Link>
                        </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Chưa có phòng nào trong nhà trọ này.</p>
            )}
          </div> */}
        </CardContent>
      </Card>
    </div>
  );
}