"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import DashboardLayout from "@/components/dashboard/dashboard-layout"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"

export default function TenantProfilePage() {
  const router = useRouter()
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    dob: "",
    gender: "male",
    idCard: "",
    hometown: "",
  })
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [currentPass, setCurrentPass] = useState("")
  const [newPass, setNewPass] = useState("")
  const [confirmPass, setConfirmPass] = useState("")

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token")
        const res = await fetch("http://localhost:5000/api/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })
        if (!res.ok) throw new Error("Lấy profile thất bại")
        const data = await res.json()
        setFormData({
          name: data.HoTen || "",
          email: data.Email || "",
          phone: data.SoDienThoai || "",
          dob: data.NgaySinh ? data.NgaySinh.split("T")[0] : "",
          gender:
            data.GioiTinh === "Nam"
              ? "male"
              : data.GioiTinh === "Nữ"
              ? "female"
              : "other",
          idCard: data.CCCD || "",
          hometown: data.QueQuan || "",
        })
      } catch (err) {
        console.error(err)
        toast({
          title: "Lỗi",
          description: "Không thể tải thông tin cá nhân",
          variant: "destructive",
        })
      }
    }
    fetchProfile()
  }, [toast])

  const handlePasswordSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (newPass !== confirmPass) {
      toast({
        title: "Lỗi",
        description: "Mật khẩu xác nhận không khớp",
        variant: "destructive",
      })
      return
    }
    setIsChangingPassword(true)
    try {
      const token = localStorage.getItem("token")
      const res = await fetch("http://localhost:5000/api/change-password", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ currentPassword: currentPass, newPassword: newPass }),
      })
      if (!res.ok) throw new Error("Change password failed")
      toast({ title: "Thành công", description: "Đổi mật khẩu thành công" })
      setCurrentPass("")
      setNewPass("")
      setConfirmPass("")
    } catch (err) {
      console.error(err)
      toast({ title: "Lỗi", description: "Đổi mật khẩu thất bại", variant: "destructive" })
    } finally {
      setIsChangingPassword(false)
    }
  }

  return (

      <div className="mx-auto max-w-2xl">
        <h1 className="text-2xl font-bold tracking-tight mb-6">Thông tin cá nhân</h1>

        <Tabs defaultValue="profile" className="mb-8">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="profile">Thông tin cá nhân</TabsTrigger>
            <TabsTrigger value="password">Đổi mật khẩu</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Thông tin cá nhân</CardTitle>
                <CardDescription>Xem thông tin cá nhân của bạn</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-center mb-4">
                  <Avatar className="h-24 w-24 border">
                    <AvatarImage
                      src={`/placeholder.svg?text=${formData.name.charAt(0)}`}
                      alt={formData.name}
                    />
                    <AvatarFallback>{formData.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                </div>

                <div className="space-y-2">
                  <Label>Họ và tên</Label>
                  <Input value={formData.name} disabled />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input value={formData.email} disabled />
                  </div>
                  <div className="space-y-2">
                    <Label>Số điện thoại</Label>
                    <Input value={formData.phone} disabled />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Ngày sinh</Label>
                    <Input type="date" value={formData.dob} disabled />
                  </div>
                  <div className="space-y-2">
                    <Label>Giới tính</Label>
                    <Select value={formData.gender} disabled>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Nam</SelectItem>
                        <SelectItem value="female">Nữ</SelectItem>
                        <SelectItem value="other">Khác</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Số CCCD/CMND</Label>
                  <Input value={formData.idCard} disabled />
                </div>

                <div className="space-y-2">
                  <Label>Quê quán</Label>
                  <Input value={formData.hometown} disabled />
                </div>
              </CardContent>
              {/* Không có nút Lưu thay đổi cho tenant */}
            </Card>
          </TabsContent>

          <TabsContent value="password">
            <form onSubmit={handlePasswordSubmit}>
              <Card>
                <CardHeader>
                  <CardTitle>Đổi mật khẩu</CardTitle>
                  <CardDescription>Cập nhật mật khẩu đăng nhập của bạn</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Mật khẩu hiện tại</Label>
                    <Input
                      type="password"
                      value={currentPass}
                      onChange={(e) => setCurrentPass(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Mật khẩu mới</Label>
                    <Input
                      type="password"
                      value={newPass}
                      onChange={(e) => setNewPass(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Xác nhận mật khẩu mới</Label>
                    <Input
                      type="password"
                      value={confirmPass}
                      onChange={(e) => setConfirmPass(e.target.value)}
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" disabled={isChangingPassword} className="ml-auto">
                    {isChangingPassword ? "Đang xử lý..." : "Đổi mật khẩu"}
                  </Button>
                </CardFooter>
              </Card>
            </form>
          </TabsContent>
        </Tabs>
      </div>

  )
}
