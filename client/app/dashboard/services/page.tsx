// clone nhatro/client/app/dashboard/services/page.tsx
'use client';

import { useEffect, useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Zap, Trash2, Pencil } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/components/ui/use-toast';
import { getAllServices, deleteService } from '@/services/serviceService';
import { getMyProperties } from '@/services/propertyService';
import type { IService } from '@/types/service';
import type { Property } from '@/types/property';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

export default function ServicesPage() {
  const [services, setServices] = useState<IService[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // State cho bộ lọc
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [propertyFilter, setPropertyFilter] = useState('all');

  // State cho việc xóa
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedService, setSelectedService] = useState<IService | null>(null);
  const [isAlertOpen, setIsAlertOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Lấy đồng thời danh sách dịch vụ và danh sách nhà trọ
        const [servicesData, propertiesData] = await Promise.all([
          getAllServices(),
          getMyProperties(),
        ]);
        setServices(servicesData || []);
        setProperties(propertiesData || []);
      } catch (err: any) {
        toast({ title: "Lỗi", description: "Không thể tải dữ liệu.", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [toast]);

  // Logic lọc dữ liệu phía client
  const filteredServices = useMemo(() => {
    return services.filter(service => {
      const matchesSearchTerm = service.TenDV.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = typeFilter === 'all' || service.LoaiDichVu === typeFilter;
      const matchesProperty = propertyFilter === 'all' || service.appliedToProperties?.some(p => p.MaNhaTro === Number(propertyFilter));
      
      return matchesSearchTerm && matchesType && matchesProperty;
    });
  }, [services, searchTerm, typeFilter, propertyFilter]);
  
  const handleDelete = async () => {
    if (!selectedService) return;
    setIsDeleting(true);
    try {
        await deleteService(selectedService.MaDV);
        toast({ title: "Thành công", description: `Đã xóa dịch vụ "${selectedService.TenDV}".` });
        setServices(prev => prev.filter(s => s.MaDV !== selectedService.MaDV));
    } catch (error: any) {
        const errorMessage = error.response?.data?.message || "Xóa dịch vụ thất bại.";
        toast({ title: "Lỗi", description: errorMessage, variant: "destructive" });
    } finally {
        setIsDeleting(false);
        setIsAlertOpen(false);
        setSelectedService(null);
    }
  };


  const getBadgeVariant = (type: string) => {
    switch (type) {
      case 'Cố định hàng tháng': return 'default';
      case 'Theo số lượng sử dụng': return 'outline';
      case 'Sự cố/Sửa chữa': return 'secondary';
      default: return 'default';
    }
  };

  return (
    <>
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Quản lý dịch vụ</h1>
          <Button asChild>
            <Link href="/dashboard/services/new">
              <Plus className="mr-2 h-4 w-4" /> Thêm dịch vụ
            </Link>
          </Button>
        </div>

        {/* BỘ LỌC */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input type="search" placeholder="Tìm kiếm theo tên dịch vụ..." className="w-full pl-8" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
          <Select value={propertyFilter} onValueChange={setPropertyFilter}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Lọc theo nhà trọ" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả nhà trọ</SelectItem>
              {properties.map(prop => (
                <SelectItem key={prop.MaNhaTro} value={String(prop.MaNhaTro)}>{prop.TenNhaTro}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Lọc theo loại dịch vụ" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả loại hình</SelectItem>
              <SelectItem value="Cố định hàng tháng">Cố định hàng tháng</SelectItem>
              <SelectItem value="Theo số lượng sử dụng">Theo số lượng sử dụng</SelectItem>
              <SelectItem value="Sự cố/Sửa chữa">Sự cố/Sửa chữa</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* HIỂN THỊ DANH SÁCH */}
        {loading ? (
          <p className="text-muted-foreground">Đang tải dữ liệu...</p>
        ) : filteredServices.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">Không tìm thấy dịch vụ nào khớp với tiêu chí.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredServices.map((service) => (
              <Card key={service.MaDV}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-lg">{service.TenDV}</h3>
                    <Badge variant={getBadgeVariant(service.LoaiDichVu)}>{service.LoaiDichVu}</Badge>
                  </div>

                  <div className="grid gap-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Đơn vị tính:</span>
                      <span className="font-medium">{service.DonViTinh}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Đơn giá mới nhất:</span>
                      <span className="font-medium">
                        {service.priceHistories?.[0]?.DonGiaMoi
                          ? `${Number(service.priceHistories[0].DonGiaMoi).toLocaleString()} VNĐ`
                          : 'Chưa có giá'}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4">
                      <span className="text-sm text-muted-foreground">Áp dụng cho:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                                        {(service.appliedToProperties || []).length > 0 ? (
                                            (service.appliedToProperties || []).map(p => (
                                                <Badge key={p.MaNhaTro} variant="outline">{p.TenNhaTro}</Badge>
                                            ))
                                        ) : (
                                            <Badge variant="secondary">Chưa áp dụng cho nhà trọ nào</Badge>
                                        )}
                                    </div>
                  </div>
                </CardContent>

                <div className="flex border-t">
                  <Button variant="ghost" className="flex-1 rounded-none h-12" asChild>
                    <Link href={`/dashboard/services/${service.MaDV}/edit`}><Pencil className="mr-2 h-4 w-4"/>Sửa</Link>
                  </Button>
                  <div className="w-px bg-border" />
                  <Button variant="ghost" className="flex-1 rounded-none h-12 text-red-600 hover:text-red-700" onClick={() => { setSelectedService(service); setIsAlertOpen(true); }}>
                    <Trash2 className="mr-2 h-4 w-4"/>Xóa
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Hộp thoại xác nhận xóa */}
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Xác nhận xóa dịch vụ?</AlertDialogTitle>
                <AlertDialogDescription>
                    Hành động này không thể hoàn tác. Dịch vụ "{selectedService?.TenDV}" sẽ bị xóa vĩnh viễn. 
                    Lưu ý: Bạn không thể xóa nếu dịch vụ đã được đăng ký hoặc sử dụng.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setSelectedService(null)}>Hủy</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
                    {isDeleting ? 'Đang xóa...' : 'Xác nhận xóa'}
                </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}