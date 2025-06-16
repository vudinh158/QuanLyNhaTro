"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createRoom } from "@/services/roomService";
import { getMyProperties } from "@/services/propertyService";
import { getRoomTypesByProperty } from "@/services/roomTypeService";
import { Property } from "@/types/property";
import { RoomType } from "@/types/roomType";
import { ChevronLeft } from "lucide-react";

// Cập nhật schema để chỉ bao gồm các trường bạn yêu cầu
const roomSchema = z.object({
  TenPhong: z.string().min(1, "Tên phòng là bắt buộc"),
  MaNhaTro: z.string().min(1, "Vui lòng chọn nhà trọ"),
  MaLoaiPhong: z.string().min(1, "Vui lòng chọn loại phòng"),
  TrangThai: z.enum(['Còn trống', 'Đang sửa chữa'], { // Chỉ cho phép 2 trạng thái này
    required_error: "Vui lòng chọn trạng thái phòng",
    invalid_type_error: "Trạng thái phòng không hợp lệ",
  }).default("Còn trống"), // Mặc định là 'Còn trống'
  GhiChu: z.string().optional(), // Đổi tên từ MoTa thành GhiChu
});

type RoomFormData = z.infer<typeof roomSchema>;

export default function NewRoomPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [properties, setProperties] = useState<Property[]>([]);
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [isLoadingProperties, setIsLoadingProperties] = useState(true);
  const [isLoadingRoomTypes, setIsLoadingRoomTypes] = useState(false);

  const form = useForm<RoomFormData>({
    resolver: zodResolver(roomSchema),
    defaultValues: {
      TenPhong: "",
      MaNhaTro: "",
      MaLoaiPhong: "",
      TrangThai: "Còn trống",
      GhiChu: "", // Đổi tên từ MoTa thành GhiChu
    },
  });

  const selectedPropertyId = form.watch("MaNhaTro");

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const props = await getMyProperties();
        setProperties(props);
      } catch (error) {
        toast({ title: "Lỗi", description: "Không thể tải danh sách nhà trọ", variant: "destructive" });
      } finally {
        setIsLoadingProperties(false);
      }
    };
    fetchProperties();
  }, [toast]);

  useEffect(() => {
    // Reset danh sách loại phòng khi chưa chọn nhà trọ
    if (!selectedPropertyId) {
      setRoomTypes([]);
      form.setValue("MaLoaiPhong", ""); // Reset giá trị loại phòng đã chọn
      return;
    }

    const fetchRoomTypes = async () => {
      setIsLoadingRoomTypes(true);
      try {
        const types = await getRoomTypesByProperty(Number(selectedPropertyId));
        setRoomTypes(types);
      } catch (error) {
        toast({ title: "Lỗi", description: "Không thể tải danh sách loại phòng cho nhà trọ này.", variant: "destructive" });
        setRoomTypes([]); // Xóa danh sách nếu có lỗi
      } finally {
        setIsLoadingRoomTypes(false);
      }
    };

    fetchRoomTypes();
  }, [selectedPropertyId, toast, form]);

  const onSubmit = async (data: RoomFormData) => {
    try {
      await createRoom({
        MaNhaTro: Number(data.MaNhaTro),
        MaLoaiPhong: Number(data.MaLoaiPhong),
        TenPhong: data.TenPhong,
        TrangThai: data.TrangThai,
        GhiChu: data.GhiChu,
      });
      toast({
        title: "Thành công",
        description: "Đã tạo phòng mới thành công.",
      });
      router.push("/dashboard/rooms");
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể tạo phòng. Vui lòng thử lại.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
                 <Button variant="ghost" size="icon" asChild>
                    <Link href="/dashboard/rooms">
                        <ChevronLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <div>
                    <CardTitle>Tạo phòng mới</CardTitle>
                    <CardDescription>Điền thông tin chi tiết để thêm một phòng mới.</CardDescription>
                </div>
            </div>
        </div>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="MaNhaTro"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nhà trọ</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoadingProperties}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={isLoadingProperties ? "Đang tải..." : "Chọn nhà trọ"} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {properties.map((prop) => (
                          <SelectItem key={prop.MaNhaTro} value={String(prop.MaNhaTro)}>
                            {prop.TenNhaTro}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="MaLoaiPhong"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Loại phòng</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={!selectedPropertyId || isLoadingRoomTypes}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={
                            isLoadingRoomTypes ? "Đang tải..." :
                            !selectedPropertyId ? "Vui lòng chọn nhà trọ trước" :
                            "Chọn loại phòng"
                          } />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {roomTypes.map((type) => (
                          <SelectItem key={type.MaLoaiPhong} value={String(type.MaLoaiPhong)}>
                            {type.TenLoai} (Giá: {type.Gia?.toLocaleString()} VNĐ)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="TenPhong"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tên phòng</FormLabel>
                    <FormControl>
                      <Input placeholder="Ví dụ: Phòng 101" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Trường trạng thái phòng, chỉ cho chọn "Còn trống" hoặc "Đang sửa chữa" */}
              <FormField
                control={form.control}
                name="TrangThai"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Trạng thái</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn trạng thái" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Còn trống">Còn trống</SelectItem>
                        <SelectItem value="Đang sửa chữa">Đang sửa chữa</SelectItem>
                        {/* Loại bỏ các trạng thái khác như "Đang thuê", "Đặt cọc" vì chúng được hệ thống tự động cập nhật */}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Các trường DienTich, GiaThue, TienCoc đã được loại bỏ theo yêu cầu */}
            </div>
            <FormField
              control={form.control}
              name="GhiChu" // Đổi tên thành GhiChu
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mô tả</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Mô tả thêm về phòng, nội thất, v.v." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => router.back()}>
                    Hủy
                </Button>
                <Button type="submit" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting ? "Đang lưu..." : "Lưu phòng"}
                </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}