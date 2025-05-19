"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import DashboardLayout from "@/components/dashboard/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"

export default function EditServicePage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Giả lập dữ liệu dịch vụ
  const service = {
    id: params.id,
    name: "Internet",
    price: "150000",
    type: "monthly",
    unit: "tháng",
    description: "Dịch vụ Internet tốc độ cao, không giới hạn dung lượng.",
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Giả lập cập nhật dịch vụ thành công
    setTimeout(() => {
      setIsSubmitting(false)
      toast({
        title: "Cập nhật dịch vụ thành công",
        description: "Thông tin dịch vụ đã được cập nhật",
      })
      router.push(`/dashboard/services/${params.id}`)
    }, 1500)
  }

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-2xl">
        <h1 className="text-2xl font-bold tracking-tight mb-6">Chỉnh sửa dịch vụ</h1>

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
                <Input id="name" placeholder="Nhập tên dịch vụ" defaultValue={service.name} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">
                  Giá dịch vụ (VNĐ) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="price"
                  type="number"
                  placeholder="Nhập giá dịch vụ"
                  min="0"
                  defaultValue={service.price}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">
                  Loại tính phí <span className="text-red-500">*</span>
                </Label>
                <Select defaultValue={service.type}>
                  <SelectTrigger id="type">
                    <SelectValue placeholder="Chọn loại tính phí" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Hàng tháng</SelectItem>
                    <SelectItem value="usage">Theo sử dụng</SelectItem>
                    <SelectItem value="one-time">Một lần</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="unit">Đơn vị tính</Label>
                <Input id="unit" placeholder="Ví dụ: tháng, kg, lần" defaultValue={service.unit} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Mô tả</Label>
                <Textarea
                  id="description"
                  placeholder="Nhập mô tả về dịch vụ (nếu có)"
                  defaultValue={service.description}
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button type="button" variant="outline" onClick={() => router.push(`/dashboard/services/${params.id}`)}>
                Hủy
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Đang cập nhật..." : "Lưu thay đổi"}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </div>
    </DashboardLayout>
  )
}
