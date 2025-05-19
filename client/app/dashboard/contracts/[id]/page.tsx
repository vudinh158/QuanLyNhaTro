"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import DashboardLayout from "@/components/dashboard/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { FileText, Home, Pencil, Trash2, User, Wallet } from "lucide-react"
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

export default function ContractDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [isTerminating, setIsTerminating] = useState(false)

  // Giả lập dữ liệu hợp đồng
  const contract = {
    id: params.id,
    room: "P101",
    property: "Nhà trọ Minh Tâm",
    startDate: "01/01/2025",
    endDate: "15/05/2025",
    rent: "2,500,000 VNĐ/tháng",
    deposit: "5,000,000 VNĐ",
    paymentPeriod: "Hàng tháng",
    paymentDue: "10 ngày",
    status: "active",
    createdAt: "01/01/2025",
    note: "Hợp đồng thuê phòng đơn, bao gồm điện nước theo giá nhà trọ.",
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

  // Giả lập dữ liệu hóa đơn
  const bills = [
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
  ]

  const handleTerminate = () => {
    setIsTerminating(true)

    // Giả lập thanh lý hợp đồng
    setTimeout(() => {
      setIsTerminating(false)
      toast({
        title: "Thanh lý hợp đồng thành công",
        description: "Hợp đồng đã được thanh lý",
      })
      router.push("/dashboard/contracts")
    }, 1500)
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-6 w-6" />
            <h1 className="text-2xl font-bold tracking-tight">Hợp đồng {contract.id}</h1>
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
          <div className="flex items-center gap-2">
            <Button variant="outline" asChild>
              <Link href={`/dashboard/contracts/${params.id}/edit`}>
                <Pencil className="mr-2 h-4 w-4" />
                Chỉnh sửa
              </Link>
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Thanh lý
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Bạn có chắc chắn muốn thanh lý hợp đồng?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Hành động này sẽ kết thúc hợp đồng và đánh dấu phòng là trống. Vui lòng đảm bảo đã thu hồi tiền cọc
                    và các khoản thanh toán khác.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Hủy</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleTerminate}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    disabled={isTerminating}
                  >
                    {isTerminating ? "Đang xử lý..." : "Thanh lý"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        <Tabs defaultValue="details">
          <TabsList>
            <TabsTrigger value="details">Thông tin hợp đồng</TabsTrigger>
            <TabsTrigger value="tenants">Người thuê</TabsTrigger>
            <TabsTrigger value="bills">Hóa đơn</TabsTrigger>
          </TabsList>
          <TabsContent value="details" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Thông tin hợp đồng</CardTitle>
                <CardDescription>Chi tiết về hợp đồng {contract.id}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium mb-2">Thông tin cơ bản</h3>
                      <div className="grid gap-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Mã hợp đồng:</span>
                          <span>{contract.id}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Phòng:</span>
                          <span>{contract.room}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Nhà trọ:</span>
                          <span>{contract.property}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Ngày tạo:</span>
                          <span>{contract.createdAt}</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-medium mb-2">Thời hạn</h3>
                      <div className="grid gap-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Ngày bắt đầu:</span>
                          <span>{contract.startDate}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Ngày kết thúc:</span>
                          <span>{contract.endDate}</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-medium mb-2">Ghi chú</h3>
                      <p className="text-sm">{contract.note}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium mb-2">Thông tin thanh toán</h3>
                      <div className="grid gap-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Tiền thuê:</span>
                          <span>{contract.rent}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Tiền cọc:</span>
                          <span>{contract.deposit}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Kỳ thanh toán:</span>
                          <span>{contract.paymentPeriod}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Hạn thanh toán:</span>
                          <span>{contract.paymentDue}</span>
                        </div>
                      </div>
                    </div>
                    <div className="pt-4">
                      <Button variant="outline" className="w-full" asChild>
                        <Link href={`/dashboard/rooms/${contract.room}`}>
                          <Home className="mr-2 h-4 w-4" />
                          Xem thông tin phòng
                        </Link>
                      </Button>
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
                <CardDescription>Danh sách người thuê trong hợp đồng này</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
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
                      <Link href={`/dashboard/tenants/${tenant.id}`}>
                        <User className="mr-2 h-4 w-4" />
                        Chi tiết
                      </Link>
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="bills" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-medium">Danh sách hóa đơn</h2>
              <Button asChild>
                <Link href={`/dashboard/bills/new?contract=${params.id}`}>
                  <Wallet className="mr-2 h-4 w-4" />
                  Tạo hóa đơn
                </Link>
              </Button>
            </div>
            <Card>
              <CardContent className="p-0">
                {bills.length > 0 ? (
                  <div className="divide-y">
                    {bills.map((bill) => (
                      <div key={bill.id} className="p-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold">{bill.id}</h3>
                              <Badge
                                variant={
                                  bill.status === "paid" ? "default" : bill.isOverdue ? "destructive" : "secondary"
                                }
                              >
                                {bill.status === "paid"
                                  ? "Đã thanh toán"
                                  : bill.isOverdue
                                    ? "Quá hạn"
                                    : "Chưa thanh toán"}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">Kỳ thanh toán: {bill.period}</p>
                          </div>
                          <div className="text-sm">
                            <span className="text-muted-foreground">Hạn thanh toán:</span> <span>{bill.dueDate}</span>
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

                        <div className="flex justify-end gap-2 mt-2">
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/dashboard/bills/${bill.id}`}>Chi tiết</Link>
                          </Button>
                          {bill.status !== "paid" && (
                            <Button size="sm" asChild>
                              <Link href={`/dashboard/bills/${bill.id}/payment`}>Thanh toán</Link>
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Wallet className="mx-auto h-12 w-12 text-muted-foreground/50" />
                    <h3 className="mt-4 text-lg font-medium">Không có hóa đơn</h3>
                    <p className="mt-2 text-sm text-muted-foreground">Hợp đồng này chưa có hóa đơn nào.</p>
                    <Button className="mt-4" asChild>
                      <Link href={`/dashboard/bills/new?contract=${params.id}`}>Tạo hóa đơn</Link>
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
