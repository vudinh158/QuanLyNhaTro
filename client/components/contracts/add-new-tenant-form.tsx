"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

// Mở rộng interface để chứa cả File object
interface NewTenantDataForContractForm {
    isNew: true;
    HoTen: string;
    SoDienThoai: string;
    CCCD?: string;
    Email?: string;
    NgaySinh?: string; // Sẽ là string format yyyy-MM-dd
    GioiTinh?: 'Nam' | 'Nữ' | 'Khác';
    QueQuan?: string;
    AnhGiayTo?: File; // Thay đổi ở đây: kiểu File
}

interface AddNewTenantFormProps {
  onTenantCreated: (newTenantData: NewTenantDataForContractForm) => void;
  onClose: () => void;
}

export const AddNewTenantForm = ({ onTenantCreated, onClose }: AddNewTenantFormProps) => {
    // ... (các state hiện có)
    const [ngaySinh, setNgaySinh] = useState<Date | undefined>();
    const [anhGiayTo, setAnhGiayTo] = useState<File | undefined>();
    const [hoTen, setHoTen] = useState("");
    const [soDienThoai, setSoDienThoai] = useState("");
    const [cccd, setCccd] = useState("");
    const [email, setEmail] = useState("");
    const [gioiTinh, setGioiTinh] = useState<'Nam' | 'Nữ' | 'Khác' | undefined>(undefined);
    const [queQuan, setQueQuan] = useState("");

    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            setAnhGiayTo(event.target.files[0]);
        }
    };

    const handleAddTenantClick = async () => {
        setIsSubmitting(true);
        try {
            if (!hoTen || !soDienThoai) {
                toast({ title: "Lỗi", description: "Vui lòng nhập Họ tên và Số điện thoại.", variant: "destructive" });
                setIsSubmitting(false);
                return;
            }

            const newTenantPayload: NewTenantDataForContractForm = {
                isNew: true,
                HoTen: hoTen,
                SoDienThoai: soDienThoai,
                ...(cccd && { CCCD: cccd }),
                ...(email && { Email: email }),
                ...(ngaySinh && { NgaySinh: format(ngaySinh, 'yyyy-MM-dd') }), // Format ngày sinh
                ...(gioiTinh && { GioiTinh: gioiTinh }),
                ...(queQuan && { QueQuan: queQuan }),
                ...(anhGiayTo && { AnhGiayTo: anhGiayTo }), // Thêm file vào payload
            };

            onTenantCreated(newTenantPayload);
            toast({ title: "Thông báo", description: "Thông tin khách thuê mới đã được chuẩn bị." });
            onClose();
        } catch (error: any) {
            toast({ title: "Lỗi", description: error.message, variant: "destructive" });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="add-new-tenant-form-wrapper">
            <DialogHeader>
                <DialogTitle>Thêm khách thuê mới</DialogTitle>
                <DialogDescription>
                    Nhập thông tin cá nhân của khách thuê. Họ sẽ được thêm vào danh sách lựa chọn và được tạo khi hợp đồng được lưu.
                </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-4">
                {/* ... Các trường input cũ ... */}
                <div className="space-y-2">
                    <Label htmlFor="hoTen">Họ và tên <span className="text-red-500">*</span></Label>
                    <Input id="hoTen" value={hoTen} onChange={(e) => setHoTen(e.target.value)} required />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="soDienThoai">Số điện thoại <span className="text-red-500">*</span></Label>
                    <Input id="soDienThoai" value={soDienThoai} onChange={(e) => setSoDienThoai(e.target.value)} required />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="cccd">Số CCCD/CMND</Label>
                    <Input id="cccd" value={cccd} onChange={(e) => setCccd(e.target.value)} />
                </div>

                {/* --- TRƯỜNG MỚI: NGÀY SINH --- */}
                <div className="space-y-2">
                    <Label htmlFor="ngaySinh">Ngày sinh</Label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !ngaySinh && "text-muted-foreground")}>
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {ngaySinh ? format(ngaySinh, "dd/MM/yyyy") : <span>Chọn ngày</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar mode="single" selected={ngaySinh} onSelect={setNgaySinh} initialFocus captionLayout="dropdown-buttons" fromYear={1950} toYear={new Date().getFullYear() - 10} />
                        </PopoverContent>
                    </Popover>
                </div>

                <div className="space-y-2">
                    <Label>Giới tính</Label>
                    <RadioGroup value={gioiTinh} onValueChange={(value: any) => setGioiTinh(value)} className="flex gap-4 pt-2">
                        <div className="flex items-center space-x-2"><RadioGroupItem value="Nam" id="male" /><Label htmlFor="male">Nam</Label></div>
                        <div className="flex items-center space-x-2"><RadioGroupItem value="Nữ" id="female" /><Label htmlFor="female">Nữ</Label></div>
                        <div className="flex items-center space-x-2"><RadioGroupItem value="Khác" id="other" /><Label htmlFor="other">Khác</Label></div>
                    </RadioGroup>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="queQuan">Quê quán</Label>
                    <Input id="queQuan" value={queQuan} onChange={(e) => setQueQuan(e.target.value)} />
                </div>
                
                {/* --- TRƯỜNG MỚI: ẢNH GIẤY TỜ --- */}
                <div className="space-y-2">
                    <Label htmlFor="anhGiayTo">Ảnh giấy tờ (CCCD/CMND)</Label>
                    <Input id="anhGiayTo" type="file" onChange={handleFileChange} accept="image/*" />
                    {anhGiayTo && <p className="text-sm text-muted-foreground">Đã chọn: {anhGiayTo.name}</p>}
                </div>
            </div>
            <DialogFooter>
                <Button type="button" variant="ghost" onClick={onClose}>Hủy</Button>
                <Button type="button" onClick={handleAddTenantClick} disabled={isSubmitting}>
                    {isSubmitting ? "Đang xử lý..." : "Thêm khách thuê"}
                </Button>
            </DialogFooter>
        </div>
    );
};