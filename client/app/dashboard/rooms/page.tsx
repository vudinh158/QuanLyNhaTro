import DashboardLayout from "@/components/dashboard/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Plus, Search } from "lucide-react"
import Link from "next/link"

export default function RoomsPage() {
  return (
    <DashboardLayout>
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Quản lý phòng</h1>
          <Button asChild>
            <Link href="/dashboard/rooms/new">
              <Plus className="mr-2 h-4 w-4" />
              Thêm phòng
            </Link>
          </Button>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input type="search" placeholder="Tìm kiếm phòng..." className="w-full pl-8" />
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
              <SelectItem value="available">Còn trống</SelectItem>
              <SelectItem value="occupied">Đang thuê</SelectItem>
              <SelectItem value="maintenance">Đang sửa chữa</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[
            {
              id: 1,
              name: "P101",
              property: "Nhà trọ Minh Tâm",
              type: "Phòng đơn",
              status: "occupied",
              tenant: "Nguyễn Văn B",
              price: "2,500,000 VNĐ/tháng",
              area: "20m²",
            },
            {
              id: 2,
              name: "P102",
              property: "Nhà trọ Minh Tâm",
              type: "Phòng đôi",
              status: "available",
              tenant: null,
              price: "3,500,000 VNĐ/tháng",
              area: "25m²",
            },
            {
              id: 3,
              name: "P201",
              property: "Nhà trọ Minh Tâm",
              type: "Phòng đơn",
              status: "maintenance",
              tenant: null,
              price: "2,500,000 VNĐ/tháng",
              area: "20m²",
            },
            {
              id: 4,
              name: "P202",
              property: "Nhà trọ Minh Tâm",
              type: "Phòng đôi",
              status: "occupied",
              tenant: "Trần Thị C",
              price: "3,500,000 VNĐ/tháng",
              area: "25m²",
            },
            {
              id: 5,
              name: "P101",
              property: "Nhà trọ Thành Công",
              type: "Phòng đơn",
              status: "occupied",
              tenant: "Lê Văn D",
              price: "2,300,000 VNĐ/tháng",
              area: "18m²",
            },
            {
              id: 6,
              name: "P102",
              property: "Nhà trọ Thành Công",
              type: "Phòng đơn",
              status: "available",
              tenant: null,
              price: "2,300,000 VNĐ/tháng",
              area: "18m²",
            },
          ].map((room) => (
            <Card key={room.id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-lg">{room.name}</h3>
                    <Badge
                      variant={
                        room.status === "available" ? "outline" : room.status === "occupied" ? "default" : "secondary"
                      }
                    >
                      {room.status === "available"
                        ? "Còn trống"
                        : room.status === "occupied"
                          ? "Đang thuê"
                          : "Đang sửa chữa"}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">{room.property}</p>

                  <div className="grid gap-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Loại phòng:</span>
                      <span>{room.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Giá thuê:</span>
                      <span>{room.price}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Diện tích:</span>
                      <span>{room.area}</span>
                    </div>
                    {room.tenant && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Người thuê:</span>
                        <span>{room.tenant}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex border-t">
                  <Button variant="ghost" className="flex-1 rounded-none h-12" asChild>
                    <Link href={`/dashboard/rooms/${room.id}`}>Chi tiết</Link>
                  </Button>
                  <div className="w-px bg-border" />
                  <Button variant="ghost" className="flex-1 rounded-none h-12" asChild>
                    <Link href={`/dashboard/rooms/${room.id}/edit`}>Chỉnh sửa</Link>
                  </Button>
                  {room.status === "available" && (
                    <>
                      <div className="w-px bg-border" />
                      <Button variant="ghost" className="flex-1 rounded-none h-12" asChild>
                        <Link href={`/dashboard/contracts/new?room=${room.id}`}>Tạo hợp đồng</Link>
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
