import DashboardLayout from "@/components/dashboard/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { AlertCircle, Building2, FileText, Home, Plus, Users, Wallet } from "lucide-react"
import Link from "next/link"

export default function DashboardPage() {
  return (
    // <DashboardLayout>
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Tổng quan</h1>
          <div className="flex items-center gap-2">
            <Button asChild>
              <Link href="/dashboard/contracts/new">
                <Plus className="mr-2 h-4 w-4" />
                Tạo hợp đồng
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tổng số nhà trọ</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3</div>
              <p className="text-xs text-muted-foreground">+1 so với tháng trước</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tổng số phòng</CardTitle>
              <Home className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">24</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-500">80%</span> đang cho thuê
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tổng số khách thuê</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">32</div>
              <p className="text-xs text-muted-foreground">+5 so với tháng trước</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Doanh thu tháng</CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">48.5M</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-500">+12%</span> so với tháng trước
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="contracts">
          <TabsList>
            <TabsTrigger value="contracts">Hợp đồng sắp hết hạn</TabsTrigger>
            <TabsTrigger value="bills">Hóa đơn chưa thanh toán</TabsTrigger>
          </TabsList>
          <TabsContent value="contracts" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Hợp đồng sắp hết hạn</CardTitle>
                <CardDescription>Danh sách các hợp đồng sẽ hết hạn trong 30 ngày tới</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {[
                    { id: "HD001", room: "P101", tenant: "Nguyễn Văn B", endDate: "15/05/2025" },
                    { id: "HD002", room: "P203", tenant: "Trần Thị C", endDate: "20/05/2025" },
                    { id: "HD003", room: "P305", tenant: "Lê Văn D", endDate: "01/06/2025" },
                  ].map((contract) => (
                    <div key={contract.id} className="flex items-center justify-between rounded-lg border p-3">
                      <div className="space-y-1">
                        <p className="font-medium">
                          {contract.room} - {contract.tenant}
                        </p>
                        <p className="text-sm text-muted-foreground">Hết hạn: {contract.endDate}</p>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/dashboard/contracts/${contract.id}`}>Xem chi tiết</Link>
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="bills" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Hóa đơn chưa thanh toán</CardTitle>
                <CardDescription>Danh sách các hóa đơn chưa thanh toán hoặc quá hạn</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {[
                    {
                      id: "HĐ001",
                      room: "P101",
                      tenant: "Nguyễn Văn B",
                      amount: "2.5M",
                      dueDate: "10/05/2025",
                      status: "Chưa thanh toán",
                    },
                    {
                      id: "HĐ002",
                      room: "P203",
                      tenant: "Trần Thị C",
                      amount: "3.2M",
                      dueDate: "05/05/2025",
                      status: "Quá hạn",
                    },
                    {
                      id: "HĐ003",
                      room: "P305",
                      tenant: "Lê Văn D",
                      amount: "2.8M",
                      dueDate: "15/05/2025",
                      status: "Chưa thanh toán",
                    },
                  ].map((bill) => (
                    <div key={bill.id} className="flex items-center justify-between rounded-lg border p-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">
                            {bill.room} - {bill.tenant}
                          </p>
                          {bill.status === "Quá hạn" && (
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
                          <Link href={`/dashboard/bills/${bill.id}`}>Xem chi tiết</Link>
                        </Button>
                        <Button size="sm" asChild>
                          <Link href={`/dashboard/bills/${bill.id}/payment`}>Thanh toán</Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Thông báo gần đây</CardTitle>
              <CardDescription>Các thông báo mới nhất từ hệ thống và khách thuê</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {[
                  { id: 1, title: "Yêu cầu sửa chữa", sender: "Nguyễn Văn B (P101)", time: "2 giờ trước" },
                  { id: 2, title: "Thanh toán hóa đơn", sender: "Hệ thống", time: "1 ngày trước" },
                  { id: 3, title: "Hợp đồng sắp hết hạn", sender: "Hệ thống", time: "3 ngày trước" },
                ].map((notification) => (
                  <div key={notification.id} className="flex items-center justify-between rounded-lg border p-3">
                    <div className="space-y-1">
                      <p className="font-medium">{notification.title}</p>
                      <p className="text-sm text-muted-foreground">
                        Từ: {notification.sender} - {notification.time}
                      </p>
                    </div>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/dashboard/notifications/${notification.id}`}>Xem</Link>
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Hành động nhanh</CardTitle>
              <CardDescription>Các thao tác thường xuyên sử dụng</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" className="h-auto flex-col items-start gap-1 p-4" asChild>
                  <Link href="/dashboard/properties/new">
                    <Building2 className="h-5 w-5" />
                    <div className="text-sm font-medium">Thêm nhà trọ</div>
                  </Link>
                </Button>
                <Button variant="outline" className="h-auto flex-col items-start gap-1 p-4" asChild>
                  <Link href="/dashboard/rooms/new">
                    <Home className="h-5 w-5" />
                    <div className="text-sm font-medium">Thêm phòng</div>
                  </Link>
                </Button>
                <Button variant="outline" className="h-auto flex-col items-start gap-1 p-4" asChild>
                  <Link href="/dashboard/tenants/new">
                    <Users className="h-5 w-5" />
                    <div className="text-sm font-medium">Thêm khách thuê</div>
                  </Link>
                </Button>
                <Button variant="outline" className="h-auto flex-col items-start gap-1 p-4" asChild>
                  <Link href="/dashboard/bills/new">
                    <FileText className="h-5 w-5" />
                    <div className="text-sm font-medium">Tạo hóa đơn</div>
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    // </DashboardLayout>
  )
}
