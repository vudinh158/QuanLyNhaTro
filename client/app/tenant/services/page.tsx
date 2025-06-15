// file: clone nhatro/client/app/tenant/services/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';
import { getCurrentContract } from '@/services/contractService';
import { getTenantServiceUsages } from '@/services/serviceusageService'; // Sẽ tạo hàm này
import { IContract } from '@/types/contract';
import { IServiceUsage } from '@/types/serviceUsage'; // Import service usage type
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { format } from 'date-fns';
import { AlertCircle, FileText, Hammer, BookOpen } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function TenantServicesPage() {
    const { toast } = useToast();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [contract, setContract] = useState<IContract | null>(null);
    const [serviceUsages, setServiceUsages] = useState<IServiceUsage[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                const currentContract = await getCurrentContract(); // Lấy hợp đồng hiện tại
                setContract(currentContract);

                if (currentContract) {
                    // Lấy các dịch vụ cố định (đã đăng ký trong hợp đồng)
                    // Chúng ta đã có registeredServices trong contract object từ getContractById/getCurrentContract
                    // Vì vậy không cần gọi API riêng nếu contract đã được include đầy đủ.

                    // Lấy lịch sử sử dụng dịch vụ (nếu có)
                    // Cần tạo hàm này trong serviceusageService.ts
                    const usages = await getTenantServiceUsages(); // Gọi service mới
                    setServiceUsages(usages);
                } else {
                    toast({
                        title: "Thông báo",
                        description: "Bạn chưa có hợp đồng thuê phòng đang hoạt động.",
                        variant: "default",
                    });
                }
            } catch (err: any) {
                console.error("Lỗi khi tải dữ liệu trang dịch vụ:", err);
                setError(err.message || "Không thể tải dữ liệu dịch vụ. Vui lòng thử lại.");
                toast({
                    title: "Lỗi",
                    description: err.message || "Không thể tải dữ liệu từ server.",
                    variant: "destructive",
                });
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [toast, router]);

    if (loading) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-96 w-full" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-8">
                <AlertCircle className="mx-auto h-12 w-12 text-red-500/50" />
                <h3 className="mt-4 text-lg font-medium">Lỗi</h3>
                <p className="mt-2 text-sm text-muted-foreground">{error}</p>
                <Button className="mt-4" onClick={() => router.refresh()}>Thử lại</Button>
            </div>
        );
    }

    if (!contract) {
        return (
            <div className="text-center py-8">
                <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground/50" />
                <h3 className="mt-4 text-lg font-medium">Không tìm thấy hợp đồng đang hoạt động</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                    Bạn cần có một hợp đồng thuê phòng đang có hiệu lực để xem thông tin dịch vụ.
                </p>
                <Button className="mt-4" asChild>
                    <Link href="/tenant/contracts">Xem hợp đồng của tôi</Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <h1 className="text-2xl font-bold">Dịch vụ phòng {contract.room?.TenPhong || 'N/A'}</h1>

            <Card>
                <CardHeader>
                    <CardTitle>Dịch vụ cố định đã đăng ký</CardTitle>
                    <CardDescription>Các dịch vụ được bao gồm trong hợp đồng của bạn.</CardDescription>
                </CardHeader>
                <CardContent>
                    {contract.registeredServices && contract.registeredServices.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Tên dịch vụ</TableHead>
                                    <TableHead>Đơn vị tính</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {contract.registeredServices.map((service) => (
                                    <TableRow key={service.MaDV}>
                                        <TableCell>{service.TenDV}</TableCell>
                                        <TableCell>{service.DonViTinh || 'N/A'}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <div className="text-center py-4 text-muted-foreground">Không có dịch vụ cố định nào được đăng ký trong hợp đồng này.</div>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Lịch sử sử dụng dịch vụ khác</CardTitle>
                    <CardDescription>Các dịch vụ bạn đã sử dụng thêm ngoài hợp đồng.</CardDescription>
                </CardHeader>
                <CardContent>
                    {serviceUsages && serviceUsages.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Dịch vụ</TableHead>
                                    <TableHead>Ngày sử dụng</TableHead>
                                    <TableHead>Số lượng</TableHead>
                                    <TableHead>Thành tiền</TableHead>
                                    <TableHead>Ghi chú</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {serviceUsages.map((usage) => (
                                    <TableRow key={usage.MaSuDungDV}>
                                        <TableCell>{usage.service?.TenDV || 'N/A'}</TableCell>
                                        <TableCell>{format(new Date(usage.NgaySuDung), 'dd/MM/yyyy')}</TableCell>
                                        <TableCell>{usage.SoLuong}</TableCell>
                                        <TableCell>{usage.ThanhTien ? Number(usage.ThanhTien).toLocaleString("vi-VN") + ' VNĐ' : 'N/A'}</TableCell>
                                        <TableCell>{usage.GhiChu || 'Không có'}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <div className="text-center py-4 text-muted-foreground">Chưa có dịch vụ sử dụng nào được ghi nhận cho phòng này.</div>
                    )}
                </CardContent>
            </Card>

            <div className="flex gap-2">
                <Button variant="outline" className="flex-1" asChild>
                    <Link href={`/tenant/bills`}>
                        <FileText className="mr-2 h-4 w-4" />
                        Xem hóa đơn
                    </Link>
                </Button>
                <Button variant="outline" className="flex-1" asChild>
                    <Link href={`/tenant/utilities`}>
                        <Hammer className="mr-2 h-4 w-4" />
                        Xem điện nước
                    </Link>
                </Button>
                 <Button variant="outline" className="flex-1" asChild>
                    <Link href={`/tenant/contracts/${contract.MaHopDong}`}>
                        <FileText className="mr-2 h-4 w-4" />
                        Xem hợp đồng
                    </Link>
                </Button>
            </div>
        </div>
    );
}