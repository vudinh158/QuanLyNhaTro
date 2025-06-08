// file: client/app/dashboard/contracts/columns.tsx
"use client";

import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { IContract } from "@/types/contract";
import Link from "next/link";
import { format } from 'date-fns';

const getRepresentativeTenant = (contract: IContract) => {
    const rep = contract.occupants.find(o => o.LaNguoiDaiDien);
    return rep ? rep.tenant.HoTen : 'Chưa có';
}

const getStatusBadge = (status: IContract['TrangThai']) => {
    const variants = {
        'Có hiệu lực': 'success',
        'Mới tạo': 'secondary',
        'Hết hiệu lực': 'outline',
        'Đã thanh lý': 'destructive',
    } as const;
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>;
}

export const columns = (onTerminate: (id: number) => void): ColumnDef<IContract>[] => [
  {
    accessorKey: "MaHopDong",
    header: "ID",
    cell: ({ row }) => <div className="font-mono">HD{row.original.MaHopDong}</div>
  },
  {
    accessorKey: "room.TenPhong",
    header: "Phòng",
  },
  {
    id: "tenant",
    header: "Người đại diện",
    cell: ({ row }) => getRepresentativeTenant(row.original)
  },
  {
    accessorKey: "NgayBatDau",
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Ngày Bắt Đầu <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => format(new Date(row.getValue("NgayBatDau")), "dd/MM/yyyy")
  },
  {
    accessorKey: "TrangThai",
    header: "Trạng thái",
    cell: ({ row }) => getStatusBadge(row.getValue("TrangThai"))
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const contract = row.original;
      const isTerminatable = contract.TrangThai === 'Có hiệu lực' || contract.TrangThai === 'Hết hiệu lực';
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Hành động</DropdownMenuLabel>
            <Link href={`/dashboard/contracts/${contract.MaHopDong}`} passHref><DropdownMenuItem>Xem chi tiết</DropdownMenuItem></Link>
            <Link href={`/dashboard/contracts/${contract.MaHopDong}/edit`} passHref><DropdownMenuItem>Chỉnh sửa</DropdownMenuItem></Link>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onTerminate(contract.MaHopDong)} className="text-red-600 focus:text-red-50 focus:bg-red-500" disabled={!isTerminatable}>
                Thanh lý hợp đồng
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];