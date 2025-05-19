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
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function NewNotificationPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [notificationType, setNotificationType] = useState("all")
  const [selectedProperties, setSelectedProperties] = useState<string[]>([])
  const [selectedRooms, setSelectedRooms] = useState<string[]>([])
  const [selectedTenants, setSelectedTenants] = useState<string[]>([])
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    priority: "normal",
  })

  // Mock data
  const properties = [
    { id: "1", name: "Nhà trọ Minh Tâm" },
    { id: "2", name: "Nhà trọ Thành Công" },
  ]

  const rooms = [
    { id: "1", name: "P101", property: "Nhà trọ Minh Tâm" },
    { id: "2", name: "P102", property: "Nhà trọ Minh Tâm" },
    { id: "3", name: "P103", property: "Nhà trọ Minh Tâm" },
    { id: "4", name: "P101", property: "Nhà trọ Thành Công" },
    { id: "5", name: "P102", property: "Nhà trọ Thành Công" },
  ]

  const tenants = [
    { id: "1", name: "Nguyễn Văn B", room: "P101", property: "Nhà trọ Minh Tâm" },
    { id: "2", name: "Trần Thị C", room: "P102", property: "Nhà trọ Minh Tâm" },
    { id: "3", name: "Lê Văn D", room: "P103", property: "Nhà trọ Minh Tâm" },
    { id: "4", name: "Phạm Thị E", room: "P101", property: "Nhà trọ Thành Công" },
    { id: "5", name: "Hoàng Văn F", room: "P102", property: "Nhà trọ Thành Công" },
  ]

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }))
  }

  const toggleProperty = (propertyId: string) => {
    if (selectedProperties.includes(propertyId)) {
      setSelectedProperties(selectedProperties.filter((id) => id !== propertyId))
      // Remove rooms and tenants of this property
      const propertyRooms = rooms.filter((room) => room.property === properties.find((p) => p.id === propertyId)?.name)
      const propertyRoomIds = propertyRooms.map((room) => room.id)
      setSelectedRooms(selectedRooms.filter((id) => !propertyRoomIds.includes(id)))

      const propertyTenants = tenants.filter(
        (tenant) => tenant.property === properties.find((p) => p.id === propertyId)?.name,
      )
      const propertyTenantIds = propertyTenants.map((tenant) => tenant.id)
      setSelectedTenants(selectedTenants.filter((id) => !propertyTenantIds.includes(id)))
    } else {
      setSelectedProperties([...selectedProperties, propertyId])
    }
  }

  const toggleRoom = (roomId: string) => {
    if (selectedRooms.includes(roomId)) {
      setSelectedRooms(selectedRooms.filter((id) => id !== roomId))
      // Remove tenants of this room
      const roomTenants = tenants.filter(
        (tenant) =>
          tenant.room === rooms.find((r) => r.id === roomId)?.name &&
          tenant.property === rooms.find((r) => r.id === roomId)?.property,
      )
      const roomTenantIds = roomTenants.map((tenant) => tenant.id)
      setSelectedTenants(selectedTenants.filter((id) => !roomTenantIds.includes(id)))
    } else {
      setSelectedRooms([...selectedRooms, roomId])
    }
  }

  const toggleTenant = (tenantId: string) => {
    if (selectedTenants.includes(tenantId)) {
      setSelectedTenants(selectedTenants.filter((id) => id !== tenantId))
    } else {
      setSelectedTenants([...selectedTenants, tenantId])
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Validate form
    if (!formData.title || !formData.content) {
      toast({
        title: "Thiếu thông tin",
        description: "Vui lòng điền đầy đủ tiêu đề và nội dung thông báo",
        variant: "destructive",
      })
      setIsSubmitting(false)
      return
    }

    if (notificationType !== "all" && selectedTenants.length === 0) {
      toast({
        title: "Chưa chọn người nhận",
        description: "Vui lòng chọn ít nhất một người nhận thông báo",
        variant: "destructive",
      })
      setIsSubmitting(false)
      return
    }

    // Simulate sending notification
    setTimeout(() => {
      setIsSubmitting(false)
      toast({
        title: "Gửi thông báo thành công",
        description: "Thông báo đã được gửi đến người nhận",
      })
      router.push("/dashboard/notifications")
    }, 1500)
  }

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-3xl">
        <div className="flex items-center gap-2 mb-6">
          <Button variant="outline" size="icon" asChild>
            <Link href="/dashboard/notifications">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">Tạo thông báo mới</h1>
        </div>

        <form onSubmit={handleSubmit}>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Thông tin thông báo</CardTitle>
              <CardDescription>Nhập thông tin chi tiết về thông báo</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">
                  Tiêu đề <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="title"
                  placeholder="Nhập tiêu đề thông báo"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">
                  Nội dung <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="content"
                  placeholder="Nhập nội dung thông báo"
                  rows={5}
                  value={formData.content}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">
                  Mức độ ưu tiên <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value) => setFormData({ ...formData, priority: value })}
                >
                  <SelectTrigger id="priority">
                    <SelectValue placeholder="Chọn mức độ ưu tiên" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Thấp</SelectItem>
                    <SelectItem value="normal">Bình thường</SelectItem>
                    <SelectItem value="high">Cao</SelectItem>
                    <SelectItem value="urgent">Khẩn cấp</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Người nhận</CardTitle>
              <CardDescription>Chọn người nhận thông báo</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="notificationType">Loại thông báo</Label>
                <Select value={notificationType} onValueChange={setNotificationType}>
                  <SelectTrigger id="notificationType">
                    <SelectValue placeholder="Chọn loại thông báo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả người thuê</SelectItem>
                    <SelectItem value="property">Theo nhà trọ</SelectItem>
                    <SelectItem value="room">Theo phòng</SelectItem>
                    <SelectItem value="tenant">Theo người thuê</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {notificationType === "property" && (
                <div className="space-y-2">
                  <Label>Chọn nhà trọ</Label>
                  <div className="space-y-2 rounded-lg border p-4">
                    {properties.map((property) => (
                      <div key={property.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`property-${property.id}`}
                          checked={selectedProperties.includes(property.id)}
                          onCheckedChange={() => toggleProperty(property.id)}
                        />
                        <Label htmlFor={`property-${property.id}`} className="text-sm font-normal">
                          {property.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {notificationType === "room" && (
                <div className="space-y-2">
                  <Label>Chọn phòng</Label>
                  <div className="space-y-2 rounded-lg border p-4">
                    {rooms.map((room) => (
                      <div key={room.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`room-${room.id}`}
                          checked={selectedRooms.includes(room.id)}
                          onCheckedChange={() => toggleRoom(room.id)}
                        />
                        <Label htmlFor={`room-${room.id}`} className="text-sm font-normal">
                          {room.name} - {room.property}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {notificationType === "tenant" && (
                <div className="space-y-2">
                  <Label>Chọn người thuê</Label>
                  <div className="space-y-2 rounded-lg border p-4">
                    {tenants.map((tenant) => (
                      <div key={tenant.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`tenant-${tenant.id}`}
                          checked={selectedTenants.includes(tenant.id)}
                          onCheckedChange={() => toggleTenant(tenant.id)}
                        />
                        <Label htmlFor={`tenant-${tenant.id}`} className="text-sm font-normal">
                          {tenant.name} - {tenant.room}, {tenant.property}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {notificationType !== "all" && (
                <div className="rounded-md bg-muted p-3">
                  <p className="text-sm font-medium">
                    Số người nhận:{" "}
                    {notificationType === "property"
                      ? selectedProperties.length
                      : notificationType === "room"
                        ? selectedRooms.length
                        : selectedTenants.length}
                  </p>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button type="button" variant="outline" onClick={() => router.push("/dashboard/notifications")}>
                Hủy
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Đang xử lý..." : "Gửi thông báo"}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </div>
    </DashboardLayout>
  )
}
