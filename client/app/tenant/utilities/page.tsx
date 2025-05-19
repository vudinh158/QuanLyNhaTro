import DashboardLayout from "@/components/dashboard/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Zap, Droplets } from "lucide-react"

export default function TenantUtilitiesPage() {
  // Dữ liệu mẫu cho điện nước
  const electricityData = [
    {
      id: 1,
      month: "Tháng 4/2025",
      previousReading: 1250,
      currentReading: 1400,
      consumption: 150,
      rate: 4000,
      total: 600000,
      readingDate: "30/04/2025",
      status: "Đã thanh toán",
    },
    {
      id: 2,
      month: "Tháng 3/2025",
      previousReading: 1100,
      currentReading: 1250,
      consumption: 150,
      rate: 4000,
      total: 600000,
      readingDate: "31/03/2025",
      status: "Đã thanh toán",
    },
    {
      id: 3,
      month: "Tháng 2/2025",
      previousReading: 950,
      currentReading: 1100,
      consumption: 150,
      rate: 4000,
      total: 600000,
      readingDate: "29/02/2025",
      status: "Đã thanh toán",
    },
  ]

  const waterData = [
    {
      id: 1,
      month: "Tháng 4/2025",
      previousReading: 50,
      currentReading: 60,
      consumption: 10,
      rate: 15000,
      total: 150000,
      readingDate: "30/04/2025",
      status: "Đã thanh toán",
    },
    {
      id: 2,
      month: "Tháng 3/2025",
      previousReading: 40,
      currentReading: 50,
      consumption: 10,
      rate: 15000,
      total: 150000,
      readingDate: "31/03/2025",
      status: "Đã thanh toán",
    },
    {
      id: 3,
      month: "Tháng 2/2025",
      previousReading: 30,
      currentReading: 40,
      consumption: 10,
      rate: 15000,
      total: 150000,
      readingDate: "29/02/2025",
      status: "Đã thanh toán",
    },
  ]

  return (
    <DashboardLayout userRole="tenant">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Điện nước</h1>
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

        <Card>
          <CardHeader>
            <CardTitle>Thông tin phòng</CardTitle>
            <CardDescription>Thông tin về phòng và hợp đồng thuê hiện tại</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-4">
                <div className="space-y-2">
                  <h3 className="font-medium">Thông tin phòng</h3>
                  <div className="grid gap-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Phòng:</span>
                      <span>P101 - Nhà trọ Minh Tâm</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Loại phòng:</span>
                      <span>Phòng đơn</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Diện tích:</span>
                      <span>20m²</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <h3 className="font-medium">Thông tin hợp đồng</h3>
                  <div className="grid gap-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Mã hợp đồng:</span>
                      <span>HD001</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Ngày bắt đầu:</span>
                      <span>01/01/2025</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Ngày kết thúc:</span>
                      <span>15/05/2025</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="electricity">
          <TabsList>
            <TabsTrigger value="electricity" className="flex items-center gap-1">
              <Zap className="h-4 w-4" />
              Điện
            </TabsTrigger>
            <TabsTrigger value="water" className="flex items-center gap-1">
              <Droplets className="h-4 w-4" />
              Nước
            </TabsTrigger>
          </TabsList>
          <TabsContent value="electricity" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Lịch sử sử dụng điện</CardTitle>
                <CardDescription>Thông tin chỉ số điện và tiền điện theo từng kỳ</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border">
                  <div className="grid grid-cols-8 gap-2 p-3 font-medium text-sm border-b">
                    <div className="col-span-1">Kỳ</div>
                    <div className="col-span-1 text-right">Chỉ số cũ</div>
                    <div className="col-span-1 text-right">Chỉ số mới</div>
                    <div className="col-span-1 text-right">Tiêu thụ</div>
                    <div className="col-span-1 text-right">Đơn giá</div>
                    <div className="col-span-1 text-right">Thành tiền</div>
                    <div className="col-span-1">Ngày ghi</div>
                    <div className="col-span-1">Trạng thái</div>
                  </div>

                  {electricityData.map((item) => (
                    <div key={item.id} className="grid grid-cols-8 gap-2 p-3 border-b last:border-0 items-center">
                      <div className="col-span-1">{item.month}</div>
                      <div className="col-span-1 text-right">{item.previousReading}</div>
                      <div className="col-span-1 text-right">{item.currentReading}</div>
                      <div className="col-span-1 text-right">{item.consumption}</div>
                      <div className="col-span-1 text-right">{item.rate.toLocaleString("vi-VN")} VNĐ</div>
                      <div className="col-span-1 text-right">{item.total.toLocaleString("vi-VN")} VNĐ</div>
                      <div className="col-span-1">{item.readingDate}</div>
                      <div className="col-span-1">{item.status}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="water" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Lịch sử sử dụng nước</CardTitle>
                <CardDescription>Thông tin chỉ số nước và tiền nước theo từng kỳ</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border">
                  <div className="grid grid-cols-8 gap-2 p-3 font-medium text-sm border-b">
                    <div className="col-span-1">Kỳ</div>
                    <div className="col-span-1 text-right">Chỉ số cũ</div>
                    <div className="col-span-1 text-right">Chỉ số mới</div>
                    <div className="col-span-1 text-right">Tiêu thụ</div>
                    <div className="col-span-1 text-right">Đơn giá</div>
                    <div className="col-span-1 text-right">Thành tiền</div>
                    <div className="col-span-1">Ngày ghi</div>
                    <div className="col-span-1">Trạng thái</div>
                  </div>

                  {waterData.map((item) => (
                    <div key={item.id} className="grid grid-cols-8 gap-2 p-3 border-b last:border-0 items-center">
                      <div className="col-span-1">{item.month}</div>
                      <div className="col-span-1 text-right">{item.previousReading}</div>
                      <div className="col-span-1 text-right">{item.currentReading}</div>
                      <div className="col-span-1 text-right">{item.consumption}</div>
                      <div className="col-span-1 text-right">{item.rate.toLocaleString("vi-VN")} VNĐ</div>
                      <div className="col-span-1 text-right">{item.total.toLocaleString("vi-VN")} VNĐ</div>
                      <div className="col-span-1">{item.readingDate}</div>
                      <div className="col-span-1">{item.status}</div>
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
