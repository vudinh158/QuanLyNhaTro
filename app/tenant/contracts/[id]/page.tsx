"use client"

import { useRouter } from "next/navigation"
import DashboardLayout from "@/components/dashboard/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Printer } from "lucide-react"
import Link from "next/link"

export default function TenantContractDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter()

  // Giả lập dữ liệu hợp đồng
  const contract = {
    id: params.id,
    roomId: "1",
    room: "P101",
    property: "Nhà trọ Minh Tâm",
    tenantId: "1",
    tenant: "Nguyễn Văn B",
    startDate: "01/01/2025",
    endDate: "15/05/2025",
    rent: "2,500,000 VNĐ/tháng",
    deposit: "5,000,000 VNĐ",
    paymentDue: 10,
    status: "active",
    note: "Hợp đồng thuê phòng đơn",
    createdAt: "01/01/2025",
    landlord: "Nguyễn Văn A",
    landlordPhone: "0987654321",
    landlordEmail: "nguyenvana@example.com",
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <DashboardLayout userRole="tenant">
      <div className="mx-auto max-w-2xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" asChild>
              <Link href="/tenant/contracts">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <h1 className="text-2xl font-bold tracking-tight">Chi tiết hợp đồng</h1>
          </div>
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" />
            In hợp đồng
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Hợp đồng thuê phòng {contract.id}</CardTitle>
                <CardDescription>Ngày tạo: {contract.createdAt}</CardDescription>
              </div>
              <Badge variant={contract.status === "active" ? "default" : "secondary"}>
                {contract.status === "active" ? "Có hiệu lực" : "Hết hạn"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Thông tin phòng</h3>
                  <div className="grid gap-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Phòng:</span>
                      <span>{contract.room}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Nhà trọ:</span>
                      <span>{contract.property}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Thông tin người thuê</h3>
                  <div className="grid gap-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Người thuê:</span>
                      <span>{contract.tenant}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Thông tin chủ trọ</h3>
                  <div className="grid gap-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Chủ trọ:</span>
                      <span>{contract.landlord}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Số điện thoại:</span>
                      <span>{contract.landlordPhone}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Email:</span>
                      <span>{contract.landlordEmail}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Thông tin hợp đồng</h3>
                  <div className="grid gap-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Thời hạn:</span>
                      <span>
                        {contract.startDate} - {contract.endDate}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tiền thuê:</span>
                      <span>{contract.rent}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tiền cọc:</span>
                      <span>{contract.deposit}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Ngày thanh toán hàng tháng:</span>
                      <span>Ngày {contract.paymentDue}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Ghi chú</h3>
                  <p className="text-sm">{contract.note}</p>
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-medium mb-2">Điều khoản và điều kiện</h3>
              <div className="text-sm space-y-2">
                <p>
                  1. Hợp đồng có hiệu lực kể từ ngày {contract.startDate} đến ngày {contract.endDate}.
                </p>
                <p>2. Tiền thuê phòng được thanh toán vào ngày {contract.paymentDue} hàng tháng.</p>
                <p>3. Tiền cọc sẽ được hoàn trả khi kết thúc hợp đồng nếu không có hư hỏng tài sản.</p>
                <p>4. Người thuê phải thông báo trước 30 ngày nếu muốn chấm dứt hợp đồng sớm.</p>
                <p>5. Chủ trọ có quyền chấm dứt hợp đồng nếu người thuê vi phạm các điều khoản.</p>
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-medium mb-2">Chữ ký</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground mb-2">Chủ trọ:</p>
                  <p>{contract.landlord}</p>
                  <p className="mt-8 text-muted-foreground">Ngày: {contract.createdAt}</p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-2">Người thuê:</p>
                  <p>{contract.tenant}</p>
                  <p className="mt-8 text-muted-foreground">Ngày: {contract.createdAt}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
