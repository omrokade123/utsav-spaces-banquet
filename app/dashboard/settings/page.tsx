import { requireDashboardAccess } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function DashboardSettingsPage() {
  const { user, profile } = await requireDashboardAccess();

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-[#8d7650]">Account</p>
        <h1 className="mt-2 text-3xl font-medium tracking-tight text-[#171614]">Settings</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-[#ded7cc] bg-white p-5 shadow-sm">
          <h2 className="text-lg font-medium text-[#171614]">Account</h2>
          <dl className="mt-5 space-y-4 text-sm text-[#4f4a47]">
            <div className="flex items-center justify-between gap-4 border-b border-[#efeae3] pb-3">
              <dt className="text-[#8d7650]">Email</dt>
              <dd className="font-medium text-[#171614]">{user.email ?? "Not available"}</dd>
            </div>
            <div className="flex items-center justify-between gap-4 border-b border-[#efeae3] pb-3">
              <dt className="text-[#8d7650]">Role</dt>
              <dd className="font-medium text-[#171614]">{profile.role}</dd>
            </div>
          </dl>
        </section>

        <section className="rounded-2xl border border-[#ded7cc] bg-white p-5 shadow-sm">
          <h2 className="text-lg font-medium text-[#171614]">Business information</h2>
          <div className="mt-5 rounded-xl border border-dashed border-[#ded7cc] bg-[#faf7f3] p-4 text-sm text-[#5f5853]">
            Business profile details are not configured for this workspace yet, so the operational account information above is shown as read-only.
          </div>
        </section>
      </div>
    </div>
  );
}
