"use client"

import type React from "react"
import { useEffect, useState, useMemo } from "react"
import { useRouter, useParams } from "next/navigation"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { CalendarIcon, Zap, Droplets, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import DashboardLayout from "@/components/dashboard/dashboard-layout"
import { getRoomById } from "@/services/roomService"
import { createDienNuoc, getAllDienNuoc } from "@/services/dienNuocService" // Assuming dienNuocService exists and maps to controller
import { getElectricWaterPrices } from "@/services/electricWaterPriceService"
import type { Room } from "@/types/room"
import type { ElectricWaterUsage } from "@/types/electricWaterUsage" // Assuming this type is defined
import type { IElectricWaterPrice } from "@/types/electricWaterPrice"
import { Skeleton } from "@/components/ui/skeleton"
import Link from "next/link"


// Temporary type for ElectricWaterUsage if it's not defined elsewhere
// This should ideally be imported from a shared types file (e.g., @/types/electricWaterUsage)
// interface ElectricWaterUsage {
//     MaDienNuoc: number;
//     MaPhong: number;
//     Loai: 'Điện' | 'Nước';
//     ChiSoDau: number;
//     ChiSoCuoi: number;
//     SoLuongTieuThu: number;
//     DonGia: number;
//     ThanhTien: number;
//     NgayGhi: string;
//     MaHoaDon?: number | null;
//     TrangThai: 'Mới ghi' | 'Đã tính tiền' | 'Đã hủy';
//     GhiChu?: string | null;
//     room?: {
//         MaPhong: number;
//         TenPhong: string;
//         property?: {
//             MaNhaTro: number;
//             TenNhaTro: string;
//         };
//     };
// }

export default function RoomUtilitiesPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const [room, setRoom] = useState<Room | null>(null);
  const [electricityReadings, setElectricityReadings] = useState<ElectricWaterUsage[]>([]);
  const [waterReadings, setWaterReadings] = useState<ElectricWaterUsage[]>([]);
  const [latestElectricReading, setLatestElectricReading] = useState<number>(0);
  const [latestWaterReading, setLatestWaterReading] = useState<number>(0);
  const [electricRate, setElectricRate] = useState<number>(0);
  const [waterRate, setWaterRate] = useState<number>(0);
  const [newElectricReading, setNewElectricReading] = useState<string>('');
  const [newWaterReading, setNewWaterReading] = useState<string>('');
  const [recordingDate, setRecordingDate] = useState<Date>(new Date());
  const [isLoading, setIsLoading] = useState(true);

  const roomId = Number(params.id);

  useEffect(() => {
    if (isNaN(roomId)) {
        toast({ title: "Lỗi", description: "Mã phòng không hợp lệ.", variant: "destructive" });
        router.push('/dashboard/rooms'); 
        return;
    }

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [fetchedRoom, allElectricWaterPrices, allUsages] = await Promise.all([
                getRoomById(roomId),
                getElectricWaterPrices(),
                getAllDienNuoc({ MaPhong: roomId }) 
            ]);

            setRoom(fetchedRoom);

            const electricUsages = allUsages.filter(u => u.Loai === 'Điện');
            const waterUsages = allUsages.filter(u => u.Loai === 'Nước');

            const latestElectric = electricUsages.sort((a, b) => new Date(b.NgayGhi).getTime() - new Date(a.NgayGhi).getTime())[0];
            const latestWater = waterUsages.sort((a, b) => new Date(b.NgayGhi).getTime() - new Date(a.NgayGhi).getTime())[0];

            setLatestElectricReading(latestElectric?.ChiSoCuoi || 0);
            setLatestWaterReading(latestWater?.ChiSoCuoi || 0);
            setElectricityReadings(electricUsages);
            setWaterReadings(waterUsages);

            const electricPrice = allElectricWaterPrices
                .filter(p => p.MaNhaTro === fetchedRoom.MaNhaTro && p.LoaiChiPhi === 'Điện')
                .sort((a, b) => new Date(b.NgayApDung).getTime() - new Date(a.NgayApDung).getTime())[0];
            const waterPrice = allElectricWaterPrices
                .filter(p => p.MaNhaTro === fetchedRoom.MaNhaTro && p.LoaiChiPhi === 'Nước')
                .sort((a, b) => new Date(b.NgayApDung).getTime() - new Date(a.NgayApDung).getTime())[0];

            setElectricRate(electricPrice?.DonGiaMoi || 0);
            setWaterRate(waterPrice?.DonGiaMoi || 0);

        } catch (error: any) {
            toast({ title: "Lỗi", description: error.message || "Không thể tải dữ liệu điện nước.", variant: "destructive" });
            router.push(`/dashboard/rooms/${roomId}`); 
        } finally {
            setIsLoading(false);
        }
    };
    fetchData();
}, [roomId, router, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!recordingDate) {
        toast({ title: "Lỗi", description: "Vui lòng chọn ngày ghi chỉ số.", variant: "destructive" });
        setIsSubmitting(false);
        return;
    }

    try {
        if (newElectricReading) {
            const currentElectric = Number(newElectricReading);
            if (currentElectric < latestElectricReading) {
                 throw new Error("Chỉ số điện mới không được nhỏ hơn chỉ số cũ.");
            }
            await createDienNuoc({
                MaPhong: roomId,
                Loai: 'Điện',
                ChiSoDau: latestElectricReading,
                ChiSoCuoi: currentElectric,
                NgayGhi: format(recordingDate, 'yyyy-MM-dd'),
                GhiChu: '', 
            });
        }

        if (newWaterReading) {
            const currentWater = Number(newWaterReading);
            if (currentWater < latestWaterReading) {
                throw new Error("Chỉ số nước mới không được nhỏ hơn chỉ số cũ.");
            }
            await createDienNuoc({
                MaPhong: roomId,
                Loai: 'Nước',
                ChiSoDau: latestWaterReading,
                ChiSoCuoi: currentWater,
                NgayGhi: format(recordingDate, 'yyyy-MM-dd'),
                GhiChu: '', 
            });
        }
        
        toast({ title: "Ghi nhận thành công", description: "Chỉ số điện nước đã được cập nhật." });
        
        // Re-fetch all data to update the UI
        const [updatedElectricWaterPrices, updatedUsages] = await Promise.all([
            getElectricWaterPrices(),
            getAllDienNuoc({ MaPhong: roomId })
        ]);

        const electricUsages = updatedUsages.filter(u => u.Loai === 'Điện');
        const waterUsages = updatedUsages.filter(u => u.Loai === 'Nước');

        const latestElectric = electricUsages.sort((a, b) => new Date(b.NgayGhi).getTime() - new Date(a.NgayGhi).getTime())[0];
        const latestWater = waterUsages.sort((a, b) => new Date(b.NgayGhi).getTime() - new Date(a.NgayGhi).getTime())[0];

        setLatestElectricReading(latestElectric?.ChiSoCuoi || 0);
        setLatestWaterReading(latestWater?.ChiSoCuoi || 0);
        setElectricityReadings(electricUsages);
        setWaterReadings(waterUsages);

        const electricPrice = updatedElectricWaterPrices
            .filter(p => p.MaNhaTro === room?.MaNhaTro && p.LoaiChiPhi === 'Điện')
            .sort((a, b) => new Date(b.NgayApDung).getTime() - new Date(a.NgayApDung).getTime())[0];
        const waterPrice = updatedElectricWaterPrices
            .filter(p => p.MaNhaTro === room?.MaNhaTro && p.LoaiChiPhi === 'Nước')
            .sort((a, b) => new Date(b.NgayApDung).getTime() - new Date(a.NgayApDung).getTime())[0];

        setElectricRate(electricPrice?.DonGiaMoi || 0);
        setWaterRate(waterPrice?.DonGiaMoi || 0);

        setNewElectricReading("");
        setNewWaterReading("");
        setRecordingDate(new Date());

    } catch (error: any) {
        toast({ title: "Lỗi ghi nhận", description: error.message || "Không thể ghi nhận chỉ số điện nước.", variant: "destructive" });
    } finally {
        setIsSubmitting(false);
    }
  };

  const calculateElectricAmount = useMemo(() => {
    const current = Number(newElectricReading);
    if (isNaN(current) || current < latestElectricReading) return 0;
    const usage = current - latestElectricReading;
    return usage * electricRate;
  }, [newElectricReading, latestElectricReading, electricRate]);

  const calculateWaterAmount = useMemo(() => {
    const current = Number(newWaterReading);
    if (isNaN(current) || current < latestWaterReading) return 0;
    const usage = current - latestWaterReading;
    return usage * waterRate;
  }, [newWaterReading, latestWaterReading, waterRate]);


  if (isLoading || !room) {
    return (
      <DashboardLayout>
        <div className="mx-auto max-w-3xl space-y-6">
          <div className="flex items-center">
            <Skeleton className="h-10 w-10 mr-2 rounded-md" />
            <Skeleton className="h-8 w-60" />
          </div>
          <Card>
            <CardHeader>
              <Skeleton className="h-7 w-3/4 mb-1" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-5 w-1/3" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-5 w-1/4" />
              <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              <Skeleton className="h-10 w-20" />
              <Skeleton className="h-10 w-36" />
            </CardFooter>
          </Card>
           <Skeleton className="h-96 w-full" />
        </div>
      </DashboardLayout>
    );
  }

  return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" asChild>
                <Link href={`/dashboard/rooms/${roomId}`}>
                    <ArrowLeft className="h-4 w-4" />
                </Link>
            </Button>
            <Zap className="h-6 w-6" />
            <h1 className="text-2xl font-bold tracking-tight">Quản lý điện nước - {room.TenPhong}</h1>
          </div>
          <Button variant="outline" onClick={() => router.back()}>
            Quay lại
          </Button>
        </div>

        <Tabs defaultValue="record">
          <TabsList>
            <TabsTrigger value="record">Ghi chỉ số</TabsTrigger>
            <TabsTrigger value="history">Lịch sử</TabsTrigger>
          </TabsList>
          <TabsContent value="record" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Ghi nhận chỉ số điện nước</CardTitle>
                <CardDescription>Nhập chỉ số công tơ điện và nước mới nhất cho phòng {room.TenPhong}</CardDescription>
              </CardHeader>
              <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">Ngày ghi chỉ số</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={cn("w-full justify-start text-left font-normal", !recordingDate && "text-muted-foreground")}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {recordingDate ? format(recordingDate, "dd/MM/yyyy", { locale: vi }) : "Chọn ngày"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar mode="single" selected={recordingDate} onSelect={(day) => {
    if (day) setRecordingDate(day);
  }} initialFocus />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Zap className="h-5 w-5 text-yellow-500" />
                        <h3 className="font-medium">Điện</h3>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Chỉ số cũ:</span>
                          <span className="font-medium">{latestElectricReading} kWh</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Đơn giá hiện tại:</span>
                            <span className="font-medium">{electricRate.toLocaleString("vi-VN")} VNĐ/kWh</span>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="electricity">Chỉ số mới (kWh)</Label>
                          <Input
                            id="electricity"
                            type="number"
                            placeholder="Nhập chỉ số điện mới"
                            value={newElectricReading}
                            onChange={(e) => setNewElectricReading(e.target.value)}
                            min={latestElectricReading}
                          />
                        </div>

                        {newElectricReading && Number.parseInt(newElectricReading) >= latestElectricReading && (
                          <div className="rounded-md bg-muted p-3">
                            <div className="text-sm">
                              <div className="flex justify-between">
                                <span>Tiêu thụ:</span>
                                <span className="font-medium">
                                  {Number.parseInt(newElectricReading) - latestElectricReading} kWh
                                </span>
                              </div>
                              <div className="flex justify-between font-medium">
                                <span>Thành tiền:</span>
                                <span>
                                  {calculateElectricAmount.toLocaleString("vi-VN")} VNĐ
                                </span>
                              </div>
                            </div>
                          </div>
                        )}
                    {newElectricReading && Number.parseInt(newElectricReading) < latestElectricReading && (
                        <p className="text-red-500 text-sm">Chỉ số điện mới không được nhỏ hơn chỉ số cũ.</p>
                    )}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Droplets className="h-5 w-5 text-blue-500" />
                        <h3 className="font-medium">Nước</h3>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Chỉ số cũ:</span>
                          <span className="font-medium">{latestWaterReading} m³</span>
                        </div>
                         <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Đơn giá hiện tại:</span>
                            <span className="font-medium">{waterRate.toLocaleString("vi-VN")} VNĐ/m³</span>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="water">Chỉ số mới (m³)</Label>
                          <Input
                            id="water"
                            type="number"
                            placeholder="Nhập chỉ số nước mới"
                            value={newWaterReading}
                            onChange={(e) => setNewWaterReading(e.target.value)}
                            min={latestWaterReading}
                          />
                        </div>

                        {newWaterReading && Number.parseInt(newWaterReading) >= latestWaterReading && (
                          <div className="rounded-md bg-muted p-3">
                            <div className="text-sm">
                              <div className="flex justify-between">
                                <span>Tiêu thụ:</span>
                                <span className="font-medium">
                                  {Number.parseInt(newWaterReading) - latestWaterReading} m³
                                </span>
                              </div>
                              <div className="flex justify-between font-medium">
                                <span>Thành tiền:</span>
                                <span>
                                  {calculateWaterAmount.toLocaleString("vi-VN")} VNĐ
                                </span>
                              </div>
                            </div>
                          </div>
                        )}
                        {newWaterReading && Number.parseInt(newWaterReading) < latestWaterReading && (
                            <p className="text-red-500 text-sm">Chỉ số nước mới không được nhỏ hơn chỉ số cũ.</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {(newElectricReading && Number.parseInt(newElectricReading) >= latestElectricReading &&
                    newWaterReading && Number.parseInt(newWaterReading) >= latestWaterReading) && (
                      <div className="rounded-md bg-primary/10 p-4 mt-4">
                        <div className="flex justify-between font-medium">
                          <span>Tổng tiền điện nước dự kiến:</span>
                          <span className="text-lg">
                            {(calculateElectricAmount + calculateWaterAmount).toLocaleString("vi-VN")}{" "}
                            VNĐ
                          </span>
                        </div>
                      </div>
                    )}
                </CardContent>
                <CardFooter>
                  <Button type="submit" disabled={isSubmitting || !recordingDate || (!newElectricReading && !newWaterReading)}>
                    {isSubmitting ? "Đang xử lý..." : "Lưu chỉ số"}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
          <TabsContent value="history" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Lịch sử chỉ số điện nước</CardTitle>
                <CardDescription>Lịch sử ghi nhận chỉ số điện nước của phòng {room.TenPhong}</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableCaption>Danh sách chỉ số điện nước đã ghi nhận</TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ngày ghi</TableHead>
                      <TableHead className="text-right">Loại</TableHead>
                      <TableHead className="text-right">Chỉ số cũ</TableHead>
                      <TableHead className="text-right">Chỉ số mới</TableHead>
                      <TableHead className="text-right">Tiêu thụ</TableHead>
                      <TableHead className="text-right">Đơn giá</TableHead>
                      <TableHead className="text-right">Thành tiền</TableHead>
                      <TableHead className="text-center">Trạng thái</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {electricityReadings.concat(waterReadings).sort((a,b) => new Date(b.NgayGhi).getTime() - new Date(a.NgayGhi).getTime()).map((reading) => (
                      <TableRow key={reading.MaDienNuoc}>
                        <TableCell>{format(new Date(reading.NgayGhi), 'dd/MM/yyyy')}</TableCell>
                        <TableCell className="text-right">{reading.Loai}</TableCell>
                        <TableCell className="text-right">{reading.ChiSoDau}</TableCell>
                        <TableCell className="text-right">{reading.ChiSoCuoi}</TableCell>
                        <TableCell className="text-right">{reading.SoLuongTieuThu} {reading.Loai === 'Điện' ? 'kWh' : 'm³'}</TableCell>
                        <TableCell className="text-right">{reading.DonGia.toLocaleString('vi-VN')} VNĐ</TableCell>
                        <TableCell className="text-right font-medium">{reading.ThanhTien.toLocaleString('vi-VN')} VNĐ</TableCell>
                        <TableCell className="text-center">{reading.TrangThai}</TableCell>
                      </TableRow>
                    ))}
                     {electricityReadings.length === 0 && waterReadings.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={8} className="text-center text-muted-foreground py-4">
                                Chưa có lịch sử ghi chỉ số điện nước.
                            </TableCell>
                        </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
  )
}