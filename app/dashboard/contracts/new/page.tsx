"use client"

import type React from "react"

import Link from "next/link"
import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import DashboardLayout from "@/components/dashboard/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { CalendarIcon, Plus } from "lucide-react"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Checkbox } from "@/components/ui/checkbox"

export default function NewContractPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [startDate, setStartDate] = useState<Date>()
  const [endDate, setEndDate] = useState<Date>()
  const [selectedRoom, setSelectedRoom] = useState(searchParams.get("room") || "")
  const [selectedTenants, setSelectedTenants] = useState<string[]>([])
  const [representativeTenant, setRepresentativeTenant] = useState<string>("")
  const [contractDetails, setContractDetails] = useState({
    rent: "",
    deposit: "",
    paymentPeriod: "monthly",
    paymentDue: "10",
    status: "active",
    note: "",
  })

  // Mock data
  const rooms = [
    { id: "1", name: "P102", property: "Nhà trọ Minh Tâm", type: "Phòng đơn", price: "2,500,000" },
    { id: "2", name: "P103", property: "Nhà trọ Minh Tâm", type: "Phòng đơn", price: "2,500,000" },
    { id: "3", name: "P203", property: "Nhà trọ Minh Tâm", type: "Phòng đôi", price: "3,500,000" },
    { id: "4", name: "P102", property: "Nhà trọ Thành Công", type: "Phòng đơn", price: "2,300,000" },
    { id: "5", name: "P103", property: "Nhà trọ Thành Công", type: "Phòng đơn", price: "2,300,000" },
  ]

  const tenants = [
    { id: "1", name: "Nguyễn Văn B", idCard: "079201001234", phone: "0901234567" },
    { id: "2", name: "Trần Thị C", idCard: "079201005678", phone: "0902345678" },
    { id: "3", name: "Lê Văn D", idCard: "079201009012", phone: "0903456789" },
    { id: "4", name: "Phạm Thị E", idCard: "079201003456", phone: "0904567890" },
    { id: "5", name: "Hoàng Văn F", idCard: "079201007890", phone: "0905678901" },
  ]

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target
    setContractDetails((prev) => ({
      ...prev,
      [id]: value,
    }))
  }

  const handleSelectChange = (id: string, value: string) => {
    setContractDetails((prev) => ({
      ...prev,
      [id]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Validate form
    if (!startDate || !endDate || !selectedRoom || selectedTenants.length === 0 || !representativeTenant) {
      toast({
        title: "Thiếu thông tin",
        description: "Vui lòng điền đầy đủ thông tin bắt buộc",
        variant: "destructive",
      })
      setIsSubmitting(false)
      return
    }

    // Simulate creating a new contract
    setTimeout(() => {
      setIsSubmitting(false)
      toast({
        title: "Tạo hợp đồng thành công",
        description: "Hợp đồng mới đã được tạo trong hệ thống",
      })
      router.push("/dashboard/contracts")
    }, 1500)
  }

  const toggleTenant = (tenantId: string) => {
    if (selectedTenants.includes(tenantId)) {
      setSelectedTenants(selectedTenants.filter((id) => id !== tenantId))
      if (representativeTenant === tenantId) {
        setRepresentativeTenant("")
      }
    } else {
      setSelectedTenants([...selectedTenants, tenantId])
      if (selectedTenants.length === 0) {
        setRepresentativeTenant(tenantId)
      }
    }
  }

  const setAsRepresentative = (tenantId: string) => {
    setRepresentativeTenant(tenantId)
  }

  // Set default rent when room is selected
  const handleRoomSelect = (roomId: string) => {
    setSelectedRoom(roomId)
    const selectedRoomData = rooms.find((r) => r.id === roomId)
    if (selectedRoomData) {
      setContractDetails((prev) => ({
        ...prev,
        rent: selectedRoomData.price.replace(/,/g, ""),
      }))
    }
  }

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-3xl">
        <h1 className="text-2xl font-bold tracking-tight mb-6">Tạo hợp đồng mới</h1>

        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="room" className="mb-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="room">1. Chọn phòng</TabsTrigger>
              <TabsTrigger value="contract" disabled={!selectedRoom}>
                2. Thông tin hợp đồng
              </TabsTrigger>
              <TabsTrigger value="tenants" disabled={!selectedRoom}>
                3. Người ở
              </TabsTrigger>
            </TabsList>

            <TabsContent value="room">
              <Card>
                <CardHeader>
                  <CardTitle>Chọn phòng cho thuê</CardTitle>
                  <CardDescription>Chọn phòng còn trống để tạo hợp đồng</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="room">
                      Phòng <span className="text-red-500">*</span>
                    </Label>
                    <Select value={selectedRoom} onValueChange={handleRoomSelect}>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn phòng" />
                      </SelectTrigger>
                      <SelectContent>
                        {rooms.map((room) => (
                          <SelectItem key={room.id} value={room.id}>
                            {room.name} - {room.property} ({room.type})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedRoom && (
                    <div className="rounded-lg border p-4">
                      <h3 className="font-medium mb-2">Thông tin phòng</h3>
                      {(() => {
                        const room = rooms.find((r) => r.id === selectedRoom)
                        if (!room) return null
                        return (
                          <div className="space-y-2 text-sm">
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
                              <span className="text-muted-foreground">Giá thuê tham khảo:</span>
                              <span>{room.price} VNĐ/tháng</span>
                            </div>
                          </div>
                        )
                      })()}
                    </div>
                  )}
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button type="button" variant="outline" onClick={() => router.push("/dashboard/contracts")}>
                    Hủy
                  </Button>
                  <Button
                    type="button"
                    disabled={!selectedRoom}
                    onClick={() => {
                      const tabsElement = document.querySelector('[role="tablist"]') as HTMLElement
                      if (tabsElement) {
                        const contractTab = tabsElement.querySelector('[value="contract"]') as HTMLElement
                        if (contractTab) contractTab.click()
                      }
                    }}
                  >
                    Tiếp theo
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="contract">
              <Card>
                <CardHeader>
                  <CardTitle>Thông tin hợp đồng</CardTitle>
                  <CardDescription>Nhập thông tin chi tiết về hợp đồng</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="startDate">
                        Ngày bắt đầu <span className="text-red-500">*</span>
                      </Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            id="startDate"
                            variant={"outline"}
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !startDate && "text-muted-foreground",
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {startDate ? format(startDate, "dd/MM/yyyy", { locale: vi }) : "Chọn ngày bắt đầu"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar mode="single" selected={startDate} onSelect={setStartDate} initialFocus />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="endDate">
                        Ngày kết thúc <span className="text-red-500">*</span>
                      </Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            id="endDate"
                            variant={"outline"}
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !endDate && "text-muted-foreground",
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {endDate ? format(endDate, "dd/MM/yyyy", { locale: vi }) : "Chọn ngày kết thúc"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={endDate}
                            onSelect={setEndDate}
                            initialFocus
                            disabled={(date) => {
                              if (!startDate) return false
                              return date < startDate
                            }}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="rent">
                        Tiền thuê (VNĐ/tháng) <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="rent"
                        type="number"
                        placeholder="Nhập tiền thuê"
                        min="0"
                        required
                        value={contractDetails.rent}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="deposit">
                        Tiền cọc (VNĐ) <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="deposit"
                        type="number"
                        placeholder="Nhập tiền cọc"
                        min="0"
                        required
                        value={contractDetails.deposit}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="paymentPeriod">
                        Kỳ thanh toán <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={contractDetails.paymentPeriod}
                        onValueChange={(value) => handleSelectChange("paymentPeriod", value)}
                      >
                        <SelectTrigger id="paymentPeriod">
                          <SelectValue placeholder="Chọn kỳ thanh toán" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="monthly">Hàng tháng</SelectItem>
                          <SelectItem value="quarterly">Hàng quý (3 tháng)</SelectItem>
                          <SelectItem value="biannually">Nửa năm</SelectItem>
                          <SelectItem value="annually">Hàng năm</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="paymentDue">
                        Hạn thanh toán (ngày) <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="paymentDue"
                        type="number"
                        placeholder="Số ngày được phép thanh toán"
                        min="0"
                        max="30"
                        value={contractDetails.paymentDue}
                        onChange={handleInputChange}
                        required
                      />
                      <p className="text-xs text-muted-foreground">
                        Số ngày được phép thanh toán kể từ ngày phát hành hóa đơn
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="status">
                      Trạng thái <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={contractDetails.status}
                      onValueChange={(value) => handleSelectChange("status", value)}
                    >
                      <SelectTrigger id="status">
                        <SelectValue placeholder="Chọn trạng thái" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Mới tạo</SelectItem>
                        <SelectItem value="active">Có hiệu lực</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="note">Ghi chú</Label>
                    <Textarea
                      id="note"
                      placeholder="Nhập ghi chú (nếu có)"
                      value={contractDetails.note}
                      onChange={handleInputChange}
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      const tabsElement = document.querySelector('[role="tablist"]') as HTMLElement
                      if (tabsElement) {
                        const roomTab = tabsElement.querySelector('[value="room"]') as HTMLElement
                        if (roomTab) roomTab.click()
                      }
                    }}
                  >
                    Quay lại
                  </Button>
                  <Button
                    type="button"
                    onClick={() => {
                      const tabsElement = document.querySelector('[role="tablist"]') as HTMLElement
                      if (tabsElement) {
                        const tenantsTab = tabsElement.querySelector('[value="tenants"]') as HTMLElement
                        if (tenantsTab) tenantsTab.click()
                      }
                    }}
                  >
                    Tiếp theo
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="tenants">
              <Card>
                <CardHeader>
                  <CardTitle>Người ở</CardTitle>
                  <CardDescription>Chọn người thuê và người ở cùng</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium">Danh sách người ở</h3>
                    <Button variant="outline" size="sm" asChild>
                      <Link href="/dashboard/tenants/new">
                        <Plus className="mr-2 h-4 w-4" />
                        Thêm khách thuê mới
                      </Link>
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {tenants.map((tenant) => (
                      <div key={tenant.id} className="flex items-center space-x-4 rounded-lg border p-4">
                        <Checkbox
                          id={`tenant-${tenant.id}`}
                          checked={selectedTenants.includes(tenant.id)}
                          onCheckedChange={() => toggleTenant(tenant.id)}
                        />
                        <Avatar className="h-10 w-10 border">
                          <AvatarImage src={`/placeholder.svg?text=${tenant.name.charAt(0)}`} alt={tenant.name} />
                          <AvatarFallback>{tenant.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-1">
                          <p className="font-medium">{tenant.name}</p>
                          <p className="text-sm text-muted-foreground">
                            CCCD: {tenant.idCard} | SĐT: {tenant.phone}
                          </p>
                        </div>
                        {selectedTenants.includes(tenant.id) && (
                          <div className="flex items-center gap-2">
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id={`representative-${tenant.id}`}
                                checked={representativeTenant === tenant.id}
                                onCheckedChange={() => setAsRepresentative(tenant.id)}
                              />
                              <Label htmlFor={`representative-${tenant.id}`} className="text-sm">
                                Người đại diện
                              </Label>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {selectedTenants.length === 0 && (
                    <div className="rounded-lg border border-dashed p-8 text-center">
                      <p className="text-muted-foreground">Chưa có người ở nào được chọn</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Vui lòng chọn ít nhất một người ở và chỉ định người đại diện
                      </p>
                    </div>
                  )}
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
                  <Button
                    type="submit"
                    disabled={isSubmitting || selectedTenants.length === 0 || !representativeTenant}
                  >
                    {isSubmitting ? "Đang xử lý..." : "Tạo hợp đồng"}
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
