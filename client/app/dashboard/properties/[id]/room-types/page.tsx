// clone nhatro/client/app/dashboard/properties/[id]/room-types/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { MoreHorizontal, PlusCircle, ArrowLeft, Pencil, Trash2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { getRoomTypesByProperty, deleteRoomType } from '@/services/roomTypeService';
import { getPropertyById } from '@/services/propertyService';
import type { RoomType } from '@/types/roomType';
import type { Property } from '@/types/property';
import { Skeleton } from '@/components/ui/skeleton';

export default function RoomTypesPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();

  const propertyId = Number(params.id);
  const [property, setProperty] = useState<Property | null>(null);
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedRoomType, setSelectedRoomType] = useState<RoomType | null>(null);
  const [isAlertOpen, setIsAlertOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [propData, typesData] = await Promise.all([
          getPropertyById(propertyId),
          getRoomTypesByProperty(propertyId),
        ]);
        setProperty(propData);
        setRoomTypes(typesData);
      } catch (error: any) {
        toast({ title: 'Lỗi tải dữ liệu', description: error.message, variant: 'destructive' });
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [propertyId, toast]);

  const handleDelete = async () => {
    if (!selectedRoomType) return;
    setIsDeleting(true);
    try {
      await deleteRoomType(selectedRoomType.MaLoaiPhong);
      toast({ title: "Thành công", description: `Đã xóa loại phòng "${selectedRoomType.TenLoai}".` });
      setRoomTypes(prev => prev.filter(rt => rt.MaLoaiPhong !== selectedRoomType.MaLoaiPhong));
    } catch (error: any) {
        const errorMessage = error.response?.data?.message || error.message;
        toast({ 
          title: "Lỗi", 
          description: errorMessage, // Sử dụng errorMessage đã được trích xuất
          variant: 'destructive' 
        });
    } finally {
      setIsDeleting(false);
      setIsAlertOpen(false);
      setSelectedRoomType(null);
    }
  };

  if (isLoading) {
    return <Skeleton className="w-full h-[400px]" />;
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href={`/dashboard/properties/${propertyId}`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
              <h1 className="text-2xl font-bold">Quản lý Loại Phòng</h1>
              <p className="text-muted-foreground">Nhà trọ: {property?.TenNhaTro}</p>
          </div>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
              <div>
                  <CardTitle>Danh sách loại phòng</CardTitle>
                  <CardDescription>Thêm, sửa hoặc xóa các loại phòng cho nhà trọ này.</CardDescription>
              </div>
              <Button asChild>
                  <Link href={`/dashboard/properties/${propertyId}/room-types/new`}>
                      <PlusCircle className="mr-2 h-4 w-4" /> Thêm mới
                  </Link>
              </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tên loại phòng</TableHead>
                  <TableHead>Giá đề xuất</TableHead>
                  <TableHead className="hidden md:table-cell">Diện tích (m²)</TableHead>
                  <TableHead className="hidden md:table-cell">Số người</TableHead>
                  <TableHead className="text-right">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {roomTypes.length > 0 ? (
                  roomTypes.map((type) => (
                    <TableRow key={type.MaLoaiPhong}>
                      <TableCell className="font-medium">{type.TenLoai}</TableCell>
                      <TableCell>{type.Gia.toLocaleString('vi-VN')} VNĐ</TableCell>
                      <TableCell className="hidden md:table-cell">{type.DienTich || 'N/A'}</TableCell>
                      <TableCell className="hidden md:table-cell">{type.SoNguoiToiDa || 'N/A'}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Mở menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/dashboard/properties/${propertyId}/room-types/${type.MaLoaiPhong}/edit`}>
                                <Pencil className="mr-2 h-4 w-4" />
                                <span>Chỉnh sửa</span>
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => {
                                setSelectedRoomType(type);
                                setIsAlertOpen(true);
                              }}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              <span>Xóa</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      Chưa có loại phòng nào.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bạn có chắc chắn muốn xóa?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này không thể hoàn tác. Loại phòng "{selectedRoomType?.TenLoai}" sẽ bị xóa vĩnh viễn.
              Lưu ý: Bạn không thể xóa nếu có phòng đang sử dụng loại này.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedRoomType(null)}>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? 'Đang xóa...' : 'Tiếp tục xóa'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}