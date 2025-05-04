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

export default function NewPropertyPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate adding a new property
    setTimeout(() => {
      setIsSubmitting(false)
      toast({
        title: "Thêm nhà trọ thành công",
        description: "Nhà trọ mới đã được thêm vào hệ thống",
      })
      router.push("/dashboard/properties")
    }, 1500)
  }

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-2xl">
        <h1 className="text-2xl font-bold tracking-tight mb-6">Thêm nhà trọ mới</h1>

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
                <Input id="name" placeholder="Nhập tên nhà trọ" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">
                  Địa chỉ <span className="text-red-500">*</span>
                </Label>
                <Textarea id="address" placeholder="Nhập địa chỉ đầy đủ" required />
              </div>

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

              <div className="space-y-2">
                <Label htmlFor="note">Ghi chú</Label>
                <Textarea id="note" placeholder="Nhập ghi chú (nếu có)" />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
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
    </DashboardLayout>
  )
}
