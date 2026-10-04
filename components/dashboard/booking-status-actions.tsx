"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, X } from "lucide-react";

import type { BookingStatus } from "@/lib/dashboard";

interface BookingStatusActionsProps {
  bookingId: string;
  currentStatus: BookingStatus;
}

export function BookingStatusActions({
  bookingId,
  currentStatus,
}: BookingStatusActionsProps) {
  const router = useRouter();
  const [pendingAction, setPendingAction] = useState<
    "confirmed" | "cancelled" | null
  >(null);
  const [error, setError] = useState<string | null>(null);

  async function updateStatus(nextStatus: "confirmed" | "cancelled") {
    setPendingAction(nextStatus);
    setError(null);

    try {
      const response = await fetch(
        `/api/dashboard/bookings/${bookingId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: nextStatus }),
        }
      );

      const payload = (await response
        .json()
        .catch(() => null)) as
        | { message?: string }
        | null;

      if (!response.ok) {
        throw new Error(
          payload?.message ?? "Unable to update booking status."
        );
      }

      router.replace("/dashboard/bookings");
    } catch (updateError) {
      setError(
        updateError instanceof Error
          ? updateError.message
          : "Unable to update booking status."
      );
    } finally {
      setPendingAction(null);
    }
  }

  if (currentStatus === "cancelled") {
    return (
      <div className="rounded-2xl border border-[#e6c7c4] bg-[#fdf1f0] p-4 text-sm text-[#7f3f39]">
        This booking has already been cancelled.
      </div>
    );
  }

  const canConfirm = currentStatus === "pending";
  const canCancel = currentStatus === "pending" || currentStatus === "confirmed";

  return (
    <div className="space-y-3">
      {canConfirm ? (
        <button
          type="button"
          onClick={() => updateStatus("confirmed")}
          disabled={pendingAction !== null}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#183d34] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#122d2a] disabled:cursor-not-allowed disabled:opacity-70"
        >
          <Check className="h-4 w-4" />
          {pendingAction === "confirmed"
            ? "Confirming..."
            : "Confirm booking"}
        </button>
      ) : null}

      {canCancel ? (
        <button
          type="button"
          onClick={() => updateStatus("cancelled")}
          disabled={pendingAction !== null}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#d9c79d] bg-[#f6f0df] px-4 py-2.5 text-sm font-medium text-[#6c541f] transition hover:bg-[#f0e4c9] disabled:cursor-not-allowed disabled:opacity-70"
        >
          <X className="h-4 w-4" />
          {pendingAction === "cancelled"
            ? "Cancelling..."
            : "Cancel booking"}
        </button>
      ) : null}

      {error ? (
        <p className="text-sm text-[#8a3b39]">{error}</p>
      ) : null}
    </div>
  );
}
