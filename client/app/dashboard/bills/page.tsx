import DashboardLayout from "@/components/dashboard/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, Plus, Search } from "lucide-react"
import Link from "next/link"

export default function BillsPage() {
  return (
    // <DashboardLayout>
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Quản lý hóa đơn</h1>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href="/dashboard/bills/create-period">Tạo hóa đơn định kỳ</Link>
            </Button>
            <Button asChild>
              <Link href="/dashboard/bills/new">
                <Plus className="mr-2 h-4 w-4" />
                Tạo hóa đơn
              </Link>
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input type="search" placeholder="Tìm kiếm hóa đơn..." className="w-full pl-8" />
          </div>
          <Select defaultValue="all-properties">
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Chọn nhà trọ" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-properties">Tất cả nhà trọ</SelectItem>
              <SelectItem value="1">Nhà trọ Minh Tâm</SelectItem>
              <SelectItem value="2">Nhà trọ Thành Công</SelectItem>
              <SelectItem value="3">Nhà trọ Phú Quý</SelectItem>
            </SelectContent>
          </Select>
          <Select defaultValue="all-status">
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-status">Tất cả trạng thái</SelectItem>
              <SelectItem value="unpaid">Chưa thanh toán</SelectItem>
              <SelectItem value="partial">Đã thanh toán một phần</SelectItem>
              <SelectItem value="paid">Đã thanh toán đủ</SelectItem>
              <SelectItem value="overdue">Quá hạn</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-4">
          {[
            {
              id: "HĐ001",
              room: "P101",
              property: "Nhà trọ Minh Tâm",
              tenant: "Nguyễn Văn B",
              period: "01/04/2025 - 30/04/2025",
              dueDate: "10/05/2025",
              total: "3,250,000 VNĐ",
              paid: "0 VNĐ",
              remaining: "3,250,000 VNĐ",
              status: "unpaid",
              isOverdue: false,
            },
            {
              id: "HĐ002",
              room: "P202",
              property: "Nhà trọ Minh Tâm",
              tenant: "Trần Thị C",
              period: "01/04/2025 - 30/04/2025",
              dueDate: "05/05/2025",
              total: "4,320,000 VNĐ",
              paid: "2,000,000 VNĐ",
              remaining: "2,320,000 VNĐ",
              status: "partial",
              isOverdue: true,
            },
            {
              id: "HĐ003",
              room: "P101",
              property: "Nhà trọ Thành Công",
              tenant: "Lê Văn D",
              period: "01/04/2025 - 30/04/2025",
              dueDate: "15/05/2025",
              total: "2,980,000 VNĐ",
              paid: "2,980,000 VNĐ",
              remaining: "0 VNĐ",
              status: "paid",
              isOverdue: false,
            },
            {
              id: "HĐ004",
              room: "P102",
              property: "Nhà trọ Thành Công",
              tenant: "Ngô Thị G",
              period: "01/04/2025 - 30/04/2025",
              dueDate: "15/05/2025",
              total: "2,850,000 VNĐ",
              paid: "0 VNĐ",
              remaining: "2,850,000 VNĐ",
              status: "unpaid",
              isOverdue: false,
            },
            {
              id: "HĐ005",
              room: "P103",
              property: "Nhà trọ Minh Tâm",
              tenant: "Hoàng Văn F",
              period: "01/03/2025 - 31/03/2025",
              dueDate: "10/04/2025",
              total: "3,150,000 VNĐ",
              paid: "0 VNĐ",
              remaining: "3,150,000 VNĐ",
              status: "unpaid",
              isOverdue: true,
            },
          ].map((bill) => (
            <Card key={bill.id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{bill.id}</h3>
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
                      <p className="text-sm text-muted-foreground">
                        {bill.room} - {bill.property}
                      </p>
                    </div>
                    <div className="text-sm">
                      <span className="text-muted-foreground">Kỳ thanh toán:</span> <span>{bill.period}</span>
                    </div>
                  </div>

                  <div className="grid gap-2 md:grid-cols-2">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Người thuê:</span>
                        <span>{bill.tenant}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Hạn thanh toán:</span>
                        <span className={bill.isOverdue ? "text-red-500 font-medium flex items-center gap-1" : ""}>
                          {bill.isOverdue && <AlertCircle className="h-3 w-3" />}
                          {bill.dueDate}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Tổng tiền:</span>
                        <span>{bill.total}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Đã thanh toán:</span>
                        <span>{bill.paid}</span>
                      </div>
                      <div className="flex justify-between text-sm font-medium">
                        <span>Còn lại:</span>
                        <span>{bill.remaining}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex border-t">
                  <Button variant="ghost" className="flex-1 rounded-none h-12" asChild>
                    <Link href={`/dashboard/bills/${bill.id}`}>Chi tiết</Link>
                  </Button>
                  {bill.status !== "paid" && (
                    <>
                      <div className="w-px bg-border" />
                      <Button variant="ghost" className="flex-1 rounded-none h-12" asChild>
                        <Link href={`/dashboard/bills/${bill.id}/payment`}>Thanh toán</Link>
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    // </DashboardLayout>
  )
}
