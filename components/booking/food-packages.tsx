"use client";

import {
  Check,
} from "lucide-react";

import { FOOD_PACKAGES } from "@/lib/booking-config";

import type {
  FoodPackageId,
} from "@/types/booking";

interface FoodPackagesProps {
  selectedPackages: FoodPackageId[];

  onChange: (
    packages: FoodPackageId[]
  ) => void;
}

export default function FoodPackages({
  selectedPackages,
  onChange,
}: FoodPackagesProps) {
  const togglePackage = (
    packageId: FoodPackageId
  ) => {
    const isSelected =
      selectedPackages.includes(packageId);

    if (isSelected) {
      onChange(
        selectedPackages.filter(
          (id) => id !== packageId
        )
      );

      return;
    }

    onChange([
      ...selectedPackages,
      packageId,
    ]);
  };

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {FOOD_PACKAGES.map((foodPackage) => {
        const Icon = foodPackage.icon;

        const selected =
          selectedPackages.includes(
            foodPackage.id
          );

        return (
          <button
            key={foodPackage.id}
            type="button"
            onClick={() =>
              togglePackage(
                foodPackage.id
              )
            }
            aria-pressed={selected}
            className={[
              "group relative rounded-lg border p-5 text-left transition-colors duration-300",
              selected
                ? "border-[#183d34] bg-[#183d34] text-white"
                : "border-[#ded7c9] bg-white text-[#211e1a] hover:border-[#a68a56] hover:bg-[#fbf8f1]",
            ].join(" ")}
          >
            {/* Selection indicator */}
            <div
              className={[
                "absolute right-5 top-5 flex h-6 w-6 items-center justify-center rounded-full border transition-all",
                selected
                  ? "border-[#e3c48c] bg-[#e3c48c] text-[#183d34]"
                  : "border-[#d8d0c1] bg-white text-transparent",
              ].join(" ")}
            >
              <Check className="h-3.5 w-3.5" />
            </div>

            {/* Icon */}
            <div
              className={[
                "mb-7 flex h-11 w-11 items-center justify-center rounded-full border transition-colors",
                selected
                  ? "border-white/20 bg-white/10 text-[#e3c48c]"
                  : "border-[#e6dfd1] bg-[#f5f1e8] text-[#a68a56]",
              ].join(" ")}
            >
              <Icon className="h-5 w-5" />
            </div>

            {/* Content */}
            <h3 className="pr-8 font-medium">
              {foodPackage.title}
            </h3>

            <p
              className={[
                "mt-2 min-h-12 text-sm leading-6",
                selected
                  ? "text-white/75"
                  : "text-[#211e1a]/65",
              ].join(" ")}
            >
              {foodPackage.description}
            </p>

            {/* Price */}
            <div className="mt-6 flex items-baseline gap-1">
              <span className="text-lg font-medium">
                ₹
                {foodPackage.price.toLocaleString(
                  "en-IN"
                )}
              </span>

              <span
                className={[
                  "text-xs",
                  selected
                    ? "text-white/70"
                    : "text-[#211e1a]/55",
                ].join(" ")}
              >
                / {foodPackage.unit}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}