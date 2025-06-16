// file: clone nhatro/client/app/dashboard/contracts/ContractForm.tsx
"use client";

import { zodResolver } from '@hookform/resolvers/zod';
import { useFieldArray, useForm } from 'react-hook-form';
import * as z from 'zod';
import { useEffect, useState } from 'react';

// UI Components
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge'; // Import Badge để hiển thị "Mới"

// Icons
import { CalendarIcon, Loader2, Trash2, UserPlus } from 'lucide-react';

// Utils & Services
import { cn } from '@/lib/utils';
import { format, parseISO, isValid, addMonths } from 'date-fns';
import { getAvailableRoomsForContract } from '@/services/roomService';
import { getAllTenantsForLandlord } from '@/services/tenantService';
import { getServicesByProperty } from '@/services/serviceService';
import { IContract, IContractPayload } from '@/types/contract';
import type { Room } from '@/types/room';
import type { Tenant } from '@/types/tenant';
import type { IService } from '@/types/service';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { AddNewTenantForm } from '@/components/contracts/add-new-tenant-form';

function isFile(value: any): value is File {
    return value instanceof File;
  }

// Định nghĩa schema validation bằng Zod
const contractFormSchema = z.object({
    MaPhong: z.coerce.number({ required_error: 'Vui lòng chọn phòng.' }).positive('Vui lòng chọn phòng.'),
    NgayBatDau: z.date({ required_error: 'Vui lòng chọn ngày bắt đầu.' }),
    NgayKetThuc: z.date({ required_error: 'Vui lòng chọn ngày kết thúc.' }),
    TienCoc: z.coerce.number().min(0, 'Tiền cọc không được âm.').default(0),
    TienThueThoaThuan: z.coerce.number().min(1, 'Tiền thuê phải lớn hơn 0.'),
    KyThanhToan: z.enum(['Đầu kỳ', 'Cuối kỳ'], { required_error: 'Vui lòng chọn kỳ thanh toán.' }),
    HanThanhToan: z.coerce.number().min(1, 'Hạn thanh toán phải là số dương.').max(28, 'Hạn thanh toán không quá ngày 28.'),
    // TrangThai sẽ được tự động gán ở backend, không gửi từ frontend
    // TrangThai: z.enum(['Mới tạo', 'Có hiệu lực', 'Hết hiệu lực', 'Đã thanh lý']),
    FileHopDong: z.any().optional(),
    GhiChu: z.string().optional(),
    occupants: z.array(z.object({
        // Cập nhật schema để cho phép cả MaKhachThue (exist) hoặc HoTen/SoDienThoai (new)
        MaKhachThue: z.number().optional(), // Có thể không có nếu là khách thuê mới
        isNew: z.boolean().optional(), // Cờ để backend biết đây là khách thuê mới
        HoTen: z.string().optional(), // Tên là bắt buộc cho khách thuê mới
        SoDienThoai: z.string().optional(), // SĐT là bắt buộc cho khách thuê mới
        CCCD: z.string().optional(),
        Email: z.string().optional(),
        NgaySinh: z.string().optional().or(z.literal('')),
        GioiTinh: z.enum(['Nam', 'Nữ', 'Khác']).optional(),
        QueQuan: z.string().optional(),
        AnhGiayTo: z.any().optional(), 
        GhiChu: z.string().optional().or(z.literal('')),
        LaNguoiDaiDien: z.boolean(),
        QuanHeVoiNguoiDaiDien: z.string().optional(), // Add this property
    })).min(1, 'Phải có ít nhất một người ở.'),
    registeredServices: z.array(z.number()).optional(),
}).superRefine((data, ctx) => {
    // Quy tắc 1: Ngày kết thúc phải sau ngày bắt đầu
    if (data.NgayKetThuc <= data.NgayBatDau) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Ngày kết thúc phải sau ngày bắt đầu.',
        path: ['NgayKetThuc'], // Chỉ định lỗi cho trường NgayKetThuc
      });
    }
  
    // Quy tắc 2: Phải có đúng một người đại diện
    const representativeCount = data.occupants.filter(o => o.LaNguoiDaiDien).length;
    if (representativeCount !== 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        // Tin nhắn lỗi rõ ràng hơn
        message: `Phải có đúng một người đại diện (hiện tại đang chọn ${representativeCount}).`,
        // Chỉ định lỗi cho toàn bộ danh sách người ở
        path: ['occupants'],
      });
    }
  
});

type ContractFormValues = z.infer<typeof contractFormSchema>;

interface ContractFormProps {
    initialData?: IContract;
    onSubmitAction: (data: FormData) => Promise<any>;
    isSubmitting: boolean;
}

export function ContractForm({ initialData, onSubmitAction, isSubmitting }: ContractFormProps) {
    const { toast } = useToast();
    const [availableRooms, setAvailableRooms] = useState<Room[]>([]);
    const [tenants, setTenants] = useState<Tenant[]>([]); // Danh sách khách thuê hiện có
    const [services, setServices] = useState<IService[]>([]);
    const [isNewTenantDialogOpen, setIsNewTenantDialogOpen] = useState(false);
    const [currentRoomDisplay, setCurrentRoomDisplay] = useState<string>('');


    const form = useForm<ContractFormValues>({
        resolver: zodResolver(contractFormSchema),
        defaultValues: {
            MaPhong: 0,
            NgayBatDau: new Date(),
            NgayKetThuc: addMonths(new Date(), 6),
            TienCoc: 0,
            TienThueThoaThuan: 0,
            KyThanhToan: 'Cuối kỳ',
            HanThanhToan: 5,
            // TrangThai: 'Có hiệu lực', // Không cần mặc định trạng thái ở frontend
            occupants: [],
            registeredServices: [],
            GhiChu: '',
        }
    });

    useEffect(() => {
        if (initialData) {
            form.reset({
                MaPhong: initialData.MaPhong,
                NgayBatDau: isValid(parseISO(initialData.NgayBatDau)) ? parseISO(initialData.NgayBatDau) : new Date(),
                NgayKetThuc: isValid(parseISO(initialData.NgayKetThuc)) ? parseISO(initialData.NgayKetThuc) : new Date(),
                TienCoc: initialData.TienCoc,
                TienThueThoaThuan: initialData.TienThueThoaThuan,
                KyThanhToan: initialData.KyThanhToan,
                HanThanhToan: initialData.HanThanhToan, // FIX: Should be HanThanhToan from initialData.HanThanhToan
                // TrangThai: initialData.TrangThai, // Giữ lại nếu muốn hiển thị khi edit, nhưng vẫn do backend quyết định trạng thái thực khi update
                GhiChu: initialData.GhiChu || '',
                // Đối với occupants khi edit, chúng luôn có MaKhachThue
                occupants: initialData.occupants.map(o => ({
                    MaKhachThue: o.MaKhachThue,
                    LaNguoiDaiDien: o.LaNguoiDaiDien,
                    // Không cần isNew, HoTen, SoDienThoai cho khách thuê đã có
                })),
                registeredServices: initialData.registeredServices.map(s => s.MaDV),
            });
            if (initialData.room && initialData.room.property) {
                setCurrentRoomDisplay(`${initialData.room.TenPhong} - ${initialData.room.property.TenNhaTro}`);
            } else {
                // Nếu không có room hoặc property, gán một giá trị mặc định để debug
                setCurrentRoomDisplay('Dữ liệu phòng không đầy đủ');
                console.warn('InitialData thiếu thông tin room/property:', initialData);
            }
        }
    }, [initialData, form]);

    const { fields, append, remove, update } = useFieldArray({
        control: form.control,
        name: 'occupants',
    });

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const [roomsData, tenantsData] = await Promise.all([
                    getAvailableRoomsForContract(),
                    getAllTenantsForLandlord({}) // Lấy tất cả khách thuê hiện có
                ]);
                setAvailableRooms(roomsData);
                setTenants(tenantsData); // Set fetched tenants

                if (initialData) {
                    const roomOfContract = roomsData.find(r => r.MaPhong === initialData.MaPhong) || initialData.room;
                    if(roomOfContract) {
                        await handleRoomSelect(roomOfContract.MaPhong);
                    }
                }
            } catch (error) {
                toast({ title: "Lỗi tải dữ liệu", description: "Không thể tải danh sách phòng hoặc khách thuê.", variant: "destructive" });
            }
        };
        loadInitialData();
    }, []);

    const handleRoomSelect = async (roomId: number) => {
        form.setValue('MaPhong', roomId);
        const room = availableRooms.find(r => r.MaPhong === roomId);
        if (room) {
            if (!initialData) {
                form.setValue('TienThueThoaThuan', room.roomType?.Gia || 0);
            }
            try {
                const servicesData = await getServicesByProperty(room.MaNhaTro);
                setServices(servicesData || []); // Ensure servicesData is an array, default to empty array if null/undefined
            } catch (error: any) {
                toast({ title: "Lỗi", description: `Không thể tải dịch vụ: ${error.message}`, variant: "destructive" });
                setServices([]); // Explicitly set to empty array on error to prevent undefined issues
            }
        } else {
            setServices([]); // Clear services if no room is selected or room not found
        }
    };

    // Hàm này được gọi khi chọn khách thuê đã có HOẶC nhận dữ liệu khách thuê mới từ AddNewTenantForm
    const handleAddOccupant = (occupantToAdd: { MaKhachThue: number; HoTen?: string; } | any) => {
        // Kiểm tra xem khách thuê đã có trong danh sách form chưa
        // Nếu là khách thuê cũ, kiểm tra theo MaKhachThue.
        // Nếu là khách thuê mới, không có MaKhachThue, nhưng cũng không thể trùng lặp về thông tin (nên kiểm tra duy nhất ở backend)
        if (occupantToAdd.MaKhachThue && fields.some(field => field.MaKhachThue === occupantToAdd.MaKhachThue)) {
            toast({ title: "Thông báo", description: "Khách thuê đã có trong danh sách.", variant: "default" });
            return;
        }

        // Tự động gán người đại diện nếu đây là người đầu tiên được thêm vào danh sách
        append({
            ...occupantToAdd, // Bao gồm MaKhachThue HOẶC isNew, HoTen, SoDienThoai
            LaNguoiDaiDien: fields.length === 0
        });
    };

    // Callback này nhận dữ liệu thô của khách thuê mới từ AddNewTenantForm
    const handleNewTenantCreated = (newTenantData: { isNew: true; HoTen: string; SoDienThoai: string; CCCD?: string; Email?: string; GioiTinh?: 'Nam' | 'Nữ' | 'Khác'; QueQuan?: string; }) => {
        // Thêm dữ liệu khách thuê mới vào danh sách người ở của form
        handleAddOccupant(newTenantData);
        setIsNewTenantDialogOpen(false); // Đóng dialog
    };

    const handleSetRepresentative = (indexToUpdate: number) => {
        fields.forEach((field, index) => {
            update(index, { ...field, LaNguoiDaiDien: index === indexToUpdate });
        });
    };

    // async function processSubmit(data: ContractFormValues) {
    //     // Chuẩn bị payload cho backend
    //     const payload: IContractPayload = {
    //         ...data,
    //         NgayLap: format(new Date(), 'yyyy-MM-dd'),
    //         NgayBatDau: format(data.NgayBatDau, 'yyyy-MM-dd'),
    //         NgayKetThuc: format(data.NgayKetThuc, 'yyyy-MM-dd'),
    //         registeredServices: data.registeredServices || [],
    //         // TrangThai không được gửi từ frontend, vì backend sẽ tự xác định
    //         // TrangThai: data.TrangThai, // REMOVE THIS LINE or ensure it's not sent if backend controls it

    //         // Ánh xạ occupants để backend biết đâu là khách thuê mới cần tạo
    //         occupants: data.occupants.map(occ => {
    //             if (occ.isNew) {
    //                 // Dữ liệu cho khách thuê mới
    //                 return {
    //                     isNew: true,
    //                     HoTen: occ.HoTen!, // Yêu cầu có HoTen
    //                     SoDienThoai: occ.SoDienThoai!, // Yêu cầu có SoDienThoai
    //                     CCCD: occ.CCCD,
    //                     Email: occ.Email,
    //                     GioiTinh: occ.GioiTinh,
    //                     QueQuan: occ.QueQuan,
    //                     LaNguoiDaiDien: occ.LaNguoiDaiDien
    //                 };
    //             } else {
    //                 // Dữ liệu cho khách thuê đã tồn tại
    //                 return {
    //                     MaKhachThue: occ.MaKhachThue!, // Yêu cầu có MaKhachThue
    //                     LaNguoiDaiDien: occ.LaNguoiDaiDien
    //                 };
    //             }
    //         }) as any, // Dùng 'as any' tạm thời nếu TypeScript vẫn báo lỗi về kiểu union
    //     };

    //     // Đảm bảo TrangThai không bị gửi nếu nó không còn là một phần của payload từ frontend
    //     if ('TrangThai' in payload) {
    //         delete (payload as any).TrangThai;
    //     }

    //     await onSubmitAction(payload);
    // }

    async function processSubmit(data: ContractFormValues) {
        // Dữ liệu 'data' nhận vào đã được Zod xác thực thành công!
        console.log("Validation thành công, dữ liệu nhận được:", data);
        
        const formData = new FormData();
        const newTenantsWithFiles: { file: File; occupantData: any }[] = [];
        
        const contractFile = data.FileHopDong?.[0];

        // Tạo payload JSON, đồng thời tách các file ra
        const occupantsPayload = data.occupants.map(occ => {
            const occCopy = { ...occ };
            if (occCopy.isNew && isFile(occCopy.AnhGiayTo)) {
                newTenantsWithFiles.push({ file: occCopy.AnhGiayTo, occupantData: { ...occCopy } });
                delete (occCopy as any).AnhGiayTo;
            }
            return occCopy;
        });

        const { FileHopDong, ...jsonDataPayload } = data;
        const finalJsonData = {
            ...jsonDataPayload,
            occupants: occupantsPayload,
            NgayLap: format(new Date(), "yyyy-MM-dd"),
            NgayBatDau: format(data.NgayBatDau, "yyyy-MM-dd"),
            NgayKetThuc: format(data.NgayKetThuc, "yyyy-MM-dd"),
        };

        // Đóng gói vào FormData
        formData.append("contractData", JSON.stringify(finalJsonData));

        if (isFile(contractFile)) {
            formData.append("FileHopDong", contractFile);
        }
        newTenantsWithFiles.forEach((item) => {
            formData.append("AnhGiayTo", item.file, item.file.name);
        });

        // Gửi đi
        await onSubmitAction(formData);
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(processSubmit)} className="space-y-8">
                <div className="grid md:grid-cols-3 gap-8">
                    {/* Cột trái */}
                    <div className="md:col-span-2 space-y-6">
                        <Card>
                            <CardHeader><CardTitle>Thông tin chính</CardTitle></CardHeader>
                            <CardContent className="space-y-4">
                                {initialData ? ( // If in edit mode, display room as read-only
                                    <FormItem>
                                        <FormLabel>Phòng cho thuê</FormLabel>
                                        <FormControl>
                                            <Input value={currentRoomDisplay} readOnly disabled />
                                        </FormControl>
                                        <FormDescription>
                                            Phòng đã chọn cho hợp đồng này. Không thể thay đổi khi chỉnh sửa.
                                        </FormDescription>
                                    </FormItem>
                                ) : ( // If in create mode, display the Select dropdown
                                    <FormField
                                        control={form.control} name="MaPhong"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Phòng cho thuê</FormLabel>
                                                <Select onValueChange={(value) => handleRoomSelect(Number(value))} value={String(field.value || '')}>
                                                    <FormControl>
                                                        <SelectTrigger><SelectValue placeholder="Chọn một phòng..." /></SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {availableRooms.map(room => (
                                                            <SelectItem key={room.MaPhong} value={String(room.MaPhong)}>
                                                                {room.TenPhong} - {room.property?.TenNhaTro || 'N/A'}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                    <FormMessage />
                                                </Select>
                                            </FormItem>
                                        )}
                                    />
                                )}
                                <div className="grid md:grid-cols-2 gap-4">
                                    <FormField control={form.control} name="NgayBatDau" render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                            <FormLabel>Ngày bắt đầu</FormLabel>
                                            <Popover><PopoverTrigger asChild><FormControl>
                                                <Button variant={"outline"} className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                                                    {field.value ? format(field.value, "dd/MM/yyyy") : <span>Chọn ngày</span>}
                                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                </Button>
                                            </FormControl></PopoverTrigger><PopoverContent className="w-auto p-0" align="start">
                                                <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus/>
                                            </PopoverContent></Popover>
                                            <FormMessage />
                                        </FormItem>
                                    )}/>
                                    <FormField control={form.control} name="NgayKetThuc" render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                            <FormLabel>Ngày kết thúc</FormLabel>
                                            <Popover><PopoverTrigger asChild><FormControl>
                                                <Button variant={"outline"} className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                                                    {field.value ? format(field.value, "dd/MM/yyyy") : <span>Chọn ngày</span>}
                                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                </Button>
                                            </FormControl></PopoverTrigger><PopoverContent className="w-auto p-0" align="start">
                                                <Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date < (form.getValues("NgayBatDau") || new Date())} initialFocus/>
                                            </PopoverContent></Popover>
                                            <FormMessage />
                                        </FormItem>
                                    )}/>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader><CardTitle>Bên thuê</CardTitle></CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-2 mb-4">
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button variant="outline" className="w-full justify-start">
                                                <UserPlus className="mr-2 h-4 w-4"/> Thêm người ở
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-[300px] p-0">
                                            <Command>
                                                <CommandInput placeholder="Tìm khách thuê..."/>
                                                <CommandEmpty>Không tìm thấy.</CommandEmpty>
                                                <CommandList>
                                                    <CommandGroup>
                                                        {tenants.map(tenant => (
                                                            <CommandItem key={tenant.MaKhachThue} onSelect={() => handleAddOccupant({MaKhachThue: tenant.MaKhachThue, HoTen: tenant.HoTen})}>
                                                                {tenant.HoTen}
                                                            </CommandItem>
                                                        ))}
                                                    </CommandGroup>
                                                </CommandList>
                                            </Command>
                                            {/* Nút Thêm khách thuê mới trong Popover hoặc ngay bên cạnh */}
                                            <div className="p-2 border-t">
                                                <Dialog open={isNewTenantDialogOpen} onOpenChange={setIsNewTenantDialogOpen}>
                                                    <DialogTrigger asChild>
                                                        <Button variant="outline" className="w-full">
                                                            <UserPlus className="mr-2 h-4 w-4" /> Thêm khách thuê mới
                                                        </Button>
                                                    </DialogTrigger>
                                                    <DialogContent>
                                                        <AddNewTenantForm onTenantCreated={handleNewTenantCreated} onClose={() => setIsNewTenantDialogOpen(false)} />
                                                    </DialogContent>
                                                </Dialog>
                                            </div>
                                        </PopoverContent>
                                    </Popover>
                                </div>
                                <FormField control={form.control} name="occupants" render={() => (
                                    <FormItem>
                                        {fields.map((field, index) => {
                                            // Lấy thông tin hiển thị của người ở
                                            const tenantInfo = field.MaKhachThue 
                                                ? tenants.find(t => t.MaKhachThue === field.MaKhachThue) // Khách thuê cũ
                                                : field; // Khách thuê mới (dữ liệu trực tiếp từ form)
                                            return (
                                                <div key={field.id} className="flex items-center justify-between p-2 border rounded-md">
                                                    <span>
                                                        {tenantInfo?.HoTen || '...'}
                                                        {field.isNew && <Badge variant="secondary" className="ml-1">Mới</Badge>}
                                                    </span>
                                                    <div className="flex items-center gap-2">
                                                        <RadioGroup onValueChange={() => handleSetRepresentative(index)} value={field.LaNguoiDaiDien ? "rep" : `not-rep-${index}`}>
                                                            <div className="flex items-center space-x-2">
                                                                <RadioGroupItem value="rep" id={`rep-${index}`}/><Label htmlFor={`rep-${index}`}>Đại diện</Label>
                                                            </div>
                                                        </RadioGroup>
                                                        <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}><Trash2 className="h-4 w-4 text-red-500"/></Button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        {form.formState.errors.occupants && (
        <p className="text-sm font-medium text-destructive">
          { form.formState.errors.occupants.message || form.formState.errors.occupants.root?.message || 'Có lỗi với danh sách người ở, vui lòng kiểm tra lại.' }
        </p>
      )}
                                    </FormItem>
                                )} />  
                                <FormField
  control={form.control}
  name="FileHopDong" // Hãy chắc chắn tên này khớp với tên trong Zod schema của bạn
  render={({ field }) => (
    <FormItem>
      <FormLabel>Tệp hợp đồng đính kèm (PDF/Ảnh)</FormLabel>
      <FormControl>
        <Input
          type="file"
          accept=".pdf,image/*"
          // Ghi đè hàm onChange để lấy đúng giá trị FileList
          onChange={(event) => field.onChange(event.target.files)}
          // Các thuộc tính còn lại như ref, name, onBlur sẽ được `field` quản lý
          // Nhưng ta không truyền value và onChange mặc định của nó
          onBlur={field.onBlur}
          name={field.name}
          ref={field.ref}
        />
      </FormControl>
      <FormMessage /> 
      {/* FormMessage bây giờ sẽ hoạt động chính xác */}
    </FormItem>
  )}
/>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader><CardTitle>Dịch vụ cố định</CardTitle></CardHeader>
                            <CardContent>
                                <FormField control={form.control} name="registeredServices" render={() => (
                                    <FormItem>
                                        <div className='space-y-2'>
                                            {services && services.length > 0 ? services.map((service) => (
                                                <FormField key={service.MaDV} control={form.control} name="registeredServices" render={({ field }) => (
                                                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                                        <FormControl>
                                                            <Checkbox
                                                                checked={field.value?.includes(service.MaDV)}
                                                                onCheckedChange={(checked) => {
                                                                    const currentValue = field.value || [];
                                                                    return checked
                                                                        ? field.onChange([...currentValue, service.MaDV])
                                                                        : field.onChange(currentValue.filter((value) => value !== service.MaDV));
                                                                }}
                                                            />
                                                        </FormControl>
                                                        <FormLabel className="font-normal">{service.TenDV}</FormLabel>
                                                    </FormItem>
                                                )}/>
                                            )) : <p className="text-sm text-muted-foreground">Vui lòng chọn phòng để xem dịch vụ.</p>}
                                        </div>
                                    </FormItem>
                                )}/>
                            </CardContent>
                        </Card>
                    </div>
                    
                    {/* Cột phải */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader><CardTitle>Tài chính</CardTitle></CardHeader>
                            <CardContent className="space-y-4">
                                <FormField control={form.control} name="TienThueThoaThuan" render={({ field }) => (
                                    <FormItem><FormLabel>Tiền thuê thỏa thuận (VNĐ/tháng)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                                )}/>
                                <FormField control={form.control} name="TienCoc" render={({ field }) => (
                                    <FormItem><FormLabel>Tiền cọc (VNĐ)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                                )}/>
                                <FormField control={form.control} name="KyThanhToan" render={({ field }) => (
                                    <FormItem><FormLabel>Kỳ thanh toán</FormLabel><Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl><SelectTrigger><SelectValue placeholder="Chọn kỳ..." /></SelectTrigger></FormControl>
                                        <SelectContent><SelectItem value="Đầu kỳ">Đầu kỳ</SelectItem><SelectItem value="Cuối kỳ">Cuối kỳ</SelectItem></SelectContent>
                                    </Select><FormMessage /></FormItem>
                                )}/>
                                <FormField control={form.control} name="HanThanhToan" render={({ field }) => (
                                    <FormItem><FormLabel>Hạn thanh toán (ngày trong tháng)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                                )}/>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader><CardTitle>Khác</CardTitle></CardHeader>
                            <CardContent className="space-y-4">
                                <FormField control={form.control} name="GhiChu" render={({ field }) => (
                                    <FormItem><FormLabel>Ghi chú</FormLabel><FormControl><Textarea placeholder="Các điều khoản bổ sung..." {...field} /></FormControl><FormMessage /></FormItem>
                                )}/>
                                {/* Trạng thái hợp đồng được quyết định ở backend */}
                                {/* Bạn có thể thêm một trường hiển thị trạng thái hợp đồng nếu là edit mode, nhưng không cho phép chỉnh sửa */}
                            </CardContent>
                        </Card>
                        <Button type="submit" className="w-full" disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {initialData ? 'Lưu thay đổi' : 'Tạo hợp đồng'}
                        </Button>
                    </div>
                </div>
            </form>
        </Form>
    );
}