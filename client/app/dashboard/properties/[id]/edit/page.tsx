"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import DashboardLayout from "@/components/dashboard/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"

export default function EditPropertyPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Giả lập dữ liệu nhà trọ
  const property = {
    id: params.id,
    name: "Nhà trọ Minh Tâm",
    address: "123 Nguyễn Văn Cừ, Quận 5, TP.HCM",
    electricityPrice: "4000",
    waterPrice: "15000",
    note: "Nhà trọ gần trường đại học, thuận tiện đi lại.",
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Giả lập cập nhật nhà trọ thành công
    setTimeout(() => {
      setIsSubmitting(false)
      toast({
        title: "Cập nhật nhà trọ thành công",
        description: "Thông tin nhà trọ đã được cập nhật",
      })
      router.push(`/dashboard/properties/${params.id}`)
    }, 1500)
  }

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-2xl">
        <h1 className="text-2xl font-bold tracking-tight mb-6">Chỉnh sửa nhà trọ</h1>

        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Thông tin nhà trọ</CardTitle>
              <CardDescription>Cập nhật thông tin chi tiết về nhà trọ</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">
                  Tên nhà trọ <span className="text-red-500">*</span>
                </Label>
                <Input id="name" placeholder="Nhập tên nhà trọ" defaultValue={property.name} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">
                  Địa chỉ <span className="text-red-500">*</span>
                </Label>
                <Textarea id="address" placeholder="Nhập địa chỉ đầy đủ" defaultValue={property.address} required />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="electricityPrice">
                    Giá điện (VNĐ/kWh) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="electricityPrice"
                    type="number"
                    placeholder="Ví dụ: 4000"
                    min="0"
                    defaultValue={property.electricityPrice}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="waterPrice">
                    Giá nước (VNĐ/m³) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="waterPrice"
                    type="number"
                    placeholder="Ví dụ: 15000"
                    min="0"
                    defaultValue={property.waterPrice}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="note">Ghi chú</Label>
                <Textarea id="note" placeholder="Nhập ghi chú (nếu có)" defaultValue={property.note} />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button type="button" variant="outline" onClick={() => router.push(`/dashboard/properties/${params.id}`)}>
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
