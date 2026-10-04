import type { BookingStatus } from "@/lib/dashboard";

interface BookingStatusBadgeProps {
  status: BookingStatus;
}

const statusStyles: Record<
  BookingStatus,
  {
    label: string;
    className: string;
  }
> = {
  pending: {
    label: "Pending",
    className:
      "border border-[#d9c79d] bg-[#f6f0df] text-[#6c541f]",
  },
  confirmed: {
    label: "Confirmed",
    className:
      "border border-[#b8d4c2] bg-[#edf7f0] text-[#1e563e]",
  },
  cancelled: {
    label: "Cancelled",
    className:
      "border border-[#e6c7c4] bg-[#fdf1f0] text-[#7f3f39]",
  },
};

export function BookingStatusBadge({
  status,
}: BookingStatusBadgeProps) {
  const info = statusStyles[status] ?? statusStyles.pending;

  return (
    <span
      role="status"
      aria-label={`Booking status: ${info.label}`}
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium ${info.className}`}
    >
      {info.label}
    </span>
  );
}
