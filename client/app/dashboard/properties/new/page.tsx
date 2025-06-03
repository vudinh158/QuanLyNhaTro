"use client";

import type React from "react";
import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link"; 
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { createProperty } from "@/services/propertyService";
import type { NewPropertyData } from "@/types/property";
import { ArrowLeft } from "lucide-react";

export default function NewPropertyPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [tenNhaTro, setTenNhaTro] = useState("");
  const [diaChi, setDiaChi] = useState("");
  const [ghiChu, setGhiChu] = useState("");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!tenNhaTro || !diaChi) {
        toast({
            title: "Lỗi",
            description: "Vui lòng nhập tên nhà trọ và địa chỉ.",
            variant: "destructive",
        });
        return;
    }
    setIsSubmitting(true);

    const propertyData: NewPropertyData = {
      TenNhaTro: tenNhaTro,
      DiaChi: diaChi,
      ...(ghiChu && { GhiChu: ghiChu }), 
    };

    try {
      await createProperty(propertyData);
      toast({
        title: "Thành công",
        description: "Đã thêm nhà trọ mới.",
      });
      router.push("/dashboard/properties");
    } catch (error: any) {
      toast({
        title: "Lỗi thêm nhà trọ",
        description: error.message || "Không thể thêm nhà trọ. Vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    // <DashboardLayout>
      <div className="mx-auto max-w-2xl">
        <div className="flex items-center mb-6">
            <Button variant="outline" size="icon" asChild className="mr-2">
                <Link href="/dashboard/properties">
                    <ArrowLeft className="h-4 w-4" />
                </Link>
            </Button>
            <h1 className="text-2xl font-bold tracking-tight">Thêm nhà trọ mới</h1>
        </div>

        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Thông tin nhà trọ</CardTitle>
              <CardDescription>Nhập thông tin chi tiết về nhà trọ mới</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">
                  Tên nhà trọ <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="Nhập tên nhà trọ"
                  required
                  value={tenNhaTro}
                  onChange={(e) => setTenNhaTro(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">
                  Địa chỉ <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="address"
                  placeholder="Nhập địa chỉ đầy đủ"
                  required
                  value={diaChi}
                  onChange={(e) => setDiaChi(e.target.value)}
                />
              </div>

              {/* Theo schema mới, giá điện nước quản lý riêng, không nhập khi tạo nhà trọ */}
              {/*
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="electricityPrice">
                    Giá điện (VNĐ/kWh) <span className="text-red-500">*</span>
                  </Label>
                  <Input id="electricityPrice" type="number" placeholder="Ví dụ: 4000" min="0" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="waterPrice">
                    Giá nước (VNĐ/m³) <span className="text-red-500">*</span>
                  </Label>
                  <Input id="waterPrice" type="number" placeholder="Ví dụ: 15000" min="0" required />
                </div>
              </div>
              */}

              <div className="space-y-2">
                <Label htmlFor="note">Ghi chú</Label>
                <Textarea
                  id="note"
                  placeholder="Nhập ghi chú (nếu có)"
                  value={ghiChu}
                  onChange={(e) => setGhiChu(e.target.value)}
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2"> {/* Đổi lại vị trí nút */}
              <Button type="button" variant="outline" onClick={() => router.push("/dashboard/properties")}>
                Hủy
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Đang xử lý..." : "Thêm nhà trọ"}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </div>
    // </DashboardLayout>
  );
}