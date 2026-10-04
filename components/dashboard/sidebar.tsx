"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarDays,
  ClipboardList,
  LayoutGrid,
  LogOut,
  Settings,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import { signOutUser } from "@/app/actions/auth";

interface SidebarProps {
  userEmail: string | null;
}

export function Sidebar({ userEmail }: SidebarProps) {
  const pathname = usePathname();

  const navigationItems = [
    { label: "Overview", href: "/dashboard", icon: LayoutGrid },
    { label: "Bookings", href: "/dashboard/bookings", icon: ClipboardList },
    { label: "Calendar", href: "/dashboard/calendar", icon: CalendarDays },
    { label: "Availability", href: "/dashboard/availability", icon: ShieldCheck },
  ] as const;

  return (
    <aside className="flex w-full shrink-0 flex-col border-b border-[#ded7cc] bg-[#f3efe9] px-4 py-4 md:min-h-screen md:w-[280px] md:border-b-0 md:border-r md:px-4 md:py-6">
      <div className="mb-4 px-1 md:mb-10 md:px-2">
        <p className="text-[10px] font-medium uppercase tracking-[0.28em] text-[#8d7650]">Utsav</p>
        <h2 className="mt-2 text-xl font-medium tracking-tight text-[#171614]">Spaces &amp; Banquets</h2>
      </div>

      <nav aria-label="Dashboard navigation" className="grid grid-cols-2 gap-2 md:block md:space-y-2">
        {navigationItems.map(({ label, href, icon: Icon }) => {
          const isActive = pathname === href || (href === "/dashboard" && pathname === "/dashboard");

          return (
            <Link
              key={label}
              href={href}
              className={[
                "flex min-w-0 items-center justify-center gap-2 rounded-xl px-2 py-2.5 text-sm font-medium transition md:justify-start md:gap-3 md:px-3",
                isActive
                  ? "bg-[#183d34] text-white shadow-sm"
                  : "text-[#2f2b29] hover:bg-[#efe9e0] hover:text-[#171614]",
              ].join(" ")}
            >
              <Icon className="h-4 w-4" />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-4 grid grid-cols-2 gap-2 border-t border-[#ded7cc] pt-3 md:mt-auto md:block md:space-y-3 md:pt-5">
        <Link
          href="/dashboard/settings"
          className={[
            "flex min-w-0 items-center justify-center gap-2 rounded-xl px-2 py-2.5 text-left text-sm font-medium transition md:w-full md:justify-start md:gap-3 md:px-3",
            pathname === "/dashboard/settings"
              ? "bg-[#183d34] text-white"
              : "text-[#2f2b29] hover:bg-[#efe9e0]",
          ].join(" ")}
        >
          <Settings className="h-4 w-4" />
          <span>Settings</span>
        </Link>

        <form action={signOutUser} className="w-full">
          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-xl px-2 py-2.5 text-sm font-medium text-[#2f2b29] transition hover:bg-[#efe9e0] md:justify-start md:gap-3 md:px-3"
          >
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </button>
        </form>
      </div>

      <div className="col-span-2 mt-1 flex min-w-0 items-center gap-3 rounded-xl border border-[#ded7cc] bg-white/60 px-3 py-2.5 text-xs text-[#453f3a] md:mt-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#e9e1d5] text-[#183d34]">
          <UserRound className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <p className="truncate font-medium text-[#171614]">{userEmail ?? "Owner"}</p>
        </div>
      </div>
    </aside>
  );
}
