"use client"

import type React from "react"

import { useState } from "react"
import DashboardLayout from "@/components/dashboard/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/components/ui/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function SettingsPage() {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Giả lập cập nhật cài đặt
    setTimeout(() => {
      setIsSubmitting(false)
      toast({
        title: "Cập nhật thành công",
        description: "Cài đặt của bạn đã được lưu",
      })
    }, 1500)
  }

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-3xl">
        <h1 className="text-2xl font-bold tracking-tight mb-6">Cài đặt</h1>

        <Tabs defaultValue="general" className="space-y-6">
          <TabsList>
            <TabsTrigger value="general">Cài đặt chung</TabsTrigger>
            <TabsTrigger value="notifications">Thông báo</TabsTrigger>
            <TabsTrigger value="billing">Thanh toán</TabsTrigger>
          </TabsList>

          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle>Cài đặt chung</CardTitle>
                <CardDescription>Quản lý cài đặt chung của hệ thống</CardDescription>
              </CardHeader>
              <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="businessName">Tên doanh nghiệp</Label>
                    <Input id="businessName" defaultValue="Quản lý nhà trọ" />
                    <p className="text-xs text-muted-foreground">
                      Tên này sẽ xuất hiện trên hóa đơn và các tài liệu khác
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="businessAddress">Địa chỉ doanh nghiệp</Label>
                    <Input id="businessAddress" defaultValue="123 Nguyễn Văn Cừ, Quận 5, TP.HCM" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="businessPhone">Số điện thoại liên hệ</Label>
                    <Input id="businessPhone" defaultValue="0901234567" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="businessEmail">Email liên hệ</Label>
                    <Input id="businessEmail" type="email" defaultValue="contact@example.com" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="language">Ngôn ngữ</Label>
                    <Select defaultValue="vi">
                      <SelectTrigger id="language">
                        <SelectValue placeholder="Chọn ngôn ngữ" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="vi">Tiếng Việt</SelectItem>
                        <SelectItem value="en">English</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="theme">Giao diện</Label>
                    <Select defaultValue="light">
                      <SelectTrigger id="theme">
                        <SelectValue placeholder="Chọn giao diện" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Sáng</SelectItem>
                        <SelectItem value="dark">Tối</SelectItem>
                        <SelectItem value="system">Theo hệ thống</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Đang lưu..." : "Lưu thay đổi"}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>

          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Cài đặt thông báo</CardTitle>
                <CardDescription>Quản lý cách bạn nhận thông báo</CardDescription>
              </CardHeader>
              <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="email-notifications">Thông báo qua email</Label>
                        <p className="text-sm text-muted-foreground">Nhận thông báo qua email</p>
                      </div>
                      <Switch id="email-notifications" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="sms-notifications">Thông báo qua SMS</Label>
                        <p className="text-sm text-muted-foreground">Nhận thông báo qua tin nhắn SMS</p>
                      </div>
                      <Switch id="sms-notifications" />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="push-notifications">Thông báo đẩy</Label>
                        <p className="text-sm text-muted-foreground">Nhận thông báo đẩy trên trình duyệt</p>
                      </div>
                      <Switch id="push-notifications" defaultChecked />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-medium">Loại thông báo</h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="contract-notifications">Thông báo hợp đồng</Label>
                        <Switch id="contract-notifications" defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="bill-notifications">Thông báo hóa đơn</Label>
                        <Switch id="bill-notifications" defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="payment-notifications">Thông báo thanh toán</Label>
                        <Switch id="payment-notifications" defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="tenant-notifications">Thông báo từ khách thuê</Label>
                        <Switch id="tenant-notifications" defaultChecked />
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Đang lưu..." : "Lưu thay đổi"}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>

          <TabsContent value="billing">
            <Card>
              <CardHeader>
                <CardTitle>Cài đặt thanh toán</CardTitle>
                <CardDescription>Quản lý cài đặt thanh toán và hóa đơn</CardDescription>
              </CardHeader>
              <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="payment-methods">Phương thức thanh toán mặc định</Label>
                    <Select defaultValue="cash">
                      <SelectTrigger id="payment-methods">
                        <SelectValue placeholder="Chọn phương thức thanh toán" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cash">Tiền mặt</SelectItem>
                        <SelectItem value="bank">Chuyển khoản</SelectItem>
                        <SelectItem value="momo">Ví MoMo</SelectItem>
                        <SelectItem value="zalopay">ZaloPay</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="payment-due">Hạn thanh toán mặc định (ngày)</Label>
                    <Input id="payment-due" type="number" min="1" max="30" defaultValue="10" />
                    <p className="text-xs text-muted-foreground">
                      Số ngày được phép thanh toán kể từ ngày phát hành hóa đơn
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="invoice-prefix">Tiền tố mã hóa đơn</Label>
                    <Input id="invoice-prefix" defaultValue="HĐ" />
                    <p className="text-xs text-muted-foreground">Tiền tố sẽ được thêm vào trước mã hóa đơn</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contract-prefix">Tiền tố mã hợp đồng</Label>
                    <Input id="contract-prefix" defaultValue="HD" />
                    <p className="text-xs text-muted-foreground">Tiền tố sẽ được thêm vào trước mã hợp đồng</p>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="auto-reminder">Tự động nhắc nhở thanh toán</Label>
                      <p className="text-sm text-muted-foreground">
                        Tự động gửi thông báo nhắc nhở thanh toán trước hạn
                      </p>
                    </div>
                    <Switch id="auto-reminder" defaultChecked />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Đang lưu..." : "Lưu thay đổi"}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
