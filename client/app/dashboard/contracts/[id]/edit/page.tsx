// file: client/app/dashboard/contracts/[id]/edit/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';
import { updateContract, getContractById } from '@/services/contractService';
import { ContractForm } from '@/app/dashboard/contracts/ContractForm';
import { IContract, IContractPayload } from '@/types/contract';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function EditContractPage() {
    const router = useRouter();
    const params = useParams();
    const id = Number(params.id);
    const { toast } = useToast();
    
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [initialData, setInitialData] = useState<IContract | null>(null);
    const [isLoadingData, setIsLoadingData] = useState(true);

    useEffect(() => {
        if (isNaN(id)) {
            toast({ title: 'Lỗi', description: 'Mã hợp đồng không hợp lệ.', variant: 'destructive' });
            router.push('/dashboard/contracts');
            return;
        }

        getContractById(id)
            .then(data => setInitialData(data))
            .catch(() => {
                toast({ title: 'Lỗi', description: 'Không tìm thấy dữ liệu hợp đồng.', variant: 'destructive' });
                router.push('/dashboard/contracts');
            })
            .finally(() => setIsLoadingData(false));
    }, [id, router, toast]);

    const handleUpdateContract = async (data: IContractPayload) => {
        setIsSubmitting(true);
        try {
            const updatedContract = await updateContract(id, data);
            toast({ title: 'Thành công!', description: `Đã cập nhật hợp đồng #${updatedContract.MaHopDong}.` });
            router.push(`/dashboard/contracts/${updatedContract.MaHopDong}`);
        } catch (error: any) {
            toast({ title: 'Lỗi xảy ra', description: error.message, variant: 'destructive' });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoadingData) {
        return <div className="container mx-auto py-10"><Skeleton className="h-96 w-full" /></div>;
    }

    return (
        <div className="container mx-auto py-10">
            <div className="flex items-center mb-6">
                <Button variant="outline" size="icon" asChild className="mr-2">
                    <Link href={`/dashboard/contracts/${id}`}>
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <h1 className="text-3xl font-bold tracking-tight">Chỉnh sửa Hợp đồng #{id}</h1>
            </div>
            {initialData && (
                <ContractForm 
                    onSubmitAction={handleUpdateContract} 
                    isSubmitting={isSubmitting} 
                    initialData={initialData}
                />
            )}
        </div>
    );
}