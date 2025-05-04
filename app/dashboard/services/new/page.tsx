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

export default function NewServicePage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [serviceType, setServiceType] = useState("monthly")

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate creating a new service
    setTimeout(() => {
      setIsSubmitting(false)
      toast({
        title: "Tạo dịch vụ thành công",
        description: "Dịch vụ mới đã được thêm vào hệ thống",
      })
      router.push("/dashboard/services")
    }, 1500)
  }

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-2xl">
        <h1 className="text-2xl font-bold tracking-tight mb-6">Thêm dịch vụ mới</h1>

        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Thông tin dịch vụ</CardTitle>
              <CardDescription>Nhập thông tin chi tiết về dịch vụ mới</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">
                  Tên dịch vụ <span className="text-red-500">*</span>
                </Label>
                <Input id="name" placeholder="Nhập tên dịch vụ" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">
                  Giá dịch vụ (VNĐ) <span className="text-red-500">*</span>
                </Label>
                <Input id="price" type="number" placeholder="Nhập giá dịch vụ" min="0" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">
                  Loại tính phí <span className="text-red-500">*</span>
                </Label>
                <Select value={serviceType} onValueChange={setServiceType} required>
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
                <Input
                  id="unit"
                  placeholder={
                    serviceType === "monthly"
                      ? "Ví dụ: tháng"
                      : serviceType === "usage"
                        ? "Ví dụ: kg, lần, giờ"
                        : "Ví dụ: lần"
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Mô tả</Label>
                <Textarea id="description" placeholder="Nhập mô tả về dịch vụ (nếu có)" />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button type="button" variant="outline" onClick={() => router.push("/dashboard/services")}>
                Hủy
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Đang xử lý..." : "Thêm dịch vụ"}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </div>
    </DashboardLayout>
  )
}
