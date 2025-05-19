import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import Image from "next/image"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between container-center mx-auto">
          <div className="flex items-center gap-2 font-semibold">
            <Image src="/placeholder.svg?height=32&width=32" alt="Logo" width={32} height={32} className="rounded" />
            <span>Quản Lý Nhà Trọ</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="outline">Đăng nhập</Button>
            </Link>
            <Link href="/register">
              <Button>Đăng ký</Button>
            </Link>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-muted/50 to-muted">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
              <div className="space-y-4">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl">Quản lý nhà trọ hiệu quả, đơn giản</h1>
                <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed">
                  Hệ thống quản lý nhà trọ toàn diện giúp chủ trọ quản lý phòng, khách thuê, hợp đồng, hóa đơn và thanh
                  toán một cách dễ dàng.
                </p>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Link href="/login">
                    <Button size="lg">Bắt đầu ngay</Button>
                  </Link>
                  <Link href="#features">
                    <Button size="lg" variant="outline">
                      Tìm hiểu thêm
                    </Button>
                  </Link>
                </div>
              </div>
              <Image
                src="/placeholder.svg?height=550&width=550"
                alt="Quản lý nhà trọ"
                width={550}
                height={550}
                className="mx-auto aspect-square overflow-hidden rounded-xl object-cover"
              />
            </div>
          </div>
        </section>
        <section id="features" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Tính năng chính</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed">
                  Hệ thống cung cấp đầy đủ các tính năng cần thiết cho việc quản lý nhà trọ hiệu quả
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-3">
              {[
                {
                  title: "Quản lý phòng & nhà trọ",
                  description: "Quản lý thông tin nhà trọ, loại phòng, phòng và tình trạng phòng",
                },
                {
                  title: "Quản lý khách thuê & hợp đồng",
                  description: "Quản lý thông tin khách thuê, hợp đồng thuê phòng và người ở cùng",
                },
                {
                  title: "Quản lý dịch vụ & hóa đơn",
                  description: "Quản lý dịch vụ, ghi điện nước, tạo hóa đơn và thanh toán",
                },
                {
                  title: "Thông báo & liên lạc",
                  description: "Hệ thống thông báo giữa chủ trọ và khách thuê",
                },
                {
                  title: "Báo cáo & thống kê",
                  description: "Xem báo cáo và thống kê về tình hình kinh doanh",
                },
                {
                  title: "Phân quyền người dùng",
                  description: "Phân quyền cho chủ trọ và khách thuê với các chức năng phù hợp",
                },
              ].map((feature, index) => (
                <Card key={index} className="text-center">
                  <CardHeader>
                    <CardTitle>{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>
      <footer className="w-full border-t py-6">
        <div className="container flex flex-col items-center justify-center gap-4 md:flex-row md:justify-between container-center mx-auto">
          <p className="text-center text-sm text-muted-foreground md:text-left">
            &copy; {new Date().getFullYear()} Hệ Thống Quản Lý Nhà Trọ. Bản quyền thuộc về chúng tôi.
          </p>
          <div className="flex gap-4">
            <Link href="/terms" className="text-sm text-muted-foreground underline-offset-4 hover:underline">
              Điều khoản
            </Link>
            <Link href="/privacy" className="text-sm text-muted-foreground underline-offset-4 hover:underline">
              Chính sách
            </Link>
            <Link href="/contact" className="text-sm text-muted-foreground underline-offset-4 hover:underline">
              Liên hệ
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
