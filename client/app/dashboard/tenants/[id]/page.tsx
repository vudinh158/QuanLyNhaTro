"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import DashboardLayout from "@/components/dashboard/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { FileText, Pencil, Trash2, User } from "lucide-react"
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

export default function TenantDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [isDeleting, setIsDeleting] = useState(false)

  // Giả lập dữ liệu khách thuê
  const tenant = {
    id: params.id,
    name: "Nguyễn Văn B",
    idCard: "079201001234",
    phone: "0901234567",
    email: "nguyenvanb@example.com",
    dob: "01/01/1990",
    gender: "Nam",
    hometown: "Hà Nội",
    status: "active",
    hasAccount: true,
    createdAt: "01/01/2025",
  }

  // Giả lập dữ liệu phòng và hợp đồng
  const contracts = [
    {
      id: "HD001",
      room: "P101",
      property: "Nhà trọ Minh Tâm",
      startDate: "01/01/2025",
      endDate: "15/05/2025",
      rent: "2,500,000 VNĐ/tháng",
      deposit: "5,000,000 VNĐ",
      status: "active",
      isRepresentative: true,
    },
  ]

  const handleDelete = () => {
    setIsDeleting(true)

    // Giả lập xóa khách thuê
    setTimeout(() => {
      setIsDeleting(false)
      toast({
        title: "Xóa khách thuê thành công",
        description: "Khách thuê đã được xóa khỏi hệ thống",
      })
      router.push("/dashboard/tenants")
    }, 1500)
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User className="h-6 w-6" />
            <h1 className="text-2xl font-bold tracking-tight">{tenant.name}</h1>
            <Badge variant={tenant.status === "active" ? "default" : "secondary"}>
              {tenant.status === "active" ? "Hoạt động" : "Ngừng hoạt động"}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" asChild>
              <Link href={`/dashboard/tenants/${params.id}/edit`}>
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
                    Hành động này không thể hoàn tác. Khách thuê này sẽ bị xóa vĩnh viễn khỏi hệ thống.
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
            <TabsTrigger value="details">Thông tin cá nhân</TabsTrigger>
            <TabsTrigger value="contracts">Hợp đồng</TabsTrigger>
          </TabsList>
          <TabsContent value="details" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Thông tin cá nhân</CardTitle>
                <CardDescription>Chi tiết về khách thuê {tenant.name}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-20 w-20 border">
                    <AvatarImage src={`/placeholder.svg?text=${tenant.name.charAt(0)}`} alt={tenant.name} />
                    <AvatarFallback>{tenant.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-lg font-medium">{tenant.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {tenant.hasAccount ? "Có tài khoản đăng nhập" : "Không có tài khoản đăng nhập"}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium mb-2">Thông tin liên hệ</h3>
                      <div className="grid gap-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Số CCCD/CMND:</span>
                          <span>{tenant.idCard}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Số điện thoại:</span>
                          <span>{tenant.phone}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Email:</span>
                          <span>{tenant.email || "Không có"}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium mb-2">Thông tin khác</h3>
                      <div className="grid gap-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Ngày sinh:</span>
                          <span>{tenant.dob}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Giới tính:</span>
                          <span>{tenant.gender}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Quê quán:</span>
                          <span>{tenant.hometown}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Ngày tạo:</span>
                          <span>{tenant.createdAt}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="contracts" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Hợp đồng</CardTitle>
                <CardDescription>Danh sách hợp đồng của khách thuê này</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {contracts.length > 0 ? (
                  <div className="space-y-4">
                    {contracts.map((contract) => (
                      <div key={contract.id} className="border rounded-lg overflow-hidden">
                        <div className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold">{contract.id}</h3>
                              <Badge variant="default">Có hiệu lực</Badge>
                              {contract.isRepresentative && <Badge variant="outline">Người đại diện</Badge>}
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
                                <span className="text-muted-foreground">Phòng:</span>
                                <span>{contract.room}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Nhà trọ:</span>
                                <span>{contract.property}</span>
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
                          <div className="w-px bg-border" />
                          <Button variant="ghost" className="flex-1 rounded-none h-12" asChild>
                            <Link href={`/dashboard/rooms/${contract.room}`}>Xem phòng</Link>
                          </Button>
                          <div className="w-px bg-border" />
                          <Button variant="ghost" className="flex-1 rounded-none h-12" asChild>
                            <Link href={`/dashboard/bills/new?contract=${contract.id}`}>Tạo hóa đơn</Link>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="mx-auto h-12 w-12 text-muted-foreground/50" />
                    <h3 className="mt-4 text-lg font-medium">Không có hợp đồng</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Khách thuê này hiện không có hợp đồng thuê nào.
                    </p>
                    <Button className="mt-4" asChild>
                      <Link href={`/dashboard/contracts/new?tenant=${params.id}`}>Tạo hợp đồng</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
