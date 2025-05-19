import DashboardLayout from "@/components/dashboard/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Wifi, ShoppingBag } from "lucide-react"

export default function TenantServicesPage() {
  // Dữ liệu mẫu cho dịch vụ cố định
  const fixedServices = [
    {
      id: 1,
      name: "Internet",
      description: "Wifi tốc độ cao không giới hạn",
      price: 100000,
      unit: "tháng",
      startDate: "01/01/2025",
      status: "Đang sử dụng",
    },
    {
      id: 2,
      name: "Dọn phòng",
      description: "Dọn dẹp phòng 2 lần/tuần",
      price: 200000,
      unit: "tháng",
      startDate: "01/01/2025",
      status: "Đang sử dụng",
    },
  ]

  // Dữ liệu mẫu cho dịch vụ theo lượng
  const usageServices = [
    {
      id: 1,
      date: "15/04/2025",
      name: "Giặt ủi",
      quantity: 5,
      unit: "kg",
      price: 20000,
      total: 100000,
      status: "Đã thanh toán",
    },
    {
      id: 2,
      date: "10/04/2025",
      name: "Nước uống",
      quantity: 2,
      unit: "bình",
      price: 40000,
      total: 80000,
      status: "Đã thanh toán",
    },
    {
      id: 3,
      date: "05/04/2025",
      name: "Giặt ủi",
      quantity: 3,
      unit: "kg",
      price: 20000,
      total: 60000,
      status: "Đã thanh toán",
    },
    {
      id: 4,
      date: "28/03/2025",
      name: "Nước uống",
      quantity: 1,
      unit: "bình",
      price: 40000,
      total: 40000,
      status: "Đã thanh toán",
    },
  ]

  return (
    <DashboardLayout userRole="tenant">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Dịch vụ</h1>
          <div className="flex items-center gap-2">
            <Select defaultValue="all">
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Chọn kỳ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả kỳ</SelectItem>
                <SelectItem value="04-2025">Tháng 4/2025</SelectItem>
                <SelectItem value="03-2025">Tháng 3/2025</SelectItem>
                <SelectItem value="02-2025">Tháng 2/2025</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Tabs defaultValue="fixed">
          <TabsList>
            <TabsTrigger value="fixed" className="flex items-center gap-1">
              <Wifi className="h-4 w-4" />
              Dịch vụ cố định
            </TabsTrigger>
            <TabsTrigger value="usage" className="flex items-center gap-1">
              <ShoppingBag className="h-4 w-4" />
              Dịch vụ theo lượng
            </TabsTrigger>
          </TabsList>
          <TabsContent value="fixed" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Dịch vụ cố định đã đăng ký</CardTitle>
                <CardDescription>Các dịch vụ cố định hàng tháng bạn đang sử dụng</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border">
                  <div className="grid grid-cols-12 gap-2 p-3 font-medium text-sm border-b">
                    <div className="col-span-3">Tên dịch vụ</div>
                    <div className="col-span-4">Mô tả</div>
                    <div className="col-span-2 text-right">Giá</div>
                    <div className="col-span-2">Ngày bắt đầu</div>
                    <div className="col-span-1">Trạng thái</div>
                  </div>

                  {fixedServices.map((service) => (
                    <div key={service.id} className="grid grid-cols-12 gap-2 p-3 border-b last:border-0 items-center">
                      <div className="col-span-3 font-medium">{service.name}</div>
                      <div className="col-span-4">{service.description}</div>
                      <div className="col-span-2 text-right">
                        {service.price.toLocaleString("vi-VN")} VNĐ/{service.unit}
                      </div>
                      <div className="col-span-2">{service.startDate}</div>
                      <div className="col-span-1">
                        <Badge variant="outline">{service.status}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="usage" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Lịch sử sử dụng dịch vụ theo lượng</CardTitle>
                <CardDescription>Các dịch vụ theo lượng bạn đã sử dụng</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border">
                  <div className="grid grid-cols-12 gap-2 p-3 font-medium text-sm border-b">
                    <div className="col-span-2">Ngày</div>
                    <div className="col-span-3">Tên dịch vụ</div>
                    <div className="col-span-2 text-right">Số lượng</div>
                    <div className="col-span-2 text-right">Đơn giá</div>
                    <div className="col-span-2 text-right">Thành tiền</div>
                    <div className="col-span-1">Trạng thái</div>
                  </div>

                  {usageServices.map((service) => (
                    <div key={service.id} className="grid grid-cols-12 gap-2 p-3 border-b last:border-0 items-center">
                      <div className="col-span-2">{service.date}</div>
                      <div className="col-span-3 font-medium">{service.name}</div>
                      <div className="col-span-2 text-right">
                        {service.quantity} {service.unit}
                      </div>
                      <div className="col-span-2 text-right">{service.price.toLocaleString("vi-VN")} VNĐ</div>
                      <div className="col-span-2 text-right">{service.total.toLocaleString("vi-VN")} VNĐ</div>
                      <div className="col-span-1">
                        <Badge variant={service.status === "Đã thanh toán" ? "outline" : "secondary"}>
                          {service.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
