'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import type { RoomType } from '@/types/roomType';

// Định nghĩa schema validation bằng Zod
const formSchema = z.object({
  TenLoai: z.string().min(3, { message: 'Tên loại phòng phải có ít nhất 3 ký tự.' }),
  Gia: z.coerce.number().min(0, { message: 'Giá phòng phải là một số dương.' }),
  DienTich: z.coerce.number().min(0, { message: 'Diện tích phải là một số dương.' }).optional().or(z.literal('')),
  SoNguoiToiDa: z.coerce.number().int().min(1, { message: 'Số người tối đa phải lớn hơn 0.' }).optional().or(z.literal('')),
  MoTa: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface RoomTypeFormProps {
  initialData?: RoomType | null;
  onSubmit: (values: FormValues) => void;
  isSubmitting: boolean;
}

export function RoomTypeForm({ initialData, onSubmit, isSubmitting }: RoomTypeFormProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      TenLoai: initialData?.TenLoai || '',
      Gia: initialData?.Gia || 0,
      DienTich: initialData?.DienTich || '',
      SoNguoiToiDa: initialData?.SoNguoiToiDa || '',
      MoTa: initialData?.MoTa || '',
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>{initialData ? 'Chỉnh sửa Loại phòng' : 'Tạo mới Loại phòng'}</CardTitle>
        <CardDescription>
          {initialData ? 'Cập nhật thông tin cho loại phòng.' : 'Điền thông tin để tạo một loại phòng mới.'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="TenLoai"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tên loại phòng *</FormLabel>
                  <FormControl>
                    <Input placeholder="Ví dụ: Phòng có gác" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="Gia"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Giá đề xuất (VNĐ/tháng) *</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="Ví dụ: 3000000" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="DienTich"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Diện tích (m²)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Ví dụ: 25" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="SoNguoiToiDa"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Số người tối đa</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Ví dụ: 2" {...field} />
                    </FormControl>
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
                  <FormControl>
                    <Textarea
                      placeholder="Mô tả các tiện nghi, đặc điểm của loại phòng này..."
                      className="resize-y"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Đang xử lý...' : (initialData ? 'Lưu thay đổi' : 'Tạo mới')}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}