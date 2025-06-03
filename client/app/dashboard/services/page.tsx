'use client'

import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/dashboard/dashboard-layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Plus, Search, Zap } from 'lucide-react'
import Link from 'next/link'
import axios from 'axios'

interface Service {
  MaDV: number
  TenDV: string
  LoaiDichVu: string
  DonViTinh: string
  priceHistories?: { DonGiaMoi: string }[]
  nhaTroRieng?: { TenNhaTro: string }
  nhaTrosApDung?: { TenNhaTro: string }[]
}

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const token = localStorage.getItem('token')
        if (!token) throw new Error('No token found')

        const res = await axios.get('http://localhost:5000/api/dich-vu', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        setServices(res.data.data || [])
      } catch (err: any) {
        console.error('Lỗi khi tải dịch vụ:', err)
        setError('Không thể tải dữ liệu dịch vụ. Vui lòng kiểm tra đăng nhập hoặc server.')
      } finally {
        setLoading(false)
      }
    }

    fetchServices()
  }, [])

  const getBadgeVariant = (type: string) => {
    switch (type) {
      case 'Cố định hàng tháng':
        return 'default'
      case 'Theo số lượng sử dụng':
        return 'outline'
      case 'Sự cố/Sửa chữa':
        return 'secondary'
      default:
        return 'default'
    }
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Quản lý dịch vụ</h1>
          <Button asChild>
            <Link href="/dashboard/services/new">
              <Plus className="mr-2 h-4 w-4" />
              Thêm dịch vụ
            </Link>
          </Button>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input type="search" placeholder="Tìm kiếm dịch vụ..." className="w-full pl-8" />
          </div>
          <Select defaultValue="all-properties">
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Chọn nhà trọ" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-properties">Tất cả nhà trọ</SelectItem>
            </SelectContent>
          </Select>
          <Select defaultValue="all-types">
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Loại dịch vụ" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-types">Tất cả loại</SelectItem>
              <SelectItem value="Cố định hàng tháng">Cố định hàng tháng</SelectItem>
              <SelectItem value="Theo số lượng sử dụng">Theo số lượng sử dụng</SelectItem>
              <SelectItem value="Sự cố/Sửa chữa">Sự cố/Sửa chữa</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <p className="text-muted-foreground">Đang tải dữ liệu...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : services.length === 0 ? (
          <p className="text-muted-foreground">Không có dịch vụ nào.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <Card key={service.MaDV} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-lg flex items-center gap-2">
                        <Zap className="h-4 w-4 text-primary" />
                        {service.TenDV}
                      </h3>
                      <Badge variant={getBadgeVariant(service.LoaiDichVu)}>
                        {service.LoaiDichVu}
                      </Badge>
                    </div>

                    <div className="grid gap-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Đơn vị tính:</span>
                        <span>{service.DonViTinh}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Đơn giá:</span>
                        <span>
                          {service.priceHistories?.[0]?.DonGiaMoi
                            ? `${Number(service.priceHistories[0].DonGiaMoi).toLocaleString()} VNĐ`
                            : 'Chưa thiết lập'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Áp dụng cho:</span>
                        <span>
                          {service.nhaTroRieng?.TenNhaTro ||
                            (service.nhaTrosApDung?.length
                              ? service.nhaTrosApDung.map((n) => n.TenNhaTro).join(', ')
                              : 'Tất cả nhà trọ')}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex border-t">
                    <Button variant="ghost" className="flex-1 rounded-none h-12" asChild>
                      <Link href={`/dashboard/services/${service.MaDV}/edit`}>Chỉnh sửa</Link>
                    </Button>
                    <div className="w-px bg-border" />
                    <Button variant="ghost" className="flex-1 rounded-none h-12" asChild>
                      <Link href={`/dashboard/services/${service.MaDV}/usage`}>Ghi nhận sử dụng</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
