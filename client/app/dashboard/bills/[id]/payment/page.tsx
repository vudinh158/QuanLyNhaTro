"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import DashboardLayout from "@/components/dashboard/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, ArrowLeft } from "lucide-react"

export default function BillPaymentPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [paymentAmount, setPaymentAmount] = useState<string>("")

  // Giả lập dữ liệu hóa đơn
  const bill = {
    id: params.id,
    contractId: "HD001",
    room: "P101",
    property: "Nhà trọ Minh Tâm",
    tenant: "Nguyễn Văn B",
    period: "01/04/2025 - 30/04/2025",
    createdDate: "01/04/2025",
    dueDate: "10/05/2025",
    total: 3250000,
    paid: 0,
    remaining: 3250000,
    status: "unpaid",
    isOverdue: false,
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Giả lập thanh toán hóa đơn
    setTimeout(() => {
      setIsSubmitting(false)
      toast({
        title: "Thanh toán thành công",
        description: "Hóa đơn đã được thanh toán thành công",
      })
      router.push(`/dashboard/bills/${params.id}`)
    }, 1500)
  }

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-2xl">
        <div className="flex items-center gap-2 mb-6">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">Thanh toán hóa đơn</h1>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Thông tin hóa đơn</CardTitle>
              <CardDescription>Chi tiết về hóa đơn cần thanh toán</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Mã hóa đơn: {bill.id}</h3>
                <Badge variant={bill.isOverdue ? "destructive" : "secondary"}>
                  {bill.isOverdue ? "Quá hạn" : "Chưa thanh toán"}
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Phòng:</span>
                    <span>
                      {bill.room} - {bill.property}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Người thuê:</span>
                    <span>{bill.tenant}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Kỳ thanh toán:</span>
                    <span>{bill.period}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Hạn thanh toán:</span>
                    <span className={bill.isOverdue ? "text-red-500 font-medium flex items-center gap-1" : ""}>
                      {bill.isOverdue && <AlertCircle className="h-3 w-3" />}
                      {bill.dueDate}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tổng tiền:</span>
                    <span>{bill.total.toLocaleString("vi-VN")} VNĐ</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Đã thanh toán:</span>
                    <span>{bill.paid.toLocaleString("vi-VN")} VNĐ</span>
                  </div>
                  <div className="flex justify-between font-medium">
                    <span>Còn lại:</span>
                    <span>{bill.remaining.toLocaleString("vi-VN")} VNĐ</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <form onSubmit={handleSubmit}>
            <Card>
              <CardHeader>
                <CardTitle>Thông tin thanh toán</CardTitle>
                <CardDescription>Nhập thông tin chi tiết về thanh toán</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">
                    Số tiền thanh toán <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="Nhập số tiền thanh toán"
                    min="0"
                    max={bill.remaining}
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    required
                  />
                  <div className="flex justify-between text-xs">
                    <span>Tối thiểu: 0 VNĐ</span>
                    <Button
                      type="button"
                      variant="link"
                      size="sm"
                      className="h-auto p-0 text-xs"
                      onClick={() => setPaymentAmount(bill.remaining.toString())}
                    >
                      Thanh toán đủ: {bill.remaining.toLocaleString("vi-VN")} VNĐ
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="method">
                    Phương thức thanh toán <span className="text-red-500">*</span>
                  </Label>
                  <Select required>
                    <SelectTrigger id="method">
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
                  <Label htmlFor="paymentDate">
                    Ngày thanh toán <span className="text-red-500">*</span>
                  </Label>
                  <Input id="paymentDate" type="date" required defaultValue={new Date().toISOString().split("T")[0]} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="note">Ghi chú</Label>
                  <Textarea id="note" placeholder="Nhập ghi chú (nếu có)" />
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button type="button" variant="outline" onClick={() => router.back()}>
                  Hủy
                </Button>
                <Button type="submit" disabled={isSubmitting || !paymentAmount}>
                  {isSubmitting ? "Đang xử lý..." : "Xác nhận thanh toán"}
                </Button>
              </CardFooter>
            </Card>
          </form>
        </div>
      </div>
    </DashboardLayout>
  )
}
