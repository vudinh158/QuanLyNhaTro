// apps/client-nextjs/app/(dashboard)/tenants/page.tsx
"use client";

import { useEffect, useState, useMemo } from "react";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { Plus, Search, Edit, Trash2, Eye, Users, Filter, FilePlus2 } from "lucide-react";
import { getAllTenantsForLandlord, deleteTenant } from "@/services/tenantService";
import type { Tenant } from "@/types/tenant";
import { useAuth } from "@/contexts/AuthContext";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";

export default function TenantsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>(""); // 'Đang thuê', 'Đã rời đi', 'Tiềm năng'

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/login");
      return;
    }
    if (user.role?.TenVaiTro === 'Chủ trọ') {
      fetchTenants();
    } else {
      toast({ title: "Lỗi", description: "Bạn không có quyền truy cập trang này.", variant: "destructive" });
      router.push("/");
    }
  }, [user, authLoading, router, toast, statusFilter]); // Thêm statusFilter để fetch lại khi filter thay đổi

  const fetchTenants = async () => {
    setIsLoading(true);
    try {
      const queryParams: { search?: string, status?: string } = {};
      if (searchTerm) queryParams.search = searchTerm; // Backend cần hỗ trợ search param
      if (statusFilter) queryParams.status = statusFilter;

      const data = await getAllTenantsForLandlord(queryParams);
      setTenants(data);
    } catch (error: any) {
      toast({
        title: "Lỗi tải danh sách khách thuê",
        description: error.message || "Không thể tải dữ liệu.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Gọi lại fetchTenants khi searchTerm thay đổi (sau một khoảng trễ để tránh gọi API liên tục)
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (user && user.role?.TenVaiTro === 'Chủ trọ') {
        fetchTenants();
      }
    }, 500); // Delay 500ms
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, user]); // Chỉ phụ thuộc searchTerm và user

  const handleDeleteTenant = async (tenantId: number) => {
    try {
      await deleteTenant(tenantId);
      toast({
        title: "Thành công",
        description: "Đã xóa khách thuê thành công.",
      });
      fetchTenants();
    } catch (error: any) {
      toast({
        title: "Lỗi xóa khách thuê",
        description: error.message || "Không thể xóa. Vui lòng thử lại.",
        variant: "destructive",
      });
    }
  };

  const getAvatarFallback = (name: string) => {
    if (!name) return "KT";
    const parts = name.split(" ");
    if (parts.length > 1) {
      return parts[0][0].toUpperCase() + parts[parts.length - 1][0].toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  if (authLoading || isLoading) {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-10 w-36" />
            </div>
            <div className="flex gap-4">
                <Skeleton className="h-10 w-64" />
                <Skeleton className="h-10 w-48" />
            </div>
            <Skeleton className="h-96 w-full" /> {/* Skeleton cho bảng */}
        </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Quản lý khách thuê</h1>
        <Button asChild>
          <Link href="/dashboard/tenants/new">
            <Plus className="mr-2 h-4 w-4" />
            Thêm khách thuê
          </Link>
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-grow">
          <Label htmlFor="tenantSearch">Tìm kiếm khách thuê</Label>
          <Search className="absolute left-2.5 top-10 h-4 w-4 text-muted-foreground" />
          <Input
            id="tenantSearch"
            type="search"
            placeholder="Tìm theo tên, SĐT, Email, CCCD..."
            className="w-full pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex-none w-full md:w-48">
            <Label htmlFor="statusFilter">Trạng thái</Label>
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value === "all" ? "" : value)}>
                <SelectTrigger id="statusFilter">
                    <SelectValue placeholder="Tất cả trạng thái" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">Tất cả trạng thái</SelectItem>
                    <SelectItem value="Đang thuê">Đang thuê</SelectItem>
                    <SelectItem value="Đã rời đi">Đã rời đi</SelectItem>
                </SelectContent>
            </Select>
        </div>
      </div>

      {tenants.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-muted-foreground py-12">
              <Users className="mx-auto h-12 w-12 mb-4" />
              <p className="text-lg font-medium">Không có khách thuê nào</p>
              <p>Hiện tại bạn chưa quản lý khách thuê nào hoặc không tìm thấy kết quả phù hợp.</p>
              <Button asChild className="mt-6">
                 <Link href="/dashboard/tenants/new">Thêm khách thuê ngay</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Avatar</TableHead>
                <TableHead>Họ Tên</TableHead>
                <TableHead>Liên hệ</TableHead>
                <TableHead>Phòng đang ở</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-right">Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tenants.map((tenant) => (
                <TableRow key={tenant.MaKhachThue}>
                  <TableCell>
                    <Avatar>
                      {/* <AvatarImage src={tenant.avatarUrl || undefined} alt={tenant.HoTen} /> */}
                      <AvatarFallback>{getAvatarFallback(tenant.HoTen)}</AvatarFallback>
                    </Avatar>
                  </TableCell>
                  <TableCell className="font-medium">{tenant.HoTen}</TableCell>
                  <TableCell>
                    <div>{tenant.SoDienThoai}</div>
                    <div className="text-xs text-muted-foreground">{tenant.Email || "Chưa có email"}</div>
                  </TableCell>
                  <TableCell>
                    {tenant.currentRoom ? `${tenant.currentRoom.TenPhong} - ${tenant.currentRoom.property?.TenNhaTro}` : "Chưa thuê phòng"}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        tenant.TrangThai === 'Đang thuê' ? 'default' :
                        tenant.TrangThai === 'Đã rời đi' ? 'destructive' :
                        'secondary'
                      }
                    >
                      {tenant.TrangThai}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right space-x-1">
                    <Button variant="ghost" size="icon" asChild title="Tạo hợp đồng"
                        disabled={tenant.TrangThai === 'Đã rời đi'} // Không cho tạo HĐ nếu đã rời đi
                    >
                      <Link href={`/dashboard/contracts/new?tenantId=${tenant.MaKhachThue}`}>
                        <FilePlus2 className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button variant="ghost" size="icon" asChild title="Chi tiết">
                      <Link href={`/dashboard/tenants/${tenant.MaKhachThue}`}>
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button variant="ghost" size="icon" asChild title="Sửa">
                      <Link href={`/dashboard/tenants/${tenant.MaKhachThue}/edit`}>
                        <Edit className="h-4 w-4" />
                      </Link>
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" title="Xóa" className="text-destructive hover:text-destructive"
                            disabled={tenant.TrangThai === 'Đang thuê'} // Không cho xóa nếu đang thuê
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Xác nhận xóa khách thuê?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Hành động này không thể hoàn tác. Khách thuê "{tenant.HoTen}" sẽ bị xóa.
                            Nếu khách thuê có tài khoản, tài khoản đó có thể được vô hiệu hóa.
                            Các hợp đồng cũ của khách thuê này sẽ vẫn còn.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Hủy</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-destructive hover:bg-destructive/90"
                            onClick={() => handleDeleteTenant(tenant.MaKhachThue)}
                          >
                            Xóa
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}