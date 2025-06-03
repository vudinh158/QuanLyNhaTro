"use client";

import { useEffect, useState, FormEvent } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { ArrowLeft, Save } from 'lucide-react';
import { getRoomById, updateRoom, getAllRoomTypes } from '@/services/roomService';
import { getMyProperties } from '@/services/propertyService';
import type { Room, RoomType, UpdateRoomData } from '@/types/room';
import type { Property } from '@/types/property';
import { useAuth } from '@/contexts/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';

export default function EditRoomPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const { user, isLoading: authLoading } = useAuth();

  const [room, setRoom] = useState<Room | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [properties, setProperties] = useState<Property[]>([]);
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);

  const [selectedRoomTypeId, setSelectedRoomTypeId] = useState<string>('');
  const [tenPhong, setTenPhong] = useState('');
  const [trangThai, setTrangThai] = useState<'Còn trống' | 'Đang thuê' | 'Đang sửa chữa' | 'Khác'>('Còn trống');
  const [ghiChu, setGhiChu] = useState('');
  const [currentPropertyInfo, setCurrentPropertyInfo] = useState<string>('');


  const roomId = Number(params.id);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/login');
      return;
    }
     if (user.role?.TenVaiTro !== 'Chủ trọ') {
      toast({ title: "Lỗi", description: "Bạn không có quyền sửa phòng.", variant: "destructive" });
      router.push('/dashboard');
      return;
    }

    if (isNaN(roomId)) {
      toast({ title: "Lỗi", description: "Mã phòng không hợp lệ.", variant: "destructive" });
      router.push('/dashboard/rooms');
      return;
    }

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [roomData, typesData, propsData] = await Promise.all([
          getRoomById(roomId),
          getAllRoomTypes(),
          getMyProperties()
        ]);

        setRoom(roomData);
        setRoomTypes(typesData);
        setProperties(propsData); 

        setTenPhong(roomData.TenPhong);
        setSelectedRoomTypeId(roomData.MaLoaiPhong.toString());
        setTrangThai(roomData.TrangThai);
        setGhiChu(roomData.GhiChu || "");

        const propertyOfRoom = propsData.find(p => p.MaNhaTro === roomData.MaNhaTro);
        setCurrentPropertyInfo(propertyOfRoom ? propertyOfRoom.TenNhaTro : 'Không xác định');

      } catch (error: any) {
        toast({
          title: "Lỗi tải thông tin phòng",
          description: error.message || "Không thể tải dữ liệu. Vui lòng thử lại.",
          variant: "destructive",
        });
        router.push('/dashboard/rooms');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [roomId, user, authLoading, router, toast]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedRoomTypeId || !tenPhong) {
      toast({ title: "Lỗi", description: "Vui lòng điền đầy đủ loại phòng và tên phòng.", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);

    const roomUpdateData: UpdateRoomData = {
      MaLoaiPhong: Number(selectedRoomTypeId),
      TenPhong: tenPhong,
      TrangThai: trangThai,
      GhiChu: ghiChu || undefined,
    };

    try {
      await updateRoom(roomId, roomUpdateData);
      toast({
        title: "Thành công",
        description: "Đã cập nhật thông tin phòng.",
      });
      router.push(`/dashboard/rooms?propertyId=${room?.MaNhaTro}`); 
    } catch (error: any) {
      toast({
        title: "Lỗi cập nhật phòng",
        description: error.message || "Không thể cập nhật. Vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || authLoading || !room) {
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
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-20 w-full" />
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
                <Skeleton className="h-10 w-20" />
                <Skeleton className="h-10 w-32" />
            </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="flex items-center mb-6">
        <Button variant="outline" size="icon" asChild className="mr-2">
          <Link href={`/dashboard/rooms?propertyId=${room.MaNhaTro}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">Chỉnh sửa phòng: {room.TenPhong}</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Thông tin phòng</CardTitle>
            <CardDescription>Cập nhật chi tiết cho phòng.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="property">Nhà trọ</Label>
              <Input id="property" value={currentPropertyInfo} disabled />
              <p className="text-xs text-muted-foreground">Không thể thay đổi nhà trọ của phòng.</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="roomType">
                Loại phòng <span className="text-red-500">*</span>
              </Label>
              <Select value={selectedRoomTypeId} onValueChange={setSelectedRoomTypeId} required>
                <SelectTrigger id="roomType">
                  <SelectValue placeholder="Chọn loại phòng" />
                </SelectTrigger>
                <SelectContent>
                  {roomTypes.map(type => (
                    <SelectItem key={type.MaLoaiPhong} value={type.MaLoaiPhong.toString()}>
                      {type.TenLoai} (Giá: {type.Gia?.toLocaleString()} VNĐ)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="roomName">
                Tên phòng <span className="text-red-500">*</span>
              </Label>
              <Input
                id="roomName"
                placeholder="Ví dụ: P101, Phòng A2"
                required
                value={tenPhong}
                onChange={(e) => setTenPhong(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Trạng thái</Label>
              <Select
                value={trangThai}
                onValueChange={(value: 'Còn trống' | 'Đang thuê' | 'Đang sửa chữa' | 'Khác') => setTrangThai(value)}
                disabled={room.TrangThai === 'Đang thuê'} 
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Chọn trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Còn trống">Còn trống</SelectItem>
                  <SelectItem value="Đang sửa chữa">Đang sửa chữa</SelectItem>
                  <SelectItem value="Khác">Khác</SelectItem>
                  {room.TrangThai === 'Đang thuê' && <SelectItem value="Đang thuê" disabled>Đang thuê</SelectItem>}
                </SelectContent>
              </Select>
              {room.TrangThai === 'Đang thuê' && <p className="text-xs text-muted-foreground">Không thể thay đổi trạng thái phòng đang có người thuê. Cần chấm dứt hợp đồng trước.</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="note">Ghi chú</Label>
              <Textarea
                id="note"
                placeholder="Mô tả thêm về phòng (nếu có)"
                value={ghiChu}
                onChange={(e) => setGhiChu(e.target.value)}
              />
            </div>
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