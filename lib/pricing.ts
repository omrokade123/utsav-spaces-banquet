import {
  FOOD_PACKAGES,
  VENUE_PRICING,
} from "@/lib/booking-config";

import type {
  FoodPackageId,
  ShiftType,
} from "@/types/booking";

/* ============================================================
   INPUT
   ============================================================ */

export interface PricingInput {
  guestCount: number;
  selectedShift: ShiftType;
  selectedPackages: FoodPackageId[];
}

/* ============================================================
   PACKAGE BREAKDOWN
   ============================================================ */

export interface PricingPackageItem {
  id: FoodPackageId;
  title: string;
  unitPrice: number;
  quantity: number;
  total: number;
  unit: "plate" | "guest";
}

/* ============================================================
   PRICING RESULT
   ============================================================ */

export interface PricingBreakdown {
  packageItems: PricingPackageItem[];

  foodCost: number;

  venueCost: number;

  estimatedTotal: number;
}

/* ============================================================
   CALCULATE PRICING
   ============================================================ */

export function calculatePricing({
  guestCount,
  selectedShift,
  selectedPackages,
}: PricingInput): PricingBreakdown {
  const uniqueSelectedPackages = [
    ...new Set(selectedPackages),
  ];

  const packageItems = uniqueSelectedPackages
    .map((packageId) => {
      const foodPackage = FOOD_PACKAGES.find(
        (item) => item.id === packageId
      );

      if (!foodPackage) {
        return null;
      }

      const quantity = guestCount;

      const total =
        foodPackage.price * quantity;

      return {
        id: foodPackage.id,
        title: foodPackage.title,
        unitPrice: foodPackage.price,
        quantity,
        total,
        unit: foodPackage.unit,
      };
    })
    .filter(
      (
        item
      ): item is PricingPackageItem =>
        item !== null
    );

  const foodCost = packageItems.reduce(
    (total, item) => total + item.total,
    0
  );

  const venueCost =
    VENUE_PRICING[selectedShift];

  const estimatedTotal =
    foodCost + venueCost;

  return {
    packageItems,
    foodCost,
    venueCost,
    estimatedTotal,
  };
}