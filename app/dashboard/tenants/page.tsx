import DashboardLayout from "@/components/dashboard/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Plus, Search } from "lucide-react"
import Link from "next/link"

export default function TenantsPage() {
  return (
    <DashboardLayout>
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Quản lý khách thuê</h1>
          <Button asChild>
            <Link href="/dashboard/tenants/new">
              <Plus className="mr-2 h-4 w-4" />
              Thêm khách thuê
            </Link>
          </Button>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input type="search" placeholder="Tìm kiếm khách thuê..." className="w-full pl-8" />
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
              <SelectItem value="active">Hoạt động</SelectItem>
              <SelectItem value="inactive">Ngừng hoạt động</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-4">
          {[
            {
              id: 1,
              name: "Nguyễn Văn B",
              idCard: "079201001234",
              phone: "0901234567",
              email: "nguyenvanb@example.com",
              room: "P101",
              property: "Nhà trọ Minh Tâm",
              status: "active",
              hasAccount: true,
            },
            {
              id: 2,
              name: "Trần Thị C",
              idCard: "079201005678",
              phone: "0902345678",
              email: "tranthic@example.com",
              room: "P202",
              property: "Nhà trọ Minh Tâm",
              status: "active",
              hasAccount: true,
            },
            {
              id: 3,
              name: "Lê Văn D",
              idCard: "079201009012",
              phone: "0903456789",
              email: null,
              room: "P101",
              property: "Nhà trọ Thành Công",
              status: "active",
              hasAccount: false,
            },
            {
              id: 4,
              name: "Phạm Thị E",
              idCard: "079201003456",
              phone: "0904567890",
              email: "phamthie@example.com",
              room: null,
              property: null,
              status: "inactive",
              hasAccount: false,
            },
            {
              id: 5,
              name: "Hoàng Văn F",
              idCard: "079201007890",
              phone: "0905678901",
              email: "hoangvanf@example.com",
              room: "P103",
              property: "Nhà trọ Minh Tâm",
              status: "active",
              hasAccount: true,
            },
          ].map((tenant) => (
            <Card key={tenant.id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="p-4">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-10 w-10 border">
                      <AvatarImage src={`/placeholder.svg?text=${tenant.name.charAt(0)}`} alt={tenant.name} />
                      <AvatarFallback>{tenant.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{tenant.name}</h3>
                          <Badge variant={tenant.status === "active" ? "default" : "secondary"}>
                            {tenant.status === "active" ? "Hoạt động" : "Ngừng hoạt động"}
                          </Badge>
                          {tenant.hasAccount && <Badge variant="outline">Có tài khoản</Badge>}
                        </div>
                      </div>
                      <div className="mt-1 grid gap-1 text-sm">
                        <div className="flex items-center gap-1">
                          <span className="text-muted-foreground">CCCD:</span>
                          <span>{tenant.idCard}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-muted-foreground">SĐT:</span>
                          <span>{tenant.phone}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-muted-foreground">Email:</span>
                          <span>{tenant.email || "Không có"}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-muted-foreground">Phòng:</span>
                          <span>
                            {tenant.room && tenant.property ? `${tenant.room} - ${tenant.property}` : "Không có phòng"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex border-t">
                  <Button variant="ghost" className="flex-1 rounded-none h-12" asChild>
                    <Link href={`/dashboard/tenants/${tenant.id}`}>Chi tiết</Link>
                  </Button>
                  <div className="w-px bg-border" />
                  <Button variant="ghost" className="flex-1 rounded-none h-12" asChild>
                    <Link href={`/dashboard/tenants/${tenant.id}/edit`}>Chỉnh sửa</Link>
                  </Button>
                  {!tenant.room && tenant.status === "active" && (
                    <>
                      <div className="w-px bg-border" />
                      <Button variant="ghost" className="flex-1 rounded-none h-12" asChild>
                        <Link href={`/dashboard/contracts/new?tenant=${tenant.id}`}>Tạo hợp đồng</Link>
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
