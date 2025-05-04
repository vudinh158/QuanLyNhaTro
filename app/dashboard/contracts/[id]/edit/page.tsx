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

export default function EditContractPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Giả lập dữ liệu hợp đồng
  const contract = {
    id: params.id,
    roomId: "1",
    room: "P101",
    property: "Nhà trọ Minh Tâm",
    tenantId: "1",
    tenant: "Nguyễn Văn B",
    startDate: "2025-01-01",
    endDate: "2025-05-15",
    rent: 2500000,
    deposit: 5000000,
    paymentDue: 10,
    status: "active",
    note: "Hợp đồng thuê phòng đơn",
  }

  const [formData, setFormData] = useState({
    roomId: contract.roomId,
    tenantId: contract.tenantId,
    startDate: contract.startDate,
    endDate: contract.endDate,
    rent: contract.rent,
    deposit: contract.deposit,
    paymentDue: contract.paymentDue,
    status: contract.status,
    note: contract.note,
  })

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Giả lập cập nhật hợp đồng thành công
    setTimeout(() => {
      setIsSubmitting(false)
      toast({
        title: "Cập nhật hợp đồng thành công",
        description: "Thông tin hợp đồng đã được cập nhật",
      })
      router.push(`/dashboard/contracts/${params.id}`)
    }, 1500)
  }

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-2xl">
        <h1 className="text-2xl font-bold tracking-tight mb-6">Chỉnh sửa hợp đồng {contract.id}</h1>

        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Thông tin hợp đồng</CardTitle>
              <CardDescription>Chỉnh sửa thông tin chi tiết về hợp đồng</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="room">
                    Phòng <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.roomId}
                    onValueChange={(value) => setFormData({ ...formData, roomId: value })}
                  >
                    <SelectTrigger id="room">
                      <SelectValue placeholder="Chọn phòng" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">P101 - Nhà trọ Minh Tâm</SelectItem>
                      <SelectItem value="2">P102 - Nhà trọ Minh Tâm</SelectItem>
                      <SelectItem value="3">P201 - Nhà trọ Thành Công</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tenant">
                    Người thuê <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.tenantId}
                    onValueChange={(value) => setFormData({ ...formData, tenantId: value })}
                  >
                    <SelectTrigger id="tenant">
                      <SelectValue placeholder="Chọn người thuê" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Nguyễn Văn B</SelectItem>
                      <SelectItem value="2">Phạm Thị E</SelectItem>
                      <SelectItem value="3">Trần Văn G</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">
                    Ngày bắt đầu <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">
                    Ngày kết thúc <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="rent">
                    Tiền thuê (VNĐ/tháng) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="rent"
                    type="number"
                    placeholder="Nhập tiền thuê"
                    value={formData.rent}
                    onChange={(e) => setFormData({ ...formData, rent: Number.parseInt(e.target.value) })}
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

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="paymentDue">
                    Ngày thanh toán hàng tháng <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="paymentDue"
                    type="number"
                    placeholder="Nhập ngày thanh toán"
                    value={formData.paymentDue}
                    onChange={(e) => setFormData({ ...formData, paymentDue: Number.parseInt(e.target.value) })}
                    min="1"
                    max="31"
                    required
                  />
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
                      <SelectItem value="active">Có hiệu lực</SelectItem>
                      <SelectItem value="expired">Hết hạn</SelectItem>
                      <SelectItem value="terminated">Đã chấm dứt</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="note">Ghi chú</Label>
                <Textarea
                  id="note"
                  placeholder="Nhập ghi chú về hợp đồng (nếu có)"
                  value={formData.note}
                  onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button type="button" variant="outline" onClick={() => router.push(`/dashboard/contracts/${params.id}`)}>
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
