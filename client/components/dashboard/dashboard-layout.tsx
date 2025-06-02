// apps/client-nextjs/components/dashboard/dashboard-layout.tsx
"use client";

import type React from "react";
import { useState, useEffect } from "react"; // Thêm useEffect
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation"; // Thêm useRouter
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Bell, Building2, ChevronDown, FileText, Home, LayoutDashboard, LogOut,
  Menu, MessageSquare, Settings, Users, Wallet, Zap, User as UserIcon // Đổi tên User thành UserIcon để tránh trùng
} from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from '@/contexts/AuthContext'; // Import useAuth
import { Skeleton } from "@/components/ui/skeleton"; // Import Skeleton

interface NavItem {
  title: string;
  href: string;
  icon: React.ReactNode;
}

interface DashboardLayoutProps {
  children: React.ReactNode;
  // userRole prop không còn cần thiết nếu lấy từ context
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [openSheet, setOpenSheet] = useState(false); // Đổi tên state của Sheet để tránh nhầm lẫn
  const pathname = usePathname();
  const router = useRouter();
  const { user, token, isLoading, logout } = useAuth(); // Lấy user, isLoading và logout từ context
  

  // Xác định vai trò thực tế từ context, hoặc từ prop (nếu bạn vẫn muốn truyền)
  // Dòng này sẽ hoạt động đúng vì nó chỉ dựa vào user từ context
    const effectiveUserRole = user?.role?.TenVaiTro === 'Chủ trọ' ? 'landlord' : user?.role?.TenVaiTro === 'Khách thuê' ? 'tenant' : undefined;

  // Bảo vệ route: Nếu đang loading hoặc không có user/token, chuyển hướng về login
  // Chỉ áp dụng cho các trang trong dashboard/tenant
  useEffect(() => {
    if (!isLoading && !user && (pathname.startsWith('/dashboard') || pathname.startsWith('/tenant'))) {
      router.push('/login');
    }
  }, [isLoading, user, pathname, router]);


  const navItems: NavItem[] =
    effectiveUserRole === "landlord"
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
      : effectiveUserRole === "tenant"
        ? [
            { title: "Tổng quan", href: "/tenant/dashboard", icon: <LayoutDashboard className="h-5 w-5" /> },
            { title: "Hợp đồng của tôi", href: "/tenant/contracts", icon: <FileText className="h-5 w-5" /> },
            { title: "Hóa đơn của tôi", href: "/tenant/bills", icon: <Wallet className="h-5 w-5" /> },
            { title: "Điện nước", href: "/tenant/utilities", icon: <Zap className="h-5 w-5" /> },
            { title: "Dịch vụ phòng", href: "/tenant/services", icon: <Zap className="h-5 w-5" /> }, // Thêm Dịch vụ phòng
            { title: "Thông báo", href: "/tenant/notifications", icon: <Bell className="h-5 w-5" /> },
          ]
        : []; // Trả về mảng rỗng nếu vai trò không xác định

  const displayName = user?.chuTroProfile?.HoTen || user?.khachThueProfile?.HoTen || user?.TenDangNhap || "User";
  const fallbackAvatar = displayName ? displayName.charAt(0).toUpperCase() : "U";

  // Nếu đang loading hoặc chưa có user, có thể hiển thị một layout chờ hoặc skeleton
  if (isLoading && (pathname.startsWith('/dashboard') || pathname.startsWith('/tenant'))) {
    return (
      <div className="flex min-h-screen flex-col">
        <header className="sticky top-0 z-50 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
          <Skeleton className="h-8 w-8 rounded-md md:hidden" /> {/* Skeleton cho nút menu mobile */}
          <Skeleton className="h-6 w-32" /> {/* Skeleton cho logo/tên app */}
          <div className="flex-1"></div>
          <div className="flex items-center gap-4">
            <Skeleton className="h-8 w-8 rounded-full" /> {/* Skeleton cho nút Bell */}
            <Skeleton className="h-8 w-8 rounded-full" /> {/* Skeleton cho nút Message */}
            <Skeleton className="h-8 w-24 rounded-full" /> {/* Skeleton cho User Dropdown */}
          </div>
        </header>
        <div className="flex flex-1">
          <aside className="hidden w-64 border-r bg-muted/40 md:block">
            <nav className="grid gap-2 p-4 text-sm font-medium">
              {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-10 w-full rounded-lg" />)}
            </nav>
          </aside>
          <main className="flex-1 overflow-auto p-4 md:p-6">
            <Skeleton className="h-screen w-full" /> {/* Skeleton cho nội dung chính */}
          </main>
        </div>
      </div>
    );
  }

  // Nếu không có user và không phải trang public (cần điều kiện chặt chẽ hơn), không render gì hoặc redirect
   if (!user && (pathname.startsWith('/dashboard') || pathname.startsWith('/tenant'))) {
     return null; // Hoặc một component báo lỗi/trang trống trong khi chờ redirect ở useEffect
   }


  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
        {navItems.length > 0 && ( // Chỉ hiển thị sheet trigger nếu có nav items
          <Sheet open={openSheet} onOpenChange={setOpenSheet}>
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
                      pathname === item.href ? "bg-muted text-primary" : "text-muted-foreground hover:text-primary"
                    }`}
                    onClick={() => setOpenSheet(false)}
                  >
                    {item.icon}
                    {item.title}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        )}
        <Link
          href={effectiveUserRole === "landlord" ? "/dashboard" : effectiveUserRole === "tenant" ? "/tenant/dashboard" : "/"}
          className="flex items-center gap-2 font-semibold"
        >
          <Building2 className="h-6 w-6" />
          <span>Quản Lý Nhà Trọ</span>
        </Link>
        <div className="flex-1"></div>
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href={effectiveUserRole === "landlord" ? "/dashboard/notifications" : "/tenant/notifications"}>
              <Bell className="h-5 w-5" />
              <span className="sr-only">Thông báo</span>
            </Link>
          </Button>
          {/* Nút tin nhắn có thể ẩn nếu không có chức năng
          <Button variant="outline" size="icon" asChild>
            <Link href={effectiveUserRole === "landlord" ? "/dashboard/messages" : "/tenant/messages"}>
              <MessageSquare className="h-5 w-5" />
              <span className="sr-only">Tin nhắn</span>
            </Link>
          </Button>
          */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="relative h-8 flex items-center gap-2 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/placeholder.svg" alt={displayName} /> {/* Cân nhắc dùng ảnh thật sau này */}
                  <AvatarFallback>{fallbackAvatar}</AvatarFallback>
                </Avatar>
                <span className="hidden md:inline-flex">
                  {displayName}
                </span>
                <ChevronDown className="h-4 w-4 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Tài khoản của tôi</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href={effectiveUserRole === "landlord" ? "/dashboard/profile" : "/tenant/profile"}>
                  <UserIcon className="mr-2 h-4 w-4" /> {/* Sử dụng UserIcon */}
                  Hồ sơ cá nhân
                </Link>
              </DropdownMenuItem>
              {effectiveUserRole === "landlord" && ( // Chỉ chủ trọ mới có cài đặt
                <DropdownMenuItem asChild>
                    <Link href={"/dashboard/settings"}>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Cài đặt</span>
                    </Link>
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Đăng xuất</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
      <div className="flex flex-1">
        {navItems.length > 0 && ( // Chỉ hiển thị aside nếu có nav items
          <aside className="hidden w-64 border-r bg-muted/40 md:block">
            <nav className="grid gap-2 p-4 text-sm font-medium">
              {navItems.map((item, index) => (
                <Link
                  key={index}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-colors ${
                    pathname === item.href ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-primary"
                  }`}
                >
                  {item.icon}
                  {item.title}
                </Link>
              ))}
            </nav>
          </aside>
        )}
        <main className="flex-1 overflow-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}