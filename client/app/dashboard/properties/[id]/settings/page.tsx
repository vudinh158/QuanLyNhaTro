// clone nhatro/client/app/dashboard/properties/[id]/settings/page.tsx
'use client';

import { useEffect, useState, useMemo, FormEvent } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { getPropertyById } from '@/services/propertyService';
import { getElectricWaterPrices, createElectricWaterPrice } from '@/services/electricWaterPriceService';
import type { Property } from '@/types/property';
import type { IElectricWaterPrice } from '@/types/electricWaterPrice';
import { ArrowLeft, Zap, Droplets, CalendarIcon, Info } from 'lucide-react';
import { format } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from '@/lib/utils';

import { deleteElectricWaterPrice } from '@/services/electricWaterPriceService'; // Thêm import
import { Trash2 } from 'lucide-react'; // Thêm icon
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"; // Thêm import

export default function PropertySettingsPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();

  const propertyId = Number(params.id);
  const [property, setProperty] = useState<Property | null>(null);
  const [priceHistory, setPriceHistory] = useState<IElectricWaterPrice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State cho form
  const [electricPrice, setElectricPrice] = useState<string>('');
  const [waterPrice, setWaterPrice] = useState<string>('');
  const [effectiveDate, setEffectiveDate] = useState<Date | undefined>(new Date());

  const [isDeleting, setIsDeleting] = useState(false);
    const [selectedPrice, setSelectedPrice] = useState<IElectricWaterPrice | null>(null);
    const [isAlertOpen, setIsAlertOpen] = useState(false);
    
    // === Bổ sung: Tính toán giá hiện tại đang áp dụng ===
  const currentPrices = useMemo(() => {
    const now = new Date();
    const findCurrentPrice = (type: 'Điện' | 'Nước') => {
      return priceHistory
        .filter(p => p.Loai === type && new Date(p.NgayApDung) <= now)
        .sort((a, b) => new Date(b.NgayApDung).getTime() - new Date(a.NgayApDung).getTime())[0];
    };
    return {
      electric: findCurrentPrice('Điện'),
      water: findCurrentPrice('Nước'),
    };
  }, [priceHistory]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [propData, priceData] = await Promise.all([
          getPropertyById(propertyId),
          getElectricWaterPrices(propertyId),
        ]);
        setProperty(propData);
        setPriceHistory(priceData);
      } catch (error: any) {
        toast({ title: "Lỗi", description: error.message, variant: 'destructive' });
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [propertyId, toast]);
  
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!effectiveDate) {
        toast({ title: "Lỗi", description: "Vui lòng chọn ngày áp dụng.", variant: "destructive" });
        return;
    }
    setIsSubmitting(true);
    try {
        const promises = [];
        if (electricPrice) {
            promises.push(createElectricWaterPrice({ MaNhaTro: propertyId, Loai: 'Điện', DonGiaMoi: parseFloat(electricPrice), NgayApDung: effectiveDate }));
        }
        if (waterPrice) {
            promises.push(createElectricWaterPrice({ MaNhaTro: propertyId, Loai: 'Nước', DonGiaMoi: parseFloat(waterPrice), NgayApDung: effectiveDate }));
        }

        if(promises.length === 0) {
            toast({ title: "Thông tin", description: "Bạn chưa nhập giá mới để cập nhật." });
            setIsSubmitting(false);
            return;
        }

        await Promise.all(promises);

        toast({ title: 'Thành công', description: 'Đã cập nhật giá điện nước.' });
        
        // Tải lại dữ liệu sau khi cập nhật và reset form
        const updatedPrices = await getElectricWaterPrices(propertyId);
        setPriceHistory(updatedPrices);
        setElectricPrice('');
        setWaterPrice('');

    } catch (error: any) {
        const errorMessage = error.response?.data?.message || "Không thể cập nhật giá.";
        toast({ title: "Lỗi cập nhật giá", description: errorMessage, variant: "destructive" });
    } finally {
        setIsSubmitting(false);
    }
    };
    
    const handleDelete = async () => {
        if (!selectedPrice) return;
        setIsDeleting(true);
        try {
            await deleteElectricWaterPrice(selectedPrice.MaLichSuGiaDienNuoc);
            toast({ title: "Thành công", description: "Đã xóa bản ghi giá." });
            // Cập nhật lại UI
            setPriceHistory(prev => prev.filter(p => p.MaLichSuGiaDienNuoc !== selectedPrice.MaLichSuGiaDienNuoc));
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || "Không thể xóa bản ghi giá.";
            toast({ title: "Lỗi", description: errorMessage, variant: 'destructive' });
        } finally {
            setIsDeleting(false);
            setIsAlertOpen(false);
            setSelectedPrice(null);
        }
    };

  if (isLoading) {
    return <div>Đang tải...</div>;
  }

    return (
        <>
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href={`/dashboard/properties/${propertyId}`}><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Cài đặt nhà trọ</h1>
          <p className="text-muted-foreground">{property?.TenNhaTro}</p>
        </div>
      </div>

      {/* === Bổ sung: Card hiển thị giá hiện tại === */}
      <Card>
        <CardHeader>
            <CardTitle>Giá đang áp dụng</CardTitle>
            <CardDescription>Đây là mức giá đang được sử dụng để tính hóa đơn.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
            <Alert>
                <Zap className="h-4 w-4" />
                <AlertTitle>Điện</AlertTitle>
                <AlertDescription>
                    {currentPrices.electric ? (
                        <>
                            <span className="font-bold text-lg">{currentPrices.electric.DonGiaMoi.toLocaleString('vi-VN')} VNĐ</span> / kWh
                            <p className="text-xs text-muted-foreground">Áp dụng từ: {format(new Date(currentPrices.electric.NgayApDung), 'dd/MM/yyyy')}</p>
                        </>
                    ) : "Chưa có giá"}
                </AlertDescription>
            </Alert>
            <Alert>
                <Droplets className="h-4 w-4" />
                <AlertTitle>Nước</AlertTitle>
                <AlertDescription>
                     {currentPrices.water ? (
                        <>
                            <span className="font-bold text-lg">{currentPrices.water.DonGiaMoi.toLocaleString('vi-VN')} VNĐ</span> / m³
                            <p className="text-xs text-muted-foreground">Áp dụng từ: {format(new Date(currentPrices.water.NgayApDung), 'dd/MM/yyyy')}</p>
                        </>
                    ) : "Chưa có giá"}
                </AlertDescription>
            </Alert>
        </CardContent>
      </Card>
      
      {/* Card cập nhật giá mới */}
      <Card>
        <form onSubmit={handleSubmit}>
            <CardHeader>
                <CardTitle>Cập nhật giá mới</CardTitle>
                <CardDescription>Thiết lập đơn giá điện, nước mới và ngày bắt đầu áp dụng.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="electricPrice">Giá điện mới (VNĐ/kWh)</Label>
                        <Input id="electricPrice" type="number" min="0" placeholder="Bỏ trống nếu không đổi" value={electricPrice} onChange={e => setElectricPrice(e.target.value)} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="waterPrice">Giá nước mới (VNĐ/m³)</Label>
                        <Input id="waterPrice" type="number" min="0" placeholder="Bỏ trống nếu không đổi" value={waterPrice} onChange={e => setWaterPrice(e.target.value)} />
                    </div>
                </div>

                {/* === Bổ sung: Ô chọn ngày áp dụng === */}
                <div className="space-y-2">
                  <Label htmlFor="effectiveDate">Ngày áp dụng</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        id="effectiveDate"
                        variant={"outline"}
                        className={cn("w-full justify-start text-left font-normal", !effectiveDate && "text-muted-foreground")}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {effectiveDate ? format(effectiveDate, "dd/MM/yyyy") : <span>Chọn ngày</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar mode="single" selected={effectiveDate} onSelect={setEffectiveDate} initialFocus />
                    </PopoverContent>
                  </Popover>
                </div>
            </CardContent>
            <CardFooter>
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Đang lưu..." : "Lưu thay đổi"}
                </Button>
            </CardFooter>
        </form>
      </Card>

      {/* === Bổ sung: Bảng lịch sử thay đổi giá === */}
      <Card>
          <CardHeader>
              <CardTitle>Lịch sử thay đổi giá</CardTitle>
          </CardHeader>
          <CardContent>
              <Table>
                  <TableHeader>
                      <TableRow>
                          <TableHead>Loại</TableHead>
                          <TableHead>Đơn giá mới</TableHead>
                          <TableHead>Ngày áp dụng</TableHead>
                          <TableHead className="text-right">Hành động</TableHead>
                                </TableRow>
                  </TableHeader>
                  <TableBody>
                      {priceHistory.length > 0 ? priceHistory.map(item => (
                          <TableRow key={item.MaLichSuGiaDienNuoc}>
                              <TableCell className="font-medium">{item.Loai}</TableCell>
                              <TableCell>{item.DonGiaMoi.toLocaleString('vi-VN')} VNĐ</TableCell>
                              <TableCell>{format(new Date(item.NgayApDung), 'dd/MM/yyyy')}</TableCell>
                                        <TableCell className="text-right">
                                            <Button 
                                                variant="ghost" 
                                                size="icon"
                                                onClick={() => {
                                                    setSelectedPrice(item);
                                                    setIsAlertOpen(true);
                                                }}
                                            >
                                                <Trash2 className="h-4 w-4 text-red-500" />
                                            </Button>
                                        </TableCell>
                          </TableRow>
                      )) : (
                          <TableRow>
                              <TableCell colSpan={4} className="h-24 text-center">Chưa có lịch sử thay đổi.</TableCell>
                          </TableRow>
                      )}
                  </TableBody>
              </Table>
          </CardContent>
      </Card>
      </div>
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
      <AlertDialogContent>
          <AlertDialogHeader>
              <AlertDialogTitle>Bạn có chắc chắn muốn xóa?</AlertDialogTitle>
              <AlertDialogDescription>
                  Hành động này sẽ xóa vĩnh viễn bản ghi giá có hiệu lực từ ngày{' '}
                  <span className="font-bold">{selectedPrice ? format(new Date(selectedPrice.NgayApDung), 'dd/MM/yyyy') : ''}</span>.
                  Bạn chỉ có thể thực hiện nếu giá này chưa được dùng để tính hóa đơn.
              </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setSelectedPrice(null)}>Hủy</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
                  {isDeleting ? 'Đang xóa...' : 'Xác nhận xóa'}
              </AlertDialogAction>
          </AlertDialogFooter>
      </AlertDialogContent>
            </AlertDialog>
            </>
  );
}