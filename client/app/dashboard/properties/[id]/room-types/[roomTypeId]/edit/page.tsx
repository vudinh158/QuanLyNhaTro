'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';
import { getRoomTypeById, updateRoomType } from '@/services/roomTypeService';
import { RoomTypeForm } from '../../RoomTypeForm'; // Chú ý đường dẫn lùi 2 cấp
import type { RoomType } from '@/types/roomType';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';


export default function EditRoomTypePage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();

  const [roomType, setRoomType] = useState<RoomType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const propertyId = Number(params.id);
  const roomTypeId = Number(params.roomTypeId);

  useEffect(() => {
    const fetchRoomType = async () => {
      setIsLoading(true);
      try {
        const data = await getRoomTypeById(roomTypeId);
        setRoomType(data);
      } catch (error) {
        toast({ title: 'Lỗi', description: 'Không thể tải dữ liệu loại phòng.', variant: 'destructive' });
        router.push(`/dashboard/properties/${propertyId}/room-types`);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRoomType();
  }, [roomTypeId, propertyId, router, toast]);

  const handleSubmit = async (values: any) => {
    setIsSubmitting(true);
    try {
      await updateRoomType(roomTypeId, values);
      toast({
        title: 'Thành công',
        description: 'Đã cập nhật thông tin loại phòng.',
      });
      router.push(`/dashboard/properties/${propertyId}/room-types`);
      router.refresh();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message;
      toast({
        title: 'Lỗi',
        description: errorMessage, // Sử dụng errorMessage đã được trích xuất
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <Skeleton className="w-full h-[400px]" />;
  }

  return (
    <div className="space-y-4">
        <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" asChild>
                <Link href={`/dashboard/properties/${propertyId}/room-types`}>
                    <ArrowLeft className="h-4 w-4" />
                </Link>
            </Button>
            <h1 className="text-xl font-bold">Chỉnh sửa loại phòng</h1>
        </div>
        <RoomTypeForm initialData={roomType} onSubmit={handleSubmit} isSubmitting={isSubmitting} />
    </div>
    );
}