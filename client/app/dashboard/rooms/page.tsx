"use client";

import { useEffect, useState, useMemo } from "react";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { Plus, Search, Edit, Trash2, Eye, Filter, Home as HomeIcon } from "lucide-react";
import { getRoomsByProperty, deleteRoom, getAllRoomTypes } from "@/services/roomService"; 
import { getMyProperties } from "@/services/propertyService"; 
import type { Room, RoomType } from "@/types/room";
import type { Property } from "@/types/property";
import { useAuth } from "@/contexts/AuthContext";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";


export default function RoomsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const searchParamsHook = useSearchParams(); 
  const { toast } = useToast();

  const [rooms, setRooms] = useState<Room[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>(searchParamsHook.get('propertyId') || ''); 
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (user && user.role?.TenVaiTro === 'Chủ trọ') {
      const fetchPropertiesForFilter = async () => {
        try {
          const props = await getMyProperties();
          setProperties(props);
          // Nếu chưa chọn nhà trọ và có nhà trọ, chọn nhà trọ đầu tiên
          if (!selectedPropertyId && props.length > 0) {
            setSelectedPropertyId(props[0].MaNhaTro.toString());
          }
        } catch (error) {
          toast({ title: "Lỗi", description: "Không thể tải danh sách nhà trọ.", variant: "destructive" });
        }
      };
      fetchPropertiesForFilter();
    }
  }, [user, toast]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }
    if (user && user.role?.TenVaiTro === 'Chủ trọ') {
      if (selectedPropertyId) {
        fetchRooms(Number(selectedPropertyId));
      } else {
        setRooms([]);
        setIsLoading(false); 
      }
    } else if (!authLoading && user) {
      toast({ title: "Lỗi", description: "Bạn không có quyền truy cập trang này.", variant: "destructive" });
      router.push("/");
    }
  }, [user, authLoading, router, toast, selectedPropertyId]);

  const fetchRooms = async (propertyId: number) => {
    setIsLoading(true);
    try {
      const data = await getRoomsByProperty(propertyId);
      setRooms(data);
    } catch (error: any) {
      toast({
        title: "Lỗi tải danh sách phòng",
        description: error.message || "Vui lòng chọn nhà trọ.",
        variant: "destructive",
      });
      setRooms([]); 
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
      if (selectedPropertyId) {
        fetchRooms(Number(selectedPropertyId)); 
      }
    } catch (error: any) {
      toast({
        title: "Lỗi xóa phòng",
        description: error.message || "Không thể xóa. Vui lòng thử lại.",
        variant: "destructive",
      });
    }
  };

  const filteredRooms = useMemo(() => {
    if (!searchTerm) return rooms;
    return rooms.filter(room =>
      room.TenPhong.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (room.roomType?.TenLoai ?? "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.TrangThai.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [rooms, searchTerm]);

  const handlePropertyChange = (propertyId: string) => {
    setSelectedPropertyId(propertyId);
    router.push(`/dashboard/rooms?propertyId=${propertyId}`); // Cập nhật URL
  };


  if (authLoading) {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-10 w-32" />
            </div>
            <div className="flex gap-4">
                <Skeleton className="h-10 w-64" />
                <Skeleton className="h-10 flex-1" />
            </div>
            <Skeleton className="h-96 w-full" />
        </div>
    );
  }


  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Quản lý phòng</h1>
        <Button asChild disabled={!selectedPropertyId}>
          <Link href={`/dashboard/rooms/new?propertyId=${selectedPropertyId}`}>
            <Plus className="mr-2 h-4 w-4" />
            Thêm phòng mới
          </Link>
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-none w-full md:w-64">
          <Label htmlFor="propertyFilter">Chọn nhà trọ</Label>
          <Select
            value={selectedPropertyId}
            onValueChange={handlePropertyChange}
          >
            <SelectTrigger id="propertyFilter" className="w-full">
              <SelectValue placeholder="Chọn nhà trọ để xem phòng..." />
            </SelectTrigger>
            <SelectContent>
              {properties.length === 0 ? (
                <div className="p-2 text-sm text-muted-foreground">Không có nhà trọ nào</div>
              ) : (
                properties.map(prop => (
                  <SelectItem key={prop.MaNhaTro} value={prop.MaNhaTro.toString()}>
                    {prop.TenNhaTro}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>
        <div className="relative flex-grow">
          <Label htmlFor="roomSearch">Tìm kiếm phòng</Label>
          <Search className="absolute left-2.5 top-10 h-4 w-4 text-muted-foreground" />
          <Input
            id="roomSearch"
            type="search"
            placeholder="Tìm theo tên phòng, loại phòng, trạng thái..."
            className="w-full pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            disabled={!selectedPropertyId}
          />
        </div>
      </div>

      {isLoading ? (
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(3)].map((_,i) => (
                <Card key={i}>
                    <CardHeader>
                        <Skeleton className="h-6 w-3/4 mb-1" />
                        <Skeleton className="h-4 w-1/2" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-4 w-full mb-1" />
                        <Skeleton className="h-4 w-2/3" />
                    </CardContent>
                    <CardFooter  className="flex justify-end gap-2 border-t pt-4">
                        <Skeleton className="h-8 w-20" />
                        <Skeleton className="h-8 w-20" />
                    </CardFooter>
                </Card>
            ))}
         </div>
      ) : !selectedPropertyId ? (
        <Card>
            <CardContent className="pt-6">
                <div className="text-center text-muted-foreground py-12">
                    <Filter className="mx-auto h-12 w-12 mb-4" />
                    <p className="text-lg font-medium">Vui lòng chọn một nhà trọ</p>
                    <p>Để xem danh sách phòng, bạn cần chọn một nhà trọ từ bộ lọc ở trên.</p>
                </div>
            </CardContent>
        </Card>
      ) : filteredRooms.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-muted-foreground py-12">
              <HomeIcon className="mx-auto h-12 w-12 mb-4" />
              <p className="text-lg font-medium">Chưa có phòng nào</p>
              <p>Nhà trọ này hiện chưa có phòng nào hoặc không tìm thấy kết quả phù hợp.</p>
              <Button asChild className="mt-6">
                 <Link href={`/dashboard/rooms/new?propertyId=${selectedPropertyId}`}>Thêm phòng ngay</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tên phòng</TableHead>
                <TableHead>Loại phòng</TableHead>
                <TableHead>Giá đề xuất</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Nhà trọ</TableHead>
                <TableHead className="text-right">Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRooms.map((room) => (
                <TableRow key={room.MaPhong}>
                  <TableCell className="font-medium">{room.TenPhong}</TableCell>
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
                  <TableCell>{room.property?.TenNhaTro || 'N/A'}</TableCell>
                  <TableCell className="text-right space-x-2">
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
                        <Button variant="ghost" size="icon" title="Xóa" className="text-destructive hover:text-destructive">
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
        </div>
      )}
    </div>
  );
}