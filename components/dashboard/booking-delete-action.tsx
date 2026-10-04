"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle, Trash2 } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface BookingDeleteActionProps {
  bookingId: string;
}

export function BookingDeleteAction({ bookingId }: BookingDeleteActionProps) {
  const router = useRouter();
  const deletingRef = useRef(false);
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function deleteBooking() {
    if (deletingRef.current) {
      return;
    }

    deletingRef.current = true;
    setDeleting(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/dashboard/bookings/${bookingId}`,
        { method: "DELETE" }
      );
      const payload = (await response.json().catch(() => null)) as
        | { message?: string }
        | null;

      if (!response.ok) {
        throw new Error(payload?.message ?? "Unable to delete booking.");
      }

      setOpen(false);

      const currentUrl = new URL(window.location.href);
      const destination =
        currentUrl.pathname === "/dashboard/bookings"
          ? currentUrl
          : new URL("/dashboard/bookings", currentUrl.origin);
      destination.searchParams.set("deleted", "1");

      router.replace(`${destination.pathname}${destination.search}`);
      router.refresh();
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "Unable to delete booking."
      );
    } finally {
      deletingRef.current = false;
      setDeleting(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setError(null);
          setOpen(true);
        }}
        className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-300 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-800 transition hover:border-red-400 hover:bg-red-100"
      >
        <Trash2 className="h-3.5 w-3.5" />
        Delete booking
      </button>

      <Dialog
        open={open}
        onOpenChange={(nextOpen) => {
          if (!deleting) {
            setOpen(nextOpen);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete cancelled booking?</DialogTitle>
            <DialogDescription>
              This permanently removes this cancelled booking. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          {error ? (
            <p role="alert" className="text-sm text-red-700">
              {error}
            </p>
          ) : null}

          <DialogFooter>
            <button
              type="button"
              onClick={() => setOpen(false)}
              disabled={deleting}
              className="inline-flex items-center justify-center rounded-lg border border-[#d7cec2] bg-white px-4 py-2 text-sm font-medium text-[#34302c] transition hover:bg-[#f7f4ef] disabled:cursor-not-allowed disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={deleteBooking}
              disabled={deleting}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {deleting ? (
                <>
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Booking"
              )}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}