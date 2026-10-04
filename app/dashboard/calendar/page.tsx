import { OperationalCalendar } from "@/components/dashboard/operational-calendar";
import { getCalendarMonthData } from "@/lib/dashboard";
import { requireDashboardAccess } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function DashboardCalendarPage() {
  await requireDashboardAccess();

  const now = new Date();
  const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const days = await getCalendarMonthData(now);

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-[#8d7650]">Operations</p>
          <h1 className="mt-2 text-3xl font-medium tracking-tight text-[#171614]">Calendar</h1>
        </div>
      </div>

      <OperationalCalendar month={month} days={days} />
    </div>
  );
}
