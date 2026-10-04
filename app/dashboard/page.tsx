import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { RecentBookings } from "@/components/dashboard/recent-bookings";
import { StatCard } from "@/components/dashboard/stat-card";
import { UpcomingEvents } from "@/components/dashboard/upcoming-events";
import { requireDashboardAccess } from "@/lib/auth";
import {
  formatCurrencyINR,
  getDashboardStats,
  getRecentBookings,
  getUpcomingBookings,
  type DashboardBooking,
  type DashboardStats,
} from "@/lib/dashboard";

export default async function DashboardPage() {
  let userEmail: string | null = null;
  let stats: DashboardStats = {
    totalEnquiries: 0,
    pending: 0,
    confirmed: 0,
    cancelled: 0,
    estimatedRevenue: 0,
    confirmedRevenueThisMonth: 0,
    upcomingEvents: 0,
  };
  let recentBookings: DashboardBooking[] = [];
  let upcomingEvents: DashboardBooking[] = [];
  let loadError: unknown = null;

  try {
    const { user } = await requireDashboardAccess();
    userEmail = user.email ?? null;

    [stats, recentBookings, upcomingEvents] = await Promise.all([
      getDashboardStats(),
      getRecentBookings(8),
      getUpcomingBookings(5),
    ]);
  } catch (error) {
    loadError = error;
    console.error("Dashboard page failed to load", error);
  }

  if (loadError) {
    return (
      <div className="rounded-2xl border border-[#ded7cc] bg-white p-6 shadow-sm">
        <p className="text-base font-medium text-[#171614]">
          Unable to load dashboard data. Please try again.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <DashboardHeader userEmail={userEmail} />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <div className="dashboard-stat-card">
          <StatCard
            title="Total Enquiries"
            value={String(stats.totalEnquiries)}
            detail="All bookings"
          />
        </div>
        <div className="dashboard-stat-card">
          <StatCard
            title="Pending"
            value={String(stats.pending)}
            detail="Awaiting action"
          />
        </div>
        <div className="dashboard-stat-card">
          <StatCard
            title="Confirmed"
            value={String(stats.confirmed)}
            detail="Active bookings"
          />
        </div>
        <div className="dashboard-stat-card">
          <StatCard
            title="Confirmed Revenue"
            value={formatCurrencyINR(stats.estimatedRevenue)}
            detail="All confirmed bookings"
          />
        </div>
        <div className="dashboard-stat-card">
          <StatCard
            title="This Month"
            value={formatCurrencyINR(stats.confirmedRevenueThisMonth)}
            detail="Current month revenue"
          />
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <div className="dashboard-panel">
          <RecentBookings bookings={recentBookings} />
        </div>

        <div className="dashboard-panel">
          <UpcomingEvents bookings={upcomingEvents} />
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-[#ded7cc] bg-white p-5 shadow-sm">
          <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-[#8d7650]">Operational summary</p>
          <div className="mt-5 space-y-3 text-sm text-[#4f4a47]">
            <div className="flex items-center justify-between gap-3">
              <span>Pending enquiries</span>
              <span className="font-medium text-[#171614]">{stats.pending}</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span>Upcoming events</span>
              <span className="font-medium text-[#171614]">{stats.upcomingEvents}</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span>Cancelled</span>
              <span className="font-medium text-[#171614]">{stats.cancelled}</span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-[#ded7cc] bg-white p-5 shadow-sm lg:col-span-2">
          <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-[#8d7650]">Revenue pacing</p>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-[#efeae3] bg-[#faf8f4] p-4">
              <p className="text-sm text-[#5f5853]">Confirmed revenue</p>
              <p className="mt-2 text-2xl font-medium text-[#171614]">{formatCurrencyINR(stats.estimatedRevenue)}</p>
            </div>
            <div className="rounded-xl border border-[#efeae3] bg-[#faf8f4] p-4">
              <p className="text-sm text-[#5f5853]">This month</p>
              <p className="mt-2 text-2xl font-medium text-[#171614]">{formatCurrencyINR(stats.confirmedRevenueThisMonth)}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
