import { NextRequest, NextResponse } from "next/server";

import { BOOKING_LIMITS } from "@/lib/booking-config";
import { getDateAvailability } from "@/lib/availability";
import type { ShiftType } from "@/types/booking";

const VALID_SHIFTS: ShiftType[] = ["morning", "evening"];

function isValidDate(date: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return false;
  }

  const [year, month, day] = date
    .split("-")
    .map(Number);

  const parsed = new Date(
    year,
    month - 1,
    day
  );

  return (
    parsed.getFullYear() === year &&
    parsed.getMonth() === month - 1 &&
    parsed.getDate() === day
  );
}

function getDateDifference(date: string) {
  const today = new Date();

  const [year, month, day] = date
    .split("-")
    .map(Number);

  const selected = new Date(
    year,
    month - 1,
    day
  );

  today.setHours(0, 0, 0, 0);
  selected.setHours(0, 0, 0, 0);

  return Math.floor(
    (selected.getTime() - today.getTime()) /
      (1000 * 60 * 60 * 24)
  );
}

export async function GET(request: NextRequest) {
  try {
    const date = request.nextUrl.searchParams.get("date");

    // -----------------------------
    // 1. Validate date
    // -----------------------------

    if (!date || !isValidDate(date)) {
      return NextResponse.json(
        {
          success: false,
          message: "A valid date is required.",
        },
        { status: 400 }
      );
    }

    // -----------------------------
    // 2. Validate booking window
    // -----------------------------

    const dateDifference = getDateDifference(date);

    if (
      dateDifference < BOOKING_LIMITS.minAdvanceDays ||
      dateDifference > BOOKING_LIMITS.maxAdvanceDays
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Selected date is outside the available booking window.",
        },
        { status: 400 }
      );
    }

    const summary = await getDateAvailability(date);

    const availability = Object.fromEntries(
      VALID_SHIFTS.map((shift) => [
        shift,
        {
          available:
            shift === "morning"
              ? summary.morning.available
              : summary.evening.available,
        },
      ])
    );

    return NextResponse.json({
      success: true,
      date,
      ...availability,
    });
  } catch (error) {
    console.error(
      "Availability API error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Something went wrong while checking availability.",
      },
      { status: 500 }
    );
  }
}