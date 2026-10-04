import {
  formatBookingDate,
  formatEventType,
  formatShift,
  type DashboardBooking,
} from "@/lib/dashboard";
import { BookingStatusBadge } from "@/components/dashboard/booking-status-badge";

interface UpcomingEventsProps {
  bookings: DashboardBooking[];
}

export function UpcomingEvents({ bookings }: UpcomingEventsProps) {
  if (!bookings.length) {
    return (
      <section className="dashboard-panel rounded-2xl border border-[#ded7cc] bg-white p-5 shadow-sm">
        <h2 className="text-lg font-medium text-[#171614]">
          Upcoming Events
        </h2>
        <p className="mt-6 text-sm text-[#5f5853]">
          No upcoming events.
        </p>
      </section>
    );
  }

  return (
    <section className="dashboard-panel rounded-2xl border border-[#ded7cc] bg-white p-5 shadow-sm">
      <h2 className="text-lg font-medium text-[#171614]">
        Upcoming Events
      </h2>

      <div className="mt-5 space-y-3">
        {bookings.map((booking) => {
          const date = new Date(
            Number(booking.event_date.split("-")[0]),
            Number(booking.event_date.split("-")[1]) - 1,
            Number(booking.event_date.split("-")[2])
          );

          const day = date.toLocaleDateString("en-IN", {
            day: "2-digit",
          });
          const month = date
            .toLocaleDateString("en-IN", {
              month: "short",
            })
            .toUpperCase();

          return (
            <article
              key={booking.id}
              className="flex gap-3 rounded-2xl border border-[#ded7cc] bg-[#f9f6f1] p-3"
            >
              <div className="flex w-14 min-w-14 flex-col items-center justify-center rounded-xl border border-[#ded7cc] bg-white py-2 text-center">
                <span className="text-xl font-medium text-[#171614]">
                  {day}
                </span>
                <span className="text-[10px] uppercase tracking-[0.16em] text-[#8d7650]">
                  {month}
                </span>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-[#171614]">
                      {formatEventType(booking.event_type)}
                    </p>
                    <p className="mt-1 text-sm text-[#4c433f]">
                      {booking.customer_name ?? "Guest"}
                    </p>
                  </div>
                  <BookingStatusBadge status={booking.status} />
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-[#5c5651]">
                  <span>{booking.guest_count} guests</span>
                  <span>•</span>
                  <span>{formatShift(booking.shift)}</span>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
