import DashboardLayout from "@/components/dashboard/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, Search } from "lucide-react"
import Link from "next/link"

export default function TenantBillsPage() {
  return (
    <DashboardLayout userRole="tenant">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Hóa đơn của tôi</h1>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input type="search" placeholder="Tìm kiếm hóa đơn..." className="w-full pl-8" />
          </div>
          <Select defaultValue="all-status">
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-status">Tất cả trạng thái</SelectItem>
              <SelectItem value="unpaid">Chưa thanh toán</SelectItem>
              <SelectItem value="paid">Đã thanh toán</SelectItem>
              <SelectItem value="overdue">Quá hạn</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-4">
          {[
            {
              id: "HĐ001",
              period: "01/04/2025 - 30/04/2025",
              dueDate: "10/05/2025",
              total: "3,250,000 VNĐ",
              paid: "0 VNĐ",
              remaining: "3,250,000 VNĐ",
              status: "unpaid",
              isOverdue: false,
            },
            {
              id: "HĐ005",
              period: "01/03/2025 - 31/03/2025",
              dueDate: "10/04/2025",
              total: "3,150,000 VNĐ",
              paid: "3,150,000 VNĐ",
              remaining: "0 VNĐ",
              status: "paid",
              isOverdue: false,
            },
            {
              id: "HĐ009",
              period: "01/02/2025 - 28/02/2025",
              dueDate: "10/03/2025",
              total: "3,100,000 VNĐ",
              paid: "3,100,000 VNĐ",
              remaining: "0 VNĐ",
              status: "paid",
              isOverdue: false,
            },
            {
              id: "HĐ013",
              period: "01/01/2025 - 31/01/2025",
              dueDate: "10/02/2025",
              total: "3,100,000 VNĐ",
              paid: "3,100,000 VNĐ",
              remaining: "0 VNĐ",
              status: "paid",
              isOverdue: false,
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
                          variant={bill.status === "paid" ? "default" : bill.isOverdue ? "destructive" : "secondary"}
                        >
                          {bill.status === "paid" ? "Đã thanh toán" : bill.isOverdue ? "Quá hạn" : "Chưa thanh toán"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">Kỳ thanh toán: {bill.period}</p>
                    </div>
                    <div className="text-sm">
                      <span className="text-muted-foreground">Hạn thanh toán:</span>{" "}
                      <span className={bill.isOverdue ? "text-red-500 font-medium flex items-center gap-1" : ""}>
                        {bill.isOverdue && <AlertCircle className="h-3 w-3" />}
                        {bill.dueDate}
                      </span>
                    </div>
                  </div>

                  <div className="grid gap-2 md:grid-cols-3">
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

                <div className="flex border-t">
                  <Button variant="ghost" className="flex-1 rounded-none h-12" asChild>
                    <Link href={`/tenant/bills/${bill.id}`}>Chi tiết</Link>
                  </Button>
                  {bill.status !== "paid" && (
                    <>
                      <div className="w-px bg-border" />
                      <Button variant="ghost" className="flex-1 rounded-none h-12" asChild>
                        <Link href={`/tenant/bills/${bill.id}/payment`}>Thanh toán</Link>
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
