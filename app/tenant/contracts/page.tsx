import DashboardLayout from "@/components/dashboard/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

export default function TenantContractsPage() {
  return (
    <DashboardLayout userRole="tenant">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Hợp đồng của tôi</h1>
        </div>

        <div className="grid gap-4">
          {[
            {
              id: "HD001",
              room: "P101",
              property: "Nhà trọ Minh Tâm",
              startDate: "01/01/2025",
              endDate: "15/05/2025",
              rent: "2,500,000 VNĐ/tháng",
              deposit: "5,000,000 VNĐ",
              status: "active",
              roommates: 2,
            },
          ].map((contract) => (
            <Card key={contract.id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{contract.id}</h3>
                        <Badge variant="default">Có hiệu lực</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {contract.room} - {contract.property}
                      </p>
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
                        <span className="text-muted-foreground">Người đại diện:</span>
                        <span>Nguyễn Văn B (Bạn)</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Số người ở cùng:</span>
                        <span>{contract.roommates} người</span>
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
                    <Link href={`/tenant/contracts/${contract.id}`}>Xem chi tiết</Link>
                  </Button>
                  <div className="w-px bg-border" />
                  <Button variant="ghost" className="flex-1 rounded-none h-12" asChild>
                    <Link href={`/tenant/contracts/${contract.id}/roommates`}>Người ở cùng</Link>
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
