"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { Users } from "lucide-react";

import {
  BOOKING_LIMITS,
} from "@/lib/booking-config";

interface GuestSelectorProps {
  guestCount: number;
  onChange: (value: number) => void;
}

const {
  minGuests: MIN_GUESTS,
  maxGuests: MAX_GUESTS,
  guestStep: STEP,
} = BOOKING_LIMITS;

const QUICK_GUEST_OPTIONS = [
  100,
  200,
  300,
  400,
  500,
];

export default function GuestSelector({
  guestCount,
  onChange,
}: GuestSelectorProps) {
  const guestCountRef =
    useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    if (!guestCountRef.current) return;

    gsap.fromTo(
      guestCountRef.current,
      {
        scale: 0.92,
        opacity: 0.65,
      },
      {
        scale: 1,
        opacity: 1,
        duration: 0.2,
        ease: "power2.out",
      }
    );
  }, [guestCount]);

  const updateGuestCount = (
    value: number
  ) => {
    const nextValue = Math.min(
      MAX_GUESTS,
      Math.max(MIN_GUESTS, value)
    );

    onChange(nextValue);
  };

  const progress =
    ((guestCount - MIN_GUESTS) /
      (MAX_GUESTS - MIN_GUESTS)) *
    100;

  return (
    <div>
      <div className="mx-auto max-w-2xl text-center">
        <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-lg border border-[#a68a56]/20 bg-[#f5f1e8]">
          <Users className="h-5 w-5 text-[#a68a56]" />
        </div>

        <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-[#8d7650]">
          Expected attendance
        </p>

        <div className="mt-3 flex items-baseline justify-center gap-2">
          <span
            ref={guestCountRef}
            className="font-serif text-5xl font-medium tracking-tight text-[#183d34] sm:text-6xl"
          >
            {guestCount}
          </span>

          <span className="text-sm text-[#211e1a]/60">
            guests
          </span>
        </div>

        <p className="mx-auto mt-3 max-w-md text-xs leading-6 text-[#211e1a]/60">
          Choose an approximate guest count between{" "}
          {MIN_GUESTS} and {MAX_GUESTS}.
        </p>
      </div>

      <div className="mx-auto mt-10 max-w-2xl">
        <input
          type="range"
          min={MIN_GUESTS}
          max={MAX_GUESTS}
          step={STEP}
          value={guestCount}
          onChange={(event) =>
            updateGuestCount(
              Number(event.target.value)
            )
          }
          aria-label="Number of guests"
          className="guest-slider w-full cursor-pointer"
          style={
            {
              "--slider-progress": `${progress}%`,
            } as React.CSSProperties
          }
        />

        <div className="mt-3 flex justify-between text-[10px] font-medium uppercase tracking-[0.14em] text-[#211e1a]/50">
          <span>{MIN_GUESTS}</span>
          <span>{MAX_GUESTS}</span>
        </div>

        <div className="mt-8 grid grid-cols-5 gap-2">
          {QUICK_GUEST_OPTIONS.map(
            (count) => (
              <button
                key={count}
                type="button"
                onClick={() =>
                  updateGuestCount(count)
                }
                aria-pressed={
                  guestCount === count
                }
                className={`rounded-xl border px-2 py-3 text-xs transition ${
                  guestCount === count
                    ? "border-[#183d34] bg-[#183d34] text-white"
                    : "border-[#ded7c9] bg-white text-[#53675d] hover:border-[#a68a56] hover:bg-[#fbf8f1]"
                }`}
              >
                {count}
              </button>
            )
          )}
        </div>

        <div className="mt-8 flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={() =>
              updateGuestCount(
                guestCount - STEP
              )
            }
            disabled={
              guestCount <= MIN_GUESTS
            }
            aria-label="Decrease guest count"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-[#ded7c9] bg-white text-[#53675d] transition hover:border-[#a68a56] hover:text-[#8d7650] disabled:cursor-not-allowed disabled:opacity-35"
          >
            −
          </button>

          <span className="min-w-[100px] text-center text-[10px] font-medium uppercase tracking-[0.14em] text-[#211e1a]/55">
            {STEP} guests
          </span>

          <button
            type="button"
            onClick={() =>
              updateGuestCount(
                guestCount + STEP
              )
            }
            disabled={
              guestCount >= MAX_GUESTS
            }
            aria-label="Increase guest count"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-[#ded7c9] bg-white text-[#53675d] transition hover:border-[#a68a56] hover:text-[#8d7650] disabled:cursor-not-allowed disabled:opacity-35"
          >
            +
          </button>
        </div>
      </div>

      <style jsx>{`
        .guest-slider {
          appearance: none;
          height: 3px;
          border-radius: 9999px;
          background: linear-gradient(
            to right,
            #537c68 0%,
            #537c68 var(--slider-progress),
            #ded7c9
              var(--slider-progress),
            #ded7c9 100%
          );
          outline: none;
        }

        .guest-slider::-webkit-slider-thumb {
          appearance: none;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #a68a56;
          border: 3px solid #f5f1e8;
          box-shadow:
            0 0 0 1px rgba(141, 118, 80, 0.5),
            0 3px 10px rgba(33, 30, 26, 0.18);
          cursor: pointer;
        }

        .guest-slider::-moz-range-thumb {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #a68a56;
          border: 3px solid #f5f1e8;
          box-shadow:
            0 0 0 1px rgba(141, 118, 80, 0.5),
            0 3px 10px rgba(33, 30, 26, 0.18);
          cursor: pointer;
        }

        .guest-slider:focus-visible {
          outline: 1px solid rgba(141, 118, 80, 0.6);
          outline-offset: 6px;
          border-radius: 9999px;
        }
      `}</style>
    </div>
  );
}