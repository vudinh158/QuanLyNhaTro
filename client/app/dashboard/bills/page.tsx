'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Plus, Search } from "lucide-react";
import { getInvoices } from '@/services/invoiceService'; // Import the new service
import { IInvoice } from '@/types/invoice'; // Import the Invoice type
import { useToast } from '@/components/ui/use-toast';
import { useDebounce } from '@/hooks/use-debounce';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { getMyProperties } from '@/services/propertyService';
import { Property } from '@/types/property';

export default function BillsPage() {
  const { toast } = useToast();
  const [invoices, setInvoices] = useState<IInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [propertyFilter, setPropertyFilter] = useState<string>('all');
  const [properties, setProperties] = useState<Property[]>([]); // To populate property filter

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  useEffect(() => {
    const fetchFilterData = async () => {
      try {
        const fetchedProperties = await getMyProperties();
        setProperties(fetchedProperties);
      } catch (error) {
        toast({ title: "Lỗi", description: "Không thể tải danh sách nhà trọ.", variant: "destructive" });
      }
    };
    fetchFilterData();
  }, [toast]);

  const fetchInvoices = useMemo(() => async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (debouncedSearchTerm) params.search = debouncedSearchTerm;
      if (statusFilter !== 'all') params.status = statusFilter;
      if (propertyFilter !== 'all') params.propertyId = Number(propertyFilter);

      const data = await getInvoices(params);
      setInvoices(data);
    } catch (error: any) {
      toast({ title: 'Lỗi', description: error.message || 'Không thể tải danh sách hóa đơn.', variant: 'destructive' });
      setInvoices([]); // Clear invoices on error
    } finally {
      setLoading(false);
    }
  }, [debouncedSearchTerm, statusFilter, propertyFilter, toast]);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  const getStatusBadgeVariant = (status: IInvoice['TrangThaiThanhToan']) => {
    switch (status) {
        case 'Đã thanh toán':
            return 'default';
        case 'Quá hạn':
            return 'destructive';
        case 'Chưa thanh toán':
        default:
            return 'secondary';
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-[150px]" />
            <Skeleton className="h-10 w-[120px]" />
          </div>
        </div>
        <div className="flex flex-col gap-4 sm:flex-row">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-full sm:w-[180px]" />
          <Skeleton className="h-10 w-full sm:w-[180px]" />
        </div>
        <div className="grid gap-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-[200px] w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Quản lý hóa đơn</h1>
        <div className="flex gap-2">
          {/* <Button variant="outline" asChild>
            <Link href="/dashboard/bills/create-period">Tạo hóa đơn định kỳ</Link>
          </Button> */}
          <Button asChild>
            <Link href="/dashboard/bills/new">
              <Plus className="mr-2 h-4 w-4" />
              Tạo hóa đơn thủ công
            </Link>
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Tìm kiếm hóa đơn..."
            className="w-full pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={propertyFilter} onValueChange={setPropertyFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Chọn nhà trọ" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả nhà trọ</SelectItem>
            {properties.map(p => (
              <SelectItem key={p.MaNhaTro} value={p.MaNhaTro.toString()}>{p.TenNhaTro}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả trạng thái</SelectItem>
            <SelectItem value="Chưa thanh toán">Chưa thanh toán</SelectItem>
            <SelectItem value="Đã thanh toán">Đã thanh toán</SelectItem>
            <SelectItem value="Quá hạn">Quá hạn</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4">
        {invoices.length === 0 ? (
          <Card className="text-center py-8">
            <CardContent>
              <h3 className="text-lg font-semibold text-muted-foreground">Không tìm thấy hóa đơn nào.</h3>
              <p className="text-sm text-muted-foreground">Thử điều chỉnh bộ lọc hoặc tạo hóa đơn mới.</p>
            </CardContent>
          </Card>
        ) : (
          invoices.map((bill) => (
            <Card key={bill.MaHoaDon} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">HĐ {bill.MaHoaDon}</h3>
                        <Badge variant={getStatusBadgeVariant(bill.TrangThaiThanhToan)}>
                          {bill.TrangThaiThanhToan}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Phòng: {bill.contract?.room?.TenPhong} - {bill.contract?.room?.property?.TenNhaTro}
                      </p>
                    </div>
                    <div className="text-sm">
                      <span className="text-muted-foreground">Kỳ thanh toán:</span>{" "}
                      <span>{format(new Date(bill.TuNgay), 'dd/MM/yyyy')} - {format(new Date(bill.DenNgay), 'dd/MM/yyyy')}</span>
                    </div>
                  </div>

                  <div className="grid gap-2 md:grid-cols-2">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Người thuê:</span>
                        <span>{bill.contract?.occupants?.find(o => o.LaNguoiDaiDien)?.tenant?.HoTen || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Hạn thanh toán:</span>
                        <span className={bill.TrangThaiThanhToan === 'Quá hạn' ? "text-red-500 font-medium flex items-center gap-1" : ""}>
                          {bill.TrangThaiThanhToan === 'Quá hạn' && <AlertCircle className="h-3 w-3" />}
                          {format(new Date(bill.NgayHanThanhToan), 'dd/MM/yyyy')}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Tổng tiền phải trả:</span>
                        <span>{bill.TongTienPhaiTra.toLocaleString("vi-VN")} VNĐ</span>
                      </div>
                      {/* Note: Paid and Remaining are no longer direct columns on Invoice model as per latest spec.
                          They would need to be calculated by summing PaymentDetails.
                          For now, we'll remove them as they are not directly available. */}
                      {/* <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Đã thanh toán:</span>
                        <span>{bill.paid}</span>
                      </div>
                      <div className="flex justify-between text-sm font-medium">
                        <span>Còn lại:</span>
                        <span>{bill.remaining}</span>
                      </div> */}
                    </div>
                  </div>
                </div>

                <div className="flex border-t">
                  <Button variant="ghost" className="flex-1 rounded-none h-12" asChild>
                    <Link href={`/dashboard/bills/${bill.MaHoaDon}`}>Chi tiết</Link>
                  </Button>
                  {bill.TrangThaiThanhToan !== "Đã thanh toán" && ( // Check against 'Đã thanh toán'
                    <>
                      <div className="w-px bg-border" />
                      <Button variant="ghost" className="flex-1 rounded-none h-12" asChild>
                        <Link href={`/dashboard/bills/${bill.MaHoaDon}/payment`}>Thanh toán</Link>
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}