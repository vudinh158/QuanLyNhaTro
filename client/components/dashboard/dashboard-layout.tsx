"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Bell,
  Building2,
  ChevronDown,
  FileText,
  Home,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  Settings,
  Users,
  Wallet,
  Zap,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface NavItem {
  title: string
  href: string
  icon: React.ReactNode
}

interface DashboardLayoutProps {
  children: React.ReactNode
  userRole?: "landlord" | "tenant"
}

export default function DashboardLayout({ children, userRole = "landlord" }: DashboardLayoutProps) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  // Định nghĩa các mục menu dựa trên vai trò người dùng
  const navItems: NavItem[] =
    userRole === "landlord"
      ? [
          { title: "Tổng quan", href: "/dashboard", icon: <LayoutDashboard className="h-5 w-5" /> },
          { title: "Nhà trọ", href: "/dashboard/properties", icon: <Building2 className="h-5 w-5" /> },
          { title: "Phòng", href: "/dashboard/rooms", icon: <Home className="h-5 w-5" /> },
          { title: "Khách thuê", href: "/dashboard/tenants", icon: <Users className="h-5 w-5" /> },
          { title: "Hợp đồng", href: "/dashboard/contracts", icon: <FileText className="h-5 w-5" /> },
          { title: "Dịch vụ", href: "/dashboard/services", icon: <Zap className="h-5 w-5" /> },
          { title: "Hóa đơn", href: "/dashboard/bills", icon: <Wallet className="h-5 w-5" /> },
          { title: "Thông báo", href: "/dashboard/notifications", icon: <Bell className="h-5 w-5" /> },
        ]
      : [
          { title: "Tổng quan", href: "/tenant/dashboard", icon: <LayoutDashboard className="h-5 w-5" /> },
          { title: "Hợp đồng", href: "/tenant/contracts", icon: <FileText className="h-5 w-5" /> },
          { title: "Hóa đơn", href: "/tenant/bills", icon: <Wallet className="h-5 w-5" /> },
          { title: "Thông báo", href: "/tenant/notifications", icon: <Bell className="h-5 w-5" /> },
        ]

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 sm:max-w-xs">
            <nav className="grid gap-2 text-lg font-medium">
              {navItems.map((item, index) => (
                <Link
                  key={index}
                  href={item.href}
                  className={`flex items-center gap-2 rounded-lg px-3 py-2 ${
                    pathname === item.href ? "bg-muted" : "hover:bg-muted"
                  }`}
                  onClick={() => setOpen(false)}
                >
                  {item.icon}
                  {item.title}
                </Link>
              ))}
            </nav>
          </SheetContent>
        </Sheet>
        <Link
          href={userRole === "landlord" ? "/dashboard" : "/tenant/dashboard"}
          className="flex items-center gap-2 font-semibold"
        >
          <Building2 className="h-6 w-6" />
          <span>Quản Lý Nhà Trọ</span>
        </Link>
        <div className="flex-1"></div>
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href={userRole === "landlord" ? "/dashboard/notifications" : "/tenant/notifications"}>
              <Bell className="h-5 w-5" />
              <span className="sr-only">Thông báo</span>
            </Link>
          </Button>
          <Button variant="outline" size="icon" asChild>
            <Link href={userRole === "landlord" ? "/dashboard/messages" : "/tenant/messages"}>
              <MessageSquare className="h-5 w-5" />
              <span className="sr-only">Tin nhắn</span>
            </Link>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="relative h-8 flex items-center gap-2 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/placeholder.svg" alt="Avatar" />
                  <AvatarFallback>NT</AvatarFallback>
                </Avatar>
                <span className="hidden md:inline-flex">
                  {userRole === "landlord" ? "Nguyễn Văn A" : "Nguyễn Văn B"}
                </span>
                <ChevronDown className="h-4 w-4 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Tài khoản của tôi</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href={userRole === "landlord" ? "/dashboard/profile" : "/tenant/profile"}>Hồ sơ cá nhân</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={userRole === "landlord" ? "/dashboard/settings" : "/tenant/settings"}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Cài đặt</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/logout">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Đăng xuất</span>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
      <div className="flex flex-1">
        <aside className="hidden w-64 border-r bg-muted/40 md:block">
          <nav className="grid gap-2 p-4 text-sm font-medium">
            {navItems.map((item, index) => (
              <Link
                key={index}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 ${
                  pathname === item.href ? "bg-muted" : "hover:bg-muted"
                }`}
              >
                {item.icon}
                {item.title}
              </Link>
            ))}
          </nav>
        </aside>
        <main className="flex-1 overflow-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  )
}
