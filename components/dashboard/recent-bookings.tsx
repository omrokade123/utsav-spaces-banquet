import Link from "next/link";

import {
  formatBookingDate,
  formatCurrencyINR,
  formatEventType,
  formatShift,
  type DashboardBooking,
} from "@/lib/dashboard";
import { BookingStatusBadge } from "@/components/dashboard/booking-status-badge";

interface RecentBookingsProps {
  bookings: DashboardBooking[];
}

export function RecentBookings({ bookings }: RecentBookingsProps) {
  if (!bookings.length) {
    return (
      <section className="dashboard-panel rounded-2xl border border-[#ded7cc] bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-medium text-[#171614]">
            Recent Bookings
          </h2>
        </div>
        <p className="mt-6 text-sm text-[#5f5853]">
          No booking enquiries yet.
        </p>
      </section>
    );
  }

  return (
    <section className="dashboard-panel rounded-2xl border border-[#ded7cc] bg-white p-4 shadow-sm sm:p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-lg font-medium text-[#171614]">
          Recent Bookings
        </h2>

        <Link
          href="/dashboard/bookings"
          className="text-sm font-medium text-[#183d34] transition hover:text-[#0f2d2a]"
        >
          View all bookings →
        </Link>
      </div>

      <div className="hidden md:block">
        <div className="overflow-hidden rounded-xl border border-[#e7e1d7]">
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
              </tr>
            </thead>
            <tbody className="divide-y divide-[#efebe5] bg-white">
              {bookings.map((booking) => (
                <tr key={booking.id} className="align-middle">
                  <td className="px-4 py-3">
                    <div className="font-medium text-[#171614]">
                      {booking.customer_name ?? "Guest"}
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="space-y-3 md:hidden">
        {bookings.map((booking) => (
          <article
            key={booking.id}
            className="rounded-xl border border-[#ded7cc] bg-[#f9f6f1] p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-medium text-[#171614]">
                  {booking.customer_name ?? "Guest"}
                </p>
                <p className="mt-1 text-xs uppercase tracking-[0.16em] text-[#8d7650]">
                  {formatEventType(booking.event_type)}
                </p>
              </div>
              <BookingStatusBadge status={booking.status} />
            </div>

            <dl className="mt-3 grid grid-cols-2 gap-y-2 text-xs text-[#554f4b]">
              <div>
                <dt className="text-[#8d7650]">Date</dt>
                <dd className="mt-1 font-medium text-[#171614]">
                  {formatBookingDate(booking.event_date)}
                </dd>
              </div>
              <div>
                <dt className="text-[#8d7650]">Shift</dt>
                <dd className="mt-1 font-medium text-[#171614]">
                  {formatShift(booking.shift)}
                </dd>
              </div>
              <div>
                <dt className="text-[#8d7650]">Guests</dt>
                <dd className="mt-1 font-medium text-[#171614]">
                  {booking.guest_count}
                </dd>
              </div>
              <div>
                <dt className="text-[#8d7650]">Total</dt>
                <dd className="mt-1 font-medium text-[#171614]">
                  {formatCurrencyINR(booking.estimated_total)}
                </dd>
              </div>
            </dl>
          </article>
        ))}
      </div>
    </section>
  );
}
