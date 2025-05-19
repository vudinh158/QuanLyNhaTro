import DashboardLayout from "@/components/dashboard/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Plus, Search } from "lucide-react"
import Link from "next/link"

export default function ContractsPage() {
  return (
    <DashboardLayout>
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Quản lý hợp đồng</h1>
          <Button asChild>
            <Link href="/dashboard/contracts/new">
              <Plus className="mr-2 h-4 w-4" />
              Tạo hợp đồng
            </Link>
          </Button>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input type="search" placeholder="Tìm kiếm hợp đồng..." className="w-full pl-8" />
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
              <SelectItem value="active">Có hiệu lực</SelectItem>
              <SelectItem value="pending">Mới tạo</SelectItem>
              <SelectItem value="expired">Hết hiệu lực</SelectItem>
              <SelectItem value="terminated">Đã thanh lý</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-4">
          {[
            {
              id: "HD001",
              room: "P101",
              property: "Nhà trọ Minh Tâm",
              tenant: "Nguyễn Văn B",
              startDate: "01/01/2025",
              endDate: "15/05/2025",
              rent: "2,500,000 VNĐ/tháng",
              deposit: "5,000,000 VNĐ",
              status: "active",
              roommates: 2,
            },
            {
              id: "HD002",
              room: "P202",
              property: "Nhà trọ Minh Tâm",
              tenant: "Trần Thị C",
              startDate: "15/02/2025",
              endDate: "20/05/2025",
              rent: "3,500,000 VNĐ/tháng",
              deposit: "7,000,000 VNĐ",
              status: "active",
              roommates: 1,
            },
            {
              id: "HD003",
              room: "P101",
              property: "Nhà trọ Thành Công",
              tenant: "Lê Văn D",
              startDate: "01/03/2025",
              endDate: "01/06/2025",
              rent: "2,300,000 VNĐ/tháng",
              deposit: "4,600,000 VNĐ",
              status: "active",
              roommates: 3,
            },
            {
              id: "HD004",
              room: "P103",
              property: "Nhà trọ Minh Tâm",
              tenant: "Phạm Thị E",
              startDate: "01/01/2024",
              endDate: "01/01/2025",
              rent: "2,500,000 VNĐ/tháng",
              deposit: "5,000,000 VNĐ",
              status: "expired",
              roommates: 1,
            },
            {
              id: "HD005",
              room: "P102",
              property: "Nhà trọ Thành Công",
              tenant: "Ngô Thị G",
              startDate: "15/04/2025",
              endDate: "15/10/2025",
              rent: "2,300,000 VNĐ/tháng",
              deposit: "4,600,000 VNĐ",
              status: "active",
              roommates: 2,
            },
          ].map((contract) => (
            <Card key={contract.id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{contract.id}</h3>
                        <Badge
                          variant={
                            contract.status === "active"
                              ? "default"
                              : contract.status === "pending"
                                ? "outline"
                                : contract.status === "expired"
                                  ? "secondary"
                                  : "destructive"
                          }
                        >
                          {contract.status === "active"
                            ? "Có hiệu lực"
                            : contract.status === "pending"
                              ? "Mới tạo"
                              : contract.status === "expired"
                                ? "Hết hiệu lực"
                                : "Đã thanh lý"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {contract.room} - {contract.property}
                      </p>
                    </div>
                    <div className="text-sm">
                      <span className="text-muted-foreground">Thời hạn:</span>{" "}
                      <span>
                        {contract.startDate} - {contract.endDate}
                      </span>
                    </div>
                  </div>

                  <div className="grid gap-2 md:grid-cols-2">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Người đại diện:</span>
                        <span>{contract.tenant}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Số người ở cùng:</span>
                        <span>{contract.roommates} người</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Tiền thuê:</span>
                        <span>{contract.rent}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Tiền cọc:</span>
                        <span>{contract.deposit}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex border-t">
                  <Button variant="ghost" className="flex-1 rounded-none h-12" asChild>
                    <Link href={`/dashboard/contracts/${contract.id}`}>Chi tiết</Link>
                  </Button>
                  {contract.status === "active" && (
                    <>
                      <div className="w-px bg-border" />
                      <Button variant="ghost" className="flex-1 rounded-none h-12" asChild>
                        <Link href={`/dashboard/bills/new?contract=${contract.id}`}>Tạo hóa đơn</Link>
                      </Button>
                      <div className="w-px bg-border" />
                      <Button variant="ghost" className="flex-1 rounded-none h-12" asChild>
                        <Link href={`/dashboard/contracts/${contract.id}/terminate`}>Thanh lý</Link>
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
