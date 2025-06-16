// Thay thế toàn bộ nội dung file: clone nhatro/client/app/dashboard/rooms/page.tsx

"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { Plus, Search, Edit, Trash2, Eye, Home as HomeIcon } from "lucide-react";
import { getAllRoomsForLandlord, deleteRoom } from "@/services/roomService"; 
import type { Room } from "@/types/room";
import { useAuth } from "@/contexts/AuthContext";
import { Input } from "@/components/ui/input";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";

export default function AllRoomsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [allRooms, setAllRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/login");
      return;
    }
    if (user.role?.TenVaiTro === 'Chủ trọ') {
      fetchRooms();
    }
  }, [user, authLoading, router]);

  const fetchRooms = async () => {
    setIsLoading(true);
    try {
      const data = await getAllRoomsForLandlord();
      setAllRooms(data);
    } catch (error: any) {
      toast({
        title: "Lỗi tải danh sách phòng",
        description: error.message || "Vui lòng thử lại sau.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteRoom = async (roomId: number) => {
    try {
      await deleteRoom(roomId);
      toast({
        title: "Thành công",
        description: "Đã xóa phòng thành công.",
      });
      fetchRooms(); 
    } catch (error: any) {
      toast({
        title: "Lỗi xóa phòng",
        description: error.message || "Không thể xóa. Vui lòng thử lại.",
        variant: "destructive",
      });
    }
  };

  const filteredRooms = useMemo(() => {
    if (!searchTerm) return allRooms;
    return allRooms.filter(room =>
      room.TenPhong.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (room.property?.TenNhaTro ?? "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (room.roomType?.TenLoai ?? "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.TrangThai.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [allRooms, searchTerm]);

  if (authLoading || isLoading) {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-10 w-36" />
            </div>
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-96 w-full" />
        </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Quản lý tất cả phòng</h1>
        <Button asChild>
          <Link href="/dashboard/rooms/new">
            <Plus className="mr-2 h-4 w-4" />
            Thêm phòng mới
          </Link>
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Tìm theo tên phòng, nhà trọ, loại phòng..."
          className="w-full pl-8"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {filteredRooms.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-muted-foreground py-12">
              <HomeIcon className="mx-auto h-12 w-12 mb-4" />
              <p className="text-lg font-medium">Bạn chưa có phòng nào</p>
              <p>Hãy bắt đầu bằng cách thêm phòng mới cho nhà trọ của bạn.</p>
              <Button asChild className="mt-6">
                 <Link href="/dashboard/rooms/new">Thêm phòng ngay</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tên phòng</TableHead>
                  <TableHead>Nhà trọ</TableHead>
                  <TableHead>Loại phòng</TableHead>
                  <TableHead>Giá đề xuất</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="text-right">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRooms.map((room) => (
                  <TableRow key={room.MaPhong}>
                    <TableCell className="font-medium">{room.TenPhong}</TableCell>
                    <TableCell>{room.property?.TenNhaTro || 'N/A'}</TableCell>
                    <TableCell>{room.roomType?.TenLoai || 'N/A'}</TableCell>
                    <TableCell>{room.roomType?.Gia ? `${room.roomType.Gia.toLocaleString()} VNĐ` : 'N/A'}</TableCell>
                    <TableCell>
                      <Badge variant={
                          room.TrangThai === 'Đang thuê' ? 'default' :
                          room.TrangThai === 'Còn trống' ? 'outline' :
                          'secondary'
                      }>
                          {room.TrangThai}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button variant="ghost" size="icon" asChild title="Chi tiết">
                        <Link href={`/dashboard/rooms/${room.MaPhong}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="icon" asChild title="Sửa">
                        <Link href={`/dashboard/rooms/${room.MaPhong}/edit`}>
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" title="Xóa" className="text-destructive hover:text-destructive"
                              disabled={room.TrangThai === 'Đang thuê'}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Xác nhận xóa phòng?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Hành động này không thể hoàn tác. Bạn có chắc chắn muốn xóa phòng "{room.TenPhong}"?
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Hủy</AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-destructive hover:bg-destructive/90"
                              onClick={() => handleDeleteRoom(room.MaPhong)}
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
          </CardContent>
        </Card>
      )}
    </div>
  );
}