'use client';

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import DashboardLayout from "@/components/dashboard/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, FileText, Home, Printer, User, Wallet } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/components/ui/use-toast";
import { getInvoiceById } from '@/services/invoiceService';
import { IInvoice, IInvoiceDetail, } from '@/types/invoice';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";


export default function TenantBillDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { toast } = useToast();
  const [invoice, setInvoice] = useState<IInvoice | null>(null);
  const [loading, setLoading] = useState(true);

  const { id: paramId } = useParams(); // Lấy id từ hook useParams()
  
      // Chuyển đổi paramId sang dạng số
      const invoiceId = Number(paramId);

  useEffect(() => {
    if (isNaN(invoiceId)) {
      toast({ title: "Lỗi", description: "Mã hóa đơn không hợp lệ.", variant: "destructive" });
      router.push('/tenant/bills');
      return;
    }

    const fetchInvoiceDetails = async () => {
      setLoading(true);
      try {
        const data = await getInvoiceById(invoiceId);
        setInvoice(data);
      } catch (error: any) {
        toast({
          title: "Lỗi tải thông tin hóa đơn",
          description: error.message || "Không thể tải dữ liệu. Vui lòng thử lại.",
          variant: "destructive",
        });
        router.push('/tenant/bills');
      } finally {
        setLoading(false);
      }
    };
    fetchInvoiceDetails();
  }, [invoiceId, router, toast]);

  const handlePrint = () => {
    window.print()
  }

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

  if (loading || !invoice) {
    return (
      // <DashboardLayout userRole="tenant">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-8 w-48" />
            <div className="flex gap-2">
              <Skeleton className="h-10 w-[120px]" />
              <Skeleton className="h-10 w-[100px]" />
            </div>
          </div>
          <Skeleton className="h-[300px] w-full" />
          <Skeleton className="h-[300px] w-full" />
          <Skeleton className="h-[200px] w-full" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-1/3" />
            <Skeleton className="h-10 w-1/3" />
            <Skeleton className="h-10 w-1/3" />
          </div>
        </div>
      // </DashboardLayout>
    );
  }

  const representativeTenant = invoice.contract?.occupants?.find(o => o.LaNguoiDaiDien)?.tenant;
  const totalPaid = invoice.paymentDetails?.reduce((sum, p) => sum + Number(p.SoTien), 0) || 0;
  const remainingAmount = invoice.TongTienPhaiTra - totalPaid;
  const isFullyPaid = remainingAmount <= 0;


  return (
    // <DashboardLayout userRole="tenant">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wallet className="h-6 w-6" />
            <h1 className="text-2xl font-bold tracking-tight">Hóa đơn {invoice.MaHoaDon}</h1>
            <Badge variant={getStatusBadgeVariant(invoice.TrangThaiThanhToan)}>
              {invoice.TrangThaiThanhToan}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handlePrint}>
              <Printer className="mr-2 h-4 w-4" />
              In hóa đơn
            </Button>
            {!isFullyPaid && (
              <Button asChild>
                <Link href={`/tenant/bills/${invoice.MaHoaDon}/payment`}>
                  <Wallet className="mr-2 h-4 w-4" />
                  Thanh toán
                </Link>
              </Button>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Thông tin hóa đơn</CardTitle>
              <CardDescription>Chi tiết về hóa đơn {invoice.MaHoaDon}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-2">Thông tin cơ bản</h3>
                    <div className="grid gap-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Mã hóa đơn:</span>
                        <span>{invoice.MaHoaDon}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Phòng:</span>
                        <span>{invoice.contract?.room?.TenPhong || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Nhà trọ:</span>
                        <span>{invoice.contract?.room?.property?.TenNhaTro || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Người thuê:</span>
                        <span>{representativeTenant?.HoTen || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Mã hợp đồng:</span>
                        <span>{invoice.MaHopDong}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium mb-2">Ghi chú</h3>
                    <p className="text-sm">{invoice.GhiChu || 'Không có ghi chú.'}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-2">Thông tin thanh toán</h3>
                    <div className="grid gap-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Kỳ thanh toán:</span>
                        <span>{format(new Date(invoice.KyThanhToan_TuNgay), 'dd/MM/yyyy')} - {format(new Date(invoice.KyThanhToan_DenNgay), 'dd/MM/yyyy')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Ngày lập:</span>
                        <span>{format(new Date(invoice.KyThanhToan_TuNgay), 'dd/MM/yyyy')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Hạn thanh toán:</span>
                        <span className={invoice.TrangThaiThanhToan === 'Quá hạn' ? "text-red-500 font-medium flex items-center gap-1" : ""}>
                          {invoice.TrangThaiThanhToan === 'Quá hạn' && <AlertCircle className="h-3 w-3" />}
                          {format(new Date(invoice.NgayHanThanhToan), 'dd/MM/yyyy')}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium mb-2">Tổng quan</h3>
                    <div className="grid gap-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Tổng tiền phải trả:</span>
                        <span>{invoice.TongTienPhaiTra.toLocaleString("vi-VN")} VNĐ</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Đã thanh toán:</span>
                        <span>{totalPaid.toLocaleString("vi-VN")} VNĐ</span>
                      </div>
                      <div className="flex justify-between font-medium">
                        <span>Còn lại:</span>
                        <span>{remainingAmount.toLocaleString("vi-VN")} VNĐ</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Chi tiết các khoản</CardTitle>
              <CardDescription>Danh sách các khoản trong hóa đơn</CardDescription>
            </CardHeader>
            <CardContent>
              {invoice.details && invoice.details.length > 0 ? (
                <div className="rounded-lg border">
                  <div className="grid grid-cols-12 gap-2 p-3 font-medium text-sm border-b">
                    <div className="col-span-5">Khoản mục</div>
                    <div className="col-span-2 text-right">Đơn giá</div>
                    <div className="col-span-2 text-right">Số lượng</div>
                    <div className="col-span-3 text-right">Thành tiền</div>
                  </div>

                  {invoice.details.map((item) => (
                    <div key={item.MaChiTiet} className="grid grid-cols-12 gap-2 p-3 border-b last:border-0 items-center">
                    <div className="col-span-5">
                        {item.LoaiChiPhi === 'Điện' ? `Tiền điện (${item.MoTaChiTiet})` : // Assuming MoTaChiTiet might contain meter info
                         item.LoaiChiPhi === 'Nước' ? `Tiền nước (${item.MoTaChiTiet})` :
                         item.LoaiChiPhi === 'Dịch vụ sử dụng' ? `${item.MoTaChiTiet} (Sử dụng)` :
                         item.LoaiChiPhi === 'Dịch vụ cố định' ? `${item.MoTaChiTiet} (Cố định)` :
                         item.MoTaChiTiet}
                        {(item.LoaiChiPhi === 'Điện' || item.LoaiChiPhi === 'Nước') && item.ChiSoCu !== null && item.ChiSoMoi !== null && (
                            <div className="text-xs text-muted-foreground mt-1">
                                Chỉ số: {item.ChiSoCu} - {item.ChiSoMoi}
                            </div>
                        )}
                    </div>
                    <div className="col-span-2 text-right">{Number(item.DonGia).toLocaleString("vi-VN")} VNĐ</div>
                    <div className="col-span-2 text-right">
                        {item.SoLuong}
                        {item.LoaiChiPhi === 'Điện' && ' kWh'}
                        {item.LoaiChiPhi === 'Nước' && ' m³'}
                        {item.LoaiChiPhi === 'Tiền phòng' && ' tháng'}
                        {item.LoaiChiPhi === 'Dịch vụ cố định' && ' tháng'}
                        {item.LoaiChiPhi === 'Dịch vụ sử dụng' && ' lần'}
                        {item.LoaiChiPhi === 'Khác' && ' lần'}
                    </div>
                    <div className="col-span-3 text-right">{Number(item.ThanhTien).toLocaleString("vi-VN")} VNĐ</div>
                </div>
                  ))}

                  <div className="grid grid-cols-12 gap-2 p-3 font-medium border-t">
                    <div className="col-span-9 text-right">Tổng cộng:</div>
                    <div className="col-span-3 text-right">
                      {invoice.TongTienPhaiTra.toLocaleString("vi-VN")} VNĐ
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4 text-muted-foreground">Không có chi tiết hóa đơn.</div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Lịch sử thanh toán</CardTitle>
              <CardDescription>Danh sách các lần thanh toán</CardDescription>
            </CardHeader>
            <CardContent>
              {invoice.paymentDetails && invoice.paymentDetails.length > 0 ? (
                <div className="rounded-lg border">
                  <div className="grid grid-cols-12 gap-2 p-3 font-medium text-sm border-b">
                    <div className="col-span-3">Ngày thanh toán</div>
                    <div className="col-span-3">Phương thức</div>
                    <div className="col-span-4">Ghi chú</div>
                    <div className="col-span-2 text-right">Số tiền</div>
                  </div>

                  {invoice.paymentDetails.map((payment, index) => (
                    <div key={payment.MaThanhToan || index} className="grid grid-cols-12 gap-2 p-3 border-b last:border-0 items-center">
                      <div className="col-span-3">{format(new Date(payment.NgayThanhToan), 'dd/MM/yyyy HH:mm')}</div>
                      <TableCell className="col-span-3">{payment.paymentMethod?.TenPTTT || 'N/A'}</TableCell>
                      <div className="col-span-4">{payment.GhiChu || 'Không có'}</div>
                      <div className="col-span-2 text-right">{Number(payment.SoTien).toLocaleString("vi-VN")} VNĐ</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Wallet className="mx-auto h-12 w-12 text-muted-foreground/50" />
                  <h3 className="mt-4 text-lg font-medium">Chưa có thanh toán</h3>
                  <p className="mt-2 text-sm text-muted-foreground">Hóa đơn này chưa có lịch sử thanh toán nào.</p>
                  {!isFullyPaid && (
                    <Button className="mt-4" asChild>
                      <Link href={`/tenant/bills/${invoice.MaHoaDon}/payment`}>Thanh toán ngay</Link>
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    // </DashboardLayout>
  )
}