"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import DashboardLayout from "@/components/dashboard/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Building2, Pencil, Plus, Trash2 } from "lucide-react"
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

export default function PropertyDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [isDeleting, setIsDeleting] = useState(false)

  // Giả lập dữ liệu nhà trọ
  const property = {
    id: params.id,
    name: "Nhà trọ Minh Tâm",
    address: "123 Nguyễn Văn Cừ, Quận 5, TP.HCM",
    rooms: 10,
    occupied: 8,
    electricityPrice: "4,000 VNĐ/kWh",
    waterPrice: "15,000 VNĐ/m³",
    note: "Nhà trọ gần trường đại học, thuận tiện đi lại.",
    createdAt: "01/01/2025",
  }

  // Giả lập dữ liệu phòng
  const rooms = [
    {
      id: 1,
      name: "P101",
      type: "Phòng đơn",
      status: "occupied",
      tenant: "Nguyễn Văn B",
      price: "2,500,000 VNĐ/tháng",
      area: "20m²",
    },
    {
      id: 2,
      name: "P102",
      type: "Phòng đôi",
      status: "available",
      tenant: null,
      price: "3,500,000 VNĐ/tháng",
      area: "25m²",
    },
    {
      id: 3,
      name: "P201",
      type: "Phòng đơn",
      status: "maintenance",
      tenant: null,
      price: "2,500,000 VNĐ/tháng",
      area: "20m²",
    },
  ]

  const handleDelete = () => {
    setIsDeleting(true)

    // Giả lập xóa nhà trọ
    setTimeout(() => {
      setIsDeleting(false)
      toast({
        title: "Xóa nhà trọ thành công",
        description: "Nhà trọ đã được xóa khỏi hệ thống",
      })
      router.push("/dashboard/properties")
    }, 1500)
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="h-6 w-6" />
            <h1 className="text-2xl font-bold tracking-tight">{property.name}</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" asChild>
              <Link href={`/dashboard/properties/${params.id}/edit`}>
                <Pencil className="mr-2 h-4 w-4" />
                Chỉnh sửa
              </Link>
            </Button>
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
                    Hành động này không thể hoàn tác. Nhà trọ này sẽ bị xóa vĩnh viễn khỏi hệ thống.
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

        <Tabs defaultValue="details">
          <TabsList>
            <TabsTrigger value="details">Thông tin chung</TabsTrigger>
            <TabsTrigger value="rooms">Danh sách phòng</TabsTrigger>
          </TabsList>
          <TabsContent value="details" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Thông tin nhà trọ</CardTitle>
                <CardDescription>Chi tiết về nhà trọ {property.name}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium mb-2">Thông tin cơ bản</h3>
                      <div className="grid gap-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Tên nhà trọ:</span>
                          <span>{property.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Địa chỉ:</span>
                          <span>{property.address}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Ngày tạo:</span>
                          <span>{property.createdAt}</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-medium mb-2">Ghi chú</h3>
                      <p className="text-sm">{property.note}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium mb-2">Thông tin phòng</h3>
                      <div className="grid gap-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Tổng số phòng:</span>
                          <span>{property.rooms}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Đang cho thuê:</span>
                          <span>{property.occupied}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Còn trống:</span>
                          <span>{property.rooms - property.occupied}</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-medium mb-2">Giá dịch vụ</h3>
                      <div className="grid gap-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Giá điện:</span>
                          <span>{property.electricityPrice}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Giá nước:</span>
                          <span>{property.waterPrice}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="rooms" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-medium">Danh sách phòng</h2>
              <Button asChild>
                <Link href={`/dashboard/rooms/new?property=${params.id}`}>
                  <Plus className="mr-2 h-4 w-4" />
                  Thêm phòng
                </Link>
              </Button>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {rooms.map((room) => (
                <Card key={room.id} className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-lg">{room.name}</h3>
                        <Badge
                          variant={
                            room.status === "available"
                              ? "outline"
                              : room.status === "occupied"
                                ? "default"
                                : "secondary"
                          }
                        >
                          {room.status === "available"
                            ? "Còn trống"
                            : room.status === "occupied"
                              ? "Đang thuê"
                              : "Đang sửa chữa"}
                        </Badge>
                      </div>

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
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
