'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ServiceForm, ServiceFormValues } from '../ServiceForm';
import { getServiceById, updateService } from '@/services/serviceService';
import { getMyProperties } from '@/services/propertyService';
import type { Property } from '@/types/property';
import type { IService } from '@/types/service';

export default function EditServicePage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const serviceId = Number(params.id);

  const [service, setService] = useState<IService | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isNaN(serviceId)) {
      toast({ title: "Lỗi", description: "ID dịch vụ không hợp lệ.", variant: "destructive" });
      router.push('/dashboard/services');
      return;
    }

    const fetchData = async () => {
      try {
        const [serviceRes, propertiesRes] = await Promise.all([
          getServiceById(serviceId),
          getMyProperties(),
        ]);
        setService(serviceRes);
        setProperties(propertiesRes);
      } catch (error: any) {
        toast({ title: "Lỗi", description: "Không thể tải dữ liệu.", variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [serviceId, router, toast]);

  const handleSubmit = async (values: ServiceFormValues, selectedPropertyIds: number[]) => {
    setIsSubmitting(true);
    try {
      // Logic sửa chỉ gửi những trường có thể thay đổi, không gửi DonGia
      const { DonGia, ...updateValues } = values;
      await updateService(serviceId, { ...updateValues, propertyIds: selectedPropertyIds });
      
      toast({ title: 'Thành công', description: 'Đã cập nhật dịch vụ.' });
      router.push('/dashboard/services');
      router.refresh();
    } catch (error: any) {
      toast({ title: 'Lỗi', description: error.response?.data?.message || 'Cập nhật thất bại.', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <p className="text-center p-8">Đang tải dữ liệu...</p>;
  if (!service) return <p className="text-center p-8">Không tìm thấy dịch vụ.</p>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Chỉnh sửa Dịch vụ</CardTitle>
        <CardDescription>Cập nhật thông tin và phạm vi áp dụng cho dịch vụ "{service.TenDV}".</CardDescription>
      </CardHeader>
      <CardContent>
        <ServiceForm
          initialData={service}
          properties={properties}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />
      </CardContent>
    </Card>
  );
}