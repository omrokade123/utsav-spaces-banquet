import { formatOwnerDisplayName, getTimeGreeting } from "@/lib/dashboard";

interface DashboardHeaderProps {
  userEmail: string | null;
}

export function DashboardHeader({ userEmail }: DashboardHeaderProps) {
  const greeting = getTimeGreeting();
  const displayName = formatOwnerDisplayName(userEmail);

  return (
    <header className="dashboard-header">
      <p className="text-[10px] font-medium uppercase tracking-[0.24em] text-[#8d7650]">
        Utsav Spaces &amp; Banquets
      </p>
      <h1 className="mt-3 text-3xl font-medium tracking-tight text-[#171614] md:text-4xl">
        {greeting}, {displayName}
      </h1>
      <p className="mt-2 max-w-2xl text-sm text-[#544d49] md:text-base">
        Here&apos;s what&apos;s happening with your venue today.
      </p>
    </header>
  );
}
