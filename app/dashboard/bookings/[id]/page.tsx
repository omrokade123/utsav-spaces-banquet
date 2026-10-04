import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

import { BookingStatusBadge } from "@/components/dashboard/booking-status-badge";
import { BookingStatusActions } from "@/components/dashboard/booking-status-actions";
import { BookingDeleteAction } from "@/components/dashboard/booking-delete-action";
import { requireDashboardAccess } from "@/lib/auth";
import {
  formatBookingDate,
  formatCreatedDate,
  formatCurrencyINR,
  formatEventType,
  formatShift,
  getBookingById,
} from "@/lib/dashboard";

interface BookingDetailsPageProps {
  params: Promise<{ id: string }>;
}

export default async function BookingDetailsPage({
  params,
}: BookingDetailsPageProps) {
  const { id } = await params;

  await requireDashboardAccess();

  const booking = await getBookingById(id);

  if (!booking) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-[0.24em] text-[#8d7650]">
            Booking details
          </p>
          <h1 className="mt-2 text-3xl font-medium tracking-tight text-[#171614]">
            {booking.customer_name ?? "Guest enquiry"}
          </h1>
        </div>

        <Link
          href="/dashboard/bookings"
          className="inline-flex items-center text-sm font-medium text-[#183d34] transition hover:text-[#0f2d2a]"
        >
          ← Back to enquiries
        </Link>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.5fr_0.8fr]">
        <div className="rounded-2xl border border-[#ded7cc] bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#efeae3] pb-4">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-[#8d7650]">
                Booking ID
              </p>
              <p className="mt-2 font-mono text-sm text-[#171614]">
                {booking.id}
              </p>
            </div>
            <BookingStatusBadge status={booking.status} />
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-[#efeae3] bg-[#faf8f4] p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-[#8d7650]">
                Event type
              </p>
              <p className="mt-2 text-lg font-medium text-[#171614]">
                {formatEventType(booking.event_type)}
              </p>
            </div>

            <div className="rounded-xl border border-[#efeae3] bg-[#faf8f4] p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-[#8d7650]">
                Date &amp; shift
              </p>
              <p className="mt-2 text-lg font-medium text-[#171614]">
                {formatBookingDate(booking.event_date)}
              </p>
              <p className="mt-1 text-sm text-[#5f5853]">
                {formatShift(booking.shift)} shift
              </p>
            </div>

            <div className="rounded-xl border border-[#efeae3] bg-[#faf8f4] p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-[#8d7650]">
                Guest count
              </p>
              <p className="mt-2 text-lg font-medium text-[#171614]">
                {booking.guest_count}
              </p>
            </div>

            <div className="rounded-xl border border-[#efeae3] bg-[#faf8f4] p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-[#8d7650]">
                Estimated total
              </p>
              <p className="mt-2 text-lg font-medium text-[#171614]">
                {formatCurrencyINR(booking.estimated_total)}
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-[#8d7650]">
                Customer
              </p>
              <ul className="mt-3 space-y-2 text-sm text-[#4f4a47]">
                <li>
                  <span className="font-medium text-[#171614]">Name:</span>{" "}
                  {booking.customer_name ?? "Guest"}
                </li>
                <li>
                  <span className="font-medium text-[#171614]">Email:</span>{" "}
                  {booking.customer_email ?? "Not provided"}
                </li>
                <li>
                  <span className="font-medium text-[#171614]">Phone:</span>{" "}
                  {booking.customer_phone ?? "Not provided"}
                </li>
              </ul>
            </div>

            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-[#8d7650]">
                Booking timeline
              </p>
              <ul className="mt-3 space-y-2 text-sm text-[#4f4a47]">
                <li>
                  <span className="font-medium text-[#171614]">Created:</span>{" "}
                  {formatCreatedDate(booking.created_at)}
                </li>
                <li>
                  <span className="font-medium text-[#171614]">Updated:</span>{" "}
                  {formatCreatedDate(booking.updated_at)}
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-6 rounded-xl border border-[#efeae3] bg-[#faf8f4] p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-[#8d7650]">
              Customer message
            </p>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-[#4f4a47]">
              {booking.customer_message?.trim() || "No message provided."}
            </p>
          </div>
        </div>

        <aside className="space-y-4 rounded-2xl border border-[#ded7cc] bg-white p-6 shadow-sm">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-[#8d7650]">
              Actions
            </p>
            <h2 className="mt-2 text-xl font-medium tracking-tight text-[#171614]">
              Booking status
            </h2>
          </div>

          <BookingStatusActions
            bookingId={booking.id}
            currentStatus={booking.status}
          />

          {booking.status === "cancelled" ? (
            <BookingDeleteAction bookingId={booking.id} />
          ) : null}

          <div className="rounded-xl border border-[#efeae3] bg-[#faf8f4] p-4 text-sm text-[#4f4a47]">
            <p className="font-medium text-[#171614]">Cost breakdown</p>
            <div className="mt-3 space-y-2">
              <div className="flex items-center justify-between gap-4">
                <span>Food cost</span>
                <span>{formatCurrencyINR(booking.food_cost)}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span>Venue cost</span>
                <span>{formatCurrencyINR(booking.venue_cost)}</span>
              </div>
              <div className="flex items-center justify-between gap-4 border-t border-[#e7e0d7] pt-2 font-medium text-[#171614]">
                <span>Estimated total</span>
                <span>{formatCurrencyINR(booking.estimated_total)}</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
