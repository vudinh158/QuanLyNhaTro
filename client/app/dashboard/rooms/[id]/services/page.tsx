"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ShoppingBag, Plus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import DashboardLayout from "@/components/dashboard/dashboard-layout"

export default function RoomServicesPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form state
  const [selectedService, setSelectedService] = useState("")
  const [quantity, setQuantity] = useState("1")

  // Giả lập dữ liệu phòng
  const room = {
    id: params.id,
    name: "P101",
    property: "Nhà trọ Minh Tâm",
  }

  // Giả lập dữ liệu dịch vụ đã đăng ký
  const registeredServices = [
    {
      id: 1,
      name: "Internet",
      type: "fixed",
      price: 150000,
      unit: "tháng",
      status: "active",
      startDate: "01/01/2025",
    },
    {
      id: 2,
      name: "Dọn phòng",
      type: "fixed",
      price: 200000,
      unit: "tháng",
      status: "active",
      startDate: "01/01/2025",
    },
    {
      id: 3,
      name: "Giặt ủi",
      type: "usage",
      price: 20000,
      unit: "kg",
      status: "active",
      startDate: "01/01/2025",
    },
  ]

  // Giả lập dữ liệu dịch vụ có thể đăng ký
  const availableServices = [
    {
      id: 1,
      name: "Internet",
      type: "fixed",
      price: 150000,
      unit: "tháng",
      description: "Internet tốc độ cao, không giới hạn dung lượng",
      isRegistered: true,
    },
    {
      id: 2,
      name: "Dọn phòng",
      type: "fixed",
      price: 200000,
      unit: "tháng",
      description: "Dọn dẹp phòng 2 lần/tuần",
      isRegistered: true,
    },
    {
      id: 3,
      name: "Giặt ủi",
      type: "usage",
      price: 20000,
      unit: "kg",
      description: "Giặt và ủi quần áo",
      isRegistered: true,
    },
    {
      id: 4,
      name: "Nước uống",
      type: "usage",
      price: 30000,
      unit: "bình",
      description: "Nước uống đóng bình 20L",
      isRegistered: false,
    },
    {
      id: 5,
      name: "Vệ sinh máy lạnh",
      type: "usage",
      price: 150000,
      unit: "lần",
      description: "Vệ sinh máy lạnh",
      isRegistered: false,
    },
  ]

  // Giả lập dữ liệu sử dụng dịch vụ
  const serviceUsage = [
    {
      id: 1,
      serviceId: 3,
      serviceName: "Giặt ủi",
      date: "15/04/2025",
      quantity: 3,
      unit: "kg",
      price: 20000,
      total: 60000,
    },
    {
      id: 2,
      serviceId: 3,
      serviceName: "Giặt ủi",
      date: "05/04/2025",
      quantity: 2,
      unit: "kg",
      price: 20000,
      total: 40000,
    },
    {
      id: 3,
      serviceId: 3,
      serviceName: "Giặt ủi",
      date: "25/03/2025",
      quantity: 4,
      unit: "kg",
      price: 20000,
      total: 80000,
    },
  ]

  // Lọc dịch vụ theo loại sử dụng
  const usageBasedServices = registeredServices.filter((service) => service.type === "usage")

  const handleRegisterService = (serviceId: number) => {
    setIsSubmitting(true)

    // Giả lập đăng ký dịch vụ
    setTimeout(() => {
      setIsSubmitting(false)
      toast({
        title: "Đăng ký thành công",
        description: "Dịch vụ đã được đăng ký cho phòng",
      })
    }, 1000)
  }

  const handleUnregisterService = (serviceId: number) => {
    setIsSubmitting(true)

    // Giả lập hủy đăng ký dịch vụ
    setTimeout(() => {
      setIsSubmitting(false)
      toast({
        title: "Hủy đăng ký thành công",
        description: "Dịch vụ đã được hủy đăng ký",
      })
    }, 1000)
  }

  const handleRecordUsage = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Giả lập ghi nhận sử dụng dịch vụ
    setTimeout(() => {
      setIsSubmitting(false)
      toast({
        title: "Ghi nhận thành công",
        description: "Sử dụng dịch vụ đã được ghi nhận",
      })
      setSelectedService("")
      setQuantity("1")
    }, 1000)
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-6 w-6" />
            <h1 className="text-2xl font-bold tracking-tight">Quản lý dịch vụ - {room.name}</h1>
          </div>
          <Button variant="outline" onClick={() => router.back()}>
            Quay lại
          </Button>
        </div>

        <Tabs defaultValue="registered">
          <TabsList>
            <TabsTrigger value="registered">Dịch vụ đã đăng ký</TabsTrigger>
            <TabsTrigger value="register">Đăng ký dịch vụ</TabsTrigger>
            <TabsTrigger value="usage">Ghi nhận sử dụng</TabsTrigger>
          </TabsList>

          <TabsContent value="registered" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Dịch vụ cố định đã đăng ký</CardTitle>
                <CardDescription>
                  Danh sách các dịch vụ cố định hàng tháng đã đăng ký cho phòng {room.name}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {registeredServices.filter((service) => service.type === "fixed").length > 0 ? (
                  <Table>
                    <TableCaption>Danh sách dịch vụ cố định đã đăng ký</TableCaption>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tên dịch vụ</TableHead>
                        <TableHead className="text-right">Đơn giá</TableHead>
                        <TableHead>Đơn vị</TableHead>
                        <TableHead>Ngày đăng ký</TableHead>
                        <TableHead>Trạng thái</TableHead>
                        <TableHead className="text-right">Thao tác</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {registeredServices
                        .filter((service) => service.type === "fixed")
                        .map((service) => (
                          <TableRow key={service.id}>
                            <TableCell className="font-medium">{service.name}</TableCell>
                            <TableCell className="text-right">{service.price.toLocaleString()}</TableCell>
                            <TableCell>{service.unit}</TableCell>
                            <TableCell>{service.startDate}</TableCell>
                            <TableCell>
                              <Badge variant={service.status === "active" ? "default" : "secondary"}>
                                {service.status === "active" ? "Đang hoạt động" : "Tạm ngưng"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleUnregisterService(service.id)}
                                disabled={isSubmitting}
                              >
                                <X className="h-4 w-4 mr-1" /> Hủy
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8">
                    <ShoppingBag className="mx-auto h-12 w-12 text-muted-foreground/50" />
                    <h3 className="mt-4 text-lg font-medium">Chưa có dịch vụ cố định</h3>
                    <p className="mt-2 text-sm text-muted-foreground">Phòng này chưa đăng ký dịch vụ cố định nào.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="register" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Đăng ký dịch vụ cố định</CardTitle>
                <CardDescription>Đăng ký các dịch vụ cố định hàng tháng cho phòng {room.name}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {availableServices
                    .filter((service) => service.type === "fixed")
                    .map((service) => (
                      <div key={service.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium">{service.name}</h3>
                            <Badge variant="outline">Cố định</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{service.description}</p>
                          <div className="text-sm">
                            <span className="font-medium">{service.price.toLocaleString()} VNĐ</span>
                            <span className="text-muted-foreground">/{service.unit}</span>
                          </div>
                        </div>
                        <Button
                          variant={service.isRegistered ? "outline" : "default"}
                          size="sm"
                          onClick={() =>
                            service.isRegistered
                              ? handleUnregisterService(service.id)
                              : handleRegisterService(service.id)
                          }
                          disabled={isSubmitting}
                        >
                          {service.isRegistered ? (
                            <>
                              <X className="h-4 w-4 mr-1" /> Hủy đăng ký
                            </>
                          ) : (
                            <>
                              <Plus className="h-4 w-4 mr-1" /> Đăng ký
                            </>
                          )}
                        </Button>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="usage" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Ghi nhận sử dụng dịch vụ</CardTitle>
                <CardDescription>Ghi nhận việc sử dụng dịch vụ theo lượng cho phòng {room.name}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <form onSubmit={handleRecordUsage} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="service">Chọn dịch vụ</Label>
                      <Select value={selectedService} onValueChange={setSelectedService}>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn dịch vụ" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableServices
                            .filter((service) => service.type === "usage")
                            .map((service) => (
                              <SelectItem key={service.id} value={service.id.toString()}>
                                {service.name} ({service.price.toLocaleString()} VNĐ/{service.unit})
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="quantity">Số lượng</Label>
                      <Input
                        id="quantity"
                        type="number"
                        min="1"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                      />
                    </div>
                  </div>

                  {selectedService && (
                    <div className="rounded-md bg-muted p-4">
                      <div className="text-sm">
                        <div className="flex justify-between">
                          <span>Dịch vụ:</span>
                          <span className="font-medium">
                            {availableServices.find((s) => s.id.toString() === selectedService)?.name}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Đơn giá:</span>
                          <span>
                            {availableServices.find((s) => s.id.toString() === selectedService)?.price.toLocaleString()}{" "}
                            VNĐ/
                            {availableServices.find((s) => s.id.toString() === selectedService)?.unit}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Số lượng:</span>
                          <span>
                            {quantity} {availableServices.find((s) => s.id.toString() === selectedService)?.unit}
                          </span>
                        </div>
                        <div className="flex justify-between font-medium mt-2">
                          <span>Thành tiền:</span>
                          <span>
                            {(
                              Number.parseInt(quantity) *
                              (availableServices.find((s) => s.id.toString() === selectedService)?.price || 0)
                            ).toLocaleString()}{" "}
                            VNĐ
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  <Button type="submit" disabled={isSubmitting || !selectedService || !quantity}>
                    {isSubmitting ? "Đang xử lý..." : "Ghi nhận sử dụng"}
                  </Button>
                </form>

                <div className="pt-4">
                  <h3 className="font-medium mb-4">Lịch sử sử dụng dịch vụ</h3>
                  {serviceUsage.length > 0 ? (
                    <Table>
                      <TableCaption>Lịch sử sử dụng dịch vụ</TableCaption>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Ngày</TableHead>
                          <TableHead>Dịch vụ</TableHead>
                          <TableHead className="text-right">Số lượng</TableHead>
                          <TableHead>Đơn vị</TableHead>
                          <TableHead className="text-right">Đơn giá</TableHead>
                          <TableHead className="text-right">Thành tiền</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {serviceUsage.map((usage) => (
                          <TableRow key={usage.id}>
                            <TableCell>{usage.date}</TableCell>
                            <TableCell>{usage.serviceName}</TableCell>
                            <TableCell className="text-right">{usage.quantity}</TableCell>
                            <TableCell>{usage.unit}</TableCell>
                            <TableCell className="text-right">{usage.price.toLocaleString()}</TableCell>
                            <TableCell className="text-right font-medium">{usage.total.toLocaleString()}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-sm text-muted-foreground">Chưa có dữ liệu sử dụng dịch vụ</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
