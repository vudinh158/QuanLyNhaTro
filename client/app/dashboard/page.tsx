// file: client/app/dashboard/page.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Building2, Home, Users, Wallet, FileWarning, Hourglass } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { differenceInDays, format } from 'date-fns';

import { getLandlordDashboardSummary } from '@/services/dashboardService';
import { IDashboardSummary } from '@/types/dashboard';
import { IContract } from '@/types/contract';
import { IInvoice } from '@/types/invoice';
import { useToast } from '@/components/ui/use-toast';

// Component con để hiển thị một thẻ thống kê
const StatCard = ({ title, value, icon }: { title: string, value: string | number, icon: React.ReactNode }) => (
    <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            {icon}
        </CardHeader>
        <CardContent>
            <div className="text-2xl font-bold">{value}</div>
        </CardContent>
    </Card>
);

// Component con để hiển thị biểu đồ tròn
const RoomOccupancyChart = ({ data }: { data: IDashboardSummary['roomSummary'] }) => {
    const chartData = [
        { name: 'Đang thuê', value: data.occupied },
        { name: 'Còn trống', value: data.vacant },
        { name: 'Đặt cọc', value: data.deposit },
    ];
    const COLORS = ['#16a34a', '#f97316', '#3b82f6']; // Xanh lá, Cam, Xanh dương

    if (data.total === 0) {
        return <div className="flex h-[250px] items-center justify-center"><p className="text-sm text-muted-foreground">Chưa có phòng nào.</p></div>;
    }

    return (
        <ResponsiveContainer width="100%" height={250}>
            <PieChart>
                <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                    {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Pie>
                <Tooltip formatter={(value: number) => `${value} phòng`} />
                <Legend />
            </PieChart>
        </ResponsiveContainer>
    );
};

// Component con để hiển thị danh sách các mục cần chú ý
const ActionableList = ({ title, items, emptyText, renderItem, icon }: { title: string, items: any[], emptyText: string, renderItem: (item: any) => React.ReactNode, icon: React.ReactNode }) => (
    <Card>
        <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
                {icon} {title}
            </CardTitle>
        </CardHeader>
        <CardContent>
            {(items || []).length > 0 ? (
                <div className="space-y-4">
                    {items.map(renderItem)}
                </div>
            ) : (
                <p className="text-sm text-muted-foreground text-center py-4">{emptyText}</p>
            )}
        </CardContent>
    </Card>
);


export default function DashboardPage() {
    const [summary, setSummary] = useState<IDashboardSummary | null>(null);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        getLandlordDashboardSummary()
            .then(setSummary)
            .catch(err => {
                console.error("Failed to load dashboard summary:", err);
                toast({ title: "Lỗi", description: "Không thể tải dữ liệu tổng quan.", variant: "destructive" });
            })
            .finally(() => setLoading(false));
    }, [toast]);

    if (loading || !summary) {
        return <DashboardSkeleton />;
    }

    const formatCurrency = (value: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);

    const occupancyRate = summary.roomSummary.total > 0 
        ? ((summary.roomSummary.occupied / summary.roomSummary.total) * 100).toFixed(0) + '%' 
        : '0%';

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Tổng quan</h1>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard title="Số nhà trọ" value={summary.propertyCount} icon={<Building2 className="h-5 w-5 text-muted-foreground" />} />
                <StatCard title="Số phòng" value={summary.roomSummary.total} icon={<Home className="h-5 w-5 text-muted-foreground" />} />
                <StatCard title="Khách đang thuê" value={summary.tenantCount} icon={<Users className="h-5 w-5 text-muted-foreground" />} />
                <StatCard title="Tỉ lệ lấp đầy" value={occupancyRate} icon={<Users className="h-5 w-5 text-muted-foreground" />} />
            </div>

            <div className="grid gap-6 lg:grid-cols-5">
                <Card className="lg:col-span-3">
                    <CardHeader>
                        <CardTitle>Tình trạng phòng</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <RoomOccupancyChart data={summary.roomSummary} />
                    </CardContent>
                </Card>
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Doanh thu tháng này</CardTitle>
                        <CardDescription>{`Tổng cộng: ${formatCurrency(summary.monthlyRevenue.total)}`}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center">
                            <div className="h-2 w-2 rounded-full bg-green-500 mr-2" />
                            <span className="text-sm text-muted-foreground">Đã thanh toán</span>
                            <span className="ml-auto font-semibold">{formatCurrency(summary.monthlyRevenue.paid)}</span>
                        </div>
                        <div className="flex items-center">
                            <div className="h-2 w-2 rounded-full bg-red-500 mr-2" />
                            <span className="text-sm text-muted-foreground">Chưa thanh toán</span>
                            <span className="ml-auto font-semibold">{formatCurrency(summary.monthlyRevenue.unpaid)}</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                <ActionableList
                    title="Hợp đồng sắp hết hạn"
                    icon={<Hourglass className="h-5 w-5 text-orange-500" />}
                    items={summary.expiringContracts}
                    emptyText="Không có hợp đồng nào sắp hết hạn."
                    renderItem={(contract: IContract) => {
                        const daysRemaining = differenceInDays(new Date(contract.NgayKetThuc), new Date());
                        const tenantName = contract.occupants?.find(o => o.LaNguoiDaiDien)?.tenant.HoTen || 'N/A';
                        return (
                            <div key={contract.MaHopDong} className="flex items-center">
                                <div className="space-y-1">
                                    <p className="text-sm font-medium leading-none">P. {contract.room?.TenPhong} - {tenantName}</p>
                                    <p className="text-sm text-muted-foreground">Hết hạn trong <span className="font-bold text-orange-500">{daysRemaining} ngày</span> - ({format(new Date(contract.NgayKetThuc), 'dd/MM/yyyy')})</p>
                                </div>
                                <Button variant="secondary" size="sm" asChild className="ml-auto">
                                    <Link href={`/dashboard/contracts/${contract.MaHopDong}`}>Chi tiết</Link>
                                </Button>
                            </div>
                        );
                    }}
                />
                <ActionableList
                    title="Hóa đơn cần thu"
                    icon={<FileWarning className="h-5 w-5 text-red-500" />}
                    items={summary.unpaidInvoices}
                    emptyText="Tuyệt vời! Không có hóa đơn nào chưa thanh toán."
                    renderItem={(invoice: IInvoice) => {
                        const tenantName = invoice.contract?.occupants?.find(o => o.LaNguoiDaiDien)?.tenant.HoTen || 'N/A';
                        return (
                            <div key={invoice.MaHoaDon} className="flex items-center">
                                <div className="space-y-1">
                                    <p className="text-sm font-medium leading-none">P. {invoice.contract?.room?.TenPhong} - {tenantName}</p>
                                    <p className="text-sm text-muted-foreground">
                                        <span className="font-bold text-red-500">{formatCurrency(invoice.TongTienPhaiTra)}</span>
                                        {' / Hạn chót: '}
                                        <span className="font-semibold">{format(new Date(invoice.NgayHanThanhToan), 'dd/MM/yyyy')}</span>
                                    </p>
                                </div>
                                <Button variant="secondary" size="sm" asChild className="ml-auto">
                                    <Link href={`/dashboard/bills/${invoice.MaHoaDon}`}>Chi tiết</Link>
                                </Button>
                            </div>
                        );
                    }}
                />
            </div>
        </div>
    );
}

const DashboardSkeleton = () => (
    <div className="space-y-6">
        <Skeleton className="h-9 w-48" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Skeleton className="h-28" /><Skeleton className="h-28" /><Skeleton className="h-28" /><Skeleton className="h-28" />
        </div>
        <div className="grid gap-6 lg:grid-cols-5">
            <Skeleton className="lg:col-span-3 h-72" /><Skeleton className="lg:col-span-2 h-72" />
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
            <Skeleton className="h-60" /><Skeleton className="h-60" />
        </div>
    </div>
);