"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import DashboardLayout from "@/components/dashboard/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Home, Pencil, Trash2, Users, FileText, Zap, ShoppingBag } from "lucide-react"
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function RoomDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [isDeleting, setIsDeleting] = useState(false)

  // Giả lập dữ liệu phòng
  const room = {
    id: params.id,
    name: "P101",
    property: "Nhà trọ Minh Tâm",
    propertyId: "1",
    type: "Phòng đơn",
    status: "occupied",
    price: "2,500,000 VNĐ/tháng",
    deposit: "5,000,000 VNĐ",
    area: "20m²",
    note: "Phòng có cửa sổ, hướng Đông Nam, thoáng mát.",
    createdAt: "01/01/2025",
    facilities: ["Điều hòa", "Nóng lạnh", "Tủ quần áo", "Giường", "Bàn học"],
  }

  // Giả lập dữ liệu người thuê
  const tenants = [
    {
      id: 1,
      name: "Nguyễn Văn B",
      idCard: "079201001234",
      phone: "0901234567",
      email: "nguyenvanb@example.com",
      isRepresentative: true,
    },
    {
      id: 2,
      name: "Phạm Thị E",
      idCard: "079201003456",
      phone: "0904567890",
      email: "phamthie@example.com",
      isRepresentative: false,
    },
  ]

  // Giả lập dữ liệu hợp đồng
  const contract = {
    id: "HD001",
    startDate: "01/01/2025",
    endDate: "15/05/2025",
    rent: "2,500,000 VNĐ/tháng",
    deposit: "5,000,000 VNĐ",
    status: "active",
  }

  const handleDelete = () => {
    setIsDeleting(true)

    // Giả lập xóa phòng
    setTimeout(() => {
      setIsDeleting(false)
      toast({
        title: "Xóa phòng thành công",
        description: "Phòng đã được xóa khỏi hệ thống",
      })
      router.push("/dashboard/rooms")
    }, 1500)
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Home className="h-6 w-6" />
            <h1 className="text-2xl font-bold tracking-tight">
              {room.name} - {room.property}
            </h1>
            <Badge
              variant={room.status === "available" ? "outline" : room.status === "occupied" ? "default" : "secondary"}
            >
              {room.status === "available" ? "Còn trống" : room.status === "occupied" ? "Đang thuê" : "Đang sửa chữa"}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" asChild>
              <Link href={`/dashboard/rooms/${params.id}/utilities`}>
                <Zap className="mr-2 h-4 w-4" />
                Ghi điện nước
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href={`/dashboard/rooms/${params.id}/services`}>
                <ShoppingBag className="mr-2 h-4 w-4" />
                Dịch vụ
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href={`/dashboard/rooms/${params.id}/edit`}>
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
                    Hành động này không thể hoàn tác. Phòng này sẽ bị xóa vĩnh viễn khỏi hệ thống.
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
            <TabsTrigger value="details">Thông tin phòng</TabsTrigger>
            <TabsTrigger value="tenants">Người thuê</TabsTrigger>
            <TabsTrigger value="contract">Hợp đồng</TabsTrigger>
            <TabsTrigger value="utilities">Điện nước</TabsTrigger>
            <TabsTrigger value="services">Dịch vụ</TabsTrigger>
          </TabsList>
          <TabsContent value="details" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Thông tin phòng</CardTitle>
                <CardDescription>Chi tiết về phòng {room.name}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium mb-2">Thông tin cơ bản</h3>
                      <div className="grid gap-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Tên phòng:</span>
                          <span>{room.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Nhà trọ:</span>
                          <span>{room.property}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Loại phòng:</span>
                          <span>{room.type}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Diện tích:</span>
                          <span>{room.area}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Ngày tạo:</span>
                          <span>{room.createdAt}</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-medium mb-2">Ghi chú</h3>
                      <p className="text-sm">{room.note}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium mb-2">Thông tin giá</h3>
                      <div className="grid gap-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Giá thuê:</span>
                          <span>{room.price}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Tiền cọc:</span>
                          <span>{room.deposit}</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-medium mb-2">Tiện nghi</h3>
                      <div className="flex flex-wrap gap-2">
                        {room.facilities.map((facility, index) => (
                          <Badge key={index} variant="outline">
                            {facility}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="tenants" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Người thuê</CardTitle>
                <CardDescription>Danh sách người đang thuê phòng này</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {tenants.length > 0 ? (
                  <div className="space-y-4">
                    {tenants.map((tenant) => (
                      <div key={tenant.id} className="flex items-start gap-4 p-4 border rounded-lg">
                        <Avatar className="h-10 w-10 border">
                          <AvatarImage src={`/placeholder.svg?text=${tenant.name.charAt(0)}`} alt={tenant.name} />
                          <AvatarFallback>{tenant.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{tenant.name}</h3>
                            {tenant.isRepresentative && <Badge variant="default">Người đại diện</Badge>}
                          </div>
                          <div className="grid gap-1 text-sm mt-1">
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
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/dashboard/tenants/${tenant.id}`}>Chi tiết</Link>
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users className="mx-auto h-12 w-12 text-muted-foreground/50" />
                    <h3 className="mt-4 text-lg font-medium">Không có người thuê</h3>
                    <p className="mt-2 text-sm text-muted-foreground">Phòng này hiện không có người thuê nào.</p>
                    <Button className="mt-4" asChild>
                      <Link href={`/dashboard/contracts/new?room=${params.id}`}>Tạo hợp đồng</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="contract" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Thông tin hợp đồng</CardTitle>
                <CardDescription>Chi tiết về hợp đồng thuê phòng hiện tại</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {contract ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">Mã hợp đồng: {contract.id}</h3>
                      <Badge variant="default">Có hiệu lực</Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Ngày bắt đầu:</span>
                          <span>{contract.startDate}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Ngày kết thúc:</span>
                          <span>{contract.endDate}</span>
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
                    <div className="flex justify-end gap-2 pt-4">
                      <Button variant="outline" asChild>
                        <Link href={`/dashboard/contracts/${contract.id}`}>Xem chi tiết</Link>
                      </Button>
                      <Button variant="outline" asChild>
                        <Link href={`/dashboard/bills/new?contract=${contract.id}`}>Tạo hóa đơn</Link>
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="mx-auto h-12 w-12 text-muted-foreground/50" />
                    <h3 className="mt-4 text-lg font-medium">Không có hợp đồng</h3>
                    <p className="mt-2 text-sm text-muted-foreground">Phòng này hiện không có hợp đồng thuê nào.</p>
                    <Button className="mt-4" asChild>
                      <Link href={`/dashboard/contracts/new?room=${params.id}`}>Tạo hợp đồng</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="utilities" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Quản lý điện nước</CardTitle>
                <CardDescription>Ghi nhận và theo dõi chỉ số điện nước của phòng</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col items-center justify-center py-6 gap-4">
                  <Zap className="h-12 w-12 text-primary" />
                  <h3 className="text-lg font-medium">Quản lý chỉ số điện nước</h3>
                  <p className="text-sm text-muted-foreground text-center max-w-md">
                    Ghi nhận chỉ số công tơ điện và nước, tính toán lượng tiêu thụ và chi phí hàng tháng.
                  </p>
                  <Button asChild>
                    <Link href={`/dashboard/rooms/${params.id}/utilities`}>Ghi điện nước</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="services" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Quản lý dịch vụ</CardTitle>
                <CardDescription>Đăng ký và ghi nhận sử dụng dịch vụ cho phòng</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col items-center justify-center py-6 gap-4">
                  <ShoppingBag className="h-12 w-12 text-primary" />
                  <h3 className="text-lg font-medium">Quản lý dịch vụ phòng</h3>
                  <p className="text-sm text-muted-foreground text-center max-w-md">
                    Đăng ký các dịch vụ cho phòng và ghi nhận việc sử dụng dịch vụ theo thời gian.
                  </p>
                  <Button asChild>
                    <Link href={`/dashboard/rooms/${params.id}/services`}>Quản lý dịch vụ</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
