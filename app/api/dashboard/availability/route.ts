import { NextResponse } from "next/server";

import { revalidatePath } from "next/cache";

import { requireDashboardAccess } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-server";

const VALID_SHIFTS = ["morning", "evening", "full_day"] as const;

type VenueBlockShift = (typeof VALID_SHIFTS)[number];

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

export async function GET() {
  try {
    await requireDashboardAccess();

    const { data, error } = await supabaseAdmin
      .from("venue_blocks")
      .select("id, event_date, shift, reason, created_at")
      .order("event_date", { ascending: true })
      .limit(100);

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true, blocks: data ?? [] });
  } catch {
    return NextResponse.json(
      { success: false, message: "Unable to load venue blocks." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await requireDashboardAccess();

    const body = (await request.json().catch(() => null)) as {
      date?: string;
      shift?: string;
      reason?: string;
    } | null;

    const date = body?.date ?? "";
    const shift = body?.shift ?? "";
    const reason = typeof body?.reason === "string" ? body.reason.trim() : "";

    if (!isValidDate(date)) {
      return NextResponse.json(
        { success: false, message: "Please choose a valid date." },
        { status: 400 }
      );
    }

    if (!VALID_SHIFTS.includes(shift as VenueBlockShift)) {
      return NextResponse.json(
        { success: false, message: "Please choose a valid shift." },
        { status: 400 }
      );
    }

    if (reason.length < 3 || reason.length > 200) {
      return NextResponse.json(
        { success: false, message: "Reason must be between 3 and 200 characters." },
        { status: 400 }
      );
    }

    const activeQuery = supabaseAdmin
      .from("bookings")
      .select("id")
      .eq("event_date", date)
      .in("status", ["pending", "confirmed"]);

    const bookingConflict = shift === "full_day"
      ? await activeQuery.in("shift", ["morning", "evening"]).limit(1)
      : await activeQuery.eq("shift", shift).limit(1);

    if (bookingConflict.error) {
      throw bookingConflict.error;
    }

    if ((bookingConflict.data ?? []).length > 0) {
      return NextResponse.json(
        { success: false, message: "This shift already has an active booking." },
        { status: 409 }
      );
    }

    const { data: existingBlock, error: existingError } = await supabaseAdmin
      .from("venue_blocks")
      .select("id")
      .eq("event_date", date)
      .eq("shift", shift)
      .maybeSingle();

    if (existingError) {
      throw existingError;
    }

    if (existingBlock) {
      return NextResponse.json(
        { success: false, message: "This availability block already exists." },
        { status: 409 }
      );
    }

    const { error: insertError } = await supabaseAdmin.from("venue_blocks").insert({
      event_date: date,
      shift,
      reason,
      created_by: (await requireDashboardAccess()).user.id,
    });

    if (insertError) {
      throw insertError;
    }

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/availability");
    revalidatePath("/dashboard/calendar");

    return NextResponse.json({ success: true, message: "Availability blocked." });
  } catch (error) {
    console.error("Venue block creation failed", error);
    return NextResponse.json(
      { success: false, message: "Unable to block this date." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    await requireDashboardAccess();

    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date") ?? "";
    const shift = searchParams.get("shift") ?? "";

    if (!isValidDate(date) || !VALID_SHIFTS.includes(shift as VenueBlockShift)) {
      return NextResponse.json(
        { success: false, message: "Invalid block selection." },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin
      .from("venue_blocks")
      .delete()
      .eq("event_date", date)
      .eq("shift", shift);

    if (error) {
      throw error;
    }

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/availability");
    revalidatePath("/dashboard/calendar");

    return NextResponse.json({ success: true, message: "Availability block removed." });
  } catch (error) {
    console.error("Venue block removal failed", error);
    return NextResponse.json(
      { success: false, message: "Unable to remove the availability block." },
      { status: 500 }
    );
  }
}
