"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import DashboardLayout from "@/components/dashboard/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Edit, Trash2 } from "lucide-react"
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

export default function ServiceDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [isDeleting, setIsDeleting] = useState(false)

  // Giả lập dữ liệu dịch vụ
  const service = {
    id: params.id,
    name: "Internet",
    price: 150000,
    type: "monthly",
    unit: "tháng",
    description: "Dịch vụ Internet tốc độ cao, không giới hạn dung lượng.",
    createdAt: "01/01/2025",
    usageCount: 15,
  }

  const handleDelete = () => {
    setIsDeleting(true)

    // Giả lập xóa dịch vụ
    setTimeout(() => {
      setIsDeleting(false)
      toast({
        title: "Xóa dịch vụ thành công",
        description: "Dịch vụ đã được xóa khỏi hệ thống",
      })
      router.push("/dashboard/services")
    }, 1500)
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Chi tiết dịch vụ</h1>
          <div className="flex items-center gap-2">
            <Button variant="outline" asChild>
              <Link href={`/dashboard/services/${params.id}/edit`}>
                <Edit className="mr-2 h-4 w-4" />
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
                    Hành động này không thể hoàn tác. Dịch vụ này sẽ bị xóa vĩnh viễn khỏi hệ thống.
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

        <Card>
          <CardHeader>
            <CardTitle>Thông tin dịch vụ</CardTitle>
            <CardDescription>Chi tiết về dịch vụ {service.name}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Thông tin cơ bản</h3>
                  <div className="grid gap-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Mã dịch vụ:</span>
                      <span>{service.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tên dịch vụ:</span>
                      <span>{service.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Giá dịch vụ:</span>
                      <span>{service.price.toLocaleString("vi-VN")} VNĐ</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Loại tính phí:</span>
                      <Badge variant="outline">
                        {service.type === "monthly"
                          ? "Hàng tháng"
                          : service.type === "usage"
                            ? "Theo sử dụng"
                            : "Một lần"}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Đơn vị tính:</span>
                      <span>{service.unit}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Thông tin khác</h3>
                  <div className="grid gap-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Ngày tạo:</span>
                      <span>{service.createdAt}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Số lần sử dụng:</span>
                      <span>{service.usageCount}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="font-medium mb-2">Mô tả</h3>
                  <p className="text-sm">{service.description}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
