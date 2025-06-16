'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { createService } from '@/services/serviceService'; // Sửa lại service nếu cần
import { getMyProperties } from '@/services/propertyService'; // Hàm lấy danh sách nhà trọ
import type { Property } from '@/types/property';

// Định nghĩa schema validation
const formSchema = z.object({
  TenDV: z.string().min(3, { message: 'Tên dịch vụ phải có ít nhất 3 ký tự.' }),
  DonViTinh: z.string().min(1, { message: 'Đơn vị tính là bắt buộc.' }),
  LoaiDichVu: z.enum(['Cố định', 'Sử dụng'], { required_error: 'Vui lòng chọn loại dịch vụ.' }),
  MoTa: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function NewServicePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // === BẮT ĐẦU THAY ĐỔI ===
  const [serviceScope, setServiceScope] = useState<'general' | 'specific'>('general');
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<string | null>(null);
  // === KẾT THÚC THAY ĐỔI ===

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { TenDV: '', DonViTinh: '', MoTa: '' },
  });

  // Lấy danh sách nhà trọ của chủ trọ khi component được tải
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const props = await getMyProperties(); // API lấy tất cả nhà trọ của chủ trọ
        setProperties(props);
      } catch (error) {
        toast({ title: "Lỗi", description: "Không thể tải danh sách nhà trọ.", variant: "destructive" });
      }
    };
    fetchProperties();
  }, [toast]);

  const handleSubmit = async (values: FormValues) => {
    // === BẮT ĐẦU THAY ĐỔI LOGIC ===
    if (serviceScope === 'specific' && !selectedProperty) {
      toast({ title: "Lỗi", description: "Vui lòng chọn một nhà trọ cho dịch vụ riêng.", variant: "destructive" });
      return;
    }

    const serviceData = {
      ...values,
      MaNhaTro: serviceScope === 'specific' ? Number(selectedProperty) : null,
    };
    // === KẾT THÚC THAY ĐỔI LOGIC ===

    setIsSubmitting(true);
    try {
      await createService(serviceData);
      toast({
        title: 'Thành công',
        description: 'Đã tạo dịch vụ mới.',
      });
      router.push('/dashboard/services');
      router.refresh();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Không thể tạo dịch vụ. Vui lòng thử lại.';
      toast({
        title: 'Lỗi',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tạo mới Dịch vụ</CardTitle>
        <CardDescription>Điền thông tin để tạo một dịch vụ mới cho nhà trọ của bạn.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            
            {/* === BẮT ĐẦU THAY ĐỔI GIAO DIỆN === */}
            <FormItem className="space-y-3">
              <FormLabel>Phạm vi áp dụng *</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={(value) => setServiceScope(value as 'general' | 'specific')}
                  defaultValue={serviceScope}
                  className="flex flex-col space-y-1"
                >
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl><RadioGroupItem value="general" /></FormControl>
                    <FormLabel className="font-normal">Dịch vụ chung (Dùng cho nhiều nhà trọ)</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl><RadioGroupItem value="specific" /></FormControl>
                    <FormLabel className="font-normal">Dịch vụ riêng (Chỉ cho một nhà trọ)</FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>

            {serviceScope === 'specific' && (
              <FormField
                name="MaNhaTro" // Tên này chỉ để liên kết logic, không có trong form schema
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Chọn nhà trọ *</FormLabel>
                    <Select onValueChange={setSelectedProperty} defaultValue={selectedProperty || undefined}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn một nhà trọ để áp dụng dịch vụ riêng..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {properties.map(prop => (
                          <SelectItem key={prop.MaNhaTro} value={String(prop.MaNhaTro)}>
                            {prop.TenNhaTro}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            {/* === KẾT THÚC THAY ĐỔI GIAO DIỆN === */}

            <FormField
              control={form.control}
              name="TenDV"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tên dịch vụ *</FormLabel>
                  <FormControl><Input placeholder="Ví dụ: Internet FPT 100Mbps" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="DonViTinh"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Đơn vị tính *</FormLabel>
                    <FormControl><Input placeholder="Ví dụ: Tháng, Kg, Bình" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="LoaiDichVu"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Loại dịch vụ *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder="Chọn loại hình dịch vụ" /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Cố định">Cố định (Thu theo tháng)</SelectItem>
                        <SelectItem value="Sử dụng">Theo mức sử dụng</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="MoTa"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mô tả</FormLabel>
                  <FormControl><Textarea placeholder="Mô tả chi tiết về dịch vụ..." {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Đang xử lý...' : 'Tạo mới'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}