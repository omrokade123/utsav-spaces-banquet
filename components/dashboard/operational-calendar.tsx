"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, CalendarDays } from "lucide-react";

import type { CalendarDaySummary } from "@/lib/dashboard";

interface OperationalCalendarProps {
  month: string;
  days: CalendarDaySummary[];
}

function toDateParts(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return { year, month, day };
}

function getCompactDayStatus(status: CalendarDaySummary["status"]) {
  switch (status) {
    case "Partially booked":
    case "Partially blocked":
      return "Partial";
    case "Fully booked":
      return "Booked";
    case "Blocked":
      return "Blocked";
    case "Fully unavailable":
      return "Unavailable";
    default:
      return "Open";
  }
}

function getShiftIndicatorClass(status: "Available" | "Booked" | "Blocked") {
  if (status === "Available") {
    return "bg-[#678b74]";
  }

  return status === "Booked" ? "bg-[#183d34]" : "bg-[#b35342]";
}

function getCompactShiftStatus(status: "Available" | "Booked" | "Blocked") {
  return status === "Available" ? "Open" : status;
}

export function OperationalCalendar({ month, days }: OperationalCalendarProps) {
  const [visibleMonth, setVisibleMonth] = useState(new Date(`${month}-01T00:00:00`));
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  });

  const selectedDay = useMemo(
    () => days.find((item) => item.date === selectedDate) ?? days[0],
    [days, selectedDate]
  );

  const monthStart = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), 1);
  const monthLength = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0).getDate();
  const startDay = monthStart.getDay();
  const cells = Array.from({ length: 42 }, (_, index) => {
    const dayNumber = index - startDay + 1;
    const date = new Date(monthStart.getFullYear(), monthStart.getMonth(), dayNumber);

    if (dayNumber < 1 || dayNumber > monthLength) {
      return null;
    }

    const iso = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    const summary = days.find((day) => day.date === iso) ?? null;

    return {
      iso,
      day: date.getDate(),
      summary,
    };
  });

  const handleToday = () => {
    const today = new Date();
    setVisibleMonth(new Date(today.getFullYear(), today.getMonth(), 1));
    setSelectedDate(
      `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`
    );
  };

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-[#ded7cc] bg-white p-3 shadow-sm sm:rounded-2xl sm:p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f2ebdf] text-[#183d34]">
              <CalendarDays className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-[#8d7650]">Operations calendar</p>
              <h2 className="text-xl font-medium text-[#171614]">
                {monthStart.toLocaleDateString("en-IN", { month: "long", year: "numeric" })}
              </h2>
            </div>
          </div>

          <div className="flex w-full items-center justify-between gap-2 sm:w-auto sm:justify-start">
            <button
              type="button"
              onClick={() => setVisibleMonth(new Date(monthStart.getFullYear(), monthStart.getMonth() - 1, 1))}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#ded7cc] bg-[#f9f6f1] text-[#171614] transition hover:border-[#183d34]"
              aria-label="Previous month"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={handleToday}
              className="min-h-10 flex-1 rounded-xl border border-[#ded7cc] bg-[#f9f6f1] px-3 py-2 text-sm font-medium text-[#171614] transition hover:border-[#183d34] sm:flex-none"
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => setVisibleMonth(new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 1))}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#ded7cc] bg-[#f9f6f1] text-[#171614] transition hover:border-[#183d34]"
              aria-label="Next month"
            >
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="grid min-w-0 gap-4 xl:grid-cols-[1.55fr_0.9fr] xl:gap-6">
        <div className="min-w-0 rounded-xl border border-[#ded7cc] bg-white p-2 shadow-sm sm:rounded-2xl sm:p-4">
          <div className="grid grid-cols-7 gap-1 text-center text-[9px] font-medium uppercase tracking-[0.08em] text-[#8d7650] sm:gap-2 sm:text-[10px] sm:tracking-[0.18em]">
            {[
              { short: "S", full: "Sun" },
              { short: "M", full: "Mon" },
              { short: "T", full: "Tue" },
              { short: "W", full: "Wed" },
              { short: "T", full: "Thu" },
              { short: "F", full: "Fri" },
              { short: "S", full: "Sat" },
            ].map(({ short, full }) => (
              <div key={full} className="py-2">
                <span className="sm:hidden">{short}</span>
                <span className="hidden sm:inline">{full}</span>
              </div>
            ))}
          </div>

          <div className="mt-1 grid grid-cols-7 gap-1 sm:mt-2 sm:gap-2">
            {cells.map((cell, index) => {
              if (!cell) {
                return <div key={`empty-${index}`} className="aspect-square min-h-0 rounded-lg border border-dashed border-[#efe7de] bg-[#faf7f3] lg:aspect-auto lg:h-24 lg:rounded-xl" />;
              }

              const isSelected = cell.iso === selectedDate;

              return (
                <button
                  key={cell.iso}
                  type="button"
                  onClick={() => setSelectedDate(cell.iso)}
                  aria-label={`${cell.iso}: ${cell.summary?.status ?? "Available"}${cell.summary ? `, morning ${cell.summary.morning}, evening ${cell.summary.evening}` : ""}`}
                  className={[
                    "flex aspect-square min-h-0 min-w-0 flex-col rounded-lg border p-1 text-left transition lg:aspect-auto lg:min-h-24 lg:rounded-xl lg:p-2",
                    isSelected
                      ? "border-[#183d34] bg-[#edf4f2] shadow-sm"
                      : "border-[#eae0d5] bg-[#f9f6f1] hover:border-[#c5bdaa]",
                  ].join(" ")}
                >
                  <span className="text-[11px] font-medium leading-4 text-[#171614] sm:text-xs">{cell.day}</span>

                  {cell.summary ? (
                    <>
                      <span className="mt-1 hidden truncate rounded-full bg-[#f0e7d8] px-1 py-0.5 text-center text-[8px] font-medium uppercase leading-3 text-[#4d433d] lg:block">
                        {getCompactDayStatus(cell.summary.status)}
                      </span>
                      <div className="mt-auto flex items-center justify-center gap-1.5 pt-1 text-[8px] text-[#665d57] lg:hidden">
                        <span className="flex items-center gap-0.5">
                          M<span className={`h-1.5 w-1.5 rounded-full ${getShiftIndicatorClass(cell.summary.morning)}`} />
                        </span>
                        <span className="flex items-center gap-0.5">
                          E<span className={`h-1.5 w-1.5 rounded-full ${getShiftIndicatorClass(cell.summary.evening)}`} />
                        </span>
                      </div>
                      <div className="mt-auto hidden space-y-0.5 pt-1 text-[8px] leading-3 text-[#665d57] lg:block">
                        <span className="block truncate">M: {getCompactShiftStatus(cell.summary.morning)}</span>
                        <span className="block truncate">E: {getCompactShiftStatus(cell.summary.evening)}</span>
                      </div>
                    </>
                  ) : (
                    <div className="mt-auto pt-1 text-[8px] leading-3 text-[#8d7650] sm:mt-2 sm:text-[9px]">Open</div>
                  )}
                </button>
              );
            })}
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-[#efeae3] pt-3 text-[9px] text-[#665d57] sm:text-[10px]">
            <span className="font-medium text-[#4d433d]">M = Morning · E = Evening</span>
            {[
              { label: "Open", value: "Available" as const },
              { label: "Booked", value: "Booked" as const },
              { label: "Blocked", value: "Blocked" as const },
            ].map(({ label, value }) => (
              <span key={label} className="inline-flex items-center gap-1">
                <span className={`h-1.5 w-1.5 rounded-full ${getShiftIndicatorClass(value)}`} />
                {label}
              </span>
            ))}
          </div>
        </div>

        <aside className="min-w-0 rounded-xl border border-[#ded7cc] bg-white p-3 shadow-sm sm:rounded-2xl sm:p-4">
          {selectedDay ? (
            <>
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#efeae3] pb-3">
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-[#8d7650]">Selected date</p>
                  <h3 className="mt-2 text-lg font-medium text-[#171614] sm:text-xl">
                    {new Date(`${selectedDay.date}T00:00:00`).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </h3>
                </div>
                <span className="max-w-full rounded-full bg-[#f0e7d8] px-2 py-1 text-[9px] font-medium uppercase leading-4 tracking-[0.08em] text-[#4d433d] sm:text-[10px] sm:tracking-[0.12em]">
                  {selectedDay.status}
                </span>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2 sm:space-y-3">
                {[
                  { label: "Morning", value: selectedDay.morning },
                  { label: "Evening", value: selectedDay.evening },
                ].map(({ label, value }) => (
                  <div key={label} className="rounded-lg border border-[#efebe5] bg-[#faf7f3] p-2.5 sm:rounded-xl sm:p-3">
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                      <span className="text-xs font-medium text-[#171614] sm:text-sm">{label}</span>
                      <span className="w-fit rounded-full border border-[#ded7cc] px-2 py-0.5 text-[9px] font-medium uppercase tracking-[0.08em] text-[#4d433d] sm:text-[10px] sm:tracking-[0.12em]">{value}</span>
                    </div>
                  </div>
                ))}
              </div>

              {selectedDay.bookings.length > 0 ? (
                <div className="mt-5 space-y-3">
                  <h4 className="text-xs font-medium uppercase tracking-[0.18em] text-[#8d7650]">Bookings</h4>

                  {selectedDay.bookings.map((booking) => (
                    <div key={booking.id} className="rounded-xl border border-[#efeae3] bg-[#faf8f4] p-3">
                      <div className="flex min-w-0 items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="break-words text-sm font-medium text-[#171614]">{booking.customer_name ?? "Guest"}</p>
                          <p className="mt-1 text-xs text-[#5f5853]">{booking.event_type}</p>
                        </div>
                        <span className="shrink-0 rounded-full bg-[#e9f4ef] px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.12em] text-[#183d34]">
                          {booking.status}
                        </span>
                      </div>

                      <div className="mt-3 flex items-center justify-between text-xs text-[#5f5853]">
                        <span>{booking.guest_count} guests</span>
                        <span>{booking.shift}</span>
                      </div>

                      <Link href={`/dashboard/bookings/${booking.id}`} className="mt-3 inline-flex min-h-10 items-center text-sm font-medium text-[#183d34] hover:text-[#102d2b]">
                        View booking →
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-5 rounded-xl border border-dashed border-[#ded7cc] bg-[#faf7f3] p-4 text-sm text-[#5f5853]">
                  No events scheduled for this period.
                </div>
              )}
            </>
          ) : (
            <p className="text-sm text-[#5f5853]">No date information available.</p>
          )}
        </aside>
      </div>
    </div>
  );
}
