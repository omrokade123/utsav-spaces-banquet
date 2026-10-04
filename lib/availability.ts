import { supabaseAdmin } from "@/lib/supabase-server";

export type ShiftName = "morning" | "evening";
export type BlockShift = ShiftName | "full_day";

export interface ShiftAvailabilitySummary {
  available: boolean;
  blocked: boolean;
  booked: boolean;
  reason?: string | null;
}

export interface DateAvailabilitySummary {
  date: string;
  morning: ShiftAvailabilitySummary;
  evening: ShiftAvailabilitySummary;
  status: "available" | "partially_booked" | "partially_blocked" | "fully_booked" | "fully_blocked" | "fully_unavailable";
}

function isValidDate(date: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return false;
  }

  const [year, month, day] = date.split("-").map(Number);
  const parsed = new Date(year, month - 1, day);

  return (
    parsed.getFullYear() === year &&
    parsed.getMonth() === month - 1 &&
    parsed.getDate() === day
  );
}

function getShiftSetForBlock(shift: BlockShift) {
  if (shift === "full_day") {
    return ["morning", "evening"] as const;
  }

  return [shift] as const;
}

export async function getDateAvailability(date: string): Promise<DateAvailabilitySummary> {
  if (!isValidDate(date)) {
    throw new Error("Invalid date");
  }

  const [{ data: bookings }, { data: blocks }] = await Promise.all([
    supabaseAdmin
      .from("bookings")
      .select("shift, status")
      .eq("event_date", date)
      .in("status", ["pending", "confirmed"]),
    supabaseAdmin
      .from("venue_blocks")
      .select("shift, reason")
      .eq("event_date", date),
  ]);

  const activeBooked = new Set(
    (bookings ?? [])
      .filter((booking) => booking.shift === "morning" || booking.shift === "evening")
      .map((booking) => booking.shift as ShiftName)
  );

  const blockReasons = new Map<string, string | null>();

  for (const block of blocks ?? []) {
    const shifts = getShiftSetForBlock(block.shift as BlockShift);
    for (const shift of shifts) {
      if (!blockReasons.has(shift) || !blockReasons.get(shift)) {
        blockReasons.set(shift, block.reason ?? "Venue maintenance");
      }
    }
  }

  const morningBlocked = Array.isArray(blocks)
    ? blocks.some((block) => getShiftSetForBlock(block.shift as BlockShift).includes("morning"))
    : false;
  const eveningBlocked = Array.isArray(blocks)
    ? blocks.some((block) => getShiftSetForBlock(block.shift as BlockShift).includes("evening"))
    : false;

  const morning = {
    available: !activeBooked.has("morning") && !morningBlocked,
    blocked: morningBlocked,
    booked: activeBooked.has("morning"),
    reason: blockReasons.get("morning") ?? null,
  };

  const evening = {
    available: !activeBooked.has("evening") && !eveningBlocked,
    blocked: eveningBlocked,
    booked: activeBooked.has("evening"),
    reason: blockReasons.get("evening") ?? null,
  };

  const bookedCount = [morning.booked, evening.booked].filter(Boolean).length;
  const blockedCount = [morning.blocked, evening.blocked].filter(Boolean).length;

  let status: DateAvailabilitySummary["status"] = "available";

  if (bookedCount === 2 || (blockedCount === 2 && bookedCount === 0)) {
    status = blockedCount === 2 ? "fully_blocked" : "fully_booked";
  } else if (bookedCount > 0 && blockedCount > 0) {
    status = "fully_unavailable";
  } else if (bookedCount === 1 && blockedCount === 0) {
    status = "partially_booked";
  } else if (blockedCount === 1 && bookedCount === 0) {
    status = "partially_blocked";
  }

  return { date, morning, evening, status };
}

export async function isShiftAvailable(date: string, shift: ShiftName) {
  const summary = await getDateAvailability(date);

  if (shift === "morning") {
    return summary.morning.available;
  }

  return summary.evening.available;
}

export function buildCalendarStatus(summary: DateAvailabilitySummary) {
  const { morning, evening } = summary;

  if (morning.booked && evening.booked) {
    return "Fully booked";
  }

  if (morning.blocked && evening.blocked) {
    return "Blocked";
  }

  if ((morning.booked && !evening.booked) || (!morning.booked && evening.booked)) {
    return "Partially booked";
  }

  if ((morning.blocked && !evening.blocked) || (!morning.blocked && evening.blocked)) {
    return "Partially blocked";
  }

  return "Available";
}
