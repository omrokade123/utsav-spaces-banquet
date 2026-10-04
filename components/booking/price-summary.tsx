"use client";

import { Calculator, Check, Info } from "lucide-react";

import type { PricingBreakdown } from "@/lib/pricing";

interface PriceSummaryProps {
  pricing: PricingBreakdown;
}

function formatCurrency(value: number) {
  return `₹${value.toLocaleString("en-IN")}`;
}

export default function PriceSummary({
  pricing,
}: PriceSummaryProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-[#d8d0c1] bg-white text-[#211e1a]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#211e1a]/10 px-5 py-5 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#a68a56]/20 bg-[#f5f1e8]">
            <Calculator className="h-4 w-4 text-[#a68a56]" />
          </div>

          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-[#8d7650]">
              Pricing
            </p>

            <h3 className="mt-1 text-sm font-medium text-[#211e1a]">
              Estimated event cost
            </h3>
          </div>
        </div>

        <span className="rounded-full border border-[#a68a56]/25 bg-[#f5f1e8] px-3 py-1 text-[9px] font-medium uppercase tracking-[0.12em] text-[#8d7650]">
          Estimate
        </span>
      </div>

      {/* Package breakdown */}
      <div className="px-5 py-5 sm:px-6">
        <div className="space-y-4">
          {pricing.packageItems.map((item) => (
            <div
              key={item.id}
              className="flex items-start justify-between gap-4"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 shrink-0 text-[#a68a56]" />

                  <p className="text-xs font-medium text-[#211e1a]">
                    {item.title}
                  </p>
                </div>

                <p className="mt-1 pl-[22px] text-[10px] text-[#211e1a]/55">
                  {formatCurrency(item.unitPrice)} ×{" "}
                  {item.quantity}{" "}
                  {item.unit === "plate"
                    ? "plates"
                    : "guests"}
                </p>
              </div>

              <span className="shrink-0 text-xs font-medium text-[#211e1a]">
                {formatCurrency(item.total)}
              </span>
            </div>
          ))}
        </div>

        {/* Divider */}
        {pricing.packageItems.length === 0 && (
          <p className="text-xs leading-5 text-[#211e1a]/55">
            No food or beverage packages selected.
          </p>
        )}

        <div className="my-5 border-t border-[#211e1a]/10" />

        {/* Food cost */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-[#211e1a]/60">
            Food & beverage
          </span>

          <span className="text-sm font-medium text-[#211e1a]">
            {formatCurrency(pricing.foodCost)}
          </span>
        </div>

        {/* Venue */}
        <div className="mt-4 flex items-center justify-between">
          <span className="text-xs text-[#211e1a]/60">
            Venue & shift
          </span>

          <span className="text-sm font-medium text-[#211e1a]">
            {formatCurrency(pricing.venueCost)}
          </span>
        </div>
      </div>

      {/* Total */}
      <div className="border-t border-[#d8d0c1] bg-[#f5f1e8] px-5 py-5 sm:px-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-[9px] font-medium uppercase tracking-[0.16em] text-[#8d7650]">
              Estimated total
            </p>

            <p className="mt-2 text-2xl font-medium tracking-tight text-[#183d34] sm:text-3xl">
              {formatCurrency(pricing.estimatedTotal)}
            </p>
          </div>

          <span className="pb-1 text-[9px] font-medium uppercase tracking-[0.12em] text-[#8d7650]">
            INR
          </span>
        </div>

        {/* Disclaimer */}
        <div className="mt-5 flex gap-2 rounded-lg border border-[#d8d0c1] bg-white/70 p-3">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#8d7650]" />

          <p className="text-[10px] leading-5 text-[#211e1a]/65">
            This is an estimated price based on your current
            selections. The final quotation may vary based on
            event requirements and confirmed arrangements.
          </p>
        </div>
      </div>
    </div>
  );
}