"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import DashboardLayout from "@/components/dashboard/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, FileText, Home, Printer, Trash2, User, Wallet } from "lucide-react"
import Link from "next/link"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/components/ui/use-toast"

export default function BillDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [isDeleting, setIsDeleting] = useState(false)

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
    total: "3,250,000 VNĐ",
    paid: "0 VNĐ",
    remaining: "3,250,000 VNĐ",
    status: "unpaid",
    isOverdue: false,
    note: "Hóa đơn tháng 4/2025",
    items: [
      { id: 1, name: "Tiền thuê phòng", amount: 2500000, quantity: 1, total: 2500000 },
      { id: 2, name: "Tiền điện", amount: 4000, quantity: 150, total: 600000 },
      { id: 3, name: "Tiền nước", amount: 15000, quantity: 10, total: 150000 },
    ],
    payments: [],
  }

  const handleDelete = () => {
    setIsDeleting(true)

    // Giả lập xóa hóa đơn
    setTimeout(() => {
      setIsDeleting(false)
      toast({
        title: "Xóa hóa đơn thành công",
        description: "Hóa đơn đã được xóa khỏi hệ thống",
      })
      router.push("/dashboard/bills")
    }, 1500)
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wallet className="h-6 w-6" />
            <h1 className="text-2xl font-bold tracking-tight">Hóa đơn {bill.id}</h1>
            <Badge
              variant={
                bill.status === "paid"
                  ? "default"
                  : bill.status === "partial"
                    ? "outline"
                    : bill.isOverdue
                      ? "destructive"
                      : "secondary"
              }
            >
              {bill.status === "paid"
                ? "Đã thanh toán đủ"
                : bill.status === "partial"
                  ? "Đã thanh toán một phần"
                  : bill.isOverdue
                    ? "Quá hạn"
                    : "Chưa thanh toán"}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handlePrint}>
              <Printer className="mr-2 h-4 w-4" />
              In hóa đơn
            </Button>
            {bill.status !== "paid" && (
              <Button asChild>
                <Link href={`/dashboard/bills/${params.id}/payment`}>
                  <Wallet className="mr-2 h-4 w-4" />
                  Thanh toán
                </Link>
              </Button>
            )}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Xóa
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Bạn có chắc chắn muốn xóa?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Hành động này không thể hoàn tác. Hóa đơn này sẽ bị xóa vĩnh viễn khỏi hệ thống.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Hủy</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    disabled={isDeleting}
                  >
                    {isDeleting ? "Đang xóa..." : "Xóa"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Thông tin hóa đơn</CardTitle>
              <CardDescription>Chi tiết về hóa đơn {bill.id}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-2">Thông tin cơ bản</h3>
                    <div className="grid gap-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Mã hóa đơn:</span>
                        <span>{bill.id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Phòng:</span>
                        <span>{bill.room}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Nhà trọ:</span>
                        <span>{bill.property}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Người thuê:</span>
                        <span>{bill.tenant}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Mã hợp đồng:</span>
                        <span>{bill.contractId}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium mb-2">Ghi chú</h3>
                    <p className="text-sm">{bill.note}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-2">Thông tin thanh toán</h3>
                    <div className="grid gap-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Kỳ thanh toán:</span>
                        <span>{bill.period}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Ngày tạo:</span>
                        <span>{bill.createdDate}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Hạn thanh toán:</span>
                        <span className={bill.isOverdue ? "text-red-500 font-medium flex items-center gap-1" : ""}>
                          {bill.isOverdue && <AlertCircle className="h-3 w-3" />}
                          {bill.dueDate}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium mb-2">Tổng quan</h3>
                    <div className="grid gap-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Tổng tiền:</span>
                        <span>{bill.total}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Đã thanh toán:</span>
                        <span>{bill.paid}</span>
                      </div>
                      <div className="flex justify-between font-medium">
                        <span>Còn lại:</span>
                        <span>{bill.remaining}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Chi tiết các khoản</CardTitle>
              <CardDescription>Danh sách các khoản trong hóa đơn</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border">
                <div className="grid grid-cols-12 gap-2 p-3 font-medium text-sm border-b">
                  <div className="col-span-5">Khoản mục</div>
                  <div className="col-span-3 text-right">Đơn giá</div>
                  <div className="col-span-2 text-right">Số lượng</div>
                  <div className="col-span-2 text-right">Thành tiền</div>
                </div>

                {bill.items.map((item) => (
                  <div key={item.id} className="grid grid-cols-12 gap-2 p-3 border-b last:border-0 items-center">
                    <div className="col-span-5">{item.name}</div>
                    <div className="col-span-3 text-right">{item.amount.toLocaleString("vi-VN")} VNĐ</div>
                    <div className="col-span-2 text-right">{item.quantity}</div>
                    <div className="col-span-2 text-right">{item.total.toLocaleString("vi-VN")} VNĐ</div>
                  </div>
                ))}

                <div className="grid grid-cols-12 gap-2 p-3 font-medium border-t">
                  <div className="col-span-10 text-right">Tổng cộng:</div>
                  <div className="col-span-2 text-right">
                    {bill.items.reduce((sum, item) => sum + item.total, 0).toLocaleString("vi-VN")} VNĐ
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Lịch sử thanh toán</CardTitle>
              <CardDescription>Danh sách các lần thanh toán</CardDescription>
            </CardHeader>
            <CardContent>
              {bill.payments.length > 0 ? (
                <div className="rounded-lg border">
                  <div className="grid grid-cols-12 gap-2 p-3 font-medium text-sm border-b">
                    <div className="col-span-3">Ngày thanh toán</div>
                    <div className="col-span-3">Phương thức</div>
                    <div className="col-span-4">Ghi chú</div>
                    <div className="col-span-2 text-right">Số tiền</div>
                  </div>

                  {bill.payments.map((payment, index) => (
                    <div key={index} className="grid grid-cols-12 gap-2 p-3 border-b last:border-0 items-center">
                      <div className="col-span-3">{payment.date}</div>
                      <div className="col-span-3">{payment.method}</div>
                      <div className="col-span-4">{payment.note}</div>
                      <div className="col-span-2 text-right">{payment.amount.toLocaleString("vi-VN")} VNĐ</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Wallet className="mx-auto h-12 w-12 text-muted-foreground/50" />
                  <h3 className="mt-4 text-lg font-medium">Chưa có thanh toán</h3>
                  <p className="mt-2 text-sm text-muted-foreground">Hóa đơn này chưa có lịch sử thanh toán nào.</p>
                  <Button className="mt-4" asChild>
                    <Link href={`/dashboard/bills/${params.id}/payment`}>Thanh toán ngay</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" asChild>
              <Link href={`/dashboard/contracts/${bill.contractId}`}>
                <FileText className="mr-2 h-4 w-4" />
                Xem hợp đồng
              </Link>
            </Button>
            <Button variant="outline" className="flex-1" asChild>
              <Link href={`/dashboard/rooms/${bill.room}`}>
                <Home className="mr-2 h-4 w-4" />
                Xem phòng
              </Link>
            </Button>
            <Button variant="outline" className="flex-1" asChild>
              <Link href={`/dashboard/tenants/${bill.tenant}`}>
                <User className="mr-2 h-4 w-4" />
                Xem khách thuê
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
