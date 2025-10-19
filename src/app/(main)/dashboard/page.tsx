import { QuickActions } from "@/components/dashboard/quick-actions";
import { ActiveQueues } from "@/components/dashboard/active-queues";
import { RecentDocuments } from "@/components/dashboard/recent-documents";
import { UserQrCode } from "@/components/dashboard/user-qr-code";
import { PageHeader } from "@/components/page-header";

export default function DashboardPage() {
  return (
    <>
      <PageHeader
        title="Welcome Back!"
        subtitle="Here's a quick overview of your account."
      />
      <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
        <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-2">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <QuickActions />
          </div>
          <RecentDocuments />
        </div>
        <div className="grid auto-rows-max items-start gap-4 md:gap-8">
          <UserQrCode />
          <ActiveQueues />
        </div>
      </div>
    </>
  );
}
