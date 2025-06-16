"use client";

import type React from "react";
import { useEffect, useState, FormEvent } from "react";
import { useRouter, useParams } from "next/navigation";
import { ShoppingBag, Plus, X, Zap } from "lucide-react"; // Import Zap for service icon
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import DashboardLayout from "@/components/dashboard/dashboard-layout";
import { getRoomById } from "@/services/roomService"; // Import service to get room details
import { getAllServices } from "@/services/serviceService"; // Import service to get all services
import { createSuDungDichVu, getAllSuDungDichVu } from "@/services/serviceusageService"; // Assuming this service exists
import { getContracts, updateContract } from '@/services/contractService'; // Import contract services to manage registered services
import type { Room } from "@/types/room";
import type { IService } from "@/types/service";
import type { IContract } from "@/types/contract";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { format } from "date-fns";

// Define the ServiceUsage type locally or import it from suDungDichVuService if preferred
interface ServiceUsage {
    MaSuDungDV: number;
    MaPhong: number;
    MaDV: number;
    SoLuong: number;
    DonGia: number;
    ThanhTien: number;
    NgaySuDung: string;
    GhiChu?: string;
    MaHoaDon?: number;
    TrangThai: 'Mới ghi' | 'Đã tính tiền';
    service?: { // Include service details for display
        TenDV: string;
        DonViTinh: string;
        LoaiDichVu: string;
    };
}


export default function RoomServicesPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const { toast } = useToast();
    const { user, isLoading: authLoading } = useAuth();

    const [room, setRoom] = useState<Room | null>(null);
    const [currentContract, setCurrentContract] = useState<IContract | null>(null);
    const [allAvailableServices, setAllAvailableServices] = useState<IService[]>([]);
    const [serviceUsageHistory, setServiceUsageHistory] = useState<ServiceUsage[]>([]); // Corrected type
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form states for 'Ghi nhận sử dụng' tab
    const [selectedServiceIdForUsage, setSelectedServiceIdForUsage] = useState<string>("");
    const [quantityForUsage, setQuantityForUsage] = useState<string>("1");
    const [usageDate, setUsageDate] = useState<Date>(new Date());

    const roomId = Number(params.id);

    useEffect(() => {
        if (authLoading) return;
        if (!user) {
            router.push('/login');
            return;
        }
        if (user.role?.TenVaiTro !== 'Chủ trọ') {
            toast({ title: "Lỗi", description: "Bạn không có quyền truy cập trang này.", variant: "destructive" });
            router.push('/dashboard');
            return;
        }
        if (isNaN(roomId)) {
            toast({ title: "Lỗi", description: "Mã phòng không hợp lệ.", variant: "destructive" });
            router.push(`/dashboard/rooms`); // Redirect back to rooms list
            return;
        }

        const fetchData = async () => {
            setIsLoading(true);
            try {
                const fetchedRoom = await getRoomById(roomId);
                setRoom(fetchedRoom);

                // Fetch all services applicable to this property (both general and specific)
                const fetchedServices = await getAllServices();
                const servicesForThisProperty = fetchedServices.filter(s =>
                    s.MaNhaTro === null || s.MaNhaTro === fetchedRoom.MaNhaTro
                );
                setAllAvailableServices(servicesForThisProperty);

                // Fetch the current active contract for the room to get registered services
                // SỬA ĐỔI: Sử dụng "MaPhong" thay vì "roomId"
                const contractsForRoom = await getContracts({ MaPhong: roomId.toString(), status: 'Có hiệu lực' }); // Pass MaPhong
                if (contractsForRoom.length > 0) {
                    setCurrentContract(contractsForRoom[0]); // Assume only one active contract per room
                } else {
                    setCurrentContract(null); // No active contract
                }

                // Fetch service usage history for the room using the new service
                const fetchedUsageHistory = await getAllSuDungDichVu({ MaPhong: roomId });
                setServiceUsageHistory(fetchedUsageHistory);

            } catch (error: any) {
                toast({
                    title: "Lỗi tải dữ liệu",
                    description: error.message || "Không thể tải dữ liệu phòng hoặc dịch vụ.",
                    variant: "destructive",
                });
                setRoom(null);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [roomId, user, authLoading, router, toast]);


    const handleRegisterService = async (serviceId: number) => {
        if (!currentContract) {
            toast({ title: "Lỗi", description: "Không có hợp đồng đang hoạt động cho phòng này để đăng ký dịch vụ.", variant: "destructive" });
            return;
        }
        setIsSubmitting(true);
        try {
            // Add service to contract's registeredServices
            const updatedRegisteredServices = [...(currentContract.registeredServices || []).map(s => s.MaDV), serviceId];

            const updatedContract = await updateContract(currentContract.MaHopDong, {
                ...currentContract, // Pass all other fields
                MaPhong: currentContract.MaPhong,
                NgayLap: format(new Date(currentContract.NgayLap), 'yyyy-MM-dd'),
                NgayBatDau: format(new Date(currentContract.NgayBatDau), 'yyyy-MM-dd'),
                NgayKetThuc: format(new Date(currentContract.NgayKetThuc), 'yyyy-MM-dd'),
                TienCoc: currentContract.TienCoc,
                TienThueThoaThuan: currentContract.TienThueThoaThuan,
                KyThanhToan: currentContract.KyThanhToan,
                HanThanhToan: currentContract.HanThanhToan,
                TrangThai: currentContract.TrangThai,
                occupants: currentContract.occupants.map(o => ({ MaKhachThue: o.MaKhachThue, LaNguoiDaiDien: o.LaNguoiDaiDien })),
                registeredServices: updatedRegisteredServices,
            });
            setCurrentContract(updatedContract); // Update local state
            toast({ title: "Thành công", description: "Dịch vụ đã được đăng ký cho hợp đồng." });
        } catch (error: any) {
            toast({ title: "Lỗi đăng ký dịch vụ", description: error.message || "Không thể đăng ký dịch vụ. Vui lòng thử lại.", variant: "destructive" });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUnregisterService = async (serviceId: number) => {
        if (!currentContract) return; // Should not happen
        setIsSubmitting(true);
        try {
            // Remove service from contract's registeredServices
            const updatedRegisteredServices = (currentContract.registeredServices || [])
                .filter(s => s.MaDV !== serviceId)
                .map(s => s.MaDV);

            const updatedContract = await updateContract(currentContract.MaHopDong, {
                ...currentContract,
                MaPhong: currentContract.MaPhong,
                NgayLap: format(new Date(currentContract.NgayLap), 'yyyy-MM-dd'),
                NgayBatDau: format(new Date(currentContract.NgayBatDau), 'yyyy-MM-dd'),
                NgayKetThuc: format(new Date(currentContract.NgayKetThuc), 'yyyy-MM-dd'),
                TienCoc: currentContract.TienCoc,
                TienThueThoaThuan: currentContract.TienThueThoaThuan,
                KyThanhToan: currentContract.KyThanhToan,
                HanThanhToan: currentContract.HanThanhToan,
                TrangThai: currentContract.TrangThai,
                occupants: currentContract.occupants.map(o => ({ MaKhachThue: o.MaKhachThue, LaNguoiDaiDien: o.LaNguoiDaiDien })),
                registeredServices: updatedRegisteredServices,
            });
            setCurrentContract(updatedContract); // Update local state
            toast({ title: "Thành công", description: "Dịch vụ đã được hủy đăng ký." });
        } catch (error: any) {
            toast({ title: "Lỗi hủy đăng ký dịch vụ", description: error.message || "Không thể hủy đăng ký dịch vụ. Vui lòng thử lại.", variant: "destructive" });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleRecordUsage = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);

        if (!selectedServiceIdForUsage || !quantityForUsage || !usageDate) {
            toast({ title: "Lỗi", description: "Vui lòng chọn dịch vụ, số lượng và ngày sử dụng.", variant: "destructive" });
            setIsSubmitting(false);
            return;
        }

        try {
            const service = allAvailableServices.find(s => s.MaDV.toString() === selectedServiceIdForUsage);
            if (!service) {
                throw new Error("Dịch vụ không hợp lệ.");
            }

            await createSuDungDichVu({
                MaPhong: roomId,
                MaDV: Number(selectedServiceIdForUsage),
                SoLuong: Number(quantityForUsage),
                NgaySuDung: format(usageDate, 'yyyy-MM-dd'),
            });
            toast({ title: "Ghi nhận thành công", description: "Sử dụng dịch vụ đã được ghi nhận." });

            // Re-fetch usage history to update the list
            const updatedUsageHistory = await getAllSuDungDichVu({ MaPhong: roomId }); // Using the actual service now
            setServiceUsageHistory(updatedUsageHistory);

            // Clear form
            setSelectedServiceIdForUsage("");
            setQuantityForUsage("1");
            setUsageDate(new Date());

        } catch (error: any) {
            toast({ title: "Lỗi ghi nhận sử dụng", description: error.message || "Không thể ghi nhận sử dụng dịch vụ.", variant: "destructive" });
        } finally {
            setIsSubmitting(false);
        }
    };

    const getServiceDetails = (serviceId: number) => {
        return allAvailableServices.find(s => s.MaDV === serviceId);
    };

    const getBadgeVariant = (type: string) => {
        switch (type) {
            case 'Cố định hàng tháng':
                return 'default';
            case 'Theo số lượng sử dụng':
                return 'outline';
            case 'Sự cố/Sửa chữa':
                return 'secondary';
            default:
                return 'default';
        }
    };

    if (isLoading || authLoading) {
        return (
            
                <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <Skeleton className="h-8 w-48" />
                        <Skeleton className="h-10 w-32" />
                    </div>
                    <Skeleton className="h-96 w-full" />
                </div>
         
        );
    }

    if (!room) {
        return (
            
                <div className="flex flex-col items-center justify-center min-h-[60vh]">
                    <h2 className="text-xl font-semibold text-muted-foreground">Không tìm thấy phòng này.</h2>
                    <Button className="mt-4" asChild>
                        <Link href="/dashboard/rooms">Quay lại danh sách phòng</Link>
                    </Button>
                </div>
         
        );
    }

    const fixedServicesRegistered = currentContract?.registeredServices?.filter(s => s.LoaiDichVu === 'Cố định hàng tháng') || [];
    const usageServicesAvailable = allAvailableServices.filter(s => s.LoaiDichVu === 'Theo số lượng sử dụng' || s.LoaiDichVu === 'Sự cố/Sửa chữa');

    return (
        
            <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="icon" asChild>
                            <Link href={`/dashboard/rooms/${roomId}`}>
                                <ArrowLeft className="h-4 w-4" />
                            </Link>
                        </Button>
                        <ShoppingBag className="h-6 w-6" />
                        <h1 className="text-2xl font-bold tracking-tight">Quản lý dịch vụ - {room.TenPhong}</h1>
                    </div>
                    <Button variant="outline" onClick={() => router.back()}>
                        Quay lại
                    </Button>
                </div>

                <Tabs defaultValue="registered">
                    <TabsList>
                        <TabsTrigger value="registered">Dịch vụ đã đăng ký</TabsTrigger>
                        <TabsTrigger value="register">Đăng ký dịch vụ</TabsTrigger>
                        <TabsTrigger value="usage">Ghi nhận sử dụng</TabsTrigger>
                    </TabsList>

                    <TabsContent value="registered" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Dịch vụ cố định đã đăng ký</CardTitle>
                                <CardDescription>
                                    Danh sách các dịch vụ cố định hàng tháng đã đăng ký cho phòng {room.TenPhong}
                                </CardDescription>
                                {!currentContract && (
                                    <p className="text-orange-500 text-sm mt-2">
                                        * Phòng này hiện không có hợp đồng đang hoạt động. Bạn không thể quản lý dịch vụ đăng ký.
                                    </p>
                                )}
                            </CardHeader>
                            <CardContent>
                                {fixedServicesRegistered.length > 0 ? (
                                    <Table>
                                        <TableCaption>Danh sách dịch vụ cố định đã đăng ký</TableCaption>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Tên dịch vụ</TableHead>
                                                <TableHead>Đơn vị</TableHead>
                                                <TableHead className="text-right">Giá hiện tại</TableHead>
                                                <TableHead>Loại</TableHead>
                                                <TableHead className="text-right">Thao tác</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {fixedServicesRegistered.map((service) => (
                                                <TableRow key={service.MaDV}>
                                                    <TableCell className="font-medium">{service.TenDV}</TableCell>
                                                    <TableCell>{service.DonViTinh}</TableCell>
                                                    <TableCell className="text-right">
                                                        {service.priceHistories?.[0]?.DonGiaMoi
                                                            ? `${Number(service.priceHistories[0].DonGiaMoi).toLocaleString('vi-VN')} VNĐ`
                                                            : 'N/A'}
                                                    </TableCell>
                                                    <TableCell><Badge variant={getBadgeVariant(service.LoaiDichVu)}>{service.LoaiDichVu}</Badge></TableCell>
                                                    <TableCell className="text-right">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleUnregisterService(service.MaDV)}
                                                            disabled={isSubmitting || !currentContract}
                                                        >
                                                            <X className="h-4 w-4 mr-1" /> Hủy
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                ) : (
                                    <div className="text-center py-8">
                                        <ShoppingBag className="mx-auto h-12 w-12 text-muted-foreground/50" />
                                        <h3 className="mt-4 text-lg font-medium">Chưa có dịch vụ cố định nào</h3>
                                        <p className="mt-2 text-sm text-muted-foreground">Phòng này hiện chưa đăng ký dịch vụ cố định nào.</p>
                                        {currentContract && (
                                            <Button className="mt-4" onClick={() => {
                                                const tabsElement = document.querySelector('[role="tablist"]') as HTMLElement;
                                                if (tabsElement) {
                                                    const registerTab = tabsElement.querySelector('[value="register"]') as HTMLElement;
                                                    if (registerTab) registerTab.click();
                                                }
                                            }}>Đăng ký ngay</Button>
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="register" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Đăng ký dịch vụ cố định</CardTitle>
                                <CardDescription>Đăng ký các dịch vụ cố định hàng tháng cho phòng {room.TenPhong}</CardDescription>
                                {!currentContract && (
                                    <p className="text-orange-500 text-sm mt-2">
                                        * Phòng này hiện không có hợp đồng đang hoạt động. Bạn không thể đăng ký dịch vụ.
                                    </p>
                                )}
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {allAvailableServices
                                        .filter((service) =>
                                            service.LoaiDichVu === "Cố định hàng tháng" &&
                                            service.HoatDong && // Chỉ hiển thị dịch vụ đang hoạt động
                                            !fixedServicesRegistered.some(regService => regService.MaDV === service.MaDV) // Lọc những dịch vụ đã đăng ký
                                        )
                                        .map((service) => (
                                            <div key={service.MaDV} className="flex items-center justify-between p-4 border rounded-lg">
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2">
                                                        <h3 className="font-medium">{service.TenDV}</h3>
                                                        <Badge variant="outline">Cố định</Badge>
                                                    </div>
                                                    <p className="text-sm text-muted-foreground">{service.GhiChu}</p>
                                                    <div className="text-sm">
                                                        <span className="font-medium">
                                                            {service.priceHistories?.[0]?.DonGiaMoi
                                                                ? `${Number(service.priceHistories[0].DonGiaMoi).toLocaleString('vi-VN')} VNĐ`
                                                                : 'Chưa thiết lập'}
                                                        </span>
                                                        <span className="text-muted-foreground">/{service.DonViTinh}</span>
                                                    </div>
                                                </div>
                                                <Button
                                                    variant="default"
                                                    size="sm"
                                                    onClick={() => handleRegisterService(service.MaDV)}
                                                    disabled={isSubmitting || !currentContract}
                                                >
                                                    <Plus className="h-4 w-4 mr-1" /> Đăng ký
                                                </Button>
                                            </div>
                                        ))}
                                    {allAvailableServices.filter(s => s.LoaiDichVu === "Cố định hàng tháng" && s.HoatDong && !fixedServicesRegistered.some(regService => regService.MaDV === s.MaDV)).length === 0 && (
                                        <div className="text-center py-4 text-muted-foreground">
                                            Không có dịch vụ cố định khả dụng để đăng ký.
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="usage" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Ghi nhận sử dụng dịch vụ</CardTitle>
                                <CardDescription>Ghi nhận việc sử dụng dịch vụ theo lượng hoặc sự cố cho phòng {room.TenPhong}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <form onSubmit={handleRecordUsage} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="service">Chọn dịch vụ</Label>
                                        <Select
                                            value={selectedServiceIdForUsage}
                                            onValueChange={(value) => setSelectedServiceIdForUsage(value)}
                                            disabled={usageServicesAvailable.length === 0}
                                        >
                                            <SelectTrigger id="service">
                                                <SelectValue placeholder="Chọn dịch vụ" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {usageServicesAvailable.map((service) => (
                                                    <SelectItem key={service.MaDV} value={service.MaDV.toString()}>
                                                        {service.TenDV} ({service.priceHistories?.[0]?.DonGiaMoi.toLocaleString()} VNĐ/{service.DonViTinh})
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {usageServicesAvailable.length === 0 && (
                                            <p className="text-sm text-muted-foreground">Không có dịch vụ theo lượng/sự cố nào hoạt động.</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="quantity">Số lượng</Label>
                                        <Input
                                            id="quantity"
                                            type="number"
                                            min="1"
                                            value={quantityForUsage}
                                            onChange={(e) => setQuantityForUsage(e.target.value)}
                                            disabled={!selectedServiceIdForUsage}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="usageDate">Ngày sử dụng</Label>
                                        <Input
                                            id="usageDate"
                                            type="date"
                                            value={format(usageDate, 'yyyy-MM-dd')}
                                            onChange={(e) => setUsageDate(new Date(e.target.value))}
                                            max={format(new Date(), 'yyyy-MM-dd')} // Cannot select future dates
                                        />
                                    </div>

                                    {selectedServiceIdForUsage && quantityForUsage && Number(quantityForUsage) > 0 && (() => {
                                        const service = getServiceDetails(Number(selectedServiceIdForUsage));
                                        if (!service) return null;
                                        const price = service.priceHistories?.[0]?.DonGiaMoi || 0;
                                        const total = Number(quantityForUsage) * Number(price);
                                        return (
                                            <div className="rounded-md bg-muted p-4">
                                                <div className="text-sm">
                                                    <div className="flex justify-between">
                                                        <span>Dịch vụ:</span>
                                                        <span className="font-medium">{service.TenDV}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span>Đơn giá:</span>
                                                        <span>{Number(price).toLocaleString('vi-VN')} VNĐ/{service.DonViTinh}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span>Số lượng:</span>
                                                        <span>{quantityForUsage} {service.DonViTinh}</span>
                                                    </div>
                                                    <div className="flex justify-between font-medium mt-2">
                                                        <span>Thành tiền:</span>
                                                        <span>{total.toLocaleString('vi-VN')} VNĐ</span>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })()}

                                    <Button type="submit" disabled={isSubmitting || !selectedServiceIdForUsage || !quantityForUsage || Number(quantityForUsage) <= 0 || !usageDate}>
                                        {isSubmitting ? "Đang xử lý..." : "Ghi nhận sử dụng"}
                                    </Button>
                                </form>

                                <div className="pt-4">
                                    <h3 className="font-medium mb-4">Lịch sử sử dụng dịch vụ</h3>
                                    {serviceUsageHistory.length > 0 ? (
                                        <Table>
                                            <TableCaption>Lịch sử sử dụng dịch vụ</TableCaption>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Ngày</TableHead>
                                                    <TableHead>Dịch vụ</TableHead>
                                                    <TableHead className="text-right">Số lượng</TableHead>
                                                    <TableHead>Đơn vị</TableHead>
                                                    <TableHead className="text-right">Đơn giá</TableHead>
                                                    <TableHead className="text-right">Thành tiền</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {serviceUsageHistory.map((usage) => (
                                                    <TableRow key={usage.MaSuDungDV}>
                                                        <TableCell>{format(new Date(usage.NgaySuDung), 'dd/MM/yyyy')}</TableCell>
                                                        <TableCell>{usage.service?.TenDV || 'N/A'}</TableCell>
                                                        <TableCell className="text-right">{usage.SoLuong}</TableCell>
                                                        <TableCell>{usage.service?.DonViTinh || 'N/A'}</TableCell>
                                                        <TableCell className="text-right">{Number(usage.DonGia).toLocaleString('vi-VN')}</TableCell>
                                                        <TableCell className="text-right font-medium">{Number(usage.ThanhTien).toLocaleString('vi-VN')}</TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    ) : (
                                        <div className="text-center py-4">
                                            <p className="text-sm text-muted-foreground">Chưa có dữ liệu sử dụng dịch vụ.</p>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
     
    );
}