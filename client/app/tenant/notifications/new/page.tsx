// file: client/app/tenant/notifications/new/page.tsx
'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, ArrowLeft } from "lucide-react";
import Link from 'next/link';

import { createNotification } from "@/services/notificationService";

const sendNotificationSchema = z.object({
  TieuDe: z.string().min(1, { message: "Tiêu đề không được để trống." }),
  NoiDung: z.string().min(1, { message: "Nội dung không được để trống." }),
});

type FormValues = z.infer<typeof sendNotificationSchema>;

export default function TenantSendNotificationPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(sendNotificationSchema),
  });

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);
    try {
      // Backend sẽ tự động xác định người nhận là chủ trọ của người gửi
      await createNotification({
        ...data,
        LoaiNguoiNhan: 'Chủ trọ',
      });

      toast({
        title: "Gửi thành công",
        description: "Thông báo của bạn đã được gửi đến chủ trọ.",
      });

      router.push("/tenant/notifications");
      router.refresh();
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể gửi thông báo.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
       <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" asChild>
                <Link href="/tenant/notifications">
                    <ArrowLeft className="h-4 w-4" />
                </Link>
            </Button>
            <h1 className="text-2xl font-bold">Gửi thông báo đến Chủ trọ</h1>
        </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Card>
            <CardHeader>
              <CardTitle>Soạn thông báo</CardTitle>
              <CardDescription>
                Nội dung sẽ được gửi trực tiếp đến chủ trọ quản lý phòng của bạn.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="TieuDe"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tiêu đề</FormLabel>
                    <FormControl>
                      <Input placeholder="Ví dụ: Báo hỏng vòi nước, Cần gia hạn hợp đồng..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="NoiDung"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nội dung chi tiết</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Vui lòng mô tả chi tiết vấn đề hoặc yêu cầu của bạn..."
                        rows={8}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Gửi
              </Button>
            </CardFooter>
          </Card>
        </form>
      </Form>
    </div>
  );
}