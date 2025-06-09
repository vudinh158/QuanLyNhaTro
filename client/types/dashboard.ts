import type { IContract } from './contract';
import type { IInvoice } from './invoice';
import type { INotificationReadStatus } from './notification';


export interface IDashboardSummary {
    // Thẻ thống kê chính
    propertyCount: number;
    tenantCount: number;
    roomSummary: {
        total: number;
        occupied: number;
        vacant: number;
        deposit: number;
        repairing: number;
    };
    
    // Thống kê doanh thu tháng
    monthlyRevenue: {
        total: number;
        paid: number;
        unpaid: number;
    };

    // Danh sách cần hành động
    expiringContracts: IContract[];
    unpaidInvoices: IInvoice[];
}

export interface ITenantDashboardSummary {
    activeContract: IContract | null;
    nextUnpaidInvoice: IInvoice | null;
    recentNotifications: INotificationReadStatus[];
}