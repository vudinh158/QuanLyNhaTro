// clone nhatro/client/app/dashboard/services/[id]/page.tsx
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useToast } from '@/components/ui/use-toast';
import { getServiceById } from '@/services/serviceService';
import type { IService } from '@/types/service';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, Edit, Calendar as CalendarIcon, Tag, Building, DollarSign } from 'lucide-react';
import { format } from 'date-fns';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { addPriceToService } from '@/services/serviceService';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Pencil, Trash2 } from 'lucide-react';
import { IServicePriceHistory } from '../../../../types/servicePriceHistory';

const priceFormSchema = z.object({
    DonGiaMoi: z.coerce.number().min(0, "Đơn giá phải là số không âm."),
    NgayApDung: z.date({ required_error: "Vui lòng chọn ngày áp dụng." }),
  });
  type PriceFormValues = z.infer<typeof priceFormSchema>;

export default function ServiceDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const serviceId = Number(params.id);

  const [service, setService] = useState<IService | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    
    const priceForm = useForm<PriceFormValues>();
    const [isAddingPrice, setIsAddingPrice] = useState(false);

    const [isEditPriceDialogOpen, setIsEditPriceDialogOpen] = useState(false);
    const [editingPriceRecord, setEditingPriceRecord] = useState<IServicePriceHistory | null>(null);

  useEffect(() => {
    if (isNaN(serviceId)) {
      toast({ title: "Lỗi", description: "ID dịch vụ không hợp lệ.", variant: "destructive" });
      router.push('/dashboard/services');
      return;
    }

    const fetchData = async () => {
      try {
        const serviceRes = await getServiceById(serviceId);
        setService(serviceRes);
      } catch (error) {
        toast({ title: "Lỗi", description: "Không thể tải dữ liệu dịch vụ.", variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [serviceId, router, toast]);
    
  const currentPriceRecord = useMemo(() => {
    if (!service?.priceHistories) return null;
    const now = new Date();
    const validPrices = service.priceHistories.filter(h => new Date(h.NgayApDung) <= now);
    return validPrices[0] || null;
  }, [service]);

  const handleAddPrice = async (values: PriceFormValues) => {
    setIsAddingPrice(true);
    try {
        await addPriceToService(serviceId, values);
        toast({ title: "Thành công", description: "Đã cập nhật giá mới cho dịch vụ." });
        // Tải lại dữ liệu để cập nhật bảng lịch sử
        const serviceData = await getServiceById(serviceId);
        setService(serviceData);
        priceForm.reset();
    } catch (error: any) {
        toast({ title: "Lỗi", description: error.response?.data?.message || "Cập nhật giá thất bại.", variant: "destructive" });
    } finally {
        setIsAddingPrice(false);
    }
};

  if (isLoading) return <p className="text-center p-8">Đang tải dữ liệu...</p>;
  if (!service) return <p className="text-center p-8">Không tìm thấy dịch vụ.</p>;
  

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/dashboard/services"><ArrowLeft className="h-4 w-4" /></Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{service.TenDV}</h1>
            <Badge variant={service.LoaiDichVu === 'Cố định hàng tháng' ? 'default' : 'outline'}>{service.LoaiDichVu}</Badge>
          </div>
        </div>
        <Button asChild>
          <Link href={`/dashboard/services/${service.MaDV}/edit`}>
            <Edit className="mr-2 h-4 w-4" /> Chỉnh sửa
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader><CardTitle>Thông tin cơ bản</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center">
            <DollarSign className="h-5 w-5 mr-3 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Đơn giá hiện tại</p>
              <p className="font-semibold">{currentPriceRecord ? `${Number(currentPriceRecord.DonGiaMoi).toLocaleString('vi-VN')} VNĐ` : "Chưa có giá hiệu lực"}</p>
            </div>
          </div>
          <div className="flex items-center">
            <Tag className="h-5 w-5 mr-3 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Đơn vị tính</p>
              <p className="font-semibold">{service.DonViTinh}</p>
            </div>
          </div>
          {service.GhiChu && (
            <div className="pt-2">
              <p className="text-sm font-medium">Ghi chú</p>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{service.GhiChu}</p>
            </div>
          )}
        </CardContent>
      </Card>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Các nhà trọ áp dụng</CardTitle></CardHeader>
          <CardContent>
            {service.appliedToProperties && service.appliedToProperties.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {service.appliedToProperties.map(prop => (
                  <Badge key={prop.MaNhaTro} variant="secondary">{prop.TenNhaTro}</Badge>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Dịch vụ này chưa được áp dụng cho nhà trọ nào.</p>
            )}
          </CardContent>
              </Card>
              <Card>
                    <CardHeader><CardTitle>Cập nhật giá mới</CardTitle></CardHeader>
                    <CardContent>
                        <Form {...priceForm}>
                            <form onSubmit={priceForm.handleSubmit(handleAddPrice)} className="space-y-4">
                                <FormField control={priceForm.control} name="DonGiaMoi" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Đơn giá mới (VNĐ)</FormLabel>
                                        <FormControl><Input type="number" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}/>
                                <FormField control={priceForm.control} name="NgayApDung" render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel>Ngày áp dụng</FormLabel>
                                        <Popover>
                                            <PopoverTrigger asChild><FormControl>
                                                <Button variant={"outline"} className={cn(!field.value && "text-muted-foreground")}>
                                                    {field.value ? format(field.value, "dd/MM/yyyy") : <span>Chọn ngày</span>}
                                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                </Button>
                                            </FormControl></PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                                            </PopoverContent>
                                        </Popover>
                                        <FormMessage />
                                    </FormItem>
                                )}/>
                                <Button type="submit" disabled={isAddingPrice}>
                                    {isAddingPrice ? 'Đang thêm...' : 'Thêm giá mới'}
                                </Button>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
                <Card>
  <CardHeader><CardTitle>Lịch sử giá</CardTitle></CardHeader>
  <CardContent>
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Đơn giá mới</TableHead>
          <TableHead>Ngày áp dụng</TableHead>
          <TableHead className="text-right">Hành động</TableHead> {/* Thêm cột */}
        </TableRow>
      </TableHeader>
      <TableBody>
        {service.priceHistories && service.priceHistories.length > 0 ? (
          service.priceHistories.map((historyItem) => (
            <TableRow key={historyItem.MaLichSuDV}>
              <TableCell className="font-medium">{Number(historyItem.DonGiaMoi).toLocaleString()} VNĐ</TableCell>
              <TableCell>{format(new Date(historyItem.NgayApDung), 'dd/MM/yyyy')}</TableCell>
              {/* THÊM CÁC NÚT HÀNH ĐỘNG */}
              <TableCell className="text-right">
                <Button variant="ghost" size="icon" onClick={() => { setEditingPriceRecord(historyItem); setIsEditPriceDialogOpen(true); }}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => { /* Mở dialog xóa */ }}>
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow><TableCell colSpan={3} className="text-center">Chưa có lịch sử giá.</TableCell></TableRow>
        )}
      </TableBody>
    </Table>
  </CardContent>
</Card>

{/* Dialog để sửa giá (ví dụ) */}
<Dialog open={isEditPriceDialogOpen} onOpenChange={setIsEditPriceDialogOpen}>
    <DialogContent>
        <DialogHeader>
            <DialogTitle>Chỉnh sửa mốc giá</DialogTitle>
            <DialogDescription>
                Chỉnh sửa giá và ngày áp dụng. Hành động này không thể thực hiện nếu giá đã được dùng trong hóa đơn.
            </DialogDescription>
        </DialogHeader>
        {/* Đặt form sửa giá ở đây */}
    </DialogContent>
</Dialog>
      </div>
    </div>
  );
}