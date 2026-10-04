"use client";

import {
  Moon,
  Sun,
} from "lucide-react";

import { SHIFTS } from "@/lib/booking-config";
import type { ShiftType } from "@/types/booking";
import type { DateAvailability } from "./date-selector";

interface ShiftSelectorProps {
  selectedShift: ShiftType | null;
  onChange: (shift: ShiftType) => void;

  availability: DateAvailability | null;

  loading: boolean;
}

export default function ShiftSelector({
  selectedShift,
  onChange,
  availability,
  loading,
}: ShiftSelectorProps) {
  const morningAvailable =
    availability?.morning.available ?? true;

  const eveningAvailable =
    availability?.evening.available ?? true;

  const getIcon = (shift: ShiftType) => {
    return shift === "morning" ? (
      <Sun className="h-5 w-5" />
    ) : (
      <Moon className="h-5 w-5" />
    );
  };

  const isAvailable = (shift: ShiftType) => {
    if (!availability) {
      return true;
    }

    return shift === "morning"
      ? morningAvailable
      : eveningAvailable;
  };

  return (
    <div className="space-y-4">
      {SHIFTS.map((shift) => {
        const available = isAvailable(
          shift.id
        );

        const selected =
          selectedShift === shift.id;

        return (
          <button
            key={shift.id}
            type="button"
            disabled={
              loading || !available
            }
            onClick={() =>
              onChange(shift.id)
            }
            aria-pressed={selected}
            className={[
              "group relative w-full rounded-lg border p-5 text-left transition-colors duration-300",
              selected
                ? "border-[#183d34] bg-[#183d34] text-white"
                : "border-[#ded7c9] bg-white text-[#211e1a] hover:border-[#a68a56] hover:bg-[#fbf8f1]",
              !available
                ? "cursor-not-allowed opacity-50 hover:border-border/60 hover:bg-background"
                : "",
              loading
                ? "cursor-wait"
                : "",
            ].join(" ")}
          >
            <div className="flex items-start gap-4">
              {/* Icon */}
              <div
                className={[
                  "flex h-11 w-11 shrink-0 items-center justify-center rounded-full border transition-colors",
                  selected
                    ? "border-white/20 bg-white/10 text-[#e3c48c]"
                    : "border-[#e6dfd1] bg-[#f5f1e8] text-[#a68a56]",
                ].join(" ")}
              >
                {getIcon(shift.id)}
              </div>

              {/* Content */}
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="font-medium">
                    {shift.title}
                  </h3>

                  {!loading &&
                    !available && (
                      <span
                        className={[
                          "text-[10px] font-medium uppercase tracking-[0.16em]",
                          selected
                            ? "text-[#e3c48c]"
                            : "text-[#8d7650]",
                        ].join(" ")}
                      >
                        Booked
                      </span>
                    )}
                </div>

                <p
                  className={[
                    "mt-1 text-sm",
                    selected
                      ? "text-white/75"
                      : "text-[#8d7650]",
                  ].join(" ")}
                >
                  {shift.time}
                </p>

                <p
                  className={[
                    "mt-3 text-sm leading-relaxed",
                    selected
                      ? "text-white/75"
                      : "text-[#211e1a]/65",
                  ].join(" ")}
                >
                  {shift.description}
                </p>

                {loading && (
                  <p
                    className={[
                      "mt-3 text-xs uppercase tracking-[0.14em]",
                      selected
                        ? "text-white/70"
                        : "text-[#8d7650]",
                    ].join(" ")}
                  >
                    Checking availability…
                  </p>
                )}

                {!loading &&
                  !available && (
                    <p
                      className={[
                        "mt-3 text-xs",
                        selected
                          ? "text-white/70"
                          : "text-[#8d7650]",
                      ].join(" ")}
                    >
                      This shift is already
                      booked for the selected
                      date.
                    </p>
                  )}
              </div>
            </div>
          </button>
        );
      })}

      {!availability && !loading && (
        <p className="pt-1 text-xs text-[#211e1a]/60">
          Select a date to check real-time
          shift availability.
        </p>
      )}
    </div>
  );
}