import { Sidebar } from "@/components/dashboard/sidebar";
import { requireDashboardAccess } from "@/lib/auth";
import { DashboardAnimation } from "@/components/dashboard/dashboard-animation";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = await requireDashboardAccess();

  return (
    <div className="min-h-screen bg-[#f7f3ec] text-[#171614]">
      <div className="mx-auto flex max-w-[1600px] flex-col md:flex-row">
        <Sidebar userEmail={user.email ?? null} />

        <main className="flex-1 overflow-x-hidden p-4 pb-10 md:p-8">
          <DashboardAnimation>{children}</DashboardAnimation>
        </main>
      </div>
    </div>
  );
}
