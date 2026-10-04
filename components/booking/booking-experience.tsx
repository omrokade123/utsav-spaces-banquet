"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import {
  ArrowLeft,
  ArrowRight,
  Check,
  Loader2,
} from "lucide-react";

import { EVENT_TYPES } from "@/lib/booking-config";
import { calculatePricing } from "@/lib/pricing";

import type {
  CustomerDetails,
  EventType,
  FoodPackageId,
  ShiftType,
} from "@/types/booking";

import DateSelector, {
  type DateAvailability,
} from "./date-selector";

import ShiftSelector from "./shift-selector";
import GuestSelector from "./guest-selector";
import FoodPackages from "./food-packages";
import PriceSummary from "./price-summary";
import BookingForm from "./booking-form";

gsap.registerPlugin(ScrollTrigger);

type BookingStep = 1 | 2 | 3 | 4 | 5 | 6 | 7;

type SubmissionStatus =
  | "idle"
  | "submitting"
  | "success"
  | "error";

const STEPS = [
  {
    number: 1,
    label: "Event",
  },
  {
    number: 2,
    label: "Date",
  },
  {
    number: 3,
    label: "Shift",
  },
  {
    number: 4,
    label: "Guests",
  },
  {
    number: 5,
    label: "Food",
  },
  {
    number: 6,
    label: "Review",
  },
  {
    number: 7,
    label: "Details",
  },
] as const;

export default function BookingExperience() {
  // ---------------------------------------
  // Refs
  // ---------------------------------------

  const sectionRef =
    useRef<HTMLElement>(null);

  const introRef =
    useRef<HTMLDivElement>(null);

  const progressRef =
    useRef<HTMLDivElement>(null);

  const contentRef =
    useRef<HTMLDivElement>(null);

  const navigationRef =
    useRef<HTMLDivElement>(null);

  // ---------------------------------------
  // Booking step
  // ---------------------------------------

  const [step, setStep] =
    useState<BookingStep>(1);

  // ---------------------------------------
  // Booking selection
  // ---------------------------------------

  const [eventType, setEventType] =
    useState<EventType | null>(null);

  const [selectedDate, setSelectedDate] =
    useState<string | null>(null);

  const [selectedShift, setSelectedShift] =
    useState<ShiftType | null>(null);

  const [guestCount, setGuestCount] =
    useState(100);

  const [selectedPackages, setSelectedPackages] =
    useState<FoodPackageId[]>([]);

  // ---------------------------------------
  // Customer
  // ---------------------------------------

  const [customer, setCustomer] =
    useState<CustomerDetails>({
      name: "",
      email: "",
      phone: "",
      message: "",
    });

  // ---------------------------------------
  // Availability
  // ---------------------------------------

  const [availability, setAvailability] =
    useState<DateAvailability | null>(null);

  const [
    availabilityLoading,
    setAvailabilityLoading,
  ] = useState(false);

  // ---------------------------------------
  // Submission
  // ---------------------------------------

  const [
    submissionStatus,
    setSubmissionStatus,
  ] = useState<SubmissionStatus>("idle");

  const [errorMessage, setErrorMessage] =
    useState("");

  const [bookingId, setBookingId] =
    useState<string | null>(null);

  // ---------------------------------------
  // Pricing
  // ---------------------------------------

  const pricing = useMemo(() => {
    if (!selectedShift) {
      return null;
    }

    return calculatePricing({
      guestCount,
      selectedShift,
      selectedPackages,
    });
  }, [
    guestCount,
    selectedShift,
    selectedPackages,
  ]);

  // ---------------------------------------
  // Helpers
  // ---------------------------------------

  const getEventTitle = (
    value: EventType
  ) => {
    const event = EVENT_TYPES.find(
      (item) => item.id === value
    );

    return event?.title ?? "Event";
  };

  const getShiftLabel = (
    value: ShiftType
  ) => {
    return value === "morning"
      ? "Morning · 9 AM – 4 PM"
      : "Evening · 6 PM – 12 AM";
  };

  const formatSelectedDate = (
    date: string
  ) => {
    return new Date(
      `${date}T00:00:00`
    ).toLocaleDateString("en-IN", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  // ---------------------------------------
  // Initial section reveal
  // ---------------------------------------

  useEffect(() => {
    const section = sectionRef.current;

    if (!section) {
      return;
    }

    const ctx = gsap.context(() => {
      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

      if (reduceMotion) {
        gsap.set(
          [
            introRef.current,
            progressRef.current,
            contentRef.current,
            navigationRef.current,
          ],
          {
            opacity: 1,
            y: 0,
          }
        );

        return;
      }

      const introElements =
        introRef.current?.querySelectorAll(
          "[data-booking-intro]"
        );

      const introTimeline =
        gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: "top 78%",
            once: true,
          },
        });

      introTimeline.fromTo(
        introElements ?? [],
        {
          opacity: 0,
          y: 24,
        },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.1,
          ease: "power3.out",
        }
      );

      introTimeline.fromTo(
        progressRef.current,
        {
          opacity: 0,
          y: 20,
        },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          ease: "power3.out",
        },
        "-=0.45"
      );

      introTimeline.fromTo(
        contentRef.current,
        {
          opacity: 0,
          y: 24,
        },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power3.out",
        },
        "-=0.4"
      );
    }, section);

    return () => {
      ctx.revert();
    };
  }, []);

  // ---------------------------------------
  // Step transition
  // ---------------------------------------

  useEffect(() => {
    const content = contentRef.current;

    if (!content) {
      return;
    }

    const ctx = gsap.context(() => {
      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

      if (reduceMotion) {
        gsap.set(content, {
          opacity: 1,
          x: 0,
        });

        return;
      }

      const elements =
        content.querySelectorAll(
          "[data-step-element]"
        );

      gsap.fromTo(
        content,
        {
          opacity: 0,
          x: 18,
        },
        {
          opacity: 1,
          x: 0,
          duration: 0.5,
          ease: "power3.out",
        }
      );

      if (elements.length) {
        gsap.fromTo(
          elements,
          {
            opacity: 0,
            y: 16,
          },
          {
            opacity: 1,
            y: 0,
            duration: 0.5,
            stagger: 0.06,
            delay: 0.08,
            ease: "power3.out",
          }
        );
      }

      if (navigationRef.current) {
        gsap.fromTo(
          navigationRef.current,
          {
            opacity: 0,
            y: 12,
          },
          {
            opacity: 1,
            y: 0,
            duration: 0.45,
            delay: 0.18,
            ease: "power2.out",
          }
        );
      }
    }, content);

    return () => {
      ctx.revert();
    };
  }, [step]);

  // ---------------------------------------
  // Customer update
  // ---------------------------------------

  const handleCustomerChange =
    useCallback(
      (
        field: keyof CustomerDetails,
        value: string
      ) => {
        setCustomer((current) => ({
          ...current,
          [field]: value,
        }));
      },
      []
    );

  // ---------------------------------------
  // Date change
  // ---------------------------------------

  const handleDateChange =
    useCallback((date: string) => {
      setSelectedDate(date);

      setSelectedShift(null);

      setAvailability(null);

      setErrorMessage("");
    }, []);

  // ---------------------------------------
  // Availability update
  // ---------------------------------------

  const handleAvailabilityChange =
    useCallback(
      (
        value: DateAvailability | null
      ) => {
        setAvailability(value);
      },
      []
    );

  // ---------------------------------------
  // Navigation
  // ---------------------------------------

  const goNext = () => {
    if (step >= 7) {
      return;
    }

    setStep(
      (current) =>
        (current + 1) as BookingStep
    );
  };

  const goBack = () => {
    if (step <= 1) {
      return;
    }

    setStep(
      (current) =>
        (current - 1) as BookingStep
    );
  };

  // ---------------------------------------
  // Validation
  // ---------------------------------------

  const canContinue = () => {
    switch (step) {
      case 1:
        return Boolean(eventType);

      case 2:
        return Boolean(
          selectedDate &&
            !availabilityLoading
        );

      case 3:
        if (
          !selectedShift ||
          availabilityLoading
        ) {
          return false;
        }

        if (
          availability &&
          !availability[selectedShift]
            .available
        ) {
          return false;
        }

        return true;

      case 4:
        return guestCount >= 100;

      case 5:
        return true;

      case 6:
        return Boolean(
          eventType &&
            selectedDate &&
            selectedShift &&
            pricing
        );

      case 7:
        return false;

      default:
        return false;
    }
  };

  // ---------------------------------------
  // Submit booking
  // ---------------------------------------

  const handleBookingSubmit =
    async () => {
      if (
        !eventType ||
        !selectedDate ||
        !selectedShift ||
        !pricing
      ) {
        return;
      }

      setErrorMessage("");
      setBookingId(null);

      setSubmissionStatus(
        "submitting"
      );

      try {
        const response = await fetch(
          "/api/bookings",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              eventType,
              selectedDate,
              selectedShift,
              guestCount,
              selectedPackages,
              customer,
            }),
          }
        );

        const data =
          await response.json();

        if (
          !response.ok ||
          !data.success
        ) {
          setSubmissionStatus(
            "error"
          );

          setErrorMessage(
            data.message ||
              "Unable to submit your booking enquiry."
          );

          if (
            data.errorCode ===
              "SHIFT_UNAVAILABLE" ||
            data.errorCode ===
              "BOOKING_EXISTS"
          ) {
            setSelectedShift(null);
            setAvailability(null);
            setStep(3);
          }

          return;
        }

        setBookingId(
          data.bookingId ?? null
        );

        setSubmissionStatus(
          "success"
        );
      } catch (error) {
        console.error(
          "Booking submission failed:",
          error
        );

        setSubmissionStatus(
          "error"
        );

        setErrorMessage(
          "Unable to connect to the booking service. Please try again."
        );
      }
    };

  // ---------------------------------------
  // Success animation
  // ---------------------------------------

  useEffect(() => {
    if (
      submissionStatus !==
      "success"
    ) {
      return;
    }

    const section = sectionRef.current;

    if (!section) {
      return;
    }

    const ctx = gsap.context(() => {
      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

      const elements =
        section.querySelectorAll(
          "[data-success-element]"
        );

      if (reduceMotion) {
        gsap.set(elements, {
          opacity: 1,
          y: 0,
          scale: 1,
        });

        return;
      }

      gsap.fromTo(
        elements,
        {
          opacity: 0,
          y: 24,
        },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          stagger: 0.1,
          ease: "power3.out",
        }
      );
    }, section);

    return () => {
      ctx.revert();
    };
  }, [submissionStatus]);

  // ---------------------------------------
  // Success screen
  // ---------------------------------------

  if (
    submissionStatus === "success" &&
    pricing &&
    eventType &&
    selectedDate &&
    selectedShift
  ) {
    return (
      <section
        ref={sectionRef}
        id="booking"
        className="border-t border-[#DED7CC] bg-[#F7F3EC] text-[#171614]"
      >
        <div className="mx-auto max-w-4xl px-5 py-20 sm:px-6 lg:px-8 lg:py-24">
          <div className="mx-auto max-w-xl text-center">
            <div
              data-success-element
              className="mx-auto mb-7 flex h-16 w-16 items-center justify-center rounded-full bg-foreground text-background"
            >
              <Check className="h-7 w-7" />
            </div>

            <p
              data-success-element
              className="mb-3 text-xs uppercase tracking-[0.2em] text-muted-foreground"
            >
              Enquiry Received
            </p>

            <h2
              data-success-element
              className="text-3xl font-medium tracking-tight sm:text-4xl"
            >
              Thank you for choosing Utsav.
            </h2>

            <p
              data-success-element
              className="mx-auto mt-5 max-w-lg text-sm leading-7 text-muted-foreground"
            >
              Your booking enquiry has been
              successfully received. Our team
              will review your details and
              contact you regarding confirmation.
            </p>

            {bookingId && (
              <div
                data-success-element
                className="mx-auto mt-6 inline-flex items-center rounded-full border border-border/60 bg-muted/20 px-4 py-2"
              >
                <span className="mr-2 text-xs text-muted-foreground">
                  Enquiry ID
                </span>

                <span className="font-mono text-xs font-medium">
                  {bookingId
                    .slice(0, 8)
                    .toUpperCase()}
                </span>
              </div>
            )}

            <div
              data-success-element
              className="mt-10 rounded-2xl border border-border/60 bg-muted/20 p-6 text-left"
            >
              <div className="space-y-4 text-sm">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-muted-foreground">
                    Event
                  </span>

                  <span className="font-medium">
                    {getEventTitle(
                      eventType
                    )}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <span className="text-muted-foreground">
                    Date
                  </span>

                  <span className="text-right font-medium">
                    {formatSelectedDate(
                      selectedDate
                    )}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <span className="text-muted-foreground">
                    Shift
                  </span>

                  <span className="font-medium">
                    {getShiftLabel(
                      selectedShift
                    )}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <span className="text-muted-foreground">
                    Guests
                  </span>

                  <span className="font-medium">
                    {guestCount}
                  </span>
                </div>

                <div className="border-t border-border/60 pt-4">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-muted-foreground">
                      Estimated Total
                    </span>

                    <span className="text-lg font-medium">
                      ₹
                      {pricing.estimatedTotal.toLocaleString(
                        "en-IN"
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <p
              data-success-element
              className="mt-6 text-xs leading-6 text-muted-foreground"
            >
              This is an estimated amount and
              not a final quotation. Final
              pricing may vary based on your
              confirmed requirements.
            </p>
          </div>
        </div>
      </section>
    );
  }

  // ---------------------------------------
  // Main booking experience
  // ---------------------------------------

  return (
    <section
      ref={sectionRef}
      id="booking"
      className="border-t border-[#d8d0c1] bg-[#f5f1e8] text-[#211e1a]"
    >
      <div className="mx-auto max-w-6xl px-5 py-20 sm:px-6 lg:px-8 lg:py-24">
        {/* --------------------------------- */}
        {/* INTRO */}
        {/* --------------------------------- */}

        <div
          ref={introRef}
          className="mx-auto max-w-2xl text-center"
        >
          <p
            data-booking-intro
            className="text-xs font-medium uppercase tracking-[0.22em] text-[#a68a56]"
          >
            Plan Your Event
          </p>

          <h2
            data-booking-intro
            className="mt-3 font-serif text-4xl font-medium tracking-tight sm:text-5xl"
          >
            Create your celebration.
          </h2>

          <p
            data-booking-intro
            className="mx-auto mt-5 max-w-xl text-sm leading-7 text-[#211e1a]/65 sm:text-base"
          >
            Choose your event details, check
            availability, customise your
            experience, and receive an instant
            estimated quotation.
          </p>
        </div>

        {/* --------------------------------- */}
        {/* PROGRESS */}
        {/* --------------------------------- */}

        <div
          ref={progressRef}
          className="mx-auto mt-14 max-w-4xl"
        >
          {/* Desktop */}
          <div className="hidden items-start justify-between sm:flex">
            {STEPS.map(
              (item, index) => {
                const completed =
                  step > item.number;

                const active =
                  step === item.number;

                return (
                  <div
                    key={item.number}
                    className="flex flex-1 items-start"
                  >
                    <div className="flex min-w-[54px] flex-col items-center">
                      <div
                        data-progress-circle
                        className={[
                          "flex h-10 w-10 items-center justify-center rounded-full border text-xs transition-colors duration-300",
                          completed ||
                          active
                            ? "border-[#183d34] bg-[#183d34] text-white"
                            : "border-[#ded7c9] bg-white text-[#8d7650]",
                        ].join(" ")}
                      >
                        {completed ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          item.number
                        )}
                      </div>

                      <span
                        className={[
                          "mt-3 text-[10px] uppercase tracking-[0.14em]",
                          active
                            ? "font-medium text-[#183d34]"
                            : "text-[#211e1a]/55",
                        ].join(" ")}
                      >
                        {item.label}
                      </span>
                    </div>

                    {index <
                      STEPS.length -
                        1 && (
                      <div className="mt-5 h-px flex-1 bg-[#d8d0c1]">
                        <div
                          className="h-full origin-left bg-[#a68a56] transition-transform duration-500"
                          style={{
                            transform:
                              step >
                              item.number
                                ? "scaleX(1)"
                                : "scaleX(0)",
                          }}
                        />
                      </div>
                    )}
                  </div>
                );
              }
            )}
          </div>

          {/* Mobile */}
          <div className="sm:hidden">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-[#8d7650]">
                Step {step} of{" "}
                {STEPS.length}
              </span>

              <span className="text-xs font-medium text-[#183d34]">
                {STEPS[step - 1].label}
              </span>
            </div>

            <div className="h-px overflow-hidden bg-[#d8d0c1]">
              <div
                className="h-full bg-[#a68a56] transition-transform duration-500"
                style={{
                  width: `${
                    (step /
                      STEPS.length) *
                    100
                  }%`,
                }}
              />
            </div>
          </div>
        </div>

        {/* --------------------------------- */}
        {/* CONTENT */}
        {/* --------------------------------- */}

        <div
          ref={contentRef}
          className="mx-auto mt-16 max-w-5xl"
        >
          {/* ================================ */}
          {/* STEP 1 */}
          {/* ================================ */}

          {step === 1 && (
            <div>
              <div
                data-step-element
                className="mb-8"
              >
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  Step 01
                </p>

                <h3 className="mt-3 text-2xl font-medium tracking-tight sm:text-3xl">
                  What are you celebrating?
                </h3>

                <p className="mt-2 text-sm text-muted-foreground">
                  Choose the type of event
                  you&apos;re planning.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                {EVENT_TYPES.map(
                  (event) => {
                    const Icon =
                      event.icon;

                    const selected =
                      eventType ===
                      event.id;

                    return (
                      <button
                        key={event.id}
                        type="button"
                        onClick={() =>
                          setEventType(
                            event.id
                          )
                        }
                        data-step-element
                        className={[
                          "group relative min-h-[210px] rounded-2xl border p-7 text-left transition-colors duration-300",
                          selected
                            ? "border-foreground bg-foreground text-background"
                            : "border-border/60 bg-background hover:border-foreground/40",
                        ].join(
                          " "
                        )}
                      >
                        <div
                          className={[
                            "flex h-11 w-11 items-center justify-center rounded-full border",
                            selected
                              ? "border-background/20 bg-background/10"
                              : "border-border bg-muted/20",
                          ].join(
                            " "
                          )}
                        >
                          <Icon className="h-5 w-5" />
                        </div>

                        <div className="absolute bottom-7 left-7 right-7">
                          <h4 className="text-lg font-medium">
                            {
                              event.title
                            }
                          </h4>

                          <p
                            className={[
                              "mt-2 text-sm leading-6",
                              selected
                                ? "text-background/70"
                                : "text-muted-foreground",
                            ].join(
                              " "
                            )}
                          >
                            {
                              event.description
                            }
                          </p>
                        </div>
                      </button>
                    );
                  }
                )}
              </div>
            </div>
          )}

          {/* ================================ */}
          {/* STEP 2 */}
          {/* ================================ */}

          {step === 2 && (
            <div>
              <div
                data-step-element
                className="mb-8"
              >
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  Step 02
                </p>

                <h3 className="mt-3 text-2xl font-medium tracking-tight sm:text-3xl">
                  Choose your date.
                </h3>

                <p className="mt-2 text-sm text-muted-foreground">
                  Select a date to check
                  real-time availability.
                </p>
              </div>

              <div data-step-element>
                <DateSelector
                  selectedDate={
                    selectedDate
                  }
                  onChange={
                    handleDateChange
                  }
                  onAvailabilityChange={
                    handleAvailabilityChange
                  }
                  onAvailabilityLoadingChange={
                    setAvailabilityLoading
                  }
                />
              </div>
            </div>
          )}

          {/* ================================ */}
          {/* STEP 3 */}
          {/* ================================ */}

          {step === 3 && (
            <div>
              <div
                data-step-element
                className="mb-8"
              >
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  Step 03
                </p>

                <h3 className="mt-3 text-2xl font-medium tracking-tight sm:text-3xl">
                  Select your shift.
                </h3>

                <p className="mt-2 text-sm text-muted-foreground">
                  Choose the time that works
                  best for your celebration.
                </p>
              </div>

              <div data-step-element>
                <ShiftSelector
                  selectedShift={
                    selectedShift
                  }
                  onChange={
                    setSelectedShift
                  }
                  availability={
                    availability
                  }
                  loading={
                    availabilityLoading
                  }
                />
              </div>
            </div>
          )}

          {/* ================================ */}
          {/* STEP 4 */}
          {/* ================================ */}

          {step === 4 && (
            <div>
              <div
                data-step-element
                className="mb-8"
              >
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  Step 04
                </p>

                <h3 className="mt-3 text-2xl font-medium tracking-tight sm:text-3xl">
                  How many guests?
                </h3>

                <p className="mt-2 text-sm text-muted-foreground">
                  Adjust the guest count to
                  calculate your estimate.
                </p>
              </div>

              <div data-step-element>
                <GuestSelector
                  guestCount={
                    guestCount
                  }
                  onChange={
                    setGuestCount
                  }
                />
              </div>
            </div>
          )}

          {/* ================================ */}
          {/* STEP 5 */}
          {/* ================================ */}

          {step === 5 && (
            <div>
              <div
                data-step-element
                className="mb-8"
              >
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  Step 05
                </p>

                <h3 className="mt-3 text-2xl font-medium tracking-tight sm:text-3xl">
                  Build your dining
                  experience.
                </h3>

                <p className="mt-2 text-sm text-muted-foreground">
                  Select the food and
                  beverage packages you&apos;d
                  like to include.
                </p>
              </div>

              <div data-step-element>
                <FoodPackages
                  selectedPackages={
                    selectedPackages
                  }
                  onChange={
                    setSelectedPackages
                  }
                />
              </div>
            </div>
          )}

          {/* ================================ */}
          {/* STEP 6 */}
          {/* ================================ */}

          {step === 6 &&
            pricing && (
              <div>
                <div
                  data-step-element
                  className="mb-8"
                >
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    Step 06
                  </p>

                  <h3 className="mt-3 text-2xl font-medium tracking-tight sm:text-3xl">
                    Review your event.
                  </h3>

                  <p className="mt-2 text-sm text-muted-foreground">
                    Everything looks good?
                    Continue to your contact
                    details.
                  </p>
                </div>

                <div className="grid gap-6 lg:grid-cols-[1fr_360px] lg:items-start">
                  <div
                    data-step-element
                    className="rounded-lg border border-[#ded7c9] bg-white p-6"
                  >
                    <p className="mb-6 text-xs font-medium uppercase tracking-[0.18em] text-[#8d7650]">
                      Event Summary
                    </p>

                    <div className="space-y-5">
                      {eventType && (
                        <div className="flex items-center justify-between gap-5">
                          <span className="text-sm text-[#211e1a]/60">
                            Event
                          </span>

                          <span className="text-right text-sm font-medium text-[#183d34]">
                            {getEventTitle(
                              eventType
                            )}
                          </span>
                        </div>
                      )}

                      {selectedDate && (
                        <div className="flex items-center justify-between gap-5">
                          <span className="text-sm text-[#211e1a]/60">
                            Date
                          </span>

                          <span className="text-right text-sm font-medium text-[#183d34]">
                            {formatSelectedDate(
                              selectedDate
                            )}
                          </span>
                        </div>
                      )}

                      {selectedShift && (
                        <div className="flex items-center justify-between gap-5">
                          <span className="text-sm text-[#211e1a]/60">
                            Shift
                          </span>

                          <span className="text-right text-sm font-medium text-[#183d34]">
                            {getShiftLabel(
                              selectedShift
                            )}
                          </span>
                        </div>
                      )}

                      <div className="flex items-center justify-between gap-5">
                        <span className="text-sm text-[#211e1a]/60">
                          Guests
                        </span>

                        <span className="text-sm font-medium text-[#183d34]">
                          {guestCount}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div data-step-element>
                    <PriceSummary
                      pricing={pricing}
                    />
                  </div>
                </div>
              </div>
            )}

          {/* ================================ */}
          {/* STEP 7 */}
          {/* ================================ */}

          {step === 7 &&
            eventType &&
            selectedDate &&
            selectedShift &&
            pricing && (
              <div>
                <div
                  data-step-element
                  className="mb-8"
                >
                  <p className="text-xs uppercase tracking-[0.2em] text-[#537c68]">
                    Final details
                  </p>

                  <h3 className="mt-3 text-2xl font-medium tracking-tight text-[#183d34] sm:text-3xl">
                    One last detail.
                  </h3>

                  <p className="mt-2 text-sm text-muted-foreground">
                    We&apos;ll use these details
                    to follow up regarding your
                    event enquiry.
                  </p>
                </div>

                <div data-step-element>
                  <BookingForm
                    eventType={getEventTitle(
                      eventType
                    )}
                    selectedDate={formatSelectedDate(
                      selectedDate
                    )}
                    selectedShift={getShiftLabel(
                      selectedShift
                    )}
                    guestCount={
                      guestCount
                    }
                    selectedPackages={
                      selectedPackages
                    }
                    pricing={pricing}
                    customer={customer}
                    onCustomerChange={
                      handleCustomerChange
                    }
                    onBack={goBack}
                    onSubmit={
                      handleBookingSubmit
                    }
                    submissionStatus={
                      submissionStatus
                    }
                    errorMessage={
                      errorMessage
                    }
                  />
                </div>
              </div>
            )}
        </div>

        {/* --------------------------------- */}
        {/* NAVIGATION */}
        {/* --------------------------------- */}

        {step < 7 && (
          <div
            ref={navigationRef}
            className="mx-auto mt-10 flex max-w-5xl items-center justify-between border-t border-border/60 pt-6"
          >
            <button
              type="button"
              onClick={goBack}
              disabled={step === 1}
              className="group inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition hover:text-foreground disabled:pointer-events-none disabled:opacity-30"
            >
              <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" />

              Back
            </button>

            <button
              type="button"
              onClick={goNext}
              disabled={!canContinue()}
              className="group inline-flex items-center gap-3 rounded-full bg-[#183d34] px-6 py-3 text-sm font-medium text-white transition-all duration-300 hover:bg-[#285c4e] disabled:pointer-events-none disabled:opacity-40"
            >
              Continue

              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </button>
          </div>
        )}

        {/* --------------------------------- */}
        {/* SUBMISSION LOADING */}
        {/* --------------------------------- */}

        {submissionStatus ===
          "submitting" && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 px-5 backdrop-blur-sm">
            <div className="w-full max-w-sm rounded-2xl border border-border/60 bg-background p-8 text-center shadow-2xl">
              <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-full border border-border">
                <Loader2 className="h-5 w-5 animate-spin" />
              </div>

              <h3 className="font-medium">
                Sending your enquiry
              </h3>

              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Please wait while we securely
                submit your event enquiry.
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}