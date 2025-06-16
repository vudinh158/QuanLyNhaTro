'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import type { Property } from '@/types/property';
import type { IService } from '@/types/service';

// Schema validation để kiểm tra dữ liệu form
const formSchema = z.object({
  TenDV: z.string().min(3, { message: 'Tên dịch vụ phải có ít nhất 3 ký tự.' }),
  DonViTinh: z.string().min(1, { message: 'Đơn vị tính là bắt buộc.' }),
  LoaiDichVu: z.enum(['Cố định hàng tháng', 'Theo số lượng sử dụng', 'Sự cố/Sửa chữa'], { required_error: 'Vui lòng chọn loại dịch vụ.' }),
  DonGia: z.coerce.number().min(0, { message: 'Đơn giá phải là một số không âm.' }),
//   GhiChu: z.string().optional(),
});

export type ServiceFormValues = z.infer<typeof formSchema>;

interface ServiceFormProps {
  initialData?: IService | null;
  properties: Property[];
  onSubmit: (values: ServiceFormValues, selectedPropertyIds: number[]) => void;
  isSubmitting: boolean;
}

export function ServiceForm({ initialData, properties, onSubmit, isSubmitting }: ServiceFormProps) {
  const [selectedPropertyIds, setSelectedPropertyIds] = useState<number[]>(
    initialData?.appliedToProperties?.map(p => p.MaNhaTro) || []
  );
  
  const isEditMode = !!initialData;

  const form = useForm<ServiceFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      TenDV: initialData?.TenDV || '',
      DonViTinh: initialData?.DonViTinh || '',
      LoaiDichVu: initialData?.LoaiDichVu || undefined,
      DonGia: isEditMode ? undefined : 0, // Chỉ yêu cầu giá khi tạo mới
    //   GhiChu: initialData?.GhiChu || '',
    },
  });

  const handlePropertySelection = (propertyId: number) => {
    setSelectedPropertyIds(prev => 
      prev.includes(propertyId) 
        ? prev.filter(id => id !== propertyId) 
        : [...prev, propertyId]
    );
  };

  const internalOnSubmit = (values: ServiceFormValues) => {
    onSubmit(values, selectedPropertyIds);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(internalOnSubmit)} className="space-y-6">
        <FormField control={form.control} name="TenDV" render={({ field }) => (
          <FormItem>
            <FormLabel>Tên dịch vụ *</FormLabel>
            <FormControl><Input placeholder="Ví dụ: Internet FPT 100Mbps" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="DonViTinh" render={({ field }) => (
          <FormItem>
            <FormLabel>Đơn vị tính *</FormLabel>
            <FormControl><Input placeholder="Ví dụ: Tháng, Kg, Bình" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="LoaiDichVu" render={({ field }) => (
          <FormItem>
            <FormLabel>Loại dịch vụ *</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isEditMode}>
              <FormControl><SelectTrigger><SelectValue placeholder="Chọn loại hình dịch vụ" /></SelectTrigger></FormControl>
              <SelectContent>
                <SelectItem value="Cố định hàng tháng">Cố định (Thu theo tháng)</SelectItem>
                <SelectItem value="Theo số lượng sử dụng">Theo mức sử dụng</SelectItem>
                <SelectItem value="Sự cố/Sửa chữa">Sự cố / Sửa chữa</SelectItem>
              </SelectContent>
            </Select>
            {isEditMode && <FormDescription>Không thể thay đổi loại hình của dịch vụ đã tạo.</FormDescription>}
            <FormMessage />
          </FormItem>
        )} />
        
        {!isEditMode && (
          <FormField control={form.control} name="DonGia" render={({ field }) => (
            <FormItem>
              <FormLabel>Đơn giá ban đầu (VNĐ) *</FormLabel>
              <FormControl><Input type="number" placeholder="Ví dụ: 100000" {...field} /></FormControl>
              <FormDescription>Giá này sẽ được áp dụng ngay cho dịch vụ mới.</FormDescription>
              <FormMessage />
            </FormItem>
          )} />
        )}

        <div className="space-y-2">
          <FormLabel>Áp dụng cho các nhà trọ</FormLabel>
          <FormDescription>Chọn các nhà trọ sẽ cung cấp dịch vụ này. Bỏ trống nếu muốn tạo dịch vụ để cấu hình sau.</FormDescription>
          <div className="rounded-md border p-4 space-y-2 max-h-48 overflow-y-auto">
            {properties.map(prop => (
              <FormItem key={prop.MaNhaTro} className="flex flex-row items-center space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={selectedPropertyIds.includes(prop.MaNhaTro)}
                    onCheckedChange={() => handlePropertySelection(prop.MaNhaTro)}
                  />
                </FormControl>
                <FormLabel className="font-normal">{prop.TenNhaTro}</FormLabel>
              </FormItem>
            ))}
          </div>
        </div>

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Đang xử lý...' : (isEditMode ? 'Lưu thay đổi' : 'Tạo mới')}
        </Button>
      </form>
    </Form>
  );
}