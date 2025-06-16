'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';
import { createRoomType } from '@/services/roomTypeService';
import { RoomTypeForm } from './../RoomTypeForm'; // Import form dùng chung
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function NewRoomTypePage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const propertyId = Number(params.id);

  const handleSubmit = async (values: any) => {
    setIsSubmitting(true);
    try {
      await createRoomType({ ...values, MaNhaTro: propertyId });
      toast({
        title: 'Thành công',
        description: 'Đã tạo loại phòng mới.',
      });
      router.push(`/dashboard/properties/${propertyId}/room-types`);
      router.refresh(); // Làm mới dữ liệu trang danh sách
    } catch (error: any) {
      toast({
        title: 'Lỗi',
        description: error.message || 'Không thể tạo loại phòng. Vui lòng thử lại.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
        <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" asChild>
                <Link href={`/dashboard/properties/${propertyId}/room-types`}>
                    <ArrowLeft className="h-4 w-4" />
                </Link>
            </Button>
            <h1 className="text-xl font-bold">Tạo loại phòng mới</h1>
        </div>
        <RoomTypeForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
    </div>
  );
}