import { requireDashboardAccess } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-server";
import { AvailabilityManager } from "@/components/dashboard/availability-manager";

export const dynamic = "force-dynamic";

export default async function AvailabilityPage() {
  await requireDashboardAccess();

  const { data: blocks, error } = await supabaseAdmin
    .from("venue_blocks")
    .select("id, event_date, shift, reason, created_at")
    .order("event_date", { ascending: true })
    .limit(100);

  if (error) {
    return (
      <div className="rounded-2xl border border-[#ded7cc] bg-white p-6 shadow-sm">
        <p className="text-base font-medium text-[#171614]">Unable to load availability information.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-[#8d7650]">Venue management</p>
        <h1 className="mt-2 text-3xl font-medium tracking-tight text-[#171614]">Availability</h1>
      </div>

      <AvailabilityManager initialBlocks={blocks ?? []} />
    </div>
  );
}
