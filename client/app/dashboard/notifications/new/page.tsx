// file: client/app/dashboard/notifications/new/page.tsx
'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";

import { createNotification } from "@/services/notificationService";
import { getMyProperties } from "@/services/propertyService";
import { getRoomsByProperty } from "@/services/roomService";
import { getAllTenantsForLandlord } from "@/services/tenantService";

import { Property } from "@/types/property";
import { Room } from "@/types/room";
import { Tenant } from "@/types/tenant";

// Định nghĩa schema validation cho form
const notificationFormSchema = z.object({
  TieuDe: z.string().min(1, "Tiêu đề không được để trống."),
  NoiDung: z.string().min(1, "Nội dung không được để trống."),
  targetType: z.enum(['property', 'room', 'tenant'], { required_error: "Vui lòng chọn đối tượng nhận." }),
  MaNhaTroNhan: z.number().optional(),
  MaPhongNhan: z.number().optional(),
  MaNguoiNhan: z.number().optional(),
}).refine(data => {
    if (data.targetType === 'property') return !!data.MaNhaTroNhan;
    if (data.targetType === 'room') return !!data.MaPhongNhan;
    if (data.targetType === 'tenant') return !!data.MaNguoiNhan;
    return false;
}, { message: "Vui lòng chọn giá trị cụ thể cho đối tượng nhận.", path: ["MaNhaTroNhan"] });

type NotificationFormValues = z.infer<typeof notificationFormSchema>;

export default function NewNotificationPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [properties, setProperties] = useState<Property[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<NotificationFormValues>({
    resolver: zodResolver(notificationFormSchema),
  });

  const targetType = form.watch('targetType');
  const selectedPropertyId = form.watch('MaNhaTroNhan');

  useEffect(() => {
    getMyProperties().then(setProperties).catch(console.error);
    getAllTenantsForLandlord({}).then(setTenants).catch(console.error);
  }, []);

  useEffect(() => {
    if (targetType === 'room' && selectedPropertyId) {
      getRoomsByProperty(selectedPropertyId).then(setRooms).catch(console.error);
    } else {
      setRooms([]);
    }
  }, [targetType, selectedPropertyId]);

  const onSubmit = async (data: NotificationFormValues) => {
    setIsLoading(true);
    try {
      const payload = {
        TieuDe: data.TieuDe,
        NoiDung: data.NoiDung,
        LoaiNguoiNhan: 'Khách thuê' as const, // Chủ trọ luôn gửi cho Khách thuê
        MaNhaTroNhan: data.targetType === 'property' ? data.MaNhaTroNhan : undefined,
        MaPhongNhan: data.targetType === 'room' ? data.MaPhongNhan : undefined,
        MaNguoiNhan: data.targetType === 'tenant' ? data.MaNguoiNhan : undefined,
      };
      
      await createNotification(payload);
      toast({ title: "Thành công", description: "Đã gửi thông báo." });
      router.push('/dashboard/notifications');
      router.refresh();
    } catch (error: any) {
      toast({ title: "Lỗi", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto max-w-2xl py-10">
      <h1 className="text-2xl font-bold tracking-tight mb-6">Gửi thông báo mới</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Soạn thông báo</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <FormField control={form.control} name="targetType" render={({ field }) => (
                <FormItem>
                  <FormLabel>Gửi đến</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Chọn đối tượng nhận..." /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="property">Tất cả các phòng trong Nhà trọ</SelectItem>
                      <SelectItem value="room">Một phòng cụ thể</SelectItem>
                      <SelectItem value="tenant">Một khách thuê cụ thể</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}/>

              {targetType === 'property' && (
                <FormField control={form.control} name="MaNhaTroNhan" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Chọn Nhà trọ</FormLabel>
                    <Select onValueChange={(v) => field.onChange(Number(v))} defaultValue={String(field.value)}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Chọn nhà trọ..." /></SelectTrigger></FormControl>
                      <SelectContent>{properties.map(p => <SelectItem key={p.MaNhaTro} value={String(p.MaNhaTro)}>{p.TenNhaTro}</SelectItem>)}</SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}/>
              )}

              {targetType === 'room' && (
                <div className="space-y-4">
                  <FormField control={form.control} name="MaNhaTroNhan" render={({ field }) => (
                     <FormItem>
                       <FormLabel>Thuộc Nhà trọ</FormLabel>
                       <Select onValueChange={(v) => field.onChange(Number(v))} defaultValue={String(field.value)}>
                         <FormControl><SelectTrigger><SelectValue placeholder="Chọn nhà trọ để xem phòng..." /></SelectTrigger></FormControl>
                         <SelectContent>{properties.map(p => <SelectItem key={p.MaNhaTro} value={String(p.MaNhaTro)}>{p.TenNhaTro}</SelectItem>)}</SelectContent>
                       </Select>
                     </FormItem>
                  )}/>
                  <FormField control={form.control} name="MaPhongNhan" render={({ field }) => (
                     <FormItem>
                       <FormLabel>Chọn Phòng</FormLabel>
                       <Select onValueChange={(v) => field.onChange(Number(v))} defaultValue={String(field.value)} disabled={!selectedPropertyId || rooms.length === 0}>
                         <FormControl><SelectTrigger><SelectValue placeholder="Chọn phòng..." /></SelectTrigger></FormControl>
                         <SelectContent>{rooms.map(r => <SelectItem key={r.MaPhong} value={String(r.MaPhong)}>{r.TenPhong}</SelectItem>)}</SelectContent>
                       </Select>
                       <FormMessage />
                     </FormItem>
                  )}/>
                </div>
              )}
              
              {targetType === 'tenant' && (
                <FormField control={form.control} name="MaNguoiNhan" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Chọn Khách thuê</FormLabel>
                    <Select onValueChange={(v) => field.onChange(Number(v))} defaultValue={String(field.value)}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Chọn khách thuê..." /></SelectTrigger></FormControl>
                      <SelectContent>{tenants.map(t => <SelectItem key={t.MaKhachThue} value={String(t.MaKhachThue)}>{t.HoTen}</SelectItem>)}</SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}/>
              )}

              <Separator />

              <FormField control={form.control} name="TieuDe" render={({ field }) => (
                <FormItem><FormLabel>Tiêu đề</FormLabel><FormControl><Input placeholder="Ví dụ: Thông báo tiền điện tháng 6" {...field} /></FormControl><FormMessage /></FormItem>
              )}/>

              <FormField control={form.control} name="NoiDung" render={({ field }) => (
                <FormItem><FormLabel>Nội dung</FormLabel><FormControl><Textarea placeholder="Nhập nội dung chi tiết..." rows={5} {...field} /></FormControl><FormMessage /></FormItem>
              )}/>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Gửi thông báo
              </Button>
            </CardFooter>
          </Card>
        </form>
      </Form>
    </div>
  );
}