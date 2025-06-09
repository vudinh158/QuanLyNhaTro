'use client';

import type React from "react"
import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import DashboardLayout from "@/components/dashboard/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, ArrowLeft, Loader2 } from "lucide-react"
import { getInvoiceById, createPayment, getPaymentMethods } from '@/services/invoiceService';
import { IInvoice } from '@/types/invoice';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';

export default function BillPaymentPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [invoice, setInvoice] = useState<IInvoice | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<{ MaPTTT: number; TenPTTT: string }[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [maPTTT, setMaPTTT] = useState<string>(''); // Selected payment method ID
  const [maGiaoDich, setMaGiaoDich] = useState<string>('');
  const [ghiChu, setGhiChu] = useState<string>('');

  const invoiceId = Number(params.id);

  useEffect(() => {
    if (isNaN(invoiceId)) {
      toast({ title: "Lỗi", description: "Mã hóa đơn không hợp lệ.", variant: "destructive" });
      router.push('/dashboard/bills');
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        const [fetchedInvoice, fetchedPaymentMethods] = await Promise.all([
          getInvoiceById(invoiceId),
          getPaymentMethods()
        ]);
        setInvoice(fetchedInvoice);
        setPaymentMethods(fetchedPaymentMethods);
        // Set default payment method if available
        if (fetchedPaymentMethods.length > 0) {
          setMaPTTT(String(fetchedPaymentMethods[0].MaPTTT));
        }
      } catch (error: any) {
        toast({
          title: "Lỗi",
          description: error.message || "Không thể tải thông tin hóa đơn hoặc phương thức thanh toán.",
          variant: "destructive",
        });
        router.push(`/dashboard/bills/${invoiceId}`); // Redirect back to invoice details
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [invoiceId, router, toast]);


  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!invoice) return;

    if (!maPTTT) {
      toast({ title: "Lỗi", description: "Vui lòng chọn phương thức thanh toán.", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);

    try {
      // As per spec v2.0, payment is a one-time full payment of TongTienPhaiTra
      const amountToPay = invoice.TongTienPhaiTra; // Total amount due

      await createPayment({
        MaHoaDon: invoice.MaHoaDon,
        SoTien: amountToPay,
        MaPTTT: Number(maPTTT),
        MaGiaoDich: maGiaoDich || undefined,
        GhiChu: ghiChu || undefined,
      });

      toast({
        title: "Thanh toán thành công",
        description: `Hóa đơn #${invoice.MaHoaDon} đã được thanh toán đủ.`,
      });
      router.push(`/dashboard/bills/${invoice.MaHoaDon}`);
      router.refresh(); // Refresh the page to show updated status
    } catch (error: any) {
      toast({
        title: "Thanh toán thất bại",
        description: error.message || "Đã xảy ra lỗi khi ghi nhận thanh toán.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading || !invoice) {
    return (
      <DashboardLayout>
        <div className="mx-auto max-w-2xl space-y-6">
          <div className="flex items-center gap-2 mb-6">
            <Skeleton className="h-10 w-10 mr-2 rounded-md" />
            <Skeleton className="h-8 w-48" />
          </div>
          <Card>
            <CardHeader><Skeleton className="h-7 w-1/2 mb-1" /><Skeleton className="h-4 w-3/4" /></CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-20 w-full" />
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              <Skeleton className="h-10 w-20" />
              <Skeleton className="h-10 w-32" />
            </CardFooter>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  const representativeTenant = invoice.contract?.occupants?.find(o => o.LaNguoiDaiDien)?.tenant;

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-2xl">
        <div className="flex items-center gap-2 mb-6">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">Thanh toán hóa đơn</h1>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Thông tin hóa đơn</CardTitle>
              <CardDescription>Chi tiết về hóa đơn cần thanh toán</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Mã hóa đơn: {invoice.MaHoaDon}</h3>
                <Badge variant={invoice.TrangThaiThanhToan === 'Quá hạn' ? "destructive" : "secondary"}>
                  {invoice.TrangThaiThanhToan}
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Phòng:</span>
                    <span>
                      {invoice.contract?.room?.TenPhong} - {invoice.contract?.room?.property?.TenNhaTro}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Người thuê:</span>
                    <span>{representativeTenant?.HoTen || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Kỳ thanh toán:</span>
                    <span>{format(new Date(invoice.TuNgay), 'dd/MM/yyyy')} - {format(new Date(invoice.DenNgay), 'dd/MM/yyyy')}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Hạn thanh toán:</span>
                    <span className={invoice.TrangThaiThanhToan === 'Quá hạn' ? "text-red-500 font-medium flex items-center gap-1" : ""}>
                      {invoice.TrangThaiThanhToan === 'Quá hạn' && <AlertCircle className="h-3 w-3" />}
                      {format(new Date(invoice.NgayHanThanhToan), 'dd/MM/yyyy')}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tổng tiền phải trả:</span>
                    <span>{invoice.TongTienPhaiTra.toLocaleString("vi-VN")} VNĐ</span>
                  </div>
                  {/* Since payment is full, paid/remaining are no longer distinct in this view */}
                  <div className="flex justify-between font-medium">
                    <span>Số tiền cần thanh toán:</span>
                    <span className="text-lg text-primary">{invoice.TongTienPhaiTra.toLocaleString("vi-VN")} VNĐ</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {invoice.TrangThaiThanhToan === 'Đã thanh toán' ? (
            <Card>
                <CardContent className="py-8 text-center text-green-600 font-semibold">
                    Hóa đơn này đã được thanh toán đủ.
                </CardContent>
            </Card>
          ) : (
            <form onSubmit={handleSubmit}>
              <Card>
                <CardHeader>
                  <CardTitle>Ghi nhận thanh toán</CardTitle>
                  <CardDescription>Xác nhận khoản thanh toán từ khách thuê.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="amount">
                      Số tiền thanh toán (VNĐ) <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="amount"
                      type="text" // Use text to display formatted currency, input type number removes formatting
                      value={invoice.TongTienPhaiTra.toLocaleString("vi-VN")}
                      readOnly // Amount is fixed as per spec (full payment)
                      disabled
                      className="font-bold text-lg"
                    />
                     <p className="text-xs text-muted-foreground">Số tiền này là tổng số tiền cần thanh toán cho hóa đơn.</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="method">
                      Phương thức thanh toán <span className="text-red-500">*</span>
                    </Label>
                    <Select value={maPTTT} onValueChange={setMaPTTT} required>
                      <SelectTrigger id="method">
                        <SelectValue placeholder="Chọn phương thức thanh toán" />
                      </SelectTrigger>
                      <SelectContent>
                        {paymentMethods.map(method => (
                          <SelectItem key={method.MaPTTT} value={String(method.MaPTTT)}>{method.TenPTTT}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="maGiaoDich">Mã giao dịch (Nếu có)</Label>
                    <Input
                      id="maGiaoDich"
                      placeholder="Nhập mã giao dịch (ví dụ: chuyển khoản ngân hàng)"
                      value={maGiaoDich}
                      onChange={(e) => setMaGiaoDich(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="note">Ghi chú</Label>
                    <Textarea
                      id="note"
                      placeholder="Nhập ghi chú (nếu có)"
                      value={ghiChu}
                      onChange={(e) => setGhiChu(e.target.value)}
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button type="button" variant="outline" onClick={() => router.back()}>
                    Hủy
                  </Button>
                  <Button type="submit" disabled={isSubmitting || !maPTTT}>
                    {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Đang xử lý...</> : "Xác nhận thanh toán"}
                  </Button>
                </CardFooter>
              </Card>
            </form>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}