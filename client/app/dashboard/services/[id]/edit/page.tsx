"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import DashboardLayout from "@/components/dashboard/dashboard-layout" //
import { Button } from "@/components/ui/button" //
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card" //
import { Input } from "@/components/ui/input" //
import { Label } from "@/components/ui/label" //
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select" //
import { Textarea } from "@/components/ui/textarea" //
import { useToast } from "@/components/ui/use-toast" //
import { getServiceById, updateService, updateServicePrice } from '@/services/serviceService'; //
import type { IService, ServiceType, UpdateServiceData } from '@/types/service'; //
import { useAuth } from "@/contexts/AuthContext"; //
import { Skeleton } from "@/components/ui/skeleton"; //
import { ArrowLeft, Save } from "lucide-react"; ///edit/page.tsx]
import Link from "next/link"; ///edit/page.tsx]

export default function EditServicePage() {
  const router = useRouter()
  const params = useParams();
  const { toast } = useToast() //
  const { user, isLoading: authLoading } = useAuth(); // Assuming auth context provides user info and loading state

  const [service, setService] = useState<IService | null>(null)
  const [isLoading, setIsLoading] = useState(true) // Tracks initial data fetch
  const [isSubmitting, setIsSubmitting] = useState(false) // Tracks form submission

  // Form states
  const [tenDV, setTenDV] = useState<string>("")
  const [currentPrice, setCurrentPrice] = useState<number | undefined>(undefined) // Current price from DB
  const [newPrice, setNewPrice] = useState<string>("") // Price input for update
  const [loaiDichVu, setLoaiDichVu] = useState<ServiceType | undefined>(undefined) //
  const [donViTinh, setDonViTinh] = useState<string>("") //
  const [ghiChu, setGhiChu] = useState<string | null>("") // Explicitly allow null

  const serviceId = Number(params.id);

  useEffect(() => {
    if (authLoading) return; // Wait for auth to load
    if (!user) { //
      router.push('/login'); // Redirect to login if not authenticated
      toast({ title: "Thông báo", description: "Bạn cần đăng nhập để truy cập trang này.", variant: "default" }); ///edit/page.tsx]
      return;
    }
    // No specific role check here, relying on backend permissions (service_definition:manage_own_property)

    if (isNaN(serviceId)) {
        console.error("Lỗi: Mã dịch vụ không hợp lệ. Params ID:", params.id);
        toast({ title: "Lỗi", description: "Mã dịch vụ không hợp lệ.", variant: "destructive" }); ///edit/page.tsx]
        router.push('/dashboard/services'); // Redirect back to services list
        return;
    }

    const fetchServiceDetails = async () => {
      setIsLoading(true); // Start loading
      try {
        const data = await getServiceById(serviceId); //
        
        // Vẫn giữ kiểm tra này, mặc dù serviceService đã ném lỗi
        if (!data) { 
          throw new Error("Không tìm thấy dữ liệu dịch vụ hoặc dữ liệu không hợp lệ.");
        }

        setService(data);
        // Set form states with fetched data
        setTenDV(data.TenDV); 
        setLoaiDichVu(data.LoaiDichVu); //
        setDonViTinh(data.DonViTinh || "");
        setGhiChu(data.GhiChu || ""); // Set ghiChu from fetched data
        
        // Get the latest price from priceHistories if available
        // Ensure priceHistories exists and has at least one element before accessing [0]
        const latestPrice = data.priceHistories?.[0]?.DonGiaMoi; 
        setCurrentPrice(latestPrice);
        setNewPrice(latestPrice !== undefined ? String(latestPrice) : ""); // Set input value to current price

      } catch (error: any) {
        console.error("Lỗi khi tải thông tin dịch vụ:", error); // Log error for debugging
        const errorMessage = error.response?.data?.message || error.message || "Không thể tải dữ liệu. Vui lòng thử lại.";
        toast({
          title: "Lỗi tải thông tin dịch vụ",
          description: errorMessage,
          variant: "destructive",
        });
        setService(null); // Explicitly set service to null on error, this is crucial
        router.push('/dashboard/services'); // Redirect back to list on error
      } finally {
        setIsLoading(false); // End loading
      }
    };

    fetchServiceDetails();
  }, [serviceId, user, authLoading, router, toast, params.id]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      if (!service) { // Should not happen if isLoading is handled correctly, but good for type safety
        toast({ title: "Lỗi", description: "Không tìm thấy thông tin dịch vụ để cập nhật.", variant: "destructive" });
        return;
      }

      const updateData: UpdateServiceData = { //
        TenDV: tenDV,
        LoaiDichVu: loaiDichVu,
        DonViTinh: donViTinh,
        GhiChu: ghiChu, // GhiChu is now part of UpdateServiceData
      };

      // Call update service for general information
      await updateService(serviceId, updateData); //

      // Check if price has changed and update it
      const parsedNewPrice = parseFloat(newPrice);
      // Only update price if it's a valid number and different from current price
      if (!isNaN(parsedNewPrice) && parsedNewPrice !== currentPrice) {
        await updateServicePrice(serviceId, parsedNewPrice); //
      }

      toast({
        title: "Cập nhật dịch vụ thành công",
        description: "Thông tin dịch vụ đã được cập nhật.",
      });
      router.push(`/dashboard/services/${serviceId}`);
    } catch (error: any) {
      console.error("Lỗi khi cập nhật dịch vụ:", error); // Log error for debugging
      const errorMessage = error.response?.data?.message || error.message || "Đã xảy ra lỗi khi cập nhật dịch vụ.";
      toast({
        title: "Lỗi",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  // Display skeleton while loading or if service data is not yet available
  // The !service check here is crucial to prevent the 'TenDV' error if fetching failed
  if (isLoading || authLoading || !service) { 
    return (
        <DashboardLayout>
            <div className="mx-auto max-w-2xl">
                <div className="flex items-center gap-2 mb-6">
                    <Skeleton className="h-10 w-24" /> 
                    <Skeleton className="h-8 w-64" /> 
                </div>
                <Card> 
                    <CardHeader> 
                        <Skeleton className="h-7 w-3/4 mb-1" /> 
                        <Skeleton className="h-4 w-1/2" /> 
                    </CardHeader>
                    <CardContent className="space-y-4"> 
                        <Skeleton className="h-10 w-full" /> 
                        <Skeleton className="h-10 w-full" /> 
                        <Skeleton className="h-10 w-full" /> 
                        <Skeleton className="h-10 w-full" /> 
                        <Skeleton className="h-32 w-full" /> 
                    </CardContent>
                    <CardFooter className="flex justify-end gap-2"> 
                        <Skeleton className="h-10 w-24" /> 
                        <Skeleton className="h-10 w-32" /> 
                    </CardFooter>
                </Card>
            </div>
        </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-2xl">
        <div className="flex items-center gap-2 mb-6">
            <Button variant="outline" size="icon" asChild className="mr-2"> 
                <Link href={`/dashboard/services/${serviceId}`}> 
                    <ArrowLeft className="h-4 w-4" />
                </Link>
            </Button>
            {/* SỬA LỖI Ở ĐÂY: Đảm bảo TenDV luôn tồn tại trước khi truy cập */}
            <h1 className="text-2xl font-bold tracking-tight">Chỉnh sửa dịch vụ: {service.TenDV}</h1> 
        </div>

        <form onSubmit={handleSubmit}>
          <Card> 
            <CardHeader> 
              <CardTitle>Thông tin dịch vụ</CardTitle> 
              <CardDescription>Cập nhật thông tin chi tiết về dịch vụ</CardDescription> 
            </CardHeader>
            <CardContent className="space-y-4"> 
              <div className="space-y-2">
                <Label htmlFor="name"> 
                  Tên dịch vụ <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="Nhập tên dịch vụ"
                  value={tenDV}
                  onChange={(e) => setTenDV(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="price"> 
                  Giá dịch vụ hiện tại (VNĐ) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="price"
                  type="number"
                  placeholder="Nhập giá dịch vụ"
                  min="0"
                  value={newPrice}
                  onChange={(e) => setNewPrice(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type"> 
                  Loại tính phí <span className="text-red-500">*</span>
                </Label>
                {/* SỬA LỖI Ở ĐÂY: Ensure Select value is never undefined */}
                <Select value={loaiDichVu || ''} onValueChange={(value) => setLoaiDichVu(value as ServiceType)} required> 
                  <SelectTrigger id="type"> 
                    <SelectValue placeholder="Chọn loại tính phí" /> 
                  </SelectTrigger>
                  <SelectContent> 
                    <SelectItem value="Cố định hàng tháng">Cố định hàng tháng</SelectItem> 
                    <SelectItem value="Theo số lượng sử dụng">Theo số lượng sử dụng</SelectItem> 
                    <SelectItem value="Sự cố/Sửa chữa">Sự cố/Sửa chữa</SelectItem> 
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="unit">Đơn vị tính</Label> 
                <Input
                  id="unit"
                  placeholder="Ví dụ: tháng, kg, lần"
                  value={donViTinh}
                  onChange={(e) => setDonViTinh(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Mô tả</Label> 
                <Textarea
                  id="description"
                  placeholder="Nhập mô tả về dịch vụ (nếu có)"
                  value={ghiChu || ""} // Ensure it's not null for the controlled component
                  onChange={(e) => setGhiChu(e.target.value)}
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between"> 
              <Button type="button" variant="outline" onClick={() => router.push(`/dashboard/services/${serviceId}`)}> 
                Hủy
              </Button>
              <Button type="submit" disabled={isSubmitting}> 
                {isSubmitting ? "Đang cập nhật..." : <><Save className="mr-2 h-4 w-4" /> Lưu thay đổi</>}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </div>
    </DashboardLayout>
  )
}