import { Skeleton } from "@/components/ui/skeleton"
import DashboardLayout from "@/components/dashboard/dashboard-layout"

export default function TenantUtilitiesLoading() {
  return (
    <DashboardLayout userRole="tenant">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-[180px]" />
        </div>

        <Skeleton className="h-[200px] w-full" />

        <div className="space-y-2">
          <Skeleton className="h-10 w-[300px]" />
          <Skeleton className="h-[400px] w-full" />
        </div>
      </div>
    </DashboardLayout>
  )
}
