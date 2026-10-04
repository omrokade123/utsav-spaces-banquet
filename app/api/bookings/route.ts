import { NextRequest, NextResponse } from "next/server";

import { supabaseAdmin } from "@/lib/supabase-server";
import { isShiftAvailable } from "@/lib/availability";

import {
  BOOKING_LIMITS,
  FOOD_PACKAGES,
  VENUE_PRICING,
} from "@/lib/booking-config";

import type {
  BookingRequest,
  BookingResponse,
  EventType,
  FoodPackageId,
  ShiftType,
} from "@/types/booking";

const VALID_EVENT_TYPES: EventType[] = [
  "wedding",
  "corporate",
  "private",
];

const VALID_SHIFTS: ShiftType[] = [
  "morning",
  "evening",
];

const VALID_PACKAGE_IDS: FoodPackageId[] =
  FOOD_PACKAGES.map((item) => item.id);

// ---------------------------------------
// Validation helpers
// ---------------------------------------

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

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    email
  );
}

function isValidPhone(phone: string) {
  return /^\d{10}$/.test(phone);
}

function isValidGuestCount(
  guestCount: number
) {
  return (
    Number.isInteger(guestCount) &&
    guestCount >= BOOKING_LIMITS.minGuests &&
    guestCount <= BOOKING_LIMITS.maxGuests &&
    guestCount %
      BOOKING_LIMITS.guestStep ===
      0
  );
}

function isValidPackageSelection(
  packages: unknown
): packages is FoodPackageId[] {
  if (!Array.isArray(packages)) {
    return false;
  }

  if (
    new Set(packages).size !==
    packages.length
  ) {
    return false;
  }

  return packages.every((packageId) =>
    VALID_PACKAGE_IDS.includes(
      packageId as FoodPackageId
    )
  );
}

function isDateWithinBookingWindow(
  date: string
) {
  if (!isValidDate(date)) {
    return false;
  }

  const today = new Date();

  const [year, month, day] = date
    .split("-")
    .map(Number);

  const selectedDate = new Date(
    year,
    month - 1,
    day
  );

  today.setHours(0, 0, 0, 0);

  selectedDate.setHours(0, 0, 0, 0);

  const difference =
    Math.floor(
      (selectedDate.getTime() -
        today.getTime()) /
        (1000 * 60 * 60 * 24)
    );

  return (
    difference >=
      BOOKING_LIMITS.minAdvanceDays &&
    difference <=
      BOOKING_LIMITS.maxAdvanceDays
  );
}

// ---------------------------------------
// POST /api/bookings
// ---------------------------------------

export async function POST(
  request: NextRequest
) {
  try {
    // -----------------------------------
    // Parse request
    // -----------------------------------

    let body: BookingRequest;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json<BookingResponse>(
        {
          success: false,
          message: "Invalid request body.",
          errorCode: "VALIDATION_ERROR",
        },
        {
          status: 400,
        }
      );
    }

    const {
      eventType,
      selectedDate,
      selectedShift,
      guestCount,
      selectedPackages,
      customer,
    } = body;

    // -----------------------------------
    // Validate event type
    // -----------------------------------

    if (
      !VALID_EVENT_TYPES.includes(
        eventType
      )
    ) {
      return NextResponse.json<BookingResponse>(
        {
          success: false,
          message: "Invalid event type.",
          errorCode: "VALIDATION_ERROR",
        },
        {
          status: 400,
        }
      );
    }

    // -----------------------------------
    // Validate date
    // -----------------------------------

    if (
      typeof selectedDate !== "string" ||
      !isValidDate(selectedDate)
    ) {
      return NextResponse.json<BookingResponse>(
        {
          success: false,
          message: "Invalid event date.",
          errorCode: "VALIDATION_ERROR",
        },
        {
          status: 400,
        }
      );
    }

    if (
      !isDateWithinBookingWindow(
        selectedDate
      )
    ) {
      return NextResponse.json<BookingResponse>(
        {
          success: false,
          message:
            "Selected date is outside the available booking window.",
          errorCode: "VALIDATION_ERROR",
        },
        {
          status: 400,
        }
      );
    }

    // -----------------------------------
    // Validate shift
    // -----------------------------------

    if (
      !VALID_SHIFTS.includes(
        selectedShift
      )
    ) {
      return NextResponse.json<BookingResponse>(
        {
          success: false,
          message: "Invalid shift.",
          errorCode: "VALIDATION_ERROR",
        },
        {
          status: 400,
        }
      );
    }

    // -----------------------------------
    // Validate guest count
    // -----------------------------------

    if (
      !isValidGuestCount(guestCount)
    ) {
      return NextResponse.json<BookingResponse>(
        {
          success: false,
          message:
            "Guest count must be between 100 and 500 in increments of 10.",
          errorCode: "VALIDATION_ERROR",
        },
        {
          status: 400,
        }
      );
    }

    // -----------------------------------
    // Validate food packages
    // -----------------------------------

    if (
      !isValidPackageSelection(
        selectedPackages
      )
    ) {
      return NextResponse.json<BookingResponse>(
        {
          success: false,
          message:
            "One or more selected food packages are invalid.",
          errorCode: "VALIDATION_ERROR",
        },
        {
          status: 400,
        }
      );
    }

    // -----------------------------------
    // Validate customer
    // -----------------------------------

    if (!customer) {
      return NextResponse.json<BookingResponse>(
        {
          success: false,
          message:
            "Customer details are required.",
          errorCode: "VALIDATION_ERROR",
        },
        {
          status: 400,
        }
      );
    }

    const name =
      typeof customer.name === "string"
        ? customer.name.trim()
        : "";

    const email =
      typeof customer.email === "string"
        ? customer.email
            .trim()
            .toLowerCase()
        : "";

    const phone =
      typeof customer.phone === "string"
        ? customer.phone.replace(
            /\D/g,
            ""
          )
        : "";

    const message =
      typeof customer.message ===
      "string"
        ? customer.message.trim()
        : "";

    if (name.length < 2) {
      return NextResponse.json<BookingResponse>(
        {
          success: false,
          message:
            "Please provide a valid name.",
          errorCode: "VALIDATION_ERROR",
        },
        {
          status: 400,
        }
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json<BookingResponse>(
        {
          success: false,
          message:
            "Please provide a valid email address.",
          errorCode: "VALIDATION_ERROR",
        },
        {
          status: 400,
        }
      );
    }

    if (!isValidPhone(phone)) {
      return NextResponse.json<BookingResponse>(
        {
          success: false,
          message:
            "Please provide a valid 10-digit phone number.",
          errorCode: "VALIDATION_ERROR",
        },
        {
          status: 400,
        }
      );
    }

    // -----------------------------------
    // Calculate pricing on SERVER
    // -----------------------------------

    const uniqueSelectedPackages = [
      ...new Set(selectedPackages),
    ];

    const packageItems =
      uniqueSelectedPackages.map(
        (packageId) => {
          const foodPackage =
            FOOD_PACKAGES.find(
              (item) =>
                item.id === packageId
            );

          if (!foodPackage) {
            throw new Error(
              "Invalid food package."
            );
          }

          const quantity = guestCount;

          return {
            id: foodPackage.id,
            title: foodPackage.title,
            unitPrice: foodPackage.price,
            quantity,
            total:
              foodPackage.price *
              quantity,
            unit: foodPackage.unit,
          };
        }
      );

    const foodCost =
      packageItems.reduce(
        (total, item) =>
          total + item.total,
        0
      );

    const venueCost =
      VENUE_PRICING[selectedShift];

    const estimatedTotal =
      foodCost + venueCost;

    // -----------------------------------
    // Server-side availability check
    // -----------------------------------

    let availabilityOpen = true;

    try {
      availabilityOpen = await isShiftAvailable(
        selectedDate,
        selectedShift
      );
    } catch {
      return NextResponse.json<BookingResponse>(
        {
          success: false,
          message:
            "Unable to verify availability. Please try again.",
          errorCode: "SERVER_ERROR",
        },
        {
          status: 500,
        }
      );
    }

    if (!availabilityOpen) {
      return NextResponse.json<BookingResponse>(
        {
          success: false,
          message:
            "This shift is unavailable. Please choose another date or shift.",
          errorCode: "SHIFT_UNAVAILABLE",
        },
        {
          status: 409,
        }
      );
    }

    // -----------------------------------
    // Create booking
    // -----------------------------------

    const {
      data: booking,
      error: insertError,
    } = await supabaseAdmin
      .from("bookings")
      .insert({
        event_type: eventType,
        event_date: selectedDate,
        shift: selectedShift,
        guest_count: guestCount,

        selected_packages:
          packageItems,

        customer_name: name,
        customer_email: email,
        customer_phone: phone,
        customer_message:
          message || null,

        food_cost: foodCost,
        venue_cost: venueCost,
        estimated_total:
          estimatedTotal,

        status: "pending",
      })
      .select("id")
      .single();

    // -----------------------------------
    // Database conflict
    // -----------------------------------

    if (insertError) {
      console.error(
        "Booking insert failed:",
        insertError
      );

      // PostgreSQL unique constraint
      // violation.
      if (
        insertError.code === "23505"
      ) {
        return NextResponse.json<BookingResponse>(
          {
            success: false,
            message:
              "This shift has just been booked. Please choose another date or shift.",
            errorCode:
              "BOOKING_EXISTS",
          },
          {
            status: 409,
          }
        );
      }

      return NextResponse.json<BookingResponse>(
        {
          success: false,
          message:
            "Unable to create your booking enquiry.",
          errorCode: "SERVER_ERROR",
        },
        {
          status: 500,
        }
      );
    }

    // -----------------------------------
    // Success
    // -----------------------------------

    return NextResponse.json<BookingResponse>(
      {
        success: true,
        bookingId: booking.id,
        estimatedTotal,
        message:
          "Your booking enquiry has been received.",
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "Booking API error:",
      error
    );

    return NextResponse.json<BookingResponse>(
      {
        success: false,
        message:
          "Something went wrong while creating the booking.",
        errorCode: "SERVER_ERROR",
      },
      {
        status: 500,
      }
    );
  }
}