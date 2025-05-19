import DashboardLayout from "@/components/dashboard/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { AlertCircle, Bell, FileText, Wallet, Zap, ShoppingBag } from "lucide-react"
import Link from "next/link"

export default function TenantDashboardPage() {
  return (
    <DashboardLayout userRole="tenant">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Tổng quan</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Thông tin phòng thuê</CardTitle>
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
                <div className="space-y-2">
                  <h3 className="font-medium">Người ở cùng</h3>
                  <div className="grid gap-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Số người:</span>
                      <span>2 người</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Người đại diện:</span>
                      <span>Nguyễn Văn B (Bạn)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Người ở cùng:</span>
                      <span>Phạm Thị E</span>
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
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tiền thuê:</span>
                      <span>2,500,000 VNĐ/tháng</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tiền cọc:</span>
                      <span>5,000,000 VNĐ</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="bills">
          <TabsList>
            <TabsTrigger value="bills">Hóa đơn gần đây</TabsTrigger>
            <TabsTrigger value="notifications">Thông báo</TabsTrigger>
          </TabsList>
          <TabsContent value="bills" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Hóa đơn gần đây</CardTitle>
                <CardDescription>Danh sách các hóa đơn gần đây của bạn</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {[
                    {
                      id: "HĐ001",
                      period: "01/04/2025 - 30/04/2025",
                      amount: "3,250,000 VNĐ",
                      dueDate: "10/05/2025",
                      status: "Chưa thanh toán",
                      isOverdue: false,
                    },
                    {
                      id: "HĐ005",
                      period: "01/03/2025 - 31/03/2025",
                      amount: "3,150,000 VNĐ",
                      dueDate: "10/04/2025",
                      status: "Đã thanh toán",
                      isOverdue: false,
                    },
                    {
                      id: "HĐ009",
                      period: "01/02/2025 - 28/02/2025",
                      amount: "3,100,000 VNĐ",
                      dueDate: "10/03/2025",
                      status: "Đã thanh toán",
                      isOverdue: false,
                    },
                  ].map((bill) => (
                    <div key={bill.id} className="flex items-center justify-between rounded-lg border p-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">
                            {bill.id} - Kỳ: {bill.period}
                          </p>
                          {bill.isOverdue && (
                            <span className="flex items-center text-xs text-red-500">
                              <AlertCircle className="mr-1 h-3 w-3" />
                              Quá hạn
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Số tiền: {bill.amount} - Hạn: {bill.dueDate}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/tenant/bills/${bill.id}`}>Xem chi tiết</Link>
                        </Button>
                        {bill.status === "Chưa thanh toán" && (
                          <Button size="sm" asChild>
                            <Link href={`/tenant/bills/${bill.id}/payment`}>Thanh toán</Link>
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="notifications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Thông báo gần đây</CardTitle>
                <CardDescription>Các thông báo mới nhất từ chủ trọ</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {[
                    { id: 1, title: "Thông báo tăng giá điện", sender: "Admin", time: "2 giờ trước" },
                    { id: 2, title: "Thông báo bảo trì hệ thống điện", sender: "Admin", time: "5 ngày trước" },
                    { id: 3, title: "Nhắc nhở thanh toán hóa đơn", sender: "Hệ thống", time: "1 tuần trước" },
                  ].map((notification) => (
                    <div key={notification.id} className="flex items-center justify-between rounded-lg border p-3">
                      <div className="space-y-1">
                        <p className="font-medium">{notification.title}</p>
                        <p className="text-sm text-muted-foreground">
                          Từ: {notification.sender} - {notification.time}
                        </p>
                      </div>
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/tenant/notifications/${notification.id}`}>Xem</Link>
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="grid gap-4 md:grid-cols-5">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Hợp đồng</CardTitle>
              <CardDescription>Xem thông tin hợp đồng</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex justify-center py-4">
                <FileText className="h-12 w-12 text-primary/80" />
              </div>
              <Button className="w-full" asChild>
                <Link href="/tenant/contracts">Xem hợp đồng</Link>
              </Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Hóa đơn</CardTitle>
              <CardDescription>Quản lý hóa đơn và thanh toán</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex justify-center py-4">
                <Wallet className="h-12 w-12 text-primary/80" />
              </div>
              <Button className="w-full" asChild>
                <Link href="/tenant/bills">Xem tất cả hóa đơn</Link>
              </Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Điện nước</CardTitle>
              <CardDescription>Xem chỉ số điện nước</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex justify-center py-4">
                <Zap className="h-12 w-12 text-primary/80" />
              </div>
              <Button className="w-full" asChild>
                <Link href="/tenant/utilities">Xem điện nước</Link>
              </Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Dịch vụ</CardTitle>
              <CardDescription>Xem dịch vụ đã sử dụng</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex justify-center py-4">
                <ShoppingBag className="h-12 w-12 text-primary/80" />
              </div>
              <Button className="w-full" asChild>
                <Link href="/tenant/services">Xem dịch vụ</Link>
              </Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Thông báo</CardTitle>
              <CardDescription>Xem thông báo từ chủ trọ</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex justify-center py-4">
                <Bell className="h-12 w-12 text-primary/80" />
              </div>
              <Button className="w-full" asChild>
                <Link href="/tenant/notifications">Xem thông báo</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
