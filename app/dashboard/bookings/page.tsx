import Link from "next/link";

export const dynamic = "force-dynamic";

import { BookingStatusBadge } from "@/components/dashboard/booking-status-badge";
import { BookingDeleteAction } from "@/components/dashboard/booking-delete-action";
import {
  formatBookingDate,
  formatCreatedDate,
  formatCurrencyINR,
  formatEventType,
  formatShift,
  getBookingsTableData,
  type BookingStatus,
  type DashboardBooking,
} from "@/lib/dashboard";

interface BookingsPageProps {
  searchParams?: Promise<{
    q?: string | string[];
    status?: string | string[];
    sort?: string | string[];
    deleted?: string | string[];
  }>;
}

const statusFilterOptions: Array<"all" | BookingStatus> = [
  "all",
  "pending",
  "confirmed",
  "cancelled",
];

const sortOptions = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "date_asc", label: "Date: earliest" },
  { value: "date_desc", label: "Date: latest" },
] as const;

export default async function BookingsPage({
  searchParams,
}: BookingsPageProps) {
  let query = "";
  let statusFilter: "all" | BookingStatus = "all";
  let sort: "newest" | "oldest" | "date_asc" | "date_desc" = "newest";
  let deletionNotice = false;
  let bookings: DashboardBooking[] = [];
  let loadError: unknown = null;

  try {
    const params = await searchParams;
    const rawQuery = params?.q;
    const rawStatus = params?.status;
    const rawSort = params?.sort;
    deletionNotice = params?.deleted === "1";

    query =
      typeof rawQuery === "string"
        ? rawQuery.trim()
        : Array.isArray(rawQuery)
          ? rawQuery[0]?.trim() ?? ""
          : "";

    statusFilter =
      typeof rawStatus === "string"
        ? (rawStatus === "pending" || rawStatus === "confirmed" || rawStatus === "cancelled"
            ? rawStatus
            : "all")
        : Array.isArray(rawStatus)
          ? (rawStatus[0] === "pending" || rawStatus[0] === "confirmed" || rawStatus[0] === "cancelled"
              ? rawStatus[0]
              : "all")
          : "all";

    sort =
      typeof rawSort === "string"
        ? (rawSort === "oldest" || rawSort === "date_asc" || rawSort === "date_desc"
            ? rawSort
            : "newest")
        : Array.isArray(rawSort)
          ? (rawSort[0] === "oldest" || rawSort[0] === "date_asc" || rawSort[0] === "date_desc"
              ? rawSort[0]
              : "newest")
          : "newest";

    bookings = await getBookingsTableData(query, statusFilter, sort);
  } catch (error) {
    loadError = error;
    console.error("Failed to load booking records", error);
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
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-[0.24em] text-[#8d7650]">
            Operations
          </p>
          <h1 className="mt-2 text-3xl font-medium tracking-tight text-[#171614]">
            Booking enquiries
          </h1>
        </div>

        <form method="GET" action="/dashboard/bookings" className="grid w-full max-w-xl grid-cols-2 gap-2 md:flex md:gap-3">
          <label htmlFor="booking-search" className="sr-only">
            Search bookings
          </label>
          <div className="contents">
            <input
              id="booking-search"
              name="q"
              defaultValue={query}
              placeholder="Search by customer name or email"
              className="col-span-2 w-full min-w-0 rounded-xl border border-[#d7cec2] bg-white px-3 py-2.5 text-sm text-[#171614] placeholder:text-[#7c726a] outline-none transition focus:border-[#183d34] focus:ring-2 focus:ring-[#dfeae5] md:col-span-1 md:flex-1"
            />
            <select
              name="status"
              aria-label="Filter bookings by status"
              defaultValue={statusFilter}
              className="w-full min-w-0 rounded-xl border border-[#d7cec2] bg-white px-3 py-2.5 text-sm text-[#171614] outline-none transition focus:border-[#183d34] focus:ring-2 focus:ring-[#dfeae5]"
            >
              {statusFilterOptions.map((option) => (
                <option key={option} value={option}>
                  {option === "all" ? "All statuses" : option[0].toUpperCase() + option.slice(1)}
                </option>
              ))}
            </select>
            <select
              name="sort"
              aria-label="Sort bookings"
              defaultValue={sort}
              className="w-full min-w-0 rounded-xl border border-[#d7cec2] bg-white px-3 py-2.5 text-sm text-[#171614] outline-none transition focus:border-[#183d34] focus:ring-2 focus:ring-[#dfeae5]"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="col-span-2 inline-flex items-center justify-center rounded-xl bg-[#183d34] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#122d2a] md:col-span-1"
            >
              Apply
            </button>
          </div>
        </form>
      </div>

      {deletionNotice ? (
        <div
          role="status"
          className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800"
        >
          Cancelled booking deleted.
        </div>
      ) : null}

      {bookings.length === 0 ? (
        <div className="rounded-2xl border border-[#ded7cc] bg-white p-6 text-sm text-[#5f5853] shadow-sm">
          {query || statusFilter !== "all"
            ? "No bookings match the current filters."
            : "No booking enquiries yet."}
        </div>
      ) : (
        <div className="space-y-3 xl:hidden">
          {bookings.map((booking) => (
            <article
              key={booking.id}
              className="rounded-xl border border-[#ded7cc] bg-white p-4 shadow-sm"
            >
              <div className="flex min-w-0 items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="break-words text-sm font-semibold text-[#171614]">
                    {booking.customer_name ?? "Guest"}
                  </h2>
                  <p className="mt-1 break-all text-xs leading-5 text-[#655f5a]">
                    {booking.customer_email ?? "No email provided"}
                  </p>
                </div>
                <BookingStatusBadge status={booking.status} />
              </div>

              <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 border-t border-[#efebe5] pt-4 text-sm">
                <div>
                  <dt className="text-xs text-[#7c726a]">Event</dt>
                  <dd className="mt-1 font-medium text-[#34302c]">{formatEventType(booking.event_type)}</dd>
                </div>
                <div>
                  <dt className="text-xs text-[#7c726a]">Date</dt>
                  <dd className="mt-1 font-medium text-[#34302c]">{formatBookingDate(booking.event_date)}</dd>
                </div>
                <div>
                  <dt className="text-xs text-[#7c726a]">Shift</dt>
                  <dd className="mt-1 font-medium text-[#34302c]">{formatShift(booking.shift)}</dd>
                </div>
                <div>
                  <dt className="text-xs text-[#7c726a]">Guests</dt>
                  <dd className="mt-1 font-medium text-[#34302c]">{booking.guest_count}</dd>
                </div>
                <div>
                  <dt className="text-xs text-[#7c726a]">Estimated total</dt>
                  <dd className="mt-1 font-medium text-[#183d34]">{formatCurrencyINR(booking.estimated_total)}</dd>
                </div>
                <div>
                  <dt className="text-xs text-[#7c726a]">Created</dt>
                  <dd className="mt-1 font-medium text-[#34302c]">{formatCreatedDate(booking.created_at)}</dd>
                </div>
              </dl>

              <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-[#efebe5] pt-4">
                <Link
                  href={`/dashboard/bookings/${booking.id}`}
                  className="inline-flex min-h-10 flex-1 items-center justify-center rounded-lg border border-[#d7cec2] bg-white px-3 py-2 text-sm font-medium text-[#183d34] transition hover:border-[#183d34] hover:bg-[#edf3f1]"
                >
                  View details
                </Link>
                {booking.status === "cancelled" ? (
                  <BookingDeleteAction bookingId={booking.id} />
                ) : null}
              </div>
            </article>
          ))}
        </div>
      )}

      {bookings.length > 0 ? (
        <div className="hidden overflow-hidden rounded-2xl border border-[#ded7cc] bg-white shadow-sm xl:block">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-[#f4efe9] text-[#534d48]">
                <tr>
                  <th className="px-4 py-3 font-medium">Customer</th>
                  <th className="px-4 py-3 font-medium">Event</th>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Shift</th>
                  <th className="px-4 py-3 font-medium">Guests</th>
                  <th className="px-4 py-3 font-medium">Estimated Total</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Created</th>
                  <th className="px-4 py-3 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#efebe5] bg-white">
                {bookings.map((booking) => (
                  <tr key={booking.id} className="align-top">
                    <td className="px-4 py-3">
                      <div className="font-medium text-[#171614]">
                        {booking.customer_name ?? "Guest"}
                      </div>
                      <div className="mt-1 text-xs text-[#655f5a]">
                        {booking.customer_email ?? "No email provided"}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[#4f4a47]">
                      {formatEventType(booking.event_type)}
                    </td>
                    <td className="px-4 py-3 text-[#4f4a47]">
                      {formatBookingDate(booking.event_date)}
                    </td>
                    <td className="px-4 py-3 text-[#4f4a47]">
                      {formatShift(booking.shift)}
                    </td>
                    <td className="px-4 py-3 text-[#4f4a47]">
                      {booking.guest_count}
                    </td>
                    <td className="px-4 py-3 font-medium text-[#171614]">
                      {formatCurrencyINR(booking.estimated_total)}
                    </td>
                    <td className="px-4 py-3">
                      <BookingStatusBadge status={booking.status} />
                    </td>
                    <td className="px-4 py-3 text-[#4f4a47]">
                      {formatCreatedDate(booking.created_at)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex flex-wrap justify-end gap-2">
                        <Link
                          href={`/dashboard/bookings/${booking.id}`}
                          className="inline-flex items-center rounded-lg border border-[#d7cec2] bg-white px-3 py-1.5 text-xs font-medium text-[#183d34] transition hover:border-[#183d34] hover:bg-[#edf3f1]"
                        >
                          View details
                        </Link>
                        {booking.status === "cancelled" ? (
                          <BookingDeleteAction bookingId={booking.id} />
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      <div className="mt-4">
        <Link
          href="/dashboard"
          className="inline-flex items-center text-sm font-medium text-[#183d34] transition hover:text-[#0f2d2a]"
        >
          ← Back to overview
        </Link>
      </div>
    </div>
  );
}
