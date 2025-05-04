"use client"

import { useRouter } from "next/navigation"
import DashboardLayout from "@/components/dashboard/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function TenantNotificationDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter()

  // Giả lập dữ liệu thông báo
  const notification = {
    id: params.id,
    title: "Thông báo bảo trì hệ thống điện",
    content:
      "Kính gửi quý khách hàng,\n\nChúng tôi xin thông báo sẽ tiến hành bảo trì hệ thống điện vào ngày 15/04/2025 từ 9:00 đến 12:00. Trong thời gian này, hệ thống điện sẽ tạm ngưng hoạt động.\n\nRất mong quý khách thông cảm cho sự bất tiện này.\n\nTrân trọng,\nBan quản lý",
    createdAt: "10/04/2025 10:30",
    isRead: true,
    type: "maintenance",
    sender: "Ban quản lý",
  }

  return (
    <DashboardLayout userRole="tenant">
      <div className="mx-auto max-w-2xl">
        <div className="flex items-center gap-2 mb-6">
          <Button variant="outline" size="icon" asChild>
            <Link href="/tenant/notifications">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">Chi tiết thông báo</h1>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <CardTitle>{notification.title}</CardTitle>
                <CardDescription>
                  Từ {notification.sender} • {notification.createdAt}
                </CardDescription>
              </div>
              <Badge
                variant={
                  notification.type === "maintenance"
                    ? "outline"
                    : notification.type === "payment"
                      ? "default"
                      : "secondary"
                }
              >
                {notification.type === "maintenance"
                  ? "Bảo trì"
                  : notification.type === "payment"
                    ? "Thanh toán"
                    : "Thông báo"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="prose max-w-none">
              {notification.content.split("\n").map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
