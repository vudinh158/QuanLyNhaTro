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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"

export default function NewRoomPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate adding a new room
    setTimeout(() => {
      setIsSubmitting(false)
      toast({
        title: "Thêm phòng thành công",
        description: "Phòng mới đã được thêm vào hệ thống",
      })
      router.push("/dashboard/rooms")
    }, 1500)
  }

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-2xl">
        <h1 className="text-2xl font-bold tracking-tight mb-6">Thêm phòng mới</h1>

        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Thông tin phòng</CardTitle>
              <CardDescription>Nhập thông tin chi tiết về phòng mới</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="property">
                  Nhà trọ <span className="text-red-500">*</span>
                </Label>
                <Select required>
                  <SelectTrigger id="property">
                    <SelectValue placeholder="Chọn nhà trọ" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Nhà trọ Minh Tâm</SelectItem>
                    <SelectItem value="2">Nhà trọ Thành Công</SelectItem>
                    <SelectItem value="3">Nhà trọ Phú Quý</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">
                  Tên phòng <span className="text-red-500">*</span>
                </Label>
                <Input id="name" placeholder="Ví dụ: P101" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="roomType">
                  Loại phòng <span className="text-red-500">*</span>
                </Label>
                <Select required>
                  <SelectTrigger id="roomType">
                    <SelectValue placeholder="Chọn loại phòng" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single">Phòng đơn</SelectItem>
                    <SelectItem value="double">Phòng đôi</SelectItem>
                    <SelectItem value="family">Phòng gia đình</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">
                    Giá thuê (VNĐ/tháng) <span className="text-red-500">*</span>
                  </Label>
                  <Input id="price" type="number" placeholder="Ví dụ: 2500000" min="0" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="area">
                    Diện tích (m²) <span className="text-red-500">*</span>
                  </Label>
                  <Input id="area" type="number" placeholder="Ví dụ: 20" min="0" required />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Trạng thái</Label>
                <Select defaultValue="available">
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Chọn trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Còn trống</SelectItem>
                    <SelectItem value="maintenance">Đang sửa chữa</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="note">Ghi chú</Label>
                <Textarea id="note" placeholder="Nhập ghi chú (nếu có)" />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button type="button" variant="outline" onClick={() => router.push("/dashboard/rooms")}>
                Hủy
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Đang xử lý..." : "Thêm phòng"}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </div>
    </DashboardLayout>
  )
}
