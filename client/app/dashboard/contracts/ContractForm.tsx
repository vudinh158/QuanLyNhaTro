// file: client/app/dashboard/contracts/ContractForm.tsx
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

// Icons
import { CalendarIcon, Loader2, Trash2, UserPlus } from 'lucide-react';

// Utils & Services
import { cn } from '@/lib/utils';
import { format, subDays, parseISO, isValid, addMonths } from 'date-fns';
import { getAvailableRoomsForContract } from '@/services/roomService';
import { getAllTenantsForLandlord } from '@/services/tenantService';
import { getServicesByProperty } from '@/services/serviceService';
import { IContract, IContractPayload } from '@/types/contract';
import type { Room } from '@/types/room'; // Sử dụng IRoom thay vì Room để nhất quán
import type { Tenant } from '@/types/tenant'; // Sử dụng ITenant thay vì Tenant
import type { IService } from '@/types/service';

// Định nghĩa schema validation bằng Zod
const contractFormSchema = z.object({
  MaPhong: z.coerce.number({ required_error: 'Vui lòng chọn phòng.' }).positive('Vui lòng chọn phòng.'),
  NgayBatDau: z.date({ required_error: 'Vui lòng chọn ngày bắt đầu.' }),
  NgayKetThuc: z.date({ required_error: 'Vui lòng chọn ngày kết thúc.' }),
  TienCoc: z.coerce.number().min(0, 'Tiền cọc không được âm.').default(0),
  TienThueThoaThuan: z.coerce.number().min(1, 'Tiền thuê phải lớn hơn 0.'),
  KyThanhToan: z.enum(['Đầu kỳ', 'Cuối kỳ'], { required_error: 'Vui lòng chọn kỳ thanh toán.' }),
  HanThanhToan: z.coerce.number().min(1, 'Hạn thanh toán phải là số dương.').max(28, 'Hạn thanh toán không quá ngày 28.'),
  TrangThai: z.enum(['Mới tạo', 'Có hiệu lực', 'Hết hiệu lực', 'Đã thanh lý']),
  GhiChu: z.string().optional(),
  occupants: z.array(z.object({
    MaKhachThue: z.number(),
    LaNguoiDaiDien: z.boolean(),
  })).min(1, 'Phải có ít nhất một người ở.'),
  registeredServices: z.array(z.number()).optional(),
}).refine(data => data.NgayKetThuc > data.NgayBatDau, {
  message: 'Ngày kết thúc phải sau ngày bắt đầu.',
  path: ['NgayKetThuc'],
}).refine(data => data.occupants.filter(o => o.LaNguoiDaiDien).length === 1, {
  message: 'Phải có đúng một người đại diện.',
  path: ['occupants'],
});

type ContractFormValues = z.infer<typeof contractFormSchema>;

interface ContractFormProps {
    initialData?: IContract;
    onSubmitAction: (data: IContractPayload) => Promise<any>;
    isSubmitting: boolean;
}

export function ContractForm({ initialData, onSubmitAction, isSubmitting }: ContractFormProps) {
    const { toast } = useToast();
    const [availableRooms, setAvailableRooms] = useState<Room[]>([]);
    const [tenants, setTenants] = useState<Tenant[]>([]);
    const [services, setServices] = useState<IService[]>([]);

    const form = useForm<ContractFormValues>({
        resolver: zodResolver(contractFormSchema),
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
                HanThanhToan: initialData.HanThanhToan,
                TrangThai: initialData.TrangThai,
                GhiChu: initialData.GhiChu || '',
                occupants: initialData.occupants.map(o => ({
                    MaKhachThue: o.MaKhachThue,
                    LaNguoiDaiDien: o.LaNguoiDaiDien,
                })),
                registeredServices: initialData.registeredServices.map(s => s.MaDV),
            });
        } else {
            form.reset({
                MaPhong: 0, // Dùng số 0 hoặc null, nhưng 0 dễ xử lý hơn với coerce
                NgayBatDau: new Date(),
                NgayKetThuc: addMonths(new Date(), 6), // Mặc định hợp đồng 6 tháng
                TienCoc: 0,
                TienThueThoaThuan: 0, // Giá trị ban đầu, sẽ được cập nhật khi chọn phòng
                KyThanhToan: 'Cuối kỳ',
                HanThanhToan: 5,
                TrangThai: 'Có hiệu lực',
                occupants: [],
                registeredServices: [],
                GhiChu: '',
            });
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
                    getAllTenantsForLandlord({})
                ]);
                setAvailableRooms(roomsData);
                setTenants(tenantsData);

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
                setServices(servicesData);
            } catch (error: any) {
                toast({ title: "Lỗi", description: `Không thể tải dịch vụ: ${error.message}`, variant: "destructive" });
            }
        }
    };

    const handleAddOccupant = (tenantId: number) => {
        if (fields.some(field => field.MaKhachThue === tenantId)) {
            toast({ title: "Thông báo", description: "Khách thuê đã có trong danh sách." });
            return;
        }
        append({ MaKhachThue: tenantId, LaNguoiDaiDien: fields.length === 0 });
    };

    const handleSetRepresentative = (indexToUpdate: number) => {
        fields.forEach((field, index) => {
            update(index, { ...field, LaNguoiDaiDien: index === indexToUpdate });
        });
    };

    async function processSubmit(data: ContractFormValues) {
        const payload: IContractPayload = {
            ...data,
            NgayLap: format(new Date(), 'yyyy-MM-dd'),
            NgayBatDau: format(data.NgayBatDau, 'yyyy-MM-dd'),
            NgayKetThuc: format(data.NgayKetThuc, 'yyyy-MM-dd'),
            registeredServices: data.registeredServices || [],
        };
        await onSubmitAction(payload);
    }

    return (
        <Form {...form}>
            {/* FIX 1: Sửa onSubmit thành processSubmit */}
            <form onSubmit={form.handleSubmit(processSubmit)} className="space-y-8">
                <div className="grid md:grid-cols-3 gap-8">
                    {/* Cột trái */}
                    <div className="md:col-span-2 space-y-6">
                        <Card>
                            <CardHeader><CardTitle>Thông tin chính</CardTitle></CardHeader>
                            <CardContent className="space-y-4">
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
                                                            {/* FIX 2: Sửa lỗi 'possibly undefined' */}
                                                            {room.TenPhong} - {room.property?.TenNhaTro || 'N/A'}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
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
                                    <Popover><PopoverTrigger asChild><Button variant="outline" className="w-full justify-start">
                                        <UserPlus className="mr-2 h-4 w-4"/> Thêm người ở</Button>
                                    </PopoverTrigger><PopoverContent className="w-[300px] p-0">
                                        <Command><CommandInput placeholder="Tìm khách thuê..."/><CommandEmpty>Không tìm thấy.</CommandEmpty><CommandList><CommandGroup>
                                            {tenants.map(tenant => (
                                                <CommandItem key={tenant.MaKhachThue} onSelect={() => handleAddOccupant(tenant.MaKhachThue)}>{tenant.HoTen}</CommandItem>
                                            ))}
                                        </CommandGroup></CommandList></Command>
                                    </PopoverContent></Popover>
                                </div>
                                <FormField control={form.control} name="occupants" render={() => (
                                    <FormItem>
                                        {fields.map((field, index) => {
                                            const tenantInfo = tenants.find(t => t.MaKhachThue === field.MaKhachThue);
                                            return (
                                                <div key={field.id} className="flex items-center justify-between p-2 border rounded-md">
                                                    <span>{tenantInfo?.HoTen || '...'}</span>
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
                                        <FormMessage />
                                    </FormItem>
                                )}/>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader><CardTitle>Dịch vụ cố định</CardTitle></CardHeader>
                            <CardContent>
                                <FormField control={form.control} name="registeredServices" render={() => (
                                    <FormItem>
                                        <div className='space-y-2'>
                                            {services.length > 0 ? services.map((service) => (
                                                <FormField key={service.MaDV} control={form.control} name="registeredServices" render={({ field }) => (
                                                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                                        <FormControl>
                                                            <Checkbox
                                                                checked={field.value?.includes(service.MaDV)}
                                                                onCheckedChange={(checked) => {
                                                                    // FIX 3: Sửa lỗi spread undefined
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
                                <FormField control={form.control} name="TrangThai" render={({ field }) => (
                                    <FormItem><FormLabel>Trạng thái ban đầu</FormLabel><Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl>
                                        <SelectContent>
                                            <SelectItem value="Có hiệu lực">Có hiệu lực</SelectItem>
                                            {/* FIX 4: Sửa lỗi thẻ đóng JSX */}
                                            <SelectItem value="Mới tạo">Mới tạo (giữ chỗ)</SelectItem>
                                        </SelectContent>
                                    </Select><FormDescription>Chọn "Mới tạo" nếu chỉ đặt cọc giữ chỗ.</FormDescription><FormMessage /></FormItem>
                                )}/>
                            </CardContent>
                        </Card>
                        {/* FIX 5: Sửa `isLoading` thành `isSubmitting` */}
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