import DashboardLayout from "@/components/dashboard/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Bell, Plus, Search } from "lucide-react"
import Link from "next/link"

export default function TenantNotificationsPage() {
  return (
    <DashboardLayout userRole="tenant">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Thông báo</h1>
          <Button asChild>
            <Link href="/tenant/notifications/new">
              <Plus className="mr-2 h-4 w-4" />
              Gửi yêu cầu
            </Link>
          </Button>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input type="search" placeholder="Tìm kiếm thông báo..." className="w-full pl-8" />
          </div>
          <Select defaultValue="all">
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Loại thông báo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả thông báo</SelectItem>
              <SelectItem value="received">Đã nhận</SelectItem>
              <SelectItem value="sent">Đã gửi</SelectItem>
            </SelectContent>
          </Select>
          <Select defaultValue="all-status">
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-status">Tất cả trạng thái</SelectItem>
              <SelectItem value="read">Đã đọc</SelectItem>
              <SelectItem value="unread">Chưa đọc</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-4">
          {[
            {
              id: 1,
              title: "Thông báo tăng giá điện",
              sender: "Admin",
              recipient: "Tất cả khách thuê",
              time: "2 giờ trước",
              content:
                "Kính gửi quý khách, giá điện sẽ được điều chỉnh từ 4,000 VNĐ/kWh lên 4,200 VNĐ/kWh từ ngày 01/06/2025. Xin cảm ơn.",
              status: "received",
              isRead: true,
            },
            {
              id: 2,
              title: "Yêu cầu sửa chữa",
              sender: "Bạn",
              recipient: "Admin",
              time: "1 ngày trước",
              content: "Kính gửi chủ trọ, vòi nước trong phòng tắm bị hỏng, mong được sửa chữa sớm. Xin cảm ơn.",
              status: "sent",
              isRead: true,
            },
            {
              id: 3,
              title: "Nhắc nhở thanh toán hóa đơn",
              sender: "Hệ thống",
              recipient: "Bạn",
              time: "3 ngày trước",
              content:
                "Kính gửi quý khách, hóa đơn tháng 4/2025 của quý khách sắp đến hạn thanh toán. Vui lòng thanh toán trước ngày 10/05/2025. Xin cảm ơn.",
              status: "received",
              isRead: false,
            },
            {
              id: 4,
              title: "Thông báo bảo trì hệ thống điện",
              sender: "Admin",
              recipient: "Nhà trọ Minh Tâm",
              time: "5 ngày trước",
              content:
                "Kính gửi quý khách, hệ thống điện sẽ được bảo trì vào ngày 15/05/2025 từ 8h-12h. Mong quý khách thông cảm. Xin cảm ơn.",
              status: "received",
              isRead: true,
            },
          ].map((notification) => (
            <Card key={notification.id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      {notification.status === "received" ? (
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                          <Bell className="h-5 w-5 text-primary" />
                        </div>
                      ) : (
                        <Avatar className="h-10 w-10 border">
                          <AvatarImage src="/placeholder.svg?text=B" alt="Bạn" />
                          <AvatarFallback>B</AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{notification.title}</h3>
                          {!notification.isRead && notification.status === "received" && (
                            <Badge variant="default" className="ml-2">
                              Mới
                            </Badge>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground">{notification.time}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {notification.status === "received"
                          ? `Từ: ${notification.sender}`
                          : `Đến: ${notification.recipient}`}
                      </p>
                      <p className="text-sm line-clamp-2">{notification.content}</p>
                    </div>
                  </div>
                </div>

                <div className="flex border-t">
                  <Button variant="ghost" className="flex-1 rounded-none h-12" asChild>
                    <Link href={`/tenant/notifications/${notification.id}`}>Xem chi tiết</Link>
                  </Button>
                  {notification.status === "received" && !notification.isRead && (
                    <>
                      <div className="w-px bg-border" />
                      <Button variant="ghost" className="flex-1 rounded-none h-12" asChild>
                        <Link href={`/tenant/notifications/${notification.id}/mark-read`}>Đánh dấu đã đọc</Link>
                      </Button>
                    </>
                  )}
                  {notification.status === "received" && (
                    <>
                      <div className="w-px bg-border" />
                      <Button variant="ghost" className="flex-1 rounded-none h-12" asChild>
                        <Link href={`/tenant/notifications/new?reply=${notification.id}`}>Trả lời</Link>
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}
