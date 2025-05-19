import DashboardLayout from "@/components/dashboard/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Plus, Search } from "lucide-react"
import Link from "next/link"

export default function PropertiesPage() {
  return (
    <DashboardLayout>
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Quản lý nhà trọ</h1>
          <Button asChild>
            <Link href="/dashboard/properties/new">
              <Plus className="mr-2 h-4 w-4" />
              Thêm nhà trọ
            </Link>
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input type="search" placeholder="Tìm kiếm nhà trọ..." className="w-full pl-8" />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[
            {
              id: 1,
              name: "Nhà trọ Minh Tâm",
              address: "123 Nguyễn Văn Cừ, Quận 5, TP.HCM",
              rooms: 10,
              occupied: 8,
              electricityPrice: "4,000 VNĐ/kWh",
              waterPrice: "15,000 VNĐ/m³",
            },
            {
              id: 2,
              name: "Nhà trọ Thành Công",
              address: "456 Lê Hồng Phong, Quận 10, TP.HCM",
              rooms: 8,
              occupied: 7,
              electricityPrice: "3,800 VNĐ/kWh",
              waterPrice: "14,000 VNĐ/m³",
            },
            {
              id: 3,
              name: "Nhà trọ Phú Quý",
              address: "789 Lý Thường Kiệt, Quận 11, TP.HCM",
              rooms: 6,
              occupied: 4,
              electricityPrice: "4,200 VNĐ/kWh",
              waterPrice: "16,000 VNĐ/m³",
            },
          ].map((property) => (
            <Card key={property.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle>{property.name}</CardTitle>
                <CardDescription className="line-clamp-1">{property.address}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Số phòng:</span>
                    <span className="font-medium">{property.rooms}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Đang thuê:</span>
                    <span className="font-medium">{property.occupied}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Giá điện:</span>
                    <span className="font-medium">{property.electricityPrice}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Giá nước:</span>
                    <span className="font-medium">{property.waterPrice}</span>
                  </div>
                  <div className="mt-2 flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1" asChild>
                      <Link href={`/dashboard/properties/${property.id}`}>Chi tiết</Link>
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1" asChild>
                      <Link href={`/dashboard/properties/${property.id}/edit`}>Chỉnh sửa</Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}
