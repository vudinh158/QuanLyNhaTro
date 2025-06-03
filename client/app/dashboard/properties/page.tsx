// apps/client-nextjs/app/(dashboard)/properties/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Plus, Search, Home, Edit, Trash2, Eye } from "lucide-react"; // Thêm icon
import { getMyProperties, deleteProperty } from "@/services/propertyService";
import type { Property } from "@/types/property";
import { useAuth } from "@/contexts/AuthContext";
import { Input } from "@/components/ui/input"; // Import Input
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"; // Import AlertDialog

export default function PropertiesPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(""); // State cho tìm kiếm

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login"); // Chuyển hướng nếu chưa đăng nhập
    } else if (user && user.MaVaiTro === 1 /* Chủ trọ */) { // Giả sử MaVaiTro 1 là Chủ trọ
      fetchProperties();
    } else if (!authLoading && user && user.MaVaiTro !== 1) {
      toast({ title: "Lỗi", description: "Bạn không có quyền truy cập trang này.", variant: "destructive" });
      router.push("/"); // Hoặc trang dashboard của vai trò khác
    }
  }, [user, authLoading, router, toast]);

  const fetchProperties = async () => {
    setIsLoading(true);
    try {
      const data = await getMyProperties();
      setProperties(data);
    } catch (error: any) {
      toast({
        title: "Lỗi tải danh sách nhà trọ",
        description: error.message || "Không thể tải dữ liệu. Vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteProperty = async (propertyId: number) => {
    try {
      await deleteProperty(propertyId);
      toast({
        title: "Thành công",
        description: "Đã xóa nhà trọ thành công.",
      });
      fetchProperties(); // Tải lại danh sách
    } catch (error: any) {
      toast({
        title: "Lỗi xóa nhà trọ",
        description: error.message || "Không thể xóa. Vui lòng thử lại.",
        variant: "destructive",
      });
    }
  };

  const filteredProperties = properties.filter(prop =>
    prop.TenNhaTro.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prop.DiaChi.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading || authLoading) {
    return <div>Đang tải dữ liệu nhà trọ...</div>; // Hoặc dùng Skeleton
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Quản lý nhà trọ</h1>
        <Button asChild>
          <Link href="/dashboard/properties/new">
            <Plus className="mr-2 h-4 w-4" />
            Thêm nhà trọ
          </Link>
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-2.5 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Tìm kiếm theo tên hoặc địa chỉ nhà trọ..."
          className="w-full pl-8"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {filteredProperties.length === 0 && !isLoading ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-muted-foreground">
              <Home className="mx-auto h-12 w-12" />
              <p className="mt-4">Bạn chưa có nhà trọ nào.</p>
              <Button asChild className="mt-4">
                 <Link href="/dashboard/properties/new">Thêm nhà trọ ngay</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredProperties.map((property) => (
            <Card key={property.MaNhaTro} className="flex flex-col">
              <CardHeader>
                <CardTitle className="truncate">{property.TenNhaTro}</CardTitle>
                <CardDescription className="truncate">{property.DiaChi}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {property.GhiChu || "Không có ghi chú."}
                </p>
                {/* Có thể thêm thông tin số phòng ở đây nếu API trả về */}
              </CardContent>
              <CardFooter className="flex justify-end gap-2 border-t pt-4">
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/dashboard/properties/${property.MaNhaTro}`}>
                    <Eye className="mr-1 h-4 w-4" /> Chi tiết
                  </Link>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/dashboard/properties/${property.MaNhaTro}/edit`}>
                    <Edit className="mr-1 h-4 w-4" /> Sửa
                  </Link>
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm">
                      <Trash2 className="mr-1 h-4 w-4" /> Xóa
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Xác nhận xóa nhà trọ?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Hành động này không thể hoàn tác. Tất cả dữ liệu liên quan đến nhà trọ này (phòng, hợp đồng, hóa đơn...) cũng có thể bị ảnh hưởng hoặc yêu cầu xử lý riêng. Bạn có chắc chắn muốn xóa nhà trọ "{property.TenNhaTro}"?
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Hủy</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDeleteProperty(property.MaNhaTro)}>
                        Xóa
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}