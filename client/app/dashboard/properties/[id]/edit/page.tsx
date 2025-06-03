"use client";

import { useEffect, useState, FormEvent } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { ArrowLeft } from 'lucide-react';
import { getPropertyById, updateProperty } from '@/services/propertyService';
import type { Property, UpdatePropertyData } from '@/types/property';
import { useAuth } from '@/contexts/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';

export default function EditPropertyPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const { user, isLoading: authLoading } = useAuth();

  const [property, setProperty] = useState<Property | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [tenNhaTro, setTenNhaTro] = useState("");
  const [diaChi, setDiaChi] = useState("");
  const [ghiChu, setGhiChu] = useState("");

  const propertyId = Number(params.id);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/login');
      return;
    }
    if (isNaN(propertyId)) {
      toast({ title: "Lỗi", description: "Mã nhà trọ không hợp lệ.", variant: "destructive" });
      router.push('/dashboard/properties');
      return;
    }

    const fetchPropertyDetails = async () => {
      setIsLoading(true);
      try {
        const data = await getPropertyById(propertyId);
        setProperty(data);
        setTenNhaTro(data.TenNhaTro);
        setDiaChi(data.DiaChi);
        setGhiChu(data.GhiChu || "");
      } catch (error: any) {
        toast({
          title: "Lỗi tải thông tin nhà trọ",
          description: error.message || "Không thể tải dữ liệu. Vui lòng thử lại.",
          variant: "destructive",
        });
        router.push('/dashboard/properties');
      } finally {
        setIsLoading(false);
      }
    };
    fetchPropertyDetails();
  }, [propertyId, user, authLoading, router, toast]);

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

    const updateData: UpdatePropertyData = {
      TenNhaTro: tenNhaTro,
      DiaChi: diaChi,
      GhiChu: ghiChu || undefined,
    };

    try {
      await updateProperty(propertyId, updateData);
      toast({
        title: "Thành công",
        description: "Đã cập nhật thông tin nhà trọ.",
      });
      router.push(`/dashboard/properties/${propertyId}`);
    } catch (error: any) {
      toast({
        title: "Lỗi cập nhật nhà trọ",
        description: error.message || "Không thể cập nhật. Vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || authLoading || !property) {
     return (
      <div className="mx-auto max-w-2xl">
        <div className="flex items-center mb-6">
            <Skeleton className="h-10 w-10 mr-2 rounded-md" />
            <Skeleton className="h-8 w-64" />
        </div>
        <Card>
            <CardHeader>
                <Skeleton className="h-8 w-1/2 mb-2" />
                <Skeleton className="h-4 w-3/4" />
            </CardHeader>
            <CardContent className="space-y-6">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
                <Skeleton className="h-10 w-20" />
                <Skeleton className="h-10 w-32" />
            </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="flex items-center mb-6">
        <Button variant="outline" size="icon" asChild className="mr-2">
          <Link href={`/dashboard/properties/${propertyId}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">Chỉnh sửa nhà trọ: {property.TenNhaTro}</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Thông tin nhà trọ</CardTitle>
            <CardDescription>Cập nhật thông tin chi tiết cho nhà trọ.</CardDescription>
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
          <CardFooter className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Hủy
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Đang lưu..." : "Lưu thay đổi"}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}