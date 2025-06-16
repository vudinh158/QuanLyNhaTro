'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ServiceForm, ServiceFormValues } from '../ServiceForm';
import { createService } from '@/services/serviceService';
import { getMyProperties } from '@/services/propertyService';
import type { Property } from '@/types/property';

export default function NewServicePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [properties, setProperties] = useState<Property[]>([]);

  useEffect(() => {
    getMyProperties()
      .then(setProperties)
      .catch(() => toast({ title: "Lỗi", description: "Không thể tải danh sách nhà trọ.", variant: "destructive" }));
  }, [toast]);

  const handleSubmit = async (values: ServiceFormValues, selectedPropertyIds: number[]) => {
    setIsSubmitting(true);
    try {
      await createService({ ...values, propertyIds: selectedPropertyIds });
      toast({ title: 'Thành công', description: 'Đã tạo dịch vụ mới.' });
      router.push('/dashboard/services');
      router.refresh();
    } catch (error: any) {
      toast({ title: 'Lỗi', description: error.response?.data?.message || 'Tạo dịch vụ thất bại.', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tạo mới Dịch vụ</CardTitle>
        <CardDescription>Điền thông tin và chọn các nhà trọ sẽ áp dụng dịch vụ này.</CardDescription>
      </CardHeader>
      <CardContent>
        <ServiceForm properties={properties} onSubmit={handleSubmit} isSubmitting={isSubmitting} />
      </CardContent>
    </Card>
  );
}