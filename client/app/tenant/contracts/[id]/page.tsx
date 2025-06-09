'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getContractById } from '@/services/contractService';
import { IContract } from '@/types/contract';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { User, Home, FileText, Calendar, CircleDollarSign, CheckCircle, Tag, Users, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

const DetailItem = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: React.ReactNode }) => (
    <div className="flex items-start space-x-4 py-2">
        <div className="text-muted-foreground mt-1">{icon}</div>
        <div className="flex-1"><p className="text-sm text-muted-foreground">{label}</p><p className="text-md font-semibold">{value}</p></div>
    </div>
);

export default function TenantContractDetailPage() {
    const params = useParams();
    const router = useRouter();
    const id = Number(params.id);
    const [contract, setContract] = useState<IContract | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            setLoading(true);
            getContractById(id)
                .then(setContract)
                .catch(err => {
                    console.error(err);
                    // Có thể thêm toast báo lỗi ở đây
                    router.push('/tenant/contracts'); // Nếu lỗi, quay về trang danh sách
                })
                .finally(() => setLoading(false));
        }
    }, [id, router]);

    const getStatusBadgeVariant = (status: IContract['TrangThai']) => {
        const variants = {
            'Có hiệu lực': 'success', 'Mới tạo': 'secondary',
            'Hết hiệu lực': 'outline', 'Đã thanh lý': 'destructive',
        } as const;
        return variants[status] || 'default';
    }

    if (loading) {
        return <Skeleton className="h-[500px] w-full" />;
    }
    if (!contract) {
        return <div className="text-center py-10">Không tìm thấy hợp đồng hoặc bạn không có quyền xem.</div>;
    }

    const representative = contract.occupants.find(o => o.LaNguoiDaiDien)?.tenant;

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" onClick={() => router.back()}><ArrowLeft className="h-4 w-4" /></Button>
                <h1 className="text-2xl font-bold">Chi tiết Hợp đồng #{contract.MaHopDong}</h1>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-6">
                    <Card>
                        <CardHeader><CardTitle>Thông tin chính</CardTitle></CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <DetailItem icon={<FileText size={20} />} label="Trạng thái" value={<Badge variant={getStatusBadgeVariant(contract.TrangThai)}>{contract.TrangThai}</Badge>} />
                            <DetailItem icon={<Home size={20} />} label="Phòng" value={`${contract.room.TenPhong} - ${contract.room.property?.TenNhaTro}`} />
                            <DetailItem icon={<User size={20} />} label="Người đại diện" value={representative?.HoTen || 'N/A'} />
                            <DetailItem icon={<Calendar size={20} />} label="Thời hạn" value={`${format(new Date(contract.NgayBatDau), 'dd/MM/yyyy')} - ${format(new Date(contract.NgayKetThuc), 'dd/MM/yyyy')}`} />
                            <DetailItem icon={<CircleDollarSign size={20} />} label="Tiền thuê" value={`${contract.TienThueThoaThuan.toLocaleString()} VNĐ`} />
                            <DetailItem icon={<CircleDollarSign size={20} />} label="Tiền cọc" value={`${contract.TienCoc.toLocaleString()} VNĐ`} />
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader><CardTitle><Users className="inline-block mr-2 h-5 w-5"/>Những người ở cùng</CardTitle></CardHeader>
                        <CardContent>
                           {contract.occupants.map((occ, index) => (
                               <div key={occ.MaNguoiOCung}>
                                   <div className="flex justify-between items-center py-3">
                                        <p className="font-semibold">{occ.tenant.HoTen}</p>
                                       {occ.LaNguoiDaiDien && <Badge>Người đại diện</Badge>}
                                   </div>
                                   {index < contract.occupants.length - 1 && <Separator />}
                               </div>
                           ))}
                        </CardContent>
                    </Card>
                </div>
                <div className="space-y-6">
                    <Card>
                        <CardHeader><CardTitle><Tag className="inline-block mr-2 h-5 w-5"/>Dịch vụ đã đăng ký</CardTitle></CardHeader>
                        <CardContent>
                            {contract.registeredServices.length > 0 ? contract.registeredServices.map(service => (
                                <div key={service.MaDV} className="flex items-center py-1">{service.TenDV}</div>
                            )) : <p className="text-sm text-muted-foreground">Không có.</p>}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}