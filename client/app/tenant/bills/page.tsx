'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import DashboardLayout from "@/components/dashboard/dashboard-layout";
import { AlertCircle, Search } from "lucide-react";
import { getInvoices } from '@/services/invoiceService'; // Import the new service
import { IInvoice } from '@/types/invoice'; // Import the Invoice type
import { useToast } from '@/components/ui/use-toast';
import { useDebounce } from '@/hooks/use-debounce';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';

export default function TenantBillsPage() {
  const { toast } = useToast();
  const [invoices, setInvoices] = useState<IInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [periodFilter, setPeriodFilter] = useState<string>('all'); // Added period filter

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const fetchInvoices = useMemo(() => async () => {
    setLoading(true);
    try {
      const params: any = {};
      // For tenant, search applies to invoice details (backend should handle this)
      if (debouncedSearchTerm) params.search = debouncedSearchTerm;
      if (statusFilter !== 'all') params.status = statusFilter;
      if (periodFilter !== 'all') params.period = periodFilter; // YYYY-MM format

      const data = await getInvoices(params);
      setInvoices(data);
    } catch (error: any) {
      toast({ title: 'Lỗi', description: error.message || 'Không thể tải danh sách hóa đơn.', variant: 'destructive' });
      setInvoices([]); // Clear invoices on error
    } finally {
      setLoading(false);
    }
  }, [debouncedSearchTerm, statusFilter, periodFilter, toast]);

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

  // Generate mock periods for filter (you might fetch this dynamically)
  const generatePeriods = () => {
    const periods = [];
    const today = new Date();
    for (let i = 0; i < 6; i++) { // Last 6 months
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      periods.push({
        value: format(date, 'yyyy-MM'),
        label: format(date, 'MM/yyyy'),
      });
    }
    return periods;
  };

  const availablePeriods = useMemo(generatePeriods, []);


  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
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
    // <DashboardLayout userRole="tenant">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Hóa đơn của tôi</h1>
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
          <Select value={periodFilter} onValueChange={setPeriodFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Kỳ thanh toán" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả kỳ</SelectItem>
              {availablePeriods.map(period => (
                <SelectItem key={period.value} value={period.value}>{period.label}</SelectItem>
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
                <p className="text-sm text-muted-foreground">Bạn không có hóa đơn nào hoặc không tìm thấy kết quả phù hợp.</p>
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
                        {/* Remove Paid and Remaining as they are no longer direct columns */}
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
                      <Link href={`/tenant/bills/${bill.MaHoaDon}`}>Chi tiết</Link>
                    </Button>
                    {bill.TrangThaiThanhToan !== "Đã thanh toán" && (
                      <>
                        <div className="w-px bg-border" />
                        <Button variant="ghost" className="flex-1 rounded-none h-12" asChild>
                          <Link href={`/tenant/bills/${bill.MaHoaDon}/payment`}>Thanh toán</Link>
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
    // </DashboardLayout>
  );
}