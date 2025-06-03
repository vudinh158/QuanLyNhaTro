"use client";

import { useEffect, useState, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { ArrowLeft, PlusCircle } from 'lucide-react';
import { createRoom, getAllRoomTypes } from '@/services/roomService';
import { getMyProperties } from '@/services/propertyService'; 
import type { NewRoomData, RoomType } from '@/types/room';
import type { Property } from '@/types/property';
import { useAuth } from '@/contexts/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';

export default function NewRoomPage() {
  const router = useRouter();
  const searchParamsHook = useSearchParams();
  const { toast } = useToast();
  const { user, isLoading: authLoading } = useAuth();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);

  const [properties, setProperties] = useState<Property[]>([]);
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);

  // Form state
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>(searchParamsHook.get('propertyId') || '');
  const [selectedRoomTypeId, setSelectedRoomTypeId] = useState<string>('');
  const [tenPhong, setTenPhong] = useState('');
  const [trangThai, setTrangThai] = useState<'Còn trống' | 'Đang sửa chữa' | 'Khác'>('Còn trống');
  const [ghiChu, setGhiChu] = useState('');

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/login');
      return;
    }
    if (user.role?.TenVaiTro !== 'Chủ trọ') {
      toast({ title: "Lỗi", description: "Bạn không có quyền tạo phòng.", variant: "destructive" });
      router.push('/dashboard');
      return;
    }

    const fetchData = async () => {
      setIsLoadingData(true);
      try {
        const [propsData, typesData] = await Promise.all([
          getMyProperties(),
          getAllRoomTypes()
        ]);
        setProperties(propsData);
        setRoomTypes(typesData);
        if(searchParamsHook.get('propertyId') && propsData.find(p => p.MaNhaTro.toString() === searchParamsHook.get('propertyId'))){
            setSelectedPropertyId(searchParamsHook.get('propertyId')!);
        } else if (propsData.length > 0 && !searchParamsHook.get('propertyId')) {
            setSelectedPropertyId(propsData[0].MaNhaTro.toString());
        }

      } catch (error) {
        toast({ title: "Lỗi tải dữ liệu", description: "Không thể tải danh sách nhà trọ hoặc loại phòng.", variant: "destructive" });
      } finally {
        setIsLoadingData(false);
      }
    };
    fetchData();
  }, [user, authLoading, router, toast, searchParamsHook]);


  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedPropertyId || !selectedRoomTypeId || !tenPhong) {
      toast({ title: "Lỗi", description: "Vui lòng điền đầy đủ thông tin bắt buộc.", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);

    const roomData: NewRoomData = {
      MaNhaTro: Number(selectedPropertyId),
      MaLoaiPhong: Number(selectedRoomTypeId),
      TenPhong: tenPhong,
      TrangThai: trangThai,
      GhiChu: ghiChu || undefined,
    };

    try {
      await createRoom(roomData);
      toast({
        title: "Thành công",
        description: "Đã thêm phòng mới.",
      });
      router.push(`/dashboard/rooms?propertyId=${selectedPropertyId}`);
    } catch (error: any) {
      toast({
        title: "Lỗi thêm phòng",
        description: error.message || "Không thể thêm phòng. Vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading || isLoadingData) {
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
          <Link href={selectedPropertyId ? `/dashboard/rooms?propertyId=${selectedPropertyId}` : "/dashboard/rooms"}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">Thêm phòng mới</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Thông tin phòng</CardTitle>
            <CardDescription>Nhập thông tin chi tiết cho phòng mới.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="property">
                Nhà trọ <span className="text-red-500">*</span>
              </Label>
              <Select value={selectedPropertyId} onValueChange={setSelectedPropertyId} required>
                <SelectTrigger id="property">
                  <SelectValue placeholder="Chọn nhà trọ" />
                </SelectTrigger>
                <SelectContent>
                  {properties.map(prop => (
                    <SelectItem key={prop.MaNhaTro} value={prop.MaNhaTro.toString()}>
                      {prop.TenNhaTro}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
              <Select value={trangThai} onValueChange={(value: 'Còn trống' | 'Đang sửa chữa' | 'Khác') => setTrangThai(value)}>
                <SelectTrigger id="status">
                  <SelectValue placeholder="Chọn trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Còn trống">Còn trống</SelectItem>
                  <SelectItem value="Đang sửa chữa">Đang sửa chữa</SelectItem>
                  <SelectItem value="Khác">Khác</SelectItem>
                </SelectContent>
              </Select>
               <p className="text-xs text-muted-foreground">Trạng thái "Đang thuê" sẽ được tự động cập nhật khi có hợp đồng.</p>
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
            <Button type="submit" disabled={isSubmitting || isLoadingData}>
              {isSubmitting ? "Đang lưu..." : <><PlusCircle className="mr-2 h-4 w-4" /> Thêm phòng</>}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}