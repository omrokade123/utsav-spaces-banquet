"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";
import gsap from "gsap";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";

interface ShiftAvailability {
  available: boolean;
}

export interface DateAvailability {
  morning: ShiftAvailability;
  evening: ShiftAvailability;
}

interface DateSelectorProps {
  selectedDate: string | null;
  onChange: (date: string) => void;

  onAvailabilityChange: (
    availability: DateAvailability | null
  ) => void;

  onAvailabilityLoadingChange: (
    loading: boolean
  ) => void;
}

export default function DateSelector({
  selectedDate,
  onChange,
  onAvailabilityChange,
  onAvailabilityLoadingChange,
}: DateSelectorProps) {
  const [currentMonth, setCurrentMonth] =
    useState(() => {
      const date = new Date();
      date.setDate(1);
      return date;
    });

  const [availabilityError, setAvailabilityError] =
    useState("");

  const calendarRef = useRef<HTMLDivElement>(null);

  // ---------------------------------------
  // Calendar calculations
  // ---------------------------------------

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const firstDay = new Date(
    year,
    month,
    1
  ).getDay();

  const daysInMonth = new Date(
    year,
    month + 1,
    0
  ).getDate();

  const today = new Date();

  today.setHours(0, 0, 0, 0);

  const formattedMonth =
    currentMonth.toLocaleDateString("en-IN", {
      month: "long",
      year: "numeric",
    });

  const monthDays = Array.from(
    { length: daysInMonth },
    (_, index) => index + 1
  );

  // ---------------------------------------
  // Check whether a date is selectable
  // ---------------------------------------

  const isPastDate = (day: number) => {
    const date = new Date(
      year,
      month,
      day
    );

    date.setHours(0, 0, 0, 0);

    return date < today;
  };

  const formatDate = (day: number) => {
    const date = new Date(
      year,
      month,
      day
    );

    const yyyy = date.getFullYear();
    const mm = String(
      date.getMonth() + 1
    ).padStart(2, "0");
    const dd = String(
      date.getDate()
    ).padStart(2, "0");

    return `${yyyy}-${mm}-${dd}`;
  };

  // ---------------------------------------
  // Fetch availability
  // ---------------------------------------

  useEffect(() => {
    if (!selectedDate) {
      onAvailabilityChange(null);
      onAvailabilityLoadingChange(false);
      return;
    }

    let cancelled = false;

    async function checkAvailability() {
      onAvailabilityLoadingChange(true);
      setAvailabilityError("");

      try {
        const response = await fetch(
          `/api/availability?date=${selectedDate}`,
          {
            method: "GET",
            cache: "no-store",
          }
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.message ||
              "Unable to check availability."
          );
        }

        if (cancelled) {
          return;
        }

        onAvailabilityChange({
          morning: {
            available:
              data.morning?.available ?? false,
          },
          evening: {
            available:
              data.evening?.available ?? false,
          },
        });
      } catch (error) {
        console.error(
          "Availability check failed:",
          error
        );

        if (!cancelled) {
          setAvailabilityError(
            "Unable to check availability. Please try again."
          );

          onAvailabilityChange(null);
        }
      } finally {
        if (!cancelled) {
          onAvailabilityLoadingChange(false);
        }
      }
    }

    checkAvailability();

    return () => {
      cancelled = true;
    };
  }, [
    selectedDate,
    onAvailabilityChange,
    onAvailabilityLoadingChange,
  ]);

  // ---------------------------------------
  // Calendar animation
  // ---------------------------------------

  useEffect(() => {
    if (!calendarRef.current) {
      return;
    }

    gsap.fromTo(
      calendarRef.current,
      {
        opacity: 0,
        y: 10,
      },
      {
        opacity: 1,
        y: 0,
        duration: 0.35,
        ease: "power2.out",
      }
    );
  }, [currentMonth]);

  // ---------------------------------------
  // Month navigation
  // ---------------------------------------

  const goToPreviousMonth = () => {
    const previousMonth = new Date(
      currentMonth
    );

    previousMonth.setMonth(
      previousMonth.getMonth() - 1
    );

    const firstOfCurrentMonth = new Date(
      today.getFullYear(),
      today.getMonth(),
      1
    );

    if (previousMonth < firstOfCurrentMonth) {
      return;
    }

    setCurrentMonth(previousMonth);
  };

  const goToNextMonth = () => {
    const nextMonth = new Date(
      currentMonth
    );

    nextMonth.setMonth(
      nextMonth.getMonth() + 1
    );

    setCurrentMonth(nextMonth);
  };

  // ---------------------------------------
  // Date selection
  // ---------------------------------------

  const handleDateSelect = (day: number) => {
    if (isPastDate(day)) {
      return;
    }

    const date = formatDate(day);

    onChange(date);
  };

  // ---------------------------------------
  // Selected date formatting
  // ---------------------------------------

  const selectedDateLabel = selectedDate
    ? new Date(
        `${selectedDate}T00:00:00`
      ).toLocaleDateString("en-IN", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "Select a date";

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_220px] lg:gap-12">
      {/* Calendar */}
      <div
        ref={calendarRef}
        className="rounded-2xl border border-border/60 bg-background p-5 sm:p-6"
      >
        {/* Calendar Header */}
        <div className="mb-6 flex items-center justify-between">
          <button
            type="button"
            onClick={goToPreviousMonth}
            disabled={
              currentMonth.getFullYear() ===
                today.getFullYear() &&
              currentMonth.getMonth() ===
                today.getMonth()
            }
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border transition hover:bg-muted disabled:pointer-events-none disabled:opacity-30"
            aria-label="Previous month"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <div className="text-sm font-medium tracking-wide">
            {formattedMonth}
          </div>

          <button
            type="button"
            onClick={goToNextMonth}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border transition hover:bg-muted"
            aria-label="Next month"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* Weekdays */}
        <div className="mb-3 grid grid-cols-7 text-center text-xs uppercase tracking-wider text-muted-foreground">
          {[
            "S",
            "M",
            "T",
            "W",
            "T",
            "F",
            "S",
          ].map((day, index) => (
            <div key={`${day}-${index}`}>
              {day}
            </div>
          ))}
        </div>

        {/* Days */}
        <div className="grid grid-cols-7 gap-y-2 text-center">
          {Array.from({
            length: firstDay,
          }).map((_, index) => (
            <div key={`empty-${index}`} />
          ))}

          {monthDays.map((day) => {
            const date = formatDate(day);
            const isSelected =
              selectedDate === date;
            const disabled =
              isPastDate(day);

            return (
              <button
                key={day}
                type="button"
                disabled={disabled}
                onClick={() =>
                  handleDateSelect(day)
                }
                className={[
                  "mx-auto flex h-9 w-9 items-center justify-center rounded-full text-sm transition sm:h-10 sm:w-10",
                  isSelected
                    ? "bg-foreground text-background"
                    : "hover:bg-muted",
                  disabled
                    ? "cursor-not-allowed text-muted-foreground/30 hover:bg-transparent"
                    : "",
                ].join(" ")}
              >
                {day}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected date */}
      <div className="flex flex-col justify-center rounded-2xl border border-border/60 bg-muted/20 p-6">
        <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background">
          <CalendarDays className="h-4 w-4" />
        </div>

        <p className="mb-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">
          Selected Date
        </p>

        <p className="text-base font-medium leading-relaxed">
          {selectedDateLabel}
        </p>

        {!selectedDate && (
          <p className="mt-3 text-sm text-muted-foreground">
            Choose a date to check available
            shifts.
          </p>
        )}

        {availabilityError && (
          <p className="mt-4 text-xs leading-relaxed text-destructive">
            {availabilityError}
          </p>
        )}
      </div>
    </div>
  );
}