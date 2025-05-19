"use client"

import type React from "react"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import DashboardLayout from "@/components/dashboard/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"

export default function NewNotificationPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const replyTo = searchParams.get("reply")

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Giả lập gửi thông báo thành công
    setTimeout(() => {
      setIsSubmitting(false)
      toast({
        title: "Gửi yêu cầu thành công",
        description: "Yêu cầu của bạn đã được gửi đến chủ trọ",
      })
      router.push("/tenant/notifications")
    }, 1500)
  }

  return (
    <DashboardLayout userRole="tenant">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-2xl font-bold tracking-tight mb-6">Gửi yêu cầu mới</h1>

        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Thông tin yêu cầu</CardTitle>
              <CardDescription>Nhập thông tin chi tiết về yêu cầu của bạn</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="recipient">
                  Người nhận <span className="text-red-500">*</span>
                </Label>
                <Select defaultValue="admin" required>
                  <SelectTrigger id="recipient">
                    <SelectValue placeholder="Chọn người nhận" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Chủ trọ</SelectItem>
                    <SelectItem value="manager">Quản lý</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">
                  Loại yêu cầu <span className="text-red-500">*</span>
                </Label>
                <Select defaultValue={replyTo ? "reply" : "repair"} required>
                  <SelectTrigger id="type">
                    <SelectValue placeholder="Chọn loại yêu cầu" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="repair">Sửa chữa</SelectItem>
                    <SelectItem value="complaint">Khiếu nại</SelectItem>
                    <SelectItem value="question">Câu hỏi</SelectItem>
                    <SelectItem value="suggestion">Đề xuất</SelectItem>
                    <SelectItem value="reply">Phản hồi</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">
                  Tiêu đề <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="title"
                  placeholder="Nhập tiêu đề yêu cầu"
                  required
                  defaultValue={replyTo ? "Phản hồi: Thông báo tăng giá điện" : ""}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">
                  Nội dung <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="content"
                  placeholder="Nhập nội dung chi tiết yêu cầu của bạn"
                  className="min-h-[150px]"
                  required
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button type="button" variant="outline" onClick={() => router.push("/tenant/notifications")}>
                Hủy
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Đang gửi..." : "Gửi yêu cầu"}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </div>
    </DashboardLayout>
  )
}
