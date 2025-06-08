// file: client/app/dashboard/contracts/page.tsx
'use client';

import { useEffect, useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DataTable } from '@/components/ui/data-table';
import { columns } from './columns';
import { IContract } from '@/types/contract';
import { getContracts, terminateContract } from '@/services/contractService';
import { useToast } from '@/components/ui/use-toast';
import { PlusCircle } from 'lucide-react';
import Link from 'next/link';
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useDebounce } from '@/hooks/use-debounce';

export default function ContractsPage() {
  const [contracts, setContracts] = useState<IContract[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [selectedContractId, setSelectedContractId] = useState<number | null>(null);

  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const { toast } = useToast();

  const fetchContracts = useMemo(() => async () => {
    setLoading(true);
    try {
      const data = await getContracts({ search: debouncedSearchTerm });
      setContracts(data);
    } catch (error) {
      toast({ title: 'Lỗi', description: 'Không thể tải danh sách hợp đồng.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [debouncedSearchTerm, toast]);

  useEffect(() => {
    fetchContracts();
  }, [fetchContracts]);

  const handleOpenTerminateDialog = (id: number) => {
    setSelectedContractId(id);
    setIsAlertOpen(true);
  };

  const handleTerminate = async () => {
    if (!selectedContractId) return;
    try {
        await terminateContract(selectedContractId);
        toast({ title: "Thành công", description: "Hợp đồng đã được thanh lý." });
        fetchContracts();
    } catch(error: any) {
        toast({
            title: "Thanh lý thất bại",
            description: error.message || "Đã có lỗi xảy ra. Vui lòng thử lại.",
            variant: "destructive"
        });
    } finally {
        setIsAlertOpen(false);
        setSelectedContractId(null);
    }
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Quản lý Hợp đồng</h1>
        <Link href="/dashboard/contracts/new" passHref>
          <Button><PlusCircle className="mr-2 h-4 w-4" /> Tạo hợp đồng mới</Button>
        </Link>
      </div>
      <div className="flex items-center py-4">
        <Input
          placeholder="Tìm kiếm theo ID, tên phòng, người thuê..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>
      <DataTable columns={columns(handleOpenTerminateDialog)} data={contracts} isLoading={loading} />

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Bạn có chắc chắn muốn thanh lý hợp đồng này?</AlertDialogTitle>
              <AlertDialogDescription>
                  Hành động này sẽ kết thúc hợp đồng và cập nhật trạng thái phòng.
                  Lưu ý: Bạn sẽ không thể thực hiện nếu hợp đồng còn công nợ chưa thanh toán.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Hủy</AlertDialogCancel>
              <AlertDialogAction onClick={handleTerminate} className="bg-red-600 hover:bg-red-700">Xác nhận Thanh lý</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}