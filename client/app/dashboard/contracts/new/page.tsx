// file: client/app/dashboard/contracts/new/page.tsx
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';
import { createContract } from '@/services/contractService';
import { ContractForm } from '@/app/dashboard/contracts/ContractForm';
import { IContractPayload } from '@/types/contract';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function NewContractPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleCreateContract = async (data: IContractPayload) => {
        setIsSubmitting(true);
        try {
            const newContract = await createContract(data);
            toast({ title: 'Thành công!', description: `Đã tạo hợp đồng #${newContract.MaHopDong} thành công.` });
            router.push(`/dashboard/contracts/${newContract.MaHopDong}`);
        } catch (error: any) {
            toast({ title: 'Lỗi xảy ra', description: error.message || 'Không thể tạo hợp đồng. Vui lòng thử lại.', variant: 'destructive' });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="container mx-auto py-10">
             <div className="flex items-center mb-6">
                <Button variant="outline" size="icon" asChild className="mr-2">
                    <Link href="/dashboard/contracts">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <h1 className="text-3xl font-bold tracking-tight">Tạo hợp đồng mới</h1>
            </div>
            <ContractForm onSubmitAction={handleCreateContract} isSubmitting={isSubmitting} />
        </div>
    );
}