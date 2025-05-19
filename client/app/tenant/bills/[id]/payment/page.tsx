"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import DashboardLayout from "@/components/dashboard/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { ArrowLeft, CreditCard, Wallet } from "lucide-react"
import Link from "next/link"

export default function TenantBillPaymentPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState("cash")

  // Giả lập dữ liệu hóa đơn
  const bill = {
    id: params.id,
    room: "P101",
    property: "Nhà trọ Minh Tâm",
    period: "01/04/2025 - 30/04/2025",
    dueDate: "10/05/2025",
    total: 3250000,
    paid: 0,
    remaining: 3250000,
  }

  const [formData, setFormData] = useState({
    amount: bill.remaining,
    note: "",
  })

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Giả lập thanh toán thành công
    setTimeout(() => {
      setIsSubmitting(false)
      toast({
        title: "Thanh toán thành công",
        description: "Hóa đơn đã được thanh toán thành công",
      })
      router.push(`/tenant/bills/${params.id}`)
    }, 1500)
  }

  return (
    <DashboardLayout userRole="tenant">
      <div className="mx-auto max-w-2xl">
        <div className="flex items-center gap-2 mb-6">
          <Button variant="outline" size="icon" asChild>
            <Link href={`/tenant/bills/${params.id}`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">Thanh toán hóa đơn</h1>
        </div>

        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Thông tin thanh toán</CardTitle>
              <CardDescription>Thanh toán hóa đơn {bill.id}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-md bg-muted p-4">
                <div className="grid gap-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Mã hóa đơn:</span>
                    <span>{bill.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Phòng:</span>
                    <span>{bill.room}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Kỳ thanh toán:</span>
                    <span>{bill.period}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Hạn thanh toán:</span>
                    <span>{bill.dueDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tổng tiền:</span>
                    <span>{bill.total.toLocaleString("vi-VN")} VNĐ</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Đã thanh toán:</span>
                    <span>{bill.paid.toLocaleString("vi-VN")} VNĐ</span>
                  </div>
                  <div className="flex justify-between font-medium">
                    <span>Còn lại:</span>
                    <span>{bill.remaining.toLocaleString("vi-VN")} VNĐ</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">
                  Số tiền thanh toán (VNĐ) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="Nhập số tiền thanh toán"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: Number.parseInt(e.target.value) })}
                  min="1"
                  max={bill.remaining}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>
                  Phương thức thanh toán <span className="text-red-500">*</span>
                </Label>
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="flex flex-col space-y-2">
                  <div className="flex items-center space-x-2 rounded-md border p-3">
                    <RadioGroupItem value="cash" id="cash" />
                    <Label htmlFor="cash" className="flex-1 cursor-pointer">
                      <div className="flex items-center gap-2">
                        <Wallet className="h-4 w-4" />
                        <span>Tiền mặt</span>
                      </div>
                      <p className="text-sm text-muted-foreground">Thanh toán trực tiếp bằng tiền mặt</p>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 rounded-md border p-3">
                    <RadioGroupItem value="bank" id="bank" />
                    <Label htmlFor="bank" className="flex-1 cursor-pointer">
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4" />
                        <span>Chuyển khoản</span>
                      </div>
                      <p className="text-sm text-muted-foreground">Chuyển khoản qua ngân hàng</p>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {paymentMethod === "bank" && (
                <div className="rounded-md bg-muted p-4">
                  <h3 className="font-medium mb-2">Thông tin chuyển khoản</h3>
                  <div className="grid gap-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Ngân hàng:</span>
                      <span>Vietcombank</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Số tài khoản:</span>
                      <span>1234567890</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Chủ tài khoản:</span>
                      <span>NGUYEN VAN A</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Nội dung:</span>
                      <span>
                        {bill.id} {bill.room}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="note">Ghi chú</Label>
                <Textarea
                  id="note"
                  placeholder="Nhập ghi chú (nếu có)"
                  value={formData.note}
                  onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button type="button" variant="outline" onClick={() => router.push(`/tenant/bills/${params.id}`)}>
                Hủy
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Đang xử lý..." : "Xác nhận thanh toán"}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </div>
    </DashboardLayout>
  )
}
