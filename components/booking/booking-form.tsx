"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Loader2,
  Mail,
  MessageSquare,
  Phone,
  User,
} from "lucide-react";

import type { FoodPackageId } from "@/types/booking";
import type { PricingBreakdown } from "@/lib/pricing";

type SubmissionStatus =
  | "idle"
  | "checking"
  | "submitting"
  | "success"
  | "error";

interface CustomerDetails {
  name: string;
  email: string;
  phone: string;
  message: string;
}

interface BookingFormProps {
  eventType: string;
  selectedDate: string;
  selectedShift: string;
  guestCount: number;
  selectedPackages: FoodPackageId[];
  pricing: PricingBreakdown;
  customer: CustomerDetails;
  onCustomerChange: (
    field: keyof CustomerDetails,
    value: string
  ) => void;
  onBack: () => void;
  onSubmit: () => void;
  submissionStatus: SubmissionStatus;
  errorMessage: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
}

export default function BookingForm({
  eventType,
  selectedDate,
  selectedShift,
  guestCount,
  pricing,
  customer,
  onCustomerChange,
  onBack,
  onSubmit,
  submissionStatus,
  errorMessage,
}: BookingFormProps) {
  const [errors, setErrors] = useState<FormErrors>({});
  const formRef = useRef<HTMLDivElement>(null);
  const isSubmitting =
    submissionStatus === "checking" ||
    submissionStatus === "submitting";

  useEffect(() => {
    const root = formRef.current;

    if (!root) {
      return;
    }

    const context = gsap.context(() => {
      const elements = root.querySelectorAll(
        "[data-booking-reveal]"
      );
      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

      if (reduceMotion) {
        gsap.set(elements, { opacity: 1, y: 0 });
        return;
      }

      gsap.fromTo(
        elements,
        { opacity: 0, y: 18 },
        {
          opacity: 1,
          y: 0,
          duration: 0.65,
          stagger: 0.08,
          ease: "power3.out",
        }
      );
    }, root);

    return () => context.revert();
  }, []);

  const validateForm = (): boolean => {
    const nextErrors: FormErrors = {};

    if (!customer.name.trim()) {
      nextErrors.name = "Please enter your name.";
    } else if (customer.name.trim().length < 2) {
      nextErrors.name = "Please enter a valid name.";
    }

    if (!customer.email.trim()) {
      nextErrors.email = "Please enter your email.";
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email.trim())
    ) {
      nextErrors.email = "Please enter a valid email.";
    }

    const cleanPhone = customer.phone.replace(/\D/g, "");

    if (!cleanPhone) {
      nextErrors.phone = "Please enter your phone number.";
    } else if (cleanPhone.length !== 10) {
      nextErrors.phone = "Please enter a valid 10-digit phone number.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = () => {
    if (isSubmitting || !validateForm()) {
      return;
    }

    onSubmit();
  };

  const handleChange = (
    field: keyof CustomerDetails,
    value: string
  ) => {
    const nextValue =
      field === "phone"
        ? value.replace(/\D/g, "").slice(0, 10)
        : value;

    onCustomerChange(field, nextValue);

    if (errors[field as keyof FormErrors]) {
      setErrors((current) => ({
        ...current,
        [field]: undefined,
      }));
    }
  };

  return (
    <div ref={formRef} className="text-[#183d34]">
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-14">
        <div className="min-w-0">
          <div className="mb-8" data-booking-reveal>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#537c68]">
              Contact details
            </p>
            <h3 className="mt-2 max-w-xl font-serif text-2xl font-medium text-[#183d34] sm:text-3xl">
              Who should we get in touch with?
            </h3>
            <p className="mt-3 max-w-lg text-sm leading-6 text-[#53675d]">
              Leave your details and our events team will help shape
              the next steps for your celebration.
            </p>
          </div>

          <div className="space-y-6">
            <div data-booking-reveal>
              <Field
                label="Full name"
                icon={<User className="h-4 w-4" />}
                error={errors.name}
              >
                <input
                  type="text"
                  value={customer.name}
                  onChange={(event) =>
                    handleChange("name", event.target.value)
                  }
                  placeholder="Enter your full name"
                  autoComplete="name"
                  disabled={isSubmitting}
                  className={inputClass(!!errors.name)}
                />
              </Field>
            </div>

            <div
              className="grid gap-6 sm:grid-cols-2"
              data-booking-reveal
            >
              <Field
                label="Email address"
                icon={<Mail className="h-4 w-4" />}
                error={errors.email}
              >
                <input
                  type="email"
                  value={customer.email}
                  onChange={(event) =>
                    handleChange("email", event.target.value)
                  }
                  placeholder="you@example.com"
                  autoComplete="email"
                  disabled={isSubmitting}
                  className={inputClass(!!errors.email)}
                />
              </Field>

              <Field
                label="Phone number"
                icon={<Phone className="h-4 w-4" />}
                error={errors.phone}
              >
                <div className="flex">
                  <span className="flex items-center rounded-l-lg border border-r-0 border-[#d8e2da] bg-[#e9f0e9] px-3 text-xs font-medium text-[#537c68]">
                    +91
                  </span>
                  <input
                    type="tel"
                    inputMode="numeric"
                    value={customer.phone}
                    onChange={(event) =>
                      handleChange("phone", event.target.value)
                    }
                    placeholder="10-digit number"
                    autoComplete="tel"
                    disabled={isSubmitting}
                    className={`${inputClass(!!errors.phone)} rounded-l-none`}
                  />
                </div>
              </Field>
            </div>

            <div data-booking-reveal>
              <Field
                label="Special requirements"
                icon={<MessageSquare className="h-4 w-4" />}
                optional
              >
                <textarea
                  value={customer.message}
                  onChange={(event) =>
                    handleChange("message", event.target.value)
                  }
                  placeholder="Tell us about setup preferences, dietary needs or anything else we should know."
                  rows={4}
                  disabled={isSubmitting}
                  className={`${inputClass(false)} resize-y`}
                />
              </Field>
            </div>
          </div>

          {submissionStatus === "error" && (
            <div
              className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3"
              role="alert"
            >
              <p className="text-xs leading-5 text-red-800">
                {errorMessage ||
                  "Something went wrong. Please try again."}
              </p>
            </div>
          )}

          <div
            className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-[#d8e2da] pt-6"
            data-booking-reveal
          >
            <button
              type="button"
              onClick={onBack}
              disabled={isSubmitting}
              className="group inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.12em] text-[#53675d] transition hover:text-[#183d34] disabled:opacity-40"
            >
              <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" />
              Back
            </button>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="group inline-flex min-h-12 min-w-47.5 items-center justify-center gap-3 rounded-lg bg-[#c56a4a] px-6 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-white transition-colors hover:bg-[#a95135] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Sending enquiry
                </>
              ) : (
                <>
                  Send enquiry
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </>
              )}
            </button>
          </div>

          <p className="mt-4 text-center text-[10px] leading-5 text-[#718077]">
            Your enquiry does not confirm a booking. Final availability
            and quotation will be confirmed separately.
          </p>
        </div>

        <aside
          data-booking-reveal
          className="h-fit rounded-2xl bg-[#183d34] p-5 text-white sm:p-6 lg:sticky lg:top-8"
        >
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#b7d1bd]">
              Event summary
            </p>
            <CheckCircle2 className="h-4 w-4 text-[#e3a982]" />
          </div>

          <div className="mt-6 space-y-5">
            <SummaryRow label="Event" value={eventType} />
            <SummaryRow label="Date" value={selectedDate || "—"} />
            <SummaryRow label="Shift" value={selectedShift || "—"} />
            <SummaryRow label="Guests" value={`${guestCount} guests`} />
          </div>

          <div className="my-6 h-px bg-white/15" />

          <div>
            <p className="text-[9px] font-medium uppercase tracking-[0.18em] text-[#b7d1bd]/75">
              Selected packages
            </p>
            <div className="mt-3 space-y-3">
              {pricing.packageItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start justify-between gap-4"
                >
                  <p className="text-xs leading-5 text-white/75">
                    {item.title}
                  </p>
                  <p className="shrink-0 text-xs text-[#e3a982]">
                    ₹{item.total.toLocaleString("en-IN")}
                  </p>
                </div>
              ))}
              {pricing.packageItems.length === 0 && (
                <p className="text-xs leading-5 text-white/55">
                  No food or beverage add-ons selected.
                </p>
              )}
            </div>
          </div>

          <div className="my-6 h-px bg-white/15" />

          <div>
            <p className="text-[9px] font-medium uppercase tracking-[0.18em] text-[#b7d1bd]/75">
              Estimated total
            </p>
            <p className="mt-2 text-3xl font-medium tracking-tight text-white">
              ₹{pricing.estimatedTotal.toLocaleString("en-IN")}
            </p>
            <p className="mt-2 text-[10px] leading-5 text-white/60">
              Indicative estimate only. Final quotation may vary based
              on your requirements.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}

interface FieldProps {
  label: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  error?: string;
  optional?: boolean;
}

function Field({ label, icon, children, error, optional }: FieldProps) {
  return (
    <div>
      <label className="block">
        <span className="mb-2 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#42574b]">
          <span className="text-[#537c68]">{icon}</span>
          {label}
          {optional && (
            <span className="font-normal normal-case tracking-normal text-[#718077]">
              (optional)
            </span>
          )}
        </span>
        {children}
      </label>
      {error && (
        <p className="mt-1.5 text-[10px] text-red-700" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

function inputClass(hasError: boolean) {
  return `w-full rounded-lg border bg-white px-4 py-3 text-sm text-[#183d34] outline-none placeholder:text-[#829188] transition-shadow ${
    hasError
      ? "border-red-400 focus:ring-2 focus:ring-red-100"
      : "border-[#d8e2da] focus:border-[#537c68] focus:ring-2 focus:ring-[#dce9df]"
  } disabled:cursor-not-allowed disabled:bg-[#edf1ed] disabled:opacity-70`;
}

interface SummaryRowProps {
  label: string;
  value: string;
}

function SummaryRow({ label, value }: SummaryRowProps) {
  return (
    <div className="flex items-start justify-between gap-4">
      <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-[#b7d1bd]/70">
        {label}
      </p>
      <p className="max-w-[65%] text-right text-xs font-medium text-white/90">
        {value}
      </p>
    </div>
  );
}