// file: client/app/tenant/notifications/page.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Bell, PlusCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

import { getMyNotifications, markAsRead } from '@/services/notificationService';
import { INotification } from '@/types/notification'; 
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog';

export default function TenantNotificationsPage() {
    const [notifications, setNotifications] = useState<INotification[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedNotification, setSelectedNotification] = useState<INotification | null>(null);
    const { toast } = useToast();
  
    useEffect(() => {
      // getMyNotifications giờ trả về INotification[] với isRead được tính sẵn
      getMyNotifications()
        .then(setNotifications)
        .catch(() => toast({ title: "Lỗi", description: "Không thể tải danh sách thông báo.", variant: "destructive" }))
        .finally(() => setLoading(false));
    }, [toast]);
    
    const handleNotificationClick = async (item: INotification) => {
      setSelectedNotification(item);
    // Nếu thông báo chưa đọc, gọi API để đánh dấu đã đọc
    if (!item.isRead) {
        try {
          await markAsRead(item.MaThongBao);
          // Cập nhật lại trạng thái trên UI
          setNotifications(prev => 
            prev.map(n => n.MaThongBao === item.MaThongBao ? { ...n, isRead: true } : n)
          );
        } catch (error) {
          console.error("Failed to mark as read", error);
        }
      }
    };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Thông báo</h1>
          <Button asChild>
            <Link href="/tenant/notifications/new">
              <PlusCircle className="mr-2 h-4 w-4" /> Gửi thông báo cho chủ trọ
            </Link>
          </Button>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Hộp thư đến</CardTitle>
            <CardDescription>Danh sách tất cả các thông báo bạn đã nhận.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {notifications.length > 0 ? (
                notifications.map((item) => (
                  <div
                    key={item.MaThongBao}
                    onClick={() => handleNotificationClick(item)}
                    className="flex items-start space-x-4 p-4 rounded-lg border cursor-pointer hover:bg-accent"
                  >
                    <div className={cn("mt-1.5 h-2.5 w-2.5 flex-shrink-0 rounded-full", !item.isRead ? 'bg-primary animate-pulse' : 'bg-muted')} />
                    <div className="flex-1 space-y-1">
                      <div className="flex justify-between items-center">
                      <p className={cn("text-sm font-medium leading-none", !item.isRead && "font-bold")}>
                             {item.TieuDe}
                          </p>
                          <p className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(item.ThoiGianGui), { addSuffix: true, locale: vi })}
                          </p>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                          {item.NoiDung}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-muted-foreground py-8">Bạn không có thông báo nào.</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dialog hiển thị chi tiết thông báo */}
      <AlertDialog open={!!selectedNotification} onOpenChange={(isOpen) => !isOpen && setSelectedNotification(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            {/* Truy cập trực tiếp, không cần .notification */}
            <AlertDialogTitle>{selectedNotification?.TieuDe}</AlertDialogTitle>
            <AlertDialogDescription className="text-xs pt-2">
              {/* Truy cập trực tiếp, không cần .notification */}
              Gửi lúc: {selectedNotification ? new Date(selectedNotification.ThoiGianGui).toLocaleString('vi-VN') : ''}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4 whitespace-pre-wrap text-sm">
            {/* Truy cập trực tiếp, không cần .notification */}
            {selectedNotification?.NoiDung}
          </div>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setSelectedNotification(null)}>Đã hiểu</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}