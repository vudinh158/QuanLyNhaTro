"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { CalendarIcon, Zap, Droplets } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import DashboardLayout from "@/components/dashboard/dashboard-layout"

export default function RoomUtilitiesPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [date, setDate] = useState<Date>()

  // Form state
  const [electricityReading, setElectricityReading] = useState("")
  const [waterReading, setWaterReading] = useState("")

  // Giả lập dữ liệu phòng
  const room = {
    id: params.id,
    name: "P101",
    property: "Nhà trọ Minh Tâm",
  }

  // Giả lập dữ liệu chỉ số điện nước
  const utilityReadings = [
    {
      id: 1,
      date: "01/04/2025",
      electricityPrevious: 1250,
      electricityCurrent: 1420,
      electricityUsage: 170,
      electricityRate: 3500,
      electricityAmount: 595000,
      waterPrevious: 45,
      waterCurrent: 52,
      waterUsage: 7,
      waterRate: 15000,
      waterAmount: 105000,
      totalAmount: 700000,
    },
    {
      id: 2,
      date: "01/03/2025",
      electricityPrevious: 1100,
      electricityCurrent: 1250,
      electricityUsage: 150,
      electricityRate: 3500,
      electricityAmount: 525000,
      waterPrevious: 39,
      waterCurrent: 45,
      waterUsage: 6,
      waterRate: 15000,
      waterAmount: 90000,
      totalAmount: 615000,
    },
    {
      id: 3,
      date: "01/02/2025",
      electricityPrevious: 980,
      electricityCurrent: 1100,
      electricityUsage: 120,
      electricityRate: 3500,
      electricityAmount: 420000,
      waterPrevious: 34,
      waterCurrent: 39,
      waterUsage: 5,
      waterRate: 15000,
      waterAmount: 75000,
      totalAmount: 495000,
    },
  ]

  // Giả lập chỉ số điện nước hiện tại
  const currentReadings = {
    electricity: 1420,
    water: 52,
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Giả lập gửi dữ liệu
    setTimeout(() => {
      setIsSubmitting(false)
      toast({
        title: "Ghi nhận thành công",
        description: "Chỉ số điện nước đã được cập nhật",
      })
      setElectricityReading("")
      setWaterReading("")
    }, 1500)
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="h-6 w-6" />
            <h1 className="text-2xl font-bold tracking-tight">Quản lý điện nước - {room.name}</h1>
          </div>
          <Button variant="outline" onClick={() => router.back()}>
            Quay lại
          </Button>
        </div>

        <Tabs defaultValue="record">
          <TabsList>
            <TabsTrigger value="record">Ghi chỉ số</TabsTrigger>
            <TabsTrigger value="history">Lịch sử</TabsTrigger>
          </TabsList>
          <TabsContent value="record" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Ghi nhận chỉ số điện nước</CardTitle>
                <CardDescription>Nhập chỉ số công tơ điện và nước mới nhất cho phòng {room.name}</CardDescription>
              </CardHeader>
              <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">Ngày ghi chỉ số</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {date ? format(date, "PPP", { locale: vi }) : "Chọn ngày"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Zap className="h-5 w-5 text-yellow-500" />
                        <h3 className="font-medium">Điện</h3>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Chỉ số cũ:</span>
                          <span className="font-medium">{currentReadings.electricity} kWh</span>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="electricity">Chỉ số mới (kWh)</Label>
                          <Input
                            id="electricity"
                            type="number"
                            placeholder="Nhập chỉ số điện mới"
                            value={electricityReading}
                            onChange={(e) => setElectricityReading(e.target.value)}
                            min={currentReadings.electricity}
                          />
                        </div>

                        {electricityReading && Number.parseInt(electricityReading) > currentReadings.electricity && (
                          <div className="rounded-md bg-muted p-3">
                            <div className="text-sm">
                              <div className="flex justify-between">
                                <span>Tiêu thụ:</span>
                                <span className="font-medium">
                                  {Number.parseInt(electricityReading) - currentReadings.electricity} kWh
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span>Đơn giá:</span>
                                <span>3,500 VNĐ/kWh</span>
                              </div>
                              <div className="flex justify-between font-medium">
                                <span>Thành tiền:</span>
                                <span>
                                  {(
                                    (Number.parseInt(electricityReading) - currentReadings.electricity) *
                                    3500
                                  ).toLocaleString()}{" "}
                                  VNĐ
                                </span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Droplets className="h-5 w-5 text-blue-500" />
                        <h3 className="font-medium">Nước</h3>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Chỉ số cũ:</span>
                          <span className="font-medium">{currentReadings.water} m³</span>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="water">Chỉ số mới (m³)</Label>
                          <Input
                            id="water"
                            type="number"
                            placeholder="Nhập chỉ số nước mới"
                            value={waterReading}
                            onChange={(e) => setWaterReading(e.target.value)}
                            min={currentReadings.water}
                          />
                        </div>

                        {waterReading && Number.parseInt(waterReading) > currentReadings.water && (
                          <div className="rounded-md bg-muted p-3">
                            <div className="text-sm">
                              <div className="flex justify-between">
                                <span>Tiêu thụ:</span>
                                <span className="font-medium">
                                  {Number.parseInt(waterReading) - currentReadings.water} m³
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span>Đơn giá:</span>
                                <span>15,000 VNĐ/m³</span>
                              </div>
                              <div className="flex justify-between font-medium">
                                <span>Thành tiền:</span>
                                <span>
                                  {((Number.parseInt(waterReading) - currentReadings.water) * 15000).toLocaleString()}{" "}
                                  VNĐ
                                </span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {electricityReading &&
                    waterReading &&
                    Number.parseInt(electricityReading) > currentReadings.electricity &&
                    Number.parseInt(waterReading) > currentReadings.water && (
                      <div className="rounded-md bg-primary/10 p-4 mt-4">
                        <div className="flex justify-between font-medium">
                          <span>Tổng tiền điện nước:</span>
                          <span className="text-lg">
                            {(
                              (Number.parseInt(electricityReading) - currentReadings.electricity) * 3500 +
                              (Number.parseInt(waterReading) - currentReadings.water) * 15000
                            ).toLocaleString()}{" "}
                            VNĐ
                          </span>
                        </div>
                      </div>
                    )}
                </CardContent>
                <CardFooter>
                  <Button type="submit" disabled={isSubmitting || !date || !electricityReading || !waterReading}>
                    {isSubmitting ? "Đang xử lý..." : "Lưu chỉ số"}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
          <TabsContent value="history" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Lịch sử chỉ số điện nước</CardTitle>
                <CardDescription>Lịch sử ghi nhận chỉ số điện nước của phòng {room.name}</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableCaption>Danh sách chỉ số điện nước đã ghi nhận</TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ngày ghi</TableHead>
                      <TableHead className="text-right">Điện cũ</TableHead>
                      <TableHead className="text-right">Điện mới</TableHead>
                      <TableHead className="text-right">Tiêu thụ</TableHead>
                      <TableHead className="text-right">Thành tiền</TableHead>
                      <TableHead className="text-right">Nước cũ</TableHead>
                      <TableHead className="text-right">Nước mới</TableHead>
                      <TableHead className="text-right">Tiêu thụ</TableHead>
                      <TableHead className="text-right">Thành tiền</TableHead>
                      <TableHead className="text-right">Tổng tiền</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {utilityReadings.map((reading) => (
                      <TableRow key={reading.id}>
                        <TableCell>{reading.date}</TableCell>
                        <TableCell className="text-right">{reading.electricityPrevious}</TableCell>
                        <TableCell className="text-right">{reading.electricityCurrent}</TableCell>
                        <TableCell className="text-right">{reading.electricityUsage} kWh</TableCell>
                        <TableCell className="text-right">{reading.electricityAmount.toLocaleString()}</TableCell>
                        <TableCell className="text-right">{reading.waterPrevious}</TableCell>
                        <TableCell className="text-right">{reading.waterCurrent}</TableCell>
                        <TableCell className="text-right">{reading.waterUsage} m³</TableCell>
                        <TableCell className="text-right">{reading.waterAmount.toLocaleString()}</TableCell>
                        <TableCell className="text-right font-medium">{reading.totalAmount.toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
