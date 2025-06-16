"use client"

import type React from "react"
import { useState, useEffect } from "react"
import DashboardLayout from "@/components/dashboard/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import axios from "axios"

export default function ProfilePage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  // State cho form thông tin cá nhân
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [form, setForm] = useState({
    HoTen: "",
    CCCD: "",
    SoDienThoai: "",
    NgaySinh: "",
    GioiTinh: "",
    Email: ""
  })

  // State cho form đổi mật khẩu
  const [isPasswordSubmitting, setIsPasswordSubmitting] = useState(false)
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  })

  // Lấy dữ liệu profile khi component được render
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token")
        if (!token) throw new Error("Chưa đăng nhập")
        const res = await axios.get("http://localhost:5000/api/profile", {
          headers: { Authorization: "Bearer " + token }
        })
        const data = res.data
        
        setUser(data)
        setForm({
          HoTen: data.HoTen || "",
          CCCD: data.CCCD || "",
          SoDienThoai: data.SoDienThoai || "",
          NgaySinh: data.NgaySinh ? new Date(data.NgaySinh).toISOString().split('T')[0] : "",
          GioiTinh: data.GioiTinh || "",
          Email: data.Email || ""
        })
      } catch (err: any) {
        toast({ title: "Lỗi", description: err.response?.data?.message || err.message, variant: "destructive" })
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [toast])

  // Handler cho form thông tin cá nhân
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }
  const handleSelectChange = (value: string) => {
    setForm({ ...form, GioiTinh: value })
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const token = localStorage.getItem("token")
      const res = await axios.put("http://localhost:5000/api/profile", form, {
          headers: {
              'Content-Type': 'application/json',
              Authorization: 'Bearer ' + token
          }
      });
      toast({ title: "Cập nhật thành công", description: "Thông tin cá nhân đã được cập nhật." })
      setUser({ ...user, ...form })
    } catch (err: any) {
      toast({ title: "Lỗi", description: err.response?.data?.message || "Cập nhật thất bại.", variant: "destructive" })
    } finally {
        setIsSubmitting(false)
    }
  }

  // Handler cho form đổi mật khẩu
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value })
  }

  const handlePasswordSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({ title: "Lỗi", description: "Mật khẩu mới không khớp.", variant: "destructive" })
      return
    }
    setIsPasswordSubmitting(true)
    try {
      const token = localStorage.getItem("token")
      const res = await axios.put("http://localhost:5000/api/change-password", passwordForm, {
        headers: {
          Authorization: "Bearer " + token
        }
      })
      toast({ title: "Thành công", description: res.data.message })
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" }) // Reset form
    } catch (err: any) {
      toast({ title: "Lỗi", description: err.response?.data?.message || "Đổi mật khẩu thất bại.", variant: "destructive" })
    } finally {
      setIsPasswordSubmitting(false)
    }
  }

  if (loading) return <div className="p-6">Đang tải...</div>

  return (
    <div className="mx-auto max-w-3xl p-6">
      <h1 className="text-2xl font-bold tracking-tight mb-6">Hồ sơ cá nhân</h1>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile">Thông tin cá nhân</TabsTrigger>
          <TabsTrigger value="password">Đổi mật khẩu</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Thông tin chủ trọ</CardTitle>
              <CardDescription>Chỉnh sửa và lưu thông tin cá nhân của bạn.</CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="HoTen">Họ và tên</Label>
                    <Input id="HoTen" name="HoTen" value={form.HoTen} onChange={handleChange} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="CCCD">CCCD</Label>
                    <Input id="CCCD" name="CCCD" value={form.CCCD} onChange={handleChange} />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="SoDienThoai">Số điện thoại</Label>
                    <Input id="SoDienThoai" name="SoDienThoai" value={form.SoDienThoai} onChange={handleChange} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="Email">Email</Label>
                    <Input id="Email" name="Email" type="email" value={form.Email} onChange={handleChange} />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="NgaySinh">Ngày sinh</Label>
                    <Input id="NgaySinh" name="NgaySinh" type="date" value={form.NgaySinh} onChange={handleChange} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="GioiTinh">Giới tính</Label>
                    <Select value={form.GioiTinh} onValueChange={handleSelectChange}>
                      <SelectTrigger id="GioiTinh" name="GioiTinh">
                        <SelectValue placeholder="Chọn giới tính" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Nam">Nam</SelectItem>
                        <SelectItem value="Nữ">Nữ</SelectItem>
                        <SelectItem value="Khác">Khác</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="username">Tên đăng nhập</Label>
                    <Input id="username" value={user?.userAccount?.TenDangNhap || ""} disabled />
                    <p className="text-xs text-muted-foreground">Tên đăng nhập không thể thay đổi.</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Ngày tạo tài khoản</Label>
                    <Input value={user?.userAccount?.NgayTao ? new Date(user.userAccount.NgayTao).toLocaleDateString('vi-VN') : ""} disabled />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Đang cập nhật..." : "Lưu thay đổi"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>

        <TabsContent value="password">
            <Card>
                <CardHeader>
                    <CardTitle>Đổi mật khẩu</CardTitle>
                    <CardDescription>Thay đổi mật khẩu đăng nhập của bạn. Mật khẩu mới phải khác mật khẩu cũ.</CardDescription>
                </CardHeader>
                <form onSubmit={handlePasswordSubmit}>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="currentPassword">Mật khẩu hiện tại</Label>
                            <Input id="currentPassword" name="currentPassword" type="password" value={passwordForm.currentPassword} onChange={handlePasswordChange} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="newPassword">Mật khẩu mới</Label>
                            <Input id="newPassword" name="newPassword" type="password" value={passwordForm.newPassword} onChange={handlePasswordChange} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Xác nhận mật khẩu mới</Label>
                            <Input id="confirmPassword" name="confirmPassword" type="password" value={passwordForm.confirmPassword} onChange={handlePasswordChange} required />
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button type="submit" disabled={isPasswordSubmitting}>
                            {isPasswordSubmitting ? "Đang lưu..." : "Lưu mật khẩu"}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}