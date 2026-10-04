import { requireDashboardAccess } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-server";

export type BookingStatus =
  | "pending"
  | "confirmed"
  | "cancelled";

export type DashboardEventType =
  | "wedding"
  | "corporate"
  | "private";

export type DashboardShift = "morning" | "evening";

export interface DashboardStats {
  totalEnquiries: number;
  pending: number;
  confirmed: number;
  cancelled: number;
  estimatedRevenue: number;
  confirmedRevenueThisMonth: number;
  upcomingEvents: number;
}

export interface CalendarDaySummary {
  date: string;
  label: string;
  status: "Available" | "Partially booked" | "Partially blocked" | "Fully booked" | "Blocked" | "Fully unavailable";
  morning: "Available" | "Booked" | "Blocked";
  evening: "Available" | "Booked" | "Blocked";
  bookingCount: number;
  bookings: Array<{
    id: string;
    customer_name: string | null;
    event_type: DashboardEventType;
    guest_count: number;
    status: BookingStatus;
    shift: DashboardShift;
  }>;
}

export interface DashboardBooking {
  id: string;
  event_type: DashboardEventType;
  event_date: string;
  shift: DashboardShift;
  guest_count: number;
  customer_name: string | null;
  customer_email: string | null;
  customer_phone: string | null;
  customer_message: string | null;
  food_cost: number | null;
  venue_cost: number | null;
  estimated_total: number | null;
  status: BookingStatus;
  created_at: string;
  updated_at: string;
}

export function getTimeGreeting(date = new Date()) {
  const hour = date.getHours();

  if (hour < 12) {
    return "Good morning";
  }

  if (hour < 18) {
    return "Good afternoon";
  }

  return "Good evening";
}

export function formatOwnerDisplayName(
  email: string | null | undefined
) {
  if (!email) {
    return "Owner";
  }

  const localPart = email.split("@")[0];
  const normalizedName = localPart
    .replace(/[._-]+/g, " ")
    .trim();

  if (!normalizedName) {
    return "Owner";
  }

  return normalizedName
    .split(" ")
    .filter(Boolean)
    .map(
      (part) =>
        part.charAt(0).toUpperCase() + part.slice(1)
    )
    .join(" ");
}

export function formatCurrencyINR(
  value: number | null | undefined
) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value ?? 0));
}

export function formatEventType(
  eventType: DashboardEventType | null | undefined
) {
  const typeMap: Record<DashboardEventType, string> = {
    wedding: "Wedding",
    corporate: "Corporate",
    private: "Private Party",
  };

  if (!eventType) {
    return "—";
  }

  return typeMap[eventType] ?? eventType;
}

export function formatShift(
  shift: DashboardShift | null | undefined
) {
  const shiftMap: Record<DashboardShift, string> = {
    morning: "Morning",
    evening: "Evening",
  };

  if (!shift) {
    return "—";
  }

  return shiftMap[shift] ?? shift;
}

export function formatBookingDate(
  dateString: string | null | undefined
) {
  if (!dateString) {
    return "—";
  }

  const [year, month, day] = dateString
    .split("-")
    .map(Number);

  if (
    Number.isNaN(year) ||
    Number.isNaN(month) ||
    Number.isNaN(day)
  ) {
    return dateString;
  }

  return new Date(
    year,
    month - 1,
    day
  ).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatCreatedDate(
  dateString: string | null | undefined
) {
  if (!dateString) {
    return "—";
  }

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getLocalDateString(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

async function getAuthorizedSupabase() {
  await requireDashboardAccess();
  return supabaseAdmin;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = await getAuthorizedSupabase();

  const { data, error } = await supabase
    .from("bookings")
    .select("status, estimated_total, event_date, created_at");

  if (error) {
    console.error("Failed to load dashboard stats", error);
    throw new Error("Unable to load dashboard data.");
  }

  const bookings = data ?? [];
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const totalEnquiries = bookings.length;
  const pending = bookings.filter(
    (booking) => booking.status === "pending"
  ).length;
  const confirmed = bookings.filter(
    (booking) => booking.status === "confirmed"
  ).length;
  const cancelled = bookings.filter(
    (booking) => booking.status === "cancelled"
  ).length;
  const estimatedRevenue = bookings
    .filter((booking) => booking.status === "confirmed")
    .reduce(
      (sum, booking) =>
        sum + Number(booking.estimated_total ?? 0),
      0
    );

  const confirmedRevenueThisMonth = bookings
    .filter((booking) => booking.status === "confirmed")
    .filter((booking) => {
      if (!booking.event_date) {
        return false;
      }

      const [year, month] = booking.event_date.split("-").map(Number);
      return year === currentYear && month - 1 === currentMonth;
    })
    .reduce(
      (sum, booking) =>
        sum + Number(booking.estimated_total ?? 0),
      0
    );

  const upcomingEvents = bookings.filter((booking) => {
    if (!booking.event_date) {
      return false;
    }

    return (
      booking.status === "pending" || booking.status === "confirmed"
    ) && booking.event_date >= getLocalDateString(new Date());
  }).length;

  return {
    totalEnquiries,
    pending,
    confirmed,
    cancelled,
    estimatedRevenue,
    confirmedRevenueThisMonth,
    upcomingEvents,
  };
}

export async function getCalendarMonthData(monthDate = new Date()): Promise<CalendarDaySummary[]> {
  const year = monthDate.getFullYear();
  const monthIndex = monthDate.getMonth();
  const startDate = getLocalDateString(new Date(year, monthIndex, 1));
  const endDate = getLocalDateString(new Date(year, monthIndex + 1, 0));

  const supabase = await getAuthorizedSupabase();

  const [{ data: bookings }, { data: blocks }] = await Promise.all([
    supabase
      .from("bookings")
      .select("id, event_date, shift, event_type, guest_count, customer_name, status")
      .gte("event_date", startDate)
      .lte("event_date", endDate)
      .in("status", ["pending", "confirmed"]),
    supabase
      .from("venue_blocks")
      .select("event_date, shift, reason")
      .gte("event_date", startDate)
      .lte("event_date", endDate),
  ]);

  const bookingsByDate = new Map<string, Array<DashboardBooking & { shift: DashboardShift }>>();
  for (const booking of bookings ?? []) {
    const list = bookingsByDate.get(booking.event_date) ?? [];
    list.push(booking as DashboardBooking & { shift: DashboardShift });
    bookingsByDate.set(booking.event_date, list);
  }

  const blocksByDate = new Map<string, Array<{ shift: string; reason: string | null }>>();
  for (const block of blocks ?? []) {
    const list = blocksByDate.get(block.event_date) ?? [];
    list.push({ shift: block.shift, reason: block.reason });
    blocksByDate.set(block.event_date, list);
  }

  const totalDays = new Date(year, monthIndex + 1, 0).getDate();
  const days: CalendarDaySummary[] = [];

  for (let day = 1; day <= totalDays; day += 1) {
    const date = getLocalDateString(new Date(year, monthIndex, day));
    const dayBookings = bookingsByDate.get(date) ?? [];
    const dayBlocks = blocksByDate.get(date) ?? [];
    const morningBooked = dayBookings.some((booking) => booking.shift === "morning");
    const eveningBooked = dayBookings.some((booking) => booking.shift === "evening");
    const morningBlocked = dayBlocks.some((block) => block.shift === "morning" || block.shift === "full_day");
    const eveningBlocked = dayBlocks.some((block) => block.shift === "evening" || block.shift === "full_day");

    const morning = morningBooked ? "Booked" : morningBlocked ? "Blocked" : "Available";
    const evening = eveningBooked ? "Booked" : eveningBlocked ? "Blocked" : "Available";

    let status: CalendarDaySummary["status"] = "Available";
    if (morning === "Booked" && evening === "Booked") {
      status = "Fully booked";
    } else if (morning === "Blocked" && evening === "Blocked") {
      status = "Blocked";
    } else if ((morning === "Booked" && evening !== "Booked") || (evening === "Booked" && morning !== "Booked")) {
      status = "Partially booked";
    } else if ((morning === "Blocked" && evening !== "Blocked") || (evening === "Blocked" && morning !== "Blocked")) {
      status = "Partially blocked";
    } else if (morning === "Blocked" || evening === "Blocked") {
      status = "Fully unavailable";
    }

    days.push({
      date,
      label: new Date(year, monthIndex, day).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
      status,
      morning,
      evening,
      bookingCount: dayBookings.length,
      bookings: dayBookings.map((booking) => ({
        id: booking.id,
        customer_name: booking.customer_name,
        event_type: booking.event_type,
        guest_count: booking.guest_count,
        status: booking.status,
        shift: booking.shift,
      })),
    });
  }

  return days;
}

export async function getRecentBookings(
  limit = 8
): Promise<DashboardBooking[]> {
  const supabase = await getAuthorizedSupabase();

  const { data, error } = await supabase
    .from("bookings")
    .select(
      "id, event_type, event_date, shift, guest_count, customer_name, customer_email, customer_phone, customer_message, food_cost, venue_cost, estimated_total, status, created_at, updated_at"
    )
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Failed to load recent bookings", error);
    throw new Error("Unable to load dashboard data.");
  }

  return (data ?? []) as DashboardBooking[];
}

export async function getUpcomingBookings(
  limit = 5
): Promise<DashboardBooking[]> {
  const supabase = await getAuthorizedSupabase();
  const today = getLocalDateString(new Date());

  const { data, error } = await supabase
    .from("bookings")
    .select(
      "id, event_type, event_date, shift, guest_count, customer_name, customer_email, customer_phone, customer_message, food_cost, venue_cost, estimated_total, status, created_at, updated_at"
    )
    .gte("event_date", today)
    .in("status", ["pending", "confirmed"])
    .order("event_date", { ascending: true })
    .limit(limit);

  if (error) {
    console.error("Failed to load upcoming bookings", error);
    throw new Error("Unable to load dashboard data.");
  }

  return (data ?? []) as DashboardBooking[];
}

export async function getBookingById(
  id: string
): Promise<DashboardBooking | null> {
  const supabase = await getAuthorizedSupabase();

  const { data, error } = await supabase
    .from("bookings")
    .select(
      "id, event_type, event_date, shift, guest_count, customer_name, customer_email, customer_phone, customer_message, food_cost, venue_cost, estimated_total, status, created_at, updated_at"
    )
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("Failed to load booking detail", error);
    throw new Error("Unable to load booking detail.");
  }

  return (data as DashboardBooking | null) ?? null;
}

export async function getBookingsTableData(
  query = "",
  status: BookingStatus | "all" = "all",
  sort: "newest" | "oldest" | "date_asc" | "date_desc" = "newest"
): Promise<DashboardBooking[]> {
  const supabase = await getAuthorizedSupabase();

  let request = supabase
    .from("bookings")
    .select(
      "id, event_type, event_date, shift, guest_count, customer_name, customer_email, customer_phone, customer_message, food_cost, venue_cost, estimated_total, status, created_at, updated_at"
    );

  const sanitized = query.trim();

  if (sanitized) {
    request = request.or(
      `customer_name.ilike.%${sanitized}%,customer_email.ilike.%${sanitized}%`
    );
  }

  if (status !== "all") {
    request = request.eq("status", status);
  }

  switch (sort) {
    case "oldest":
      request = request.order("created_at", { ascending: true });
      break;
    case "date_asc":
      request = request.order("event_date", { ascending: true });
      break;
    case "date_desc":
      request = request.order("event_date", { ascending: false });
      break;
    case "newest":
    default:
      request = request.order("created_at", { ascending: false });
      break;
  }

  const { data, error } = await request;

  if (error) {
    console.error("Failed to load booking records", error);
    throw new Error("Unable to load dashboard data.");
  }

  return (data ?? []) as DashboardBooking[];
}
