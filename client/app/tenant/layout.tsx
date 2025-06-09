// file: client/app/tenant/layout.tsx
"use client";

import DashboardLayout from "@/components/dashboard/dashboard-layout";
import type React from "react";

export default function TenantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayout>{children}</DashboardLayout>;
}