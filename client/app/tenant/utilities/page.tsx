"use client"

import { useEffect, useState, useMemo } from "react"
import { format } from "date-fns"
import DashboardLayout from "@/components/dashboard/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Zap, Droplets, AlertCircle } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import TenantUtilitiesLoading from "./loading" // Import component skeleton
import { getElectricWaterUsages } from "@/services/dienNuocService"
import { getCurrentContract } from "@/services/contractService"
import { IElectricWaterUsage } from "@/types/electricWaterUsage"
import { IContract } from "@/types/contract"

export default function TenantUtilitiesPage() {
  // State để lưu trữ dữ liệu từ API
  const [contractInfo, setContractInfo] = useState<IContract | null>(null)
  const [electricData, setElectricData] = useState<IElectricWaterUsage[]>([])
  const [waterData, setWaterData] = useState<IElectricWaterUsage[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedPeriod, setSelectedPeriod] = useState<string>("all")
  const { toast } = useToast()

  // Lấy dữ liệu từ server khi component được mount
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      setError(null)
      try {
        // Gọi đồng thời cả hai API để tăng tốc
        const [contractRes, usageRes] = await Promise.all([
          getCurrentContract(),
          getElectricWaterUsages()
        ]);

        setContractInfo(contractRes)
        
        // Phân loại dữ liệu điện và nước
        setElectricData(usageRes.filter(item => item.Loai === 'dien'))
        setWaterData(usageRes.filter(item => item.Loai === 'nuoc'))

      } catch (err: any) {
        console.error("Failed to fetch utilities data:", err)
        setError("Không thể tải dữ liệu điện nước. Vui lòng thử lại sau.")
        toast({
          title: "Lỗi",
          description: err.message || "Không thể tải dữ liệu từ server.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    };

    fetchData()
  }, [toast])
  
  // Lọc dữ liệu theo kỳ được chọn
  const filteredElectricData = useMemo(() => {
    if (selectedPeriod === "all") return electricData;
    return electricData.filter(item => `${format(new Date(item.Ky), 'MM-yyyy')}` === selectedPeriod);
  }, [selectedPeriod, electricData]);

  const filteredWaterData = useMemo(() => {
    if (selectedPeriod === "all") return waterData;
    return waterData.filter(item => `${format(new Date(item.Ky), 'MM-yyyy')}` === selectedPeriod);
  }, [selectedPeriod, waterData]);

  // Tạo danh sách các kỳ duy nhất để hiển thị trong bộ lọc
  const availablePeriods = useMemo(() => {
    const allRecords = [...electricData, ...waterData];
    const periods = new Set(allRecords.map(item => format(new Date(item.Ky), 'MM-yyyy')));
    return Array.from(periods);
  }, [electricData, waterData]);

  // Hiển thị skeleton loading
  if (isLoading) {
    return <TenantUtilitiesLoading />
  }

  // Hiển thị thông báo lỗi
  if (error) {
    return (
      
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
            <h2 className="mt-4 text-xl font-semibold">Đã xảy ra lỗi</h2>
            <p className="mt-2 text-muted-foreground">{error}</p>
          </div>
        </div>
      
    )
  }

  // Giao diện chính
  return (
    
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Điện nước</h1>
          <div className="flex items-center gap-2">
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Chọn kỳ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả kỳ</SelectItem>
                {availablePeriods.map(period => (
                  <SelectItem key={period} value={period}>
                    Tháng {period.replace('-', '/')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Thông tin phòng</CardTitle>
            <CardDescription>Thông tin về phòng và hợp đồng thuê hiện tại của bạn</CardDescription>
          </CardHeader>
          <CardContent>
            {contractInfo ? (
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <h3 className="font-medium">Thông tin phòng</h3>
                  <div className="grid gap-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Phòng:</span>
                      <span>{contractInfo.room?.TenPhong} - {contractInfo.room?.property?.TenNhaTro}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Loại phòng:</span>
                      <span>{contractInfo.room?.roomType?.TenLoai}</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="font-medium">Thông tin hợp đồng</h3>
                  <div className="grid gap-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Mã hợp đồng:</span>
                      <span>{contractInfo.MaHopDong}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Ngày bắt đầu:</span>
                      <span>{format(new Date(contractInfo.NgayBatDau), 'dd/MM/yyyy')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Ngày kết thúc:</span>
                      <span>{format(new Date(contractInfo.NgayKetThuc), 'dd/MM/yyyy')}</span>
                    </div>

                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Không tìm thấy thông tin hợp đồng đang có hiệu lực.</p>
            )}
          </CardContent>
        </Card>

        <Tabs defaultValue="electricity">
          <TabsList>
            <TabsTrigger value="electricity" className="flex items-center gap-1">
              <Zap className="h-4 w-4" />
              Điện
            </TabsTrigger>
            <TabsTrigger value="water" className="flex items-center gap-1">
              <Droplets className="h-4 w-4" />
              Nước
            </TabsTrigger>
          </TabsList>

          {/* Tab Điện */}
          <TabsContent value="electricity" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Lịch sử sử dụng điện</CardTitle>
                <CardDescription>Thông tin chỉ số điện và tiền điện theo từng kỳ</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border">
                  <div className="grid grid-cols-7 gap-2 p-3 font-medium text-sm border-b">
                    <div className="col-span-1">Kỳ</div>
                    <div className="col-span-1 text-right">Chỉ số cũ</div>
                    <div className="col-span-1 text-right">Chỉ số mới</div>
                    <div className="col-span-1 text-right">Tiêu thụ</div>
                    <div className="col-span-1 text-right">Đơn giá</div>
                    <div className="col-span-1 text-right">Thành tiền</div>
                    <div className="col-span-1">Ngày ghi</div>
                  </div>

                  {filteredElectricData.length > 0 ? (
                    filteredElectricData.map((item) => (
                      <div key={item.MaGhiDienNuoc} className="grid grid-cols-7 gap-2 p-3 border-b last:border-0 items-center text-sm">
                        <div className="col-span-1">{format(new Date(item.Ky), 'MM/yyyy')}</div>
                        <div className="col-span-1 text-right">{item.ChiSoCu}</div>
                        <div className="col-span-1 text-right">{item.ChiSoMoi}</div>
                        <div className="col-span-1 text-right font-medium">{item.SoTieuThu}</div>
                        <div className="col-span-1 text-right">{item.DonGia?.toLocaleString("vi-VN")} VNĐ</div>
                        <div className="col-span-1 text-right font-semibold">{item.ThanhTien?.toLocaleString("vi-VN")} VNĐ</div>
                        <div className="col-span-1">{format(new Date(item.NgayGhi), 'dd/MM/yyyy')}</div>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-muted-foreground">Không có dữ liệu.</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab Nước */}
          <TabsContent value="water" className="space-y-4">
             <Card>
              <CardHeader>
                <CardTitle>Lịch sử sử dụng nước</CardTitle>
                <CardDescription>Thông tin chỉ số nước và tiền nước theo từng kỳ</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border">
                  <div className="grid grid-cols-7 gap-2 p-3 font-medium text-sm border-b">
                    <div className="col-span-1">Kỳ</div>
                    <div className="col-span-1 text-right">Chỉ số cũ</div>
                    <div className="col-span-1 text-right">Chỉ số mới</div>
                    <div className="col-span-1 text-right">Tiêu thụ</div>
                    <div className="col-span-1 text-right">Đơn giá</div>
                    <div className="col-span-1 text-right">Thành tiền</div>
                    <div className="col-span-1">Ngày ghi</div>
                  </div>

                  {filteredWaterData.length > 0 ? (
                    filteredWaterData.map((item) => (
                       <div key={item.MaGhiDienNuoc} className="grid grid-cols-7 gap-2 p-3 border-b last:border-0 items-center text-sm">
                        <div className="col-span-1">{format(new Date(item.Ky), 'MM/yyyy')}</div>
                        <div className="col-span-1 text-right">{item.ChiSoCu}</div>
                        <div className="col-span-1 text-right">{item.ChiSoMoi}</div>
                        <div className="col-span-1 text-right font-medium">{item.SoTieuThu}</div>
                        <div className="col-span-1 text-right">{item.DonGia?.toLocaleString("vi-VN")} VNĐ</div>
                        <div className="col-span-1 text-right font-semibold">{item.ThanhTien?.toLocaleString("vi-VN")} VNĐ</div>
                        <div className="col-span-1">{format(new Date(item.NgayGhi), 'dd/MM/yyyy')}</div>
                      </div>
                    ))
                  ) : (
                     <div className="p-4 text-center text-muted-foreground">Không có dữ liệu.</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    
  )
}