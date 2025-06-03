// apps/client-nextjs/app/(dashboard)/layout.tsx
import type React from 'react';
import DashboardLayoutComponent from '@/components/dashboard/dashboard-layout';

export default function DashboardGroupLayout({ 
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardLayoutComponent>
      {children}
    </DashboardLayoutComponent>
  );
}