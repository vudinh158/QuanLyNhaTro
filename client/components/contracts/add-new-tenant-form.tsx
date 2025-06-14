// file: clone nhatro/client/components/contracts/add-new-tenant-form.tsx
"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface NewTenantDataForContractForm {
    isNew: true;
    HoTen: string;
    SoDienThoai: string;
    CCCD?: string;
    Email?: string;
    GioiTinh?: 'Nam' | 'Nữ' | 'Khác';
    QueQuan?: string;
}

interface AddNewTenantFormProps {
  onTenantCreated: (newTenantData: NewTenantDataForContractForm) => void;
  onClose: () => void;
}

export const AddNewTenantForm = ({ onTenantCreated, onClose }: AddNewTenantFormProps) => {
    const [hoTen, setHoTen] = useState("");
    const [soDienThoai, setSoDienThoai] = useState("");
    const [cccd, setCccd] = useState("");
    const [email, setEmail] = useState("");
    const [gioiTinh, setGioiTinh] = useState<'Nam' | 'Nữ' | 'Khác' | undefined>(undefined);
    const [queQuan, setQueQuan] = useState("");

    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();

    // Changed to a regular function that will be called by the button's onClick
    const handleAddTenantClick = async () => { // Renamed from handleCreateTenant
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
                ...(gioiTinh && { GioiTinh: gioiTinh }),
                ...(queQuan && { QueQuan: queQuan }),
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
        // Removed onSubmit from form, as the button will now handle the click
        <div className="add-new-tenant-form-wrapper"> {/* Changed <form> to <div> to explicitly avoid form nesting issues */}
            <DialogHeader>
                <DialogTitle>Thêm khách thuê mới</DialogTitle>
                <DialogDescription>
                    Nhập thông tin cá nhân của khách thuê. Họ sẽ được thêm vào danh sách lựa chọn và được tạo khi hợp đồng được lưu.
                </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
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
            </div>
            <DialogFooter>
                <Button type="button" variant="ghost" onClick={onClose}>Hủy</Button>
                {/* Changed type="submit" to type="button" and added onClick handler */}
                <Button type="button" onClick={handleAddTenantClick} disabled={isSubmitting}>
                    {isSubmitting ? "Đang xử lý..." : "Thêm khách thuê"}
                </Button>
            </DialogFooter>
        </div> // Changed </form> to </div>
    );
};