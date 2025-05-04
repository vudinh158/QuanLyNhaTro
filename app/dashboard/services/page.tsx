import DashboardLayout from "@/components/dashboard/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Zap } from "lucide-react"
import Link from "next/link"

export default function ServicesPage() {
  return (
    <DashboardLayout>
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Quản lý dịch vụ</h1>
          <Button asChild>
            <Link href="/dashboard/services/new">
              <Plus className="mr-2 h-4 w-4" />
              Thêm dịch vụ
            </Link>
          </Button>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input type="search" placeholder="Tìm kiếm dịch vụ..." className="w-full pl-8" />
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
          <Select defaultValue="all-types">
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Loại dịch vụ" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-types">Tất cả loại</SelectItem>
              <SelectItem value="monthly">Cố định hàng tháng</SelectItem>
              <SelectItem value="usage">Theo số lượng sử dụng</SelectItem>
              <SelectItem value="incident">Sự cố/Sửa chữa</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[
            {
              id: 1,
              name: "Internet",
              type: "monthly",
              unit: "Tháng",
              price: "150,000 VNĐ",
              property: null,
            },
            {
              id: 2,
              name: "Dọn vệ sinh",
              type: "usage",
              unit: "Lần",
              price: "100,000 VNĐ",
              property: null,
            },
            {
              id: 3,
              name: "Giặt ủi",
              type: "usage",
              unit: "Kg",
              price: "20,000 VNĐ",
              property: null,
            },
            {
              id: 4,
              name: "Sửa chữa thiết bị",
              type: "incident",
              unit: "Lần",
              price: "Theo thực tế",
              property: null,
            },
            {
              id: 5,
              name: "Giữ xe",
              type: "monthly",
              unit: "Tháng",
              price: "100,000 VNĐ",
              property: "Nhà trọ Minh Tâm",
            },
            {
              id: 6,
              name: "Dọn phòng",
              type: "usage",
              unit: "Lần",
              price: "80,000 VNĐ",
              property: "Nhà trọ Thành Công",
            },
          ].map((service) => (
            <Card key={service.id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                      <Zap className="h-4 w-4 text-primary" />
                      {service.name}
                    </h3>
                    <Badge
                      variant={
                        service.type === "monthly" ? "default" : service.type === "usage" ? "outline" : "secondary"
                      }
                    >
                      {service.type === "monthly"
                        ? "Cố định hàng tháng"
                        : service.type === "usage"
                          ? "Theo số lượng sử dụng"
                          : "Sự cố/Sửa chữa"}
                    </Badge>
                  </div>

                  <div className="grid gap-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Đơn vị tính:</span>
                      <span>{service.unit}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Đơn giá:</span>
                      <span>{service.price}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Áp dụng cho:</span>
                      <span>{service.property || "Tất cả nhà trọ"}</span>
                    </div>
                  </div>
                </div>

                <div className="flex border-t">
                  <Button variant="ghost" className="flex-1 rounded-none h-12" asChild>
                    <Link href={`/dashboard/services/${service.id}/edit`}>Chỉnh sửa</Link>
                  </Button>
                  <div className="w-px bg-border" />
                  <Button variant="ghost" className="flex-1 rounded-none h-12" asChild>
                    <Link href={`/dashboard/services/${service.id}/usage`}>Ghi nhận sử dụng</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}
