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
import { Checkbox } from "@/components/ui/checkbox"

export default function EditRoomPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Giả lập dữ liệu phòng
  const room = {
    id: params.id,
    name: "P101",
    property: "Nhà trọ Minh Tâm",
    propertyId: "1",
    type: "Phòng đơn",
    status: "occupied",
    price: 2500000,
    deposit: 5000000,
    area: "20",
    note: "Phòng có cửa sổ, hướng Đông Nam, thoáng mát.",
    facilities: ["Điều hòa", "Nóng lạnh", "Tủ quần áo", "Giường", "Bàn học"],
  }

  const [formData, setFormData] = useState({
    name: room.name,
    propertyId: room.propertyId,
    type: room.type,
    status: room.status,
    price: room.price,
    deposit: room.deposit,
    area: room.area,
    note: room.note,
    facilities: room.facilities,
  })

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Giả lập cập nhật phòng thành công
    setTimeout(() => {
      setIsSubmitting(false)
      toast({
        title: "Cập nhật phòng thành công",
        description: "Thông tin phòng đã được cập nhật",
      })
      router.push(`/dashboard/rooms/${params.id}`)
    }, 1500)
  }

  const facilityOptions = [
    { id: "air-conditioner", label: "Điều hòa" },
    { id: "water-heater", label: "Nóng lạnh" },
    { id: "wardrobe", label: "Tủ quần áo" },
    { id: "bed", label: "Giường" },
    { id: "desk", label: "Bàn học" },
    { id: "refrigerator", label: "Tủ lạnh" },
    { id: "tv", label: "TV" },
    { id: "washing-machine", label: "Máy giặt" },
  ]

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-2xl">
        <h1 className="text-2xl font-bold tracking-tight mb-6">Chỉnh sửa phòng {room.name}</h1>

        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Thông tin phòng</CardTitle>
              <CardDescription>Chỉnh sửa thông tin chi tiết về phòng</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">
                    Tên phòng <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    placeholder="Nhập tên phòng"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="property">
                    Nhà trọ <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.propertyId}
                    onValueChange={(value) => setFormData({ ...formData, propertyId: value })}
                  >
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
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">
                    Loại phòng <span className="text-red-500">*</span>
                  </Label>
                  <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                    <SelectTrigger id="type">
                      <SelectValue placeholder="Chọn loại phòng" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Phòng đơn">Phòng đơn</SelectItem>
                      <SelectItem value="Phòng đôi">Phòng đôi</SelectItem>
                      <SelectItem value="Phòng gia đình">Phòng gia đình</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">
                    Trạng thái <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger id="status">
                      <SelectValue placeholder="Chọn trạng thái" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="available">Còn trống</SelectItem>
                      <SelectItem value="occupied">Đang thuê</SelectItem>
                      <SelectItem value="maintenance">Đang sửa chữa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">
                    Giá thuê (VNĐ/tháng) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="price"
                    type="number"
                    placeholder="Nhập giá thuê"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number.parseInt(e.target.value) })}
                    min="0"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="deposit">
                    Tiền cọc (VNĐ) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="deposit"
                    type="number"
                    placeholder="Nhập tiền cọc"
                    value={formData.deposit}
                    onChange={(e) => setFormData({ ...formData, deposit: Number.parseInt(e.target.value) })}
                    min="0"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="area">
                  Diện tích (m²) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="area"
                  placeholder="Nhập diện tích"
                  value={formData.area}
                  onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Tiện nghi</Label>
                <div className="grid grid-cols-2 gap-2">
                  {facilityOptions.map((facility) => (
                    <div key={facility.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={facility.id}
                        checked={formData.facilities.includes(facility.label)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setFormData({
                              ...formData,
                              facilities: [...formData.facilities, facility.label],
                            })
                          } else {
                            setFormData({
                              ...formData,
                              facilities: formData.facilities.filter((item) => item !== facility.label),
                            })
                          }
                        }}
                      />
                      <label
                        htmlFor={facility.id}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {facility.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="note">Ghi chú</Label>
                <Textarea
                  id="note"
                  placeholder="Nhập ghi chú về phòng (nếu có)"
                  value={formData.note}
                  onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button type="button" variant="outline" onClick={() => router.push(`/dashboard/rooms/${params.id}`)}>
                Hủy
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Đang xử lý..." : "Lưu thay đổi"}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </div>
    </DashboardLayout>
  )
}
