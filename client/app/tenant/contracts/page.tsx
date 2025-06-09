// file: client/app/tenant/contracts/page.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { FileText, Building, Home, Calendar } from 'lucide-react';
import { format } from 'date-fns';

import { getContracts } from '@/services/contractService';
import { IContract } from '@/types/contract';
import { cn } from '@/lib/utils';

// Hàm để lấy variant màu cho Badge trạng thái
const getStatusBadgeVariant = (status: IContract['TrangThai']) => {
    const variants = {
        'Có hiệu lực': 'success',
        'Mới tạo': 'secondary',
        'Hết hiệu lực': 'outline',
        'Đã thanh lý': 'destructive',
    } as const;
    return variants[status] || 'default';
};

export default function TenantContractsPage() {
  const [contracts, setContracts] = useState<IContract[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getContracts()
      .then(setContracts)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-1/3" />
        <div className="grid gap-4 md:grid-cols-2">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-48 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Hợp đồng của tôi</h1>
      {contracts.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
          {contracts.map((contract) => (
            <Link href={`/tenant/contracts/${contract.MaHopDong}`} key={contract.MaHopDong} className="block">
              <Card className="hover:shadow-lg transition-shadow duration-200">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Hợp đồng #{contract.MaHopDong}
                      </CardTitle>
                      <CardDescription>Nhà trọ: {contract.room?.property?.TenNhaTro || 'N/A'}</CardDescription>
                    </div>
                    <Badge variant={getStatusBadgeVariant(contract.TrangThai)}>
                        {contract.TrangThai}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Home className="h-4 w-4" />
                    <span>Phòng: <span className="font-semibold text-foreground">{contract.room.TenPhong}</span></span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Thời hạn: <span className="font-semibold text-foreground">{format(new Date(contract.NgayBatDau), 'dd/MM/yyyy')} - {format(new Date(contract.NgayKetThuc), 'dd/MM/yyyy')}</span></span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 border-2 border-dashed rounded-lg">
            <p className="text-muted-foreground">Bạn chưa có hợp đồng nào.</p>
        </div>
      )}
    </div>
  );
}