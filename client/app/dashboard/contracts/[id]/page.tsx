'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getContractById } from '@/services/contractService';
import { IContract } from '@/types/contract';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { User, Home, FileText, Calendar, CircleDollarSign, CheckCircle, Tag, Users, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Download } from 'lucide-react';

const DetailItem = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: React.ReactNode }) => (
    <div className="flex items-start space-x-4 py-2">
        <div className="text-muted-foreground mt-1">{icon}</div>
        <div className="flex-1"><p className="text-sm text-muted-foreground">{label}</p><p className="text-md font-semibold">{value}</p></div>
    </div>
);

export default function ContractDetailPage() {
    const params = useParams();
    const router = useRouter();
    const id = Number(params.id);
    const [contract, setContract] = useState<IContract | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            setLoading(true);
            getContractById(id).then(setContract).catch(console.error).finally(() => setLoading(false));
        }
    }, [id]);

    const representative = contract?.occupants.find(o => o.LaNguoiDaiDien)?.tenant;
    const getStatusBadge = (status: IContract['TrangThai']) => {
        const variants = {
            'Có hiệu lực': 'success', 'Mới tạo': 'secondary',
            'Hết hiệu lực': 'outline', 'Đã thanh lý': 'destructive',
        } as const;
        return <Badge variant={variants[status] || 'default'}>{status}</Badge>;
    }

    if (loading) return <ContractDetailSkeleton />;
    if (!contract) return <div className="text-center py-10">Không tìm thấy hợp đồng.</div>;

    return (
        <div className="container mx-auto p-4 space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" onClick={() => router.back()}><ArrowLeft className="h-4 w-4" /></Button>
                <h1 className="text-3xl font-bold">Chi tiết Hợp đồng #{contract.MaHopDong}</h1>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-6">
                    <Card>
                        <CardHeader><CardTitle>Thông tin chính</CardTitle></CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <DetailItem icon={<FileText size={20} />} label="Trạng thái" value={getStatusBadge(contract.TrangThai)} />
                            <DetailItem icon={<Home size={20} />} label="Phòng" value={`${contract.room?.TenPhong || 'N/A'} - ${contract.room?.property?.TenNhaTro || 'N/A'}`} />
                            <DetailItem icon={<User size={20} />} label="Người đại diện" value={representative?.HoTen || 'N/A'} />
                            <DetailItem icon={<Calendar size={20} />} label="Thời hạn" value={`${format(new Date(contract.NgayBatDau), 'dd/MM/yyyy')} - ${format(new Date(contract.NgayKetThuc), 'dd/MM/yyyy')}`} />
                            <DetailItem icon={<CircleDollarSign size={20} />} label="Tiền thuê" value={`${contract.TienThueThoaThuan.toLocaleString()} VNĐ`} />
                            <DetailItem icon={<CircleDollarSign size={20} />} label="Tiền cọc" value={`${contract.TienCoc.toLocaleString()} VNĐ`} />
                            <DetailItem icon={<CheckCircle size={20} />} label="Kỳ thanh toán" value={contract.KyThanhToan} />
                            {contract.FileHopDong && (
    <div className="space-y-2">
      <h4 className="text-sm font-medium text-muted-foreground">Tệp đính kèm</h4>
      <Button variant="outline" asChild>
        <a 
          href={`http://localhost:5000/uploads/${contract.FileHopDong}`} 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          Tải xuống hợp đồng
        </a>
      </Button>
    </div>
  )}
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader><CardTitle><Users className="inline-block mr-2 h-5 w-5"/>Bên thuê</CardTitle></CardHeader>
                        <CardContent>
                           {contract.occupants.map((occ, index) => (
                               <div key={occ.MaNguoiOCung}>
                                   <div className="flex justify-between items-center py-3">
                                        <div>
                                            <p className="font-semibold">{occ.tenant.HoTen}</p>
                                            <p className="text-sm text-muted-foreground">{occ.tenant.SoDienThoai} - {occ.tenant.CCCD}</p>
                                        </div>
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
                        <CardHeader><CardTitle><Tag className="inline-block mr-2 h-5 w-5"/>Dịch vụ cố định</CardTitle></CardHeader>
                        <CardContent>
                            {contract.registeredServices.length > 0 ? contract.registeredServices.map(service => (
                                <div key={service.MaDV} className="flex items-center py-1">{service.TenDV}</div>
                            )) : <p className="text-sm text-muted-foreground">Không có.</p>}
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader><CardTitle>Ghi chú</CardTitle></CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">{contract.GhiChu || 'Không có ghi chú.'}</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

const ContractDetailSkeleton = () => (
    <div className="container mx-auto p-4 space-y-6">
        <Skeleton className="h-10 w-1/3" />
        <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
                <Card><CardHeader><Skeleton className="h-8 w-1/4" /></CardHeader><CardContent className="space-y-4"><Skeleton className="h-6 w-full" /><Skeleton className="h-6 w-full" /><Skeleton className="h-6 w-2/3" /></CardContent></Card>
                <Card><CardHeader><Skeleton className="h-8 w-1/4" /></CardHeader><CardContent className="space-y-4"><Skeleton className="h-6 w-full" /><Skeleton className="h-6 w-full" /></CardContent></Card>
            </div>
            <div className="space-y-6"><Card><CardHeader><Skeleton className="h-8 w-1/2" /></CardHeader><CardContent className="space-y-2"><Skeleton className="h-5 w-full" /><Skeleton className="h-5 w-2/3" /></CardContent></Card></div>
        </div>
    </div>
);