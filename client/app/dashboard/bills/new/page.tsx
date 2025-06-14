'use client';

import type React from "react";
import { useState, useEffect, FormEvent, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import DashboardLayout from "@/components/dashboard/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { CalendarIcon, Minus, Plus, Trash, ArrowLeft, Loader2 } from "lucide-react";
import { format, addMonths, parseISO, isValid } from "date-fns";
import { vi } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getContracts } from '@/services/contractService';
import { getAllServices } from '@/services/serviceService';
import Link from "next/link";
import { createInvoice } from '@/services/invoiceService';
import { IContract } from '@/types/contract';
import { IService } from '@/types/service';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/AuthContext';
import { getElectricWaterPrices } from '@/services/electricWaterPriceService';
import { IElectricWaterPrice } from '@/types/electricWaterPrice';

interface BillItem {
  id: number;
  type: 'Tiền phòng' | 'Điện' | 'Nước' | 'Dịch vụ cố định' | 'Dịch vụ sử dụng' | 'Khác'; // Đã sửa 'room' thành 'Tiền phòng'
  description: string;
  oldReading?: number;
  newReading?: number;
  quantity: number;
  unitPrice: number;
  total: number;
  serviceId?: number | null;
}

export default function NewBillPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { user, isLoading: authLoading } = useAuth();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);

  const [contracts, setContracts] = useState<IContract[]>([]);
  const [allServices, setAllServices] = useState<IService[]>([]);
  const [electricWaterPrices, setElectricWaterPrices] = useState<IElectricWaterPrice[]>([]);

  const [selectedContractId, setSelectedContractId] = useState(searchParams.get("contractId") || "");
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [billItems, setBillItems] = useState<BillItem[]>([]);
  const [note, setNote] = useState('');
  const [periodStartDate, setPeriodStartDate] = useState<Date | undefined>(undefined);
  const [periodEndDate, setPeriodEndDate] = useState<Date | undefined>(undefined);

  const [currentTab, setCurrentTab] = useState("contract");
    
  const selectedContract = useMemo(() => {
    return contracts.find(c => c.MaHopDong.toString() === selectedContractId);
  }, [contracts, selectedContractId]);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/login');
      return;
    }
    if (user.role?.TenVaiTro !== 'Chủ trọ') {
      toast({ title: "Lỗi", description: "Bạn không có quyền tạo hóa đơn.", variant: "destructive" });
      router.push('/dashboard');
      return;
    }

    const fetchData = async () => {
      setIsLoadingData(true);
      try {
        const fetchedContracts = await getContracts({ status: 'Có hiệu lực' });
        setContracts(fetchedContracts);

        const fetchedServices = await getAllServices();
        setAllServices(fetchedServices.filter(s => s.HoatDong));

        const fetchedElectricWaterPrices = await getElectricWaterPrices();
        setElectricWaterPrices(fetchedElectricWaterPrices);

        if (searchParams.get("contractId")) {
          setSelectedContractId(searchParams.get("contractId")!);
          const preselectedContract = fetchedContracts.find(c => c.MaHopDong.toString() === searchParams.get("contractId"));
          if (preselectedContract) {
            const roomRentItem: BillItem = {
              id: 1,
              type: 'Tiền phòng', // Đã sửa 'room' thành 'Tiền phòng'
              description: 'Tiền thuê phòng',
              quantity: 1,
              unitPrice: preselectedContract.TienThueThoaThuan,
              total: preselectedContract.TienThueThoaThuan
            };
            setBillItems([roomRentItem]);

            const today = new Date();
            const defaultStart = new Date(today.getFullYear(), today.getMonth(), 1);
            const defaultEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
            setPeriodStartDate(defaultStart);
            setPeriodEndDate(defaultEnd);

            const defaultDueDate = new Date(defaultEnd.getFullYear(), defaultEnd.getMonth(), preselectedContract.HanThanhToan);
            setDueDate(defaultDueDate);
          }
        }

      } catch (error) {
        toast({ title: "Lỗi tải dữ liệu", description: "Không thể tải danh sách hợp đồng, dịch vụ hoặc giá điện nước.", variant: "destructive" });
        console.error("Error fetching initial data:", error);
      } finally {
        setIsLoadingData(false);
      }
    };
    fetchData();
  }, [user, authLoading, router, toast, searchParams]);

  const handleContractChange = (contractId: string) => {
    setSelectedContractId(contractId);
    const contract = contracts.find(c => c.MaHopDong.toString() === contractId);
    if (contract) {
      const roomRentItem: BillItem = {
        id: 1,
        type: 'Tiền phòng', // Đã sửa 'room' thành 'Tiền phòng'
        description: 'Tiền thuê phòng',
        quantity: 1,
        unitPrice: contract.TienThueThoaThuan,
        total: contract.TienThueThoaThuan
      };
      setBillItems([roomRentItem]);
      const today = new Date();
      const defaultStart = new Date(today.getFullYear(), today.getMonth(), 1);
      const defaultEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      setPeriodStartDate(defaultStart);
      setPeriodEndDate(defaultEnd);
      setDueDate(new Date(defaultEnd.getFullYear(), defaultEnd.getMonth(), contract.HanThanhToan));
    } else {
        setBillItems([]);
        setPeriodStartDate(undefined);
        setPeriodEndDate(undefined);
        setDueDate(undefined);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedContract) {
      toast({ title: "Lỗi", description: "Vui lòng chọn hợp đồng.", variant: "destructive" });
      return;
    }
    if (!periodStartDate || !periodEndDate || !dueDate) {
      toast({ title: "Lỗi", description: "Vui lòng chọn đầy đủ kỳ thanh toán và hạn thanh toán.", variant: "destructive" });
      return;
    }
    if (billItems.length === 0) {
      toast({ title: "Lỗi", description: "Hóa đơn phải có ít nhất một khoản mục.", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);

    const totalAmount = billItems.reduce((sum, item) => sum + item.total, 0);

    const invoiceDetailsPayload = billItems.map(item => ({
        LoaiChiPhi: item.type,
        MoTaChiTiet: item.description,
        ChiSoCu: item.oldReading,
        ChiSoMoi: item.newReading,
        SoLuong: item.quantity,
        DonGia: item.unitPrice,
        ThanhTien: item.total,
        MaDV_LienQuan: item.serviceId,
    }));

    const newInvoiceData = {
        MaHopDong: selectedContract.MaHopDong,
        KyThanhToan_TuNgay: format(periodStartDate, 'yyyy-MM-dd'),
        KyThanhToan_DenNgay: format(periodEndDate, 'yyyy-MM-dd'),
        NgayLap: format(new Date(), 'yyyy-MM-dd'),
        NgayHanThanhToan: format(dueDate, 'yyyy-MM-dd'),
        GhiChu: note || null,
        TongTienPhaiTra: totalAmount,
        details: invoiceDetailsPayload
    };

    try {
        const createdInvoice = await createInvoice(newInvoiceData);
        toast({
            title: "Tạo hóa đơn thành công",
            description: `Hóa đơn #${createdInvoice.MaHoaDon} đã được tạo.`,
        });
        router.push(`/dashboard/bills/${createdInvoice.MaHoaDon}`);
        router.refresh();
    } catch (error: any) {
        toast({
            title: "Lỗi tạo hóa đơn",
            description: error.message || "Đã xảy ra lỗi khi tạo hóa đơn.",
            variant: "destructive",
        });
    } finally {
        setIsSubmitting(false);
    }
  };


  const addBillItemRow = (type: BillItem['type'], serviceId?: number) => {
    let newItem: BillItem | null = null;
    let basePrice = 0;
    let description = '';
    let quantity = 1;

    switch (type) {
      case 'Tiền phòng': // Vẫn giữ là 'Tiền phòng' để tránh lỗi
        toast({ title: "Lỗi", description: "Tiền phòng được tự động thêm khi chọn hợp đồng.", variant: "destructive" });
        return;
      case 'Điện':
        description = 'Chỉ số điện';
        const electricPrice = electricWaterPrices.find(p => p.MaNhaTro === selectedContract?.room?.MaNhaTro && p.LoaiChiPhi === 'Điện')?.DonGiaMoi;
        basePrice = electricPrice || 4000;
        newItem = { id: Date.now(), type, description, oldReading: 0, newReading: 0, quantity: 0, unitPrice: basePrice, total: 0 };
        break;
      case 'Nước':
        description = 'Chỉ số nước';
        const waterPrice = electricWaterPrices.find(p => p.MaNhaTro === selectedContract?.room?.MaNhaTro && p.LoaiChiPhi === 'Nước')?.DonGiaMoi;
        basePrice = waterPrice || 15000;
        newItem = { id: Date.now(), type, description, oldReading: 0, newReading: 0, quantity: 0, unitPrice: basePrice, total: 0 };
        break;
      case 'Dịch vụ sử dụng':
      case 'Dịch vụ cố định':
        const selectedService = allServices.find(s => s.MaDV === serviceId);
        if (selectedService) {
          description = selectedService.TenDV;
          basePrice = selectedService.priceHistories?.[0]?.DonGiaMoi || 0;
          quantity = 1;
          newItem = { id: Date.now(), type: selectedService.LoaiDichVu === 'Cố định hàng tháng' ? 'Dịch vụ cố định' : 'Dịch vụ sử dụng', description, quantity, unitPrice: basePrice, total: basePrice, serviceId: selectedService.MaDV };
        }
        break;
      case 'Khác':
        description = 'Khoản phí khác';
        basePrice = 0;
        newItem = { id: Date.now(), type, description, quantity: 1, unitPrice: basePrice, total: basePrice };
        break;
    }

    if (newItem) {
      setBillItems(prevItems => [...prevItems, newItem!]);
    }
  };


  const removeBillItem = (id: number) => {
    setBillItems(billItems.filter((item) => item.id !== id));
  };

  const updateBillItem = (id: number, field: keyof BillItem, value: any) => {
    setBillItems(
      billItems.map((item) => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value };

          if (field === 'oldReading' || field === 'newReading') {
              const oldR = Number(updatedItem.oldReading || 0);
              const newR = Number(updatedItem.newReading || 0);
              updatedItem.quantity = Math.max(0, newR - oldR);
              updatedItem.total = updatedItem.quantity * updatedItem.unitPrice;
          } else if (field === 'quantity' && typeof value === 'number') {
            updatedItem.quantity = Math.max(0, value);
            updatedItem.total = updatedItem.quantity * updatedItem.unitPrice;
          } else if (field === 'unitPrice' && typeof value === 'number') {
            updatedItem.unitPrice = Math.max(0, value);
            updatedItem.total = updatedItem.quantity * updatedItem.unitPrice;
          } else if (field === 'description') {
            updatedItem.description = value;
          }
          return updatedItem;
        }
        return item;
      }),
    );
  };

  const totalAmount = billItems.reduce((sum, item) => sum + item.total, 0);


  if (authLoading || isLoadingData) {
    return (
   
        <div className="mx-auto max-w-3xl space-y-6">
          <div className="flex items-center">
            <Skeleton className="h-10 w-10 mr-2 rounded-md" />
            <Skeleton className="h-8 w-48" />
          </div>
          <Card>
            <CardHeader>
              <Skeleton className="h-7 w-1/2 mb-1" />
              <Skeleton className="h-4 w-3/4" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-20 w-full" />
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              <Skeleton className="h-10 w-20" />
              <Skeleton className="h-10 w-32" />
            </CardFooter>
          </Card>
        </div>
      
    );
  }


  return (

      <div className="mx-auto max-w-3xl">
        <div className="flex items-center mb-6">
          <Button variant="outline" size="icon" asChild className="mr-2">
            <Link href="/dashboard/bills">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">Tạo hóa đơn mới</h1>
        </div>

        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="contract" className="mb-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="contract">1. Chọn hợp đồng</TabsTrigger>
              <TabsTrigger value="bill" disabled={!selectedContractId}>
                2. Chi tiết hóa đơn
              </TabsTrigger>
            </TabsList>

            <TabsContent value="contract">
              <Card>
                <CardHeader>
                  <CardTitle>Chọn hợp đồng</CardTitle>
                  <CardDescription>Chọn hợp đồng để tạo hóa đơn</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="contract">
                      Hợp đồng <span className="text-red-500">*</span>
                    </Label>
                    <Select value={selectedContractId} onValueChange={handleContractChange}>
                      <SelectTrigger id="contract">
                        <SelectValue placeholder="Chọn hợp đồng" />
                      </SelectTrigger>
                      <SelectContent>
                        {contracts.length === 0 ? (
                            <SelectItem value="no-contracts" disabled>Không có hợp đồng nào đang hoạt động</SelectItem>
                        ) : (
                            contracts.map((contract) => (
                              <SelectItem key={contract.MaHopDong} value={contract.MaHopDong.toString()}>
                                {contract.MaHopDong} - {contract.room?.TenPhong} - {contract.occupants?.find(o => o.LaNguoiDaiDien)?.tenant?.HoTen || 'N/A'}
                              </SelectItem>
                            ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedContract && (
                    <div className="rounded-lg border p-4">
                      <h3 className="font-medium mb-2">Thông tin hợp đồng</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Mã hợp đồng:</span>
                          <span>{selectedContract.MaHopDong}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Phòng:</span>
                          <span>{selectedContract.room?.TenPhong}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Nhà trọ:</span>
                          <span>{selectedContract.room?.property?.TenNhaTro}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Người đại diện:</span>
                          <span>{selectedContract.occupants?.find(o => o.LaNguoiDaiDien)?.tenant?.HoTen || 'N/A'}</span>
                        </div>
                         <div className="flex justify-between">
                          <span className="text-muted-foreground">Tiền thuê thỏa thuận:</span>
                          <span>{selectedContract.TienThueThoaThuan.toLocaleString("vi-VN")} VNĐ</span>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button type="button" variant="outline" onClick={() => router.push("/dashboard/bills")}>
                    Hủy
                  </Button>
                  <Button
                type="button"
                disabled={!selectedContractId}
                onClick={() => setCurrentTab("bill")} // Cập nhật state để chuyển tab
            >
                Tiếp theo
            </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="bill">
              <Card>
                <CardHeader>
                  <CardTitle>Chi tiết hóa đơn</CardTitle>
                  <CardDescription>Nhập thông tin chi tiết về hóa đơn</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="billPeriodStart">
                        Kỳ thanh toán từ <span className="text-red-500">*</span>
                      </Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant={"outline"}
                            className={cn("w-full pl-3 text-left font-normal", !periodStartDate && "text-muted-foreground")}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4 opacity-50" />
                            {periodStartDate ? format(periodStartDate, "dd/MM/yyyy") : <span>Chọn ngày</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={periodStartDate}
                            onSelect={setPeriodStartDate}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="billPeriodEnd">
                        Đến <span className="text-red-500">*</span>
                      </Label>
                       <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant={"outline"}
                            className={cn("w-full pl-3 text-left font-normal", !periodEndDate && "text-muted-foreground")}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4 opacity-50" />
                            {periodEndDate ? format(periodEndDate, "dd/MM/yyyy") : <span>Chọn ngày</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={periodEndDate}
                            onSelect={setPeriodEndDate}
                            initialFocus
                            disabled={(date) => periodStartDate ? date < periodStartDate : false}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dueDate">
                      Hạn thanh toán <span className="text-red-500">*</span>
                    </Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          id="dueDate"
                          variant={"outline"}
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !dueDate && "text-muted-foreground",
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {dueDate ? format(dueDate, "dd/MM/yyyy", { locale: vi }) : "Chọn hạn thanh toán"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar mode="single" selected={dueDate} onSelect={setDueDate} initialFocus
                          disabled={(date) => periodEndDate ? date < periodEndDate : false}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Các khoản thanh toán</Label>
                      <Select onValueChange={(value) => {
                          if (value === 'Điện' || value === 'Nước' || value === 'Khác') {
                              addBillItemRow(value as BillItem['type']);
                          } else {
                              addBillItemRow('Dịch vụ cố định', Number(value));
                          }
                      }}>
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Thêm khoản mục" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Điện">Tiền điện</SelectItem>
                          <SelectItem value="Nước">Tiền nước</SelectItem>
                          {allServices.filter(s => s.LoaiDichVu === 'Cố định hàng tháng' || s.LoaiDichVu === 'Theo số lượng sử dụng' || s.LoaiDichVu === 'Sự cố/Sửa chữa').map((service) => (
                            <SelectItem key={service.MaDV} value={service.MaDV.toString()}>
                              Dịch vụ: {service.TenDV} ({service.LoaiDichVu})
                            </SelectItem>
                          ))}
                          <SelectItem value="Khác">Khoản khác</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="rounded-lg border">
                      <div className="grid grid-cols-12 gap-2 p-3 font-medium text-sm border-b">
                        <div className="col-span-3">Khoản mục</div>
                        <div className="col-span-2 text-right">Đơn giá</div>
                        <div className="col-span-2 text-right">Chỉ số cũ/Mới</div>
                        <div className="col-span-2 text-right">Số lượng</div>
                        <div className="col-span-2 text-right">Thành tiền</div>
                        <div className="col-span-1"></div>
                      </div>

                      {billItems.map((item) => (
                        <div key={item.id} className="grid grid-cols-12 gap-2 p-3 border-b last:border-0 items-center">
                          <div className="col-span-3">
                            <Input
                                type="text"
                                value={item.description}
                                onChange={(e) => updateBillItem(item.id, "description", e.target.value)}
                                className="h-8"
                                disabled={item.type !== 'Khác'}
                            />
                          </div>
                          <div className="col-span-2">
                            <Input
                              type="number"
                              value={item.unitPrice}
                              onChange={(e) => updateBillItem(item.id, "unitPrice", Number(e.target.value))}
                              className="text-right h-8"
                              min="0"
                            />
                          </div>
                          {(item.type === 'Điện' || item.type === 'Nước') ? (
                              <div className="col-span-2 space-y-1">
                                <Input
                                  type="number"
                                  placeholder="Cũ"
                                  value={item.oldReading ?? ''}
                                  onChange={(e) => updateBillItem(item.id, "oldReading", Number(e.target.value))}
                                  className="text-right h-8"
                                  min="0"
                                />
                                <Input
                                  type="number"
                                  placeholder="Mới"
                                  value={item.newReading ?? ''}
                                  onChange={(e) => updateBillItem(item.id, "newReading", Number(e.target.value))}
                                  className="text-right h-8"
                                  min={item.oldReading !== undefined ? item.oldReading : "0"}
                                />
                              </div>
                          ) : (
                              <div className="col-span-2 text-center text-muted-foreground text-sm">-</div>
                          )}
                          <div className="col-span-2 flex items-center">
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              className="h-8 w-8 rounded-r-none"
                              onClick={() => updateBillItem(item.id, "quantity", Math.max(0, item.quantity - 1))}
                              disabled={item.type === 'Điện' || item.type === 'Nước' || item.type === 'Tiền phòng'}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <Input
                              type="number"
                              value={item.quantity}
                              onChange={(e) => updateBillItem(item.id, "quantity", Number(e.target.value))}
                              className="text-right h-8 rounded-none w-full"
                              min="0"
                              readOnly={item.type === 'Điện' || item.type === 'Nước' || item.type === 'Tiền phòng'}
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              className="h-8 w-8 rounded-l-none"
                              onClick={() => updateBillItem(item.id, "quantity", item.quantity + 1)}
                              disabled={item.type === 'Điện' || item.type === 'Nước' || item.type === 'Tiền phòng'}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                          <div className="col-span-2 text-right">{item.total.toLocaleString("vi-VN")} VNĐ</div>
                          <div className="col-span-1 flex justify-end">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={() => removeBillItem(item.id)}
                              disabled={item.type === 'Tiền phòng'}
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}

                      <div className="grid grid-cols-12 gap-2 p-3 font-medium border-t">
                        <div className="col-span-10 text-right">Tổng cộng:</div>
                        <div className="col-span-2 text-right">{totalAmount.toLocaleString("vi-VN")} VNĐ</div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="note">Ghi chú</Label>
                    <Input id="note" placeholder="Nhập ghi chú (nếu có)" value={note} onChange={(e) => setNote(e.target.value)} />
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                <Button
                type="button"
                variant="outline"
                onClick={() => setCurrentTab("contract")} // Quay lại tab trước
            >
                Quay lại
            </Button>
                  <Button type="submit" disabled={isSubmitting || billItems.length === 0 || totalAmount <= 0}>
                    {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Đang xử lý...</> : "Tạo hóa đơn"}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </form>
      </div>
  )
}