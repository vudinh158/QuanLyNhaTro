// apps/client-nextjs/app/(dashboard)/layout.tsx
import type React from 'react';
import { Toaster } from '@/components/ui/toaster'; // Hoặc sonner Toaster
import DashboardLayoutComponent from '@/components/dashboard/dashboard-layout';

export default function DashboardGroupLayout({ 
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <DashboardLayoutComponent>
              {children}
              {/* <Toaster /> */}
      </DashboardLayoutComponent>
      
    </>
  );
}