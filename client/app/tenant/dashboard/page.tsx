// file: client/app/tenant/dashboard/page.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Home, FileText, Wallet, Bell, Calendar, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

import { getTenantDashboardSummary } from '@/services/dashboardService';
import { ITenantDashboardSummary } from '@/types/dashboard';

export default function TenantDashboardPage() {
    const { user } = useAuth();
    const [summary, setSummary] = useState<ITenantDashboardSummary | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getTenantDashboardSummary()
            .then(setSummary)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);
    console.log(user);
    const displayName = user?.khachThueProfile?.HoTen || user?.TenDangNhap;

    if (loading) {
        return <DashboardSkeleton />;
    }

    return (
        <div className="space-y-6">
            <div className="space-y-1">
                <h1 className="text-2xl font-bold tracking-tight">Chào mừng trở lại, {displayName}!</h1>
                <p className="text-muted-foreground">Đây là thông tin tổng quan về việc thuê trọ của bạn.</p>
            </div>
            
            <div className="grid gap-6 md:grid-cols-2">
                {/* Card thông tin thuê trọ */}
                <Card className="flex flex-col">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Home /> Thông tin Thuê trọ</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-grow space-y-3">
                        {summary?.activeContract ? (
                            <>
                                <p><strong>Nhà trọ:</strong> {summary.activeContract.room?.property?.TenNhaTro}</p>
                                <p><strong>Phòng:</strong> {summary.activeContract.room?.TenPhong}</p>
                                <p className="flex items-center gap-2 pt-2">
                                    <Calendar className="h-4 w-4" /> 
                                    <span>Hợp đồng hết hạn vào: <strong>{format(new Date(summary.activeContract.NgayKetThuc), 'dd/MM/yyyy')}</strong></span>
                                </p>
                            </>
                        ) : (
                            <p className="text-muted-foreground">Bạn hiện không có hợp đồng nào đang hiệu lực.</p>
                        )}
                    </CardContent>
                    <CardFooter>
                        {summary?.activeContract && (
                            <Button asChild variant="secondary" size="sm">
                                <Link href={`/tenant/contracts/${summary.activeContract.MaHopDong}`}>Xem chi tiết hợp đồng</Link>
                            </Button>
                        )}
                    </CardFooter>
                </Card>

                {/* Card hóa đơn cần thanh toán */}
                <Card className="flex flex-col">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-amber-600"><Wallet /> Hóa đơn sắp tới</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-grow space-y-3">
                         {summary?.nextUnpaidInvoice ? (
                            <>
                                <p className="text-3xl font-bold text-amber-600">
                                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(summary.nextUnpaidInvoice.TongTienPhaiTra)}
                                </p>
                                <p className="flex items-center gap-2 text-muted-foreground">
                                    <AlertTriangle className="h-4 w-4" /> 
                                    <span>Cần thanh toán trước ngày: <strong>{format(new Date(summary.nextUnpaidInvoice.NgayHanThanhToan), 'dd/MM/yyyy')}</strong></span>
                                </p>
                            </>
                        ) : (
                            <p className="text-muted-foreground">Không có hóa đơn nào cần thanh toán.</p>
                        )}
                    </CardContent>
                     <CardFooter>
                        {summary?.nextUnpaidInvoice && (
                            <Button asChild variant="default" size="sm">
                                <Link href={`/tenant/bills/${summary.nextUnpaidInvoice.MaHoaDon}`}>Xem hóa đơn & Thanh toán</Link>
                            </Button>
                        )}
                    </CardFooter>
                </Card>
            </div>

            {/* Card thông báo gần đây */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Bell /> Thông báo gần đây</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {summary?.recentNotifications && summary.recentNotifications.length > 0 ? (
                        summary.recentNotifications.map(item => (
                            <div key={item.MaThongBao} className="flex items-center">
                                <div className="space-y-1">
                                    {/* --- SỬA LỖI Ở ĐÂY --- */}
                                    {/* Bỏ ".notification" và truy cập trực tiếp vào "item.TieuDe" và "item.NoiDung" */}
                                    <p className="text-sm font-bold">{item.TieuDe}</p>
                                    <p className="text-sm text-muted-foreground line-clamp-1">{item.NoiDung}</p>
                                    {/* --- KẾT THÚC PHẦN SỬA --- */}
                                </div>
                                <Button variant="ghost" size="sm" asChild className="ml-auto">
                                    <Link href="/tenant/notifications">Chi tiết</Link>
                                </Button>
                            </div>
                        ))
                    ) : (
                        <p className="text-sm text-muted-foreground">Bạn không có thông báo mới nào.</p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

const DashboardSkeleton = () => (
    <div className="space-y-6">
        <div className="space-y-2">
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-4 w-2/3" />
        </div>
        <div className="grid gap-6 md:grid-cols-2">
            <Skeleton className="h-56 w-full" />
            <Skeleton className="h-56 w-full" />
        </div>
        <Skeleton className="h-48 w-full" />
    </div>
);