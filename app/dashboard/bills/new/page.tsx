"use client"

import type React from "react"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import DashboardLayout from "@/components/dashboard/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { CalendarIcon, Minus, Plus, Trash } from "lucide-react"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function NewBillPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [dueDate, setDueDate] = useState<Date>()
  const [selectedContract, setSelectedContract] = useState(searchParams.get("contract") || "")
  const [billItems, setBillItems] = useState([
    { id: 1, name: "Tiền thuê phòng", amount: 2500000, quantity: 1, total: 2500000 },
    { id: 2, name: "Tiền điện", amount: 4000, quantity: 150, total: 600000 },
    { id: 3, name: "Tiền nước", amount: 15000, quantity: 10, total: 150000 },
  ])

  // Mock data
  const contracts = [
    { id: "HD001", room: "P101", property: "Nhà trọ Minh Tâm", tenant: "Nguyễn Văn B" },
    { id: "HD002", room: "P202", property: "Nhà trọ Minh Tâm", tenant: "Trần Thị C" },
    { id: "HD003", room: "P101", property: "Nhà trọ Thành Công", tenant: "Lê Văn D" },
    { id: "HD005", room: "P102", property: "Nhà trọ Thành Công", tenant: "Ngô Thị G" },
  ]

  const services = [
    { id: 1, name: "Internet", price: 150000, unit: "Tháng" },
    { id: 2, name: "Dọn vệ sinh", price: 100000, unit: "Lần" },
    { id: 3, name: "Giặt ủi", price: 20000, unit: "Kg" },
    { id: 4, name: "Giữ xe", price: 100000, unit: "Tháng" },
  ]

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate creating a new bill
    setTimeout(() => {
      setIsSubmitting(false)
      toast({
        title: "Tạo hóa đơn thành công",
        description: "Hóa đơn mới đã được tạo trong hệ thống",
      })
      router.push("/dashboard/bills")
    }, 1500)
  }

  const addBillItem = (serviceId: number) => {
    const service = services.find((s) => s.id === serviceId)
    if (!service) return

    const newItem = {
      id: Date.now(),
      name: service.name,
      amount: service.price,
      quantity: 1,
      total: service.price,
    }

    setBillItems([...billItems, newItem])
  }

  const removeBillItem = (id: number) => {
    setBillItems(billItems.filter((item) => item.id !== id))
  }

  const updateBillItem = (id: number, field: string, value: number) => {
    setBillItems(
      billItems.map((item) => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value }
          if (field === "amount" || field === "quantity") {
            updatedItem.total = updatedItem.amount * updatedItem.quantity
          }
          return updatedItem
        }
        return item
      }),
    )
  }

  const totalAmount = billItems.reduce((sum, item) => sum + item.total, 0)

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-3xl">
        <h1 className="text-2xl font-bold tracking-tight mb-6">Tạo hóa đơn mới</h1>

        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="contract" className="mb-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="contract">1. Chọn hợp đồng</TabsTrigger>
              <TabsTrigger value="bill" disabled={!selectedContract}>
                2. Chi tiết hóa đơn
              </TabsTrigger>
            </TabsList>

            <TabsContent value="contract">
              <Card>
                <CardHeader>
                  <CardTitle>Chọn hợp đồng</CardTitle>
                  <CardDescription>Chọn hợp đồng để tạo hóa đơn</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="contract">
                      Hợp đồng <span className="text-red-500">*</span>
                    </Label>
                    <Select value={selectedContract} onValueChange={setSelectedContract}>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn hợp đồng" />
                      </SelectTrigger>
                      <SelectContent>
                        {contracts.map((contract) => (
                          <SelectItem key={contract.id} value={contract.id}>
                            {contract.id} - {contract.room} - {contract.tenant}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedContract && (
                    <div className="rounded-lg border p-4">
                      <h3 className="font-medium mb-2">Thông tin hợp đồng</h3>
                      {(() => {
                        const contract = contracts.find((c) => c.id === selectedContract)
                        if (!contract) return null
                        return (
                          <div className="space-y-2 text-sm">
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
                              <span className="text-muted-foreground">Người thuê:</span>
                              <span>{contract.tenant}</span>
                            </div>
                          </div>
                        )
                      })()}
                    </div>
                  )}
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button type="button" variant="outline" onClick={() => router.push("/dashboard/bills")}>
                    Hủy
                  </Button>
                  <Button
                    type="button"
                    disabled={!selectedContract}
                    onClick={() => {
                      const tabsElement = document.querySelector('[role="tablist"]') as HTMLElement
                      if (tabsElement) {
                        const billTab = tabsElement.querySelector('[value="bill"]') as HTMLElement
                        if (billTab) billTab.click()
                      }
                    }}
                  >
                    Tiếp theo
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="bill">
              <Card>
                <CardHeader>
                  <CardTitle>Chi tiết hóa đơn</CardTitle>
                  <CardDescription>Nhập thông tin chi tiết về hóa đơn</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="billPeriodStart">
                        Kỳ thanh toán từ <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="billPeriodStart"
                        type="text"
                        placeholder="Ví dụ: 01/04/2025"
                        required
                        defaultValue="01/04/2025"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="billPeriodEnd">
                        Đến <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="billPeriodEnd"
                        type="text"
                        placeholder="Ví dụ: 30/04/2025"
                        required
                        defaultValue="30/04/2025"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dueDate">
                      Hạn thanh toán <span className="text-red-500">*</span>
                    </Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          id="dueDate"
                          variant={"outline"}
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !dueDate && "text-muted-foreground",
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {dueDate ? format(dueDate, "dd/MM/yyyy", { locale: vi }) : "Chọn hạn thanh toán"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar mode="single" selected={dueDate} onSelect={setDueDate} initialFocus />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Các khoản thanh toán</Label>
                      <Select onValueChange={(value) => addBillItem(Number(value))}>
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Thêm dịch vụ" />
                        </SelectTrigger>
                        <SelectContent>
                          {services.map((service) => (
                            <SelectItem key={service.id} value={service.id.toString()}>
                              {service.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="rounded-lg border">
                      <div className="grid grid-cols-12 gap-2 p-3 font-medium text-sm border-b">
                        <div className="col-span-5">Khoản mục</div>
                        <div className="col-span-2 text-right">Đơn giá</div>
                        <div className="col-span-2 text-right">Số lượng</div>
                        <div className="col-span-2 text-right">Thành tiền</div>
                        <div className="col-span-1"></div>
                      </div>

                      {billItems.map((item) => (
                        <div key={item.id} className="grid grid-cols-12 gap-2 p-3 border-b last:border-0 items-center">
                          <div className="col-span-5">{item.name}</div>
                          <div className="col-span-2">
                            <Input
                              type="number"
                              value={item.amount}
                              onChange={(e) => updateBillItem(item.id, "amount", Number(e.target.value))}
                              className="text-right h-8"
                            />
                          </div>
                          <div className="col-span-2 flex items-center">
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              className="h-8 w-8 rounded-r-none"
                              onClick={() => updateBillItem(item.id, "quantity", Math.max(1, item.quantity - 1))}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <Input
                              type="number"
                              value={item.quantity}
                              onChange={(e) => updateBillItem(item.id, "quantity", Number(e.target.value))}
                              className="text-right h-8 rounded-none w-full"
                              min="1"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              className="h-8 w-8 rounded-l-none"
                              onClick={() => updateBillItem(item.id, "quantity", item.quantity + 1)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                          <div className="col-span-2 text-right">{item.total.toLocaleString("vi-VN")} VNĐ</div>
                          <div className="col-span-1 flex justify-end">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => removeBillItem(item.id)}
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}

                      <div className="grid grid-cols-12 gap-2 p-3 font-medium border-t">
                        <div className="col-span-9 text-right">Tổng cộng:</div>
                        <div className="col-span-2 text-right">{totalAmount.toLocaleString("vi-VN")} VNĐ</div>
                        <div className="col-span-1"></div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="note">Ghi chú</Label>
                    <Input id="note" placeholder="Nhập ghi chú (nếu có)" />
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      const tabsElement = document.querySelector('[role="tablist"]') as HTMLElement
                      if (tabsElement) {
                        const contractTab = tabsElement.querySelector('[value="contract"]') as HTMLElement
                        if (contractTab) contractTab.click()
                      }
                    }}
                  >
                    Quay lại
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Đang xử lý..." : "Tạo hóa đơn"}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </form>
      </div>
    </DashboardLayout>
  )
}
