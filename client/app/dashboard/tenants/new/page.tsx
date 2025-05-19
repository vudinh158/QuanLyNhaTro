"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import DashboardLayout from "@/components/dashboard/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/components/ui/use-toast"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

export default function NewTenantPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [createAccount, setCreateAccount] = useState(false)
  const [date, setDate] = useState<Date>()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate adding a new tenant
    setTimeout(() => {
      setIsSubmitting(false)
      toast({
        title: "Thêm khách thuê thành công",
        description: "Khách thuê mới đã được thêm vào hệ thống",
      })
      router.push("/dashboard/tenants")
    }, 1500)
  }

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-2xl">
        <h1 className="text-2xl font-bold tracking-tight mb-6">Thêm khách thuê mới</h1>

        <form onSubmit={handleSubmit}>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Thông tin cá nhân</CardTitle>
              <CardDescription>Nhập thông tin chi tiết về khách thuê mới</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">
                  Họ và tên <span className="text-red-500">*</span>
                </Label>
                <Input id="name" placeholder="Nhập họ và tên đầy đủ" required />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="idCard">
                    Số CCCD/CMND <span className="text-red-500">*</span>
                  </Label>
                  <Input id="idCard" placeholder="Nhập số CCCD/CMND" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">
                    Số điện thoại <span className="text-red-500">*</span>
                  </Label>
                  <Input id="phone" placeholder="Nhập số điện thoại" required />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="Nhập địa chỉ email" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dob">Ngày sinh</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, "dd/MM/yyyy", { locale: vi }) : "Chọn ngày sinh"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label>Giới tính</Label>
                  <RadioGroup defaultValue="male" className="flex gap-4">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="male" id="male" />
                      <Label htmlFor="male">Nam</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="female" id="female" />
                      <Label htmlFor="female">Nữ</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="other" id="other" />
                      <Label htmlFor="other">Khác</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="hometown">Quê quán</Label>
                <Input id="hometown" placeholder="Nhập quê quán" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="note">Ghi chú</Label>
                <Textarea id="note" placeholder="Nhập ghi chú (nếu có)" />
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Tài khoản đăng nhập</CardTitle>
              <CardDescription>Tạo tài khoản đăng nhập cho khách thuê</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="createAccount"
                  checked={createAccount}
                  onCheckedChange={(checked) => setCreateAccount(checked as boolean)}
                />
                <Label htmlFor="createAccount">Tạo tài khoản đăng nhập cho khách thuê này</Label>
              </div>

              {createAccount && (
                <div className="space-y-4 pt-2">
                  <div className="space-y-2">
                    <Label htmlFor="username">
                      Tên đăng nhập <span className="text-red-500">*</span>
                    </Label>
                    <Input id="username" placeholder="Nhập tên đăng nhập" required={createAccount} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">
                      Mật khẩu <span className="text-red-500">*</span>
                    </Label>
                    <Input id="password" type="password" placeholder="Nhập mật khẩu" required={createAccount} />
                    <p className="text-xs text-muted-foreground">
                      Mật khẩu sẽ được gửi cho khách thuê. Họ có thể thay đổi sau khi đăng nhập.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-between">
            <Button type="button" variant="outline" onClick={() => router.push("/dashboard/tenants")}>
              Hủy
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Đang xử lý..." : "Thêm khách thuê"}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}
