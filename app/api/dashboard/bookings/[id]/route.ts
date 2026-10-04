import { NextResponse } from "next/server";

import { revalidatePath } from "next/cache";

import {
  createSupabaseServerClient,
  supabaseAdmin,
} from "@/lib/supabase-server";

const ALLOWED_TRANSITIONS: Record<
  "pending" | "confirmed" | "cancelled",
  Array<"pending" | "confirmed" | "cancelled">
> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["cancelled"],
  cancelled: [],
};

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  return PATCH(request, context);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = (await request.json().catch(() => null)) as {
      status?: string;
    } | null;

    if (!id) {
      return NextResponse.json(
        { message: "Booking not found." },
        { status: 404 }
      );
    }

    if (!body || typeof body.status !== "string") {
      return NextResponse.json(
        { message: "Invalid booking update request." },
        { status: 400 }
      );
    }

    const requestedStatus = body.status;
    const nextStatus =
      requestedStatus === "confirmed" ||
      requestedStatus === "cancelled"
        ? requestedStatus
        : null;

    if (!nextStatus) {
      return NextResponse.json(
        { message: "Invalid booking status." },
        { status: 400 }
      );
    }

    const supabase = await createSupabaseServerClient();
    const adminClient = supabaseAdmin;

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { message: "Unauthorized." },
        { status: 401 }
      );
    }

    const { data: profile, error: profileError } =
      await supabase
        .from("profiles")
        .select("id, role")
        .eq("id", user.id)
        .maybeSingle();

    if (
      profileError ||
      !profile ||
      !["owner", "admin"].includes(profile.role)
    ) {
      return NextResponse.json(
        { message: "Unauthorized." },
        { status: 403 }
      );
    }

    const { data: existingBooking, error: bookingError } =
      await adminClient
        .from("bookings")
        .select(
          "id, status, event_date, shift, event_type, customer_name"
        )
        .eq("id", id)
        .maybeSingle();

    if (bookingError || !existingBooking) {
      return NextResponse.json(
        { message: "Booking not found." },
        { status: 404 }
      );
    }

    const currentStatus = existingBooking.status;

    if (currentStatus === "cancelled") {
      return NextResponse.json(
        { message: "This booking has already been cancelled." },
        { status: 409 }
      );
    }

    if (currentStatus === "confirmed") {
      if (nextStatus === "confirmed") {
        return NextResponse.json(
          { message: "This booking has already been confirmed." },
          { status: 409 }
        );
      }

      if (nextStatus !== "cancelled") {
        return NextResponse.json(
          { message: "Invalid status transition." },
          { status: 400 }
        );
      }
    }

    if (currentStatus === "pending") {
      if (
        nextStatus !== "confirmed" &&
        nextStatus !== "cancelled"
      ) {
        return NextResponse.json(
          { message: "Invalid status transition." },
          { status: 400 }
        );
      }
    }

    const allowedTargets =
      ALLOWED_TRANSITIONS[
        currentStatus as keyof typeof ALLOWED_TRANSITIONS
      ];

    if (
      !allowedTargets ||
      !allowedTargets.includes(nextStatus)
    ) {
      return NextResponse.json(
        { message: "Invalid status transition." },
        { status: 400 }
      );
    }

    if (nextStatus === "confirmed") {
      const { data: conflict, error: conflictError } =
        await adminClient
          .from("bookings")
          .select("id")
          .eq("event_date", existingBooking.event_date)
          .eq("shift", existingBooking.shift)
          .in("status", ["pending", "confirmed"])
          .neq("id", id)
          .maybeSingle();

      if (conflictError) {
        return NextResponse.json(
          { message: "Unable to update the booking. Please try again." },
          { status: 500 }
        );
      }

      if (conflict) {
        return NextResponse.json(
          { message: "This date and shift are no longer available." },
          { status: 409 }
        );
      }
    }

    const { error: updateError } = await adminClient
      .from("bookings")
      .update({
        status: nextStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("status", currentStatus);

    if (updateError) {
      const message =
        updateError.code === "23505"
          ? "This date and shift are no longer available."
          : "Unable to update the booking. Please try again.";

      return NextResponse.json(
        { message },
        {
          status: updateError.code === "23505" ? 409 : 500,
        }
      );
    }

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/bookings");

    return NextResponse.json({
      success: true,
      status: nextStatus,
      message:
        nextStatus === "confirmed"
          ? "Booking confirmed."
          : "Booking cancelled.",
    });
  } catch {
    return NextResponse.json(
      { message: "Unable to update the booking. Please try again." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createSupabaseServerClient();
    const adminClient = supabaseAdmin;

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { message: "Unauthorized." },
        { status: 401 }
      );
    }

    const { data: profile, error: profileError } =
      await supabase
        .from("profiles")
        .select("id, role")
        .eq("id", user.id)
        .maybeSingle();

    if (
      profileError ||
      !profile ||
      !["owner", "admin"].includes(profile.role)
    ) {
      return NextResponse.json(
        { message: "Unauthorized." },
        { status: 403 }
      );
    }

    if (!id) {
      return NextResponse.json(
        { message: "Booking not found." },
        { status: 404 }
      );
    }

    const { data: booking, error: bookingError } = await adminClient
      .from("bookings")
      .select("id, status")
      .eq("id", id)
      .maybeSingle();

    if (bookingError || !booking) {
      return NextResponse.json(
        { message: "Booking not found." },
        { status: 404 }
      );
    }

    if (booking.status !== "cancelled") {
      return NextResponse.json(
        { message: "Only cancelled bookings can be deleted." },
        { status: 409 }
      );
    }

    const { data: deletedBooking, error: deleteError } = await adminClient
      .from("bookings")
      .delete()
      .eq("id", id)
      .eq("status", "cancelled")
      .select("id")
      .maybeSingle();

    if (deleteError) {
      return NextResponse.json(
        { message: "Unable to delete the cancelled booking. Please try again." },
        { status: 500 }
      );
    }

    if (!deletedBooking) {
      return NextResponse.json(
        { message: "Booking status changed. Refresh and try again." },
        { status: 409 }
      );
    }

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/bookings");
    revalidatePath(`/dashboard/bookings/${id}`);

    return NextResponse.json({
      success: true,
      message: "Cancelled booking deleted.",
    });
  } catch {
    return NextResponse.json(
      { message: "Unable to delete the cancelled booking. Please try again." },
      { status: 500 }
    );
  }
}
