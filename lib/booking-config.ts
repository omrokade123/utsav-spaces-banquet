import {
  BriefcaseBusiness,
  ChefHat,
  GlassWater,
  Heart,
  IceCreamBowl,
  PartyPopper,
  Utensils,
  type LucideIcon,
} from "lucide-react";

import type {
  EventType,
  FoodPackageId,
  ShiftType,
} from "@/types/booking";

/* ============================================================
   EVENT TYPES
   ============================================================ */

export interface EventConfig {
  id: EventType;
  title: string;
  description: string;
  icon: LucideIcon;
}

export const EVENT_TYPES: EventConfig[] = [
  {
    id: "wedding",
    title: "Wedding",
    description: "Celebrate your special day",
    icon: Heart,
  },
  {
    id: "corporate",
    title: "Corporate",
    description: "Meetings, conferences & events",
    icon: BriefcaseBusiness,
  },
  {
    id: "private",
    title: "Private Party",
    description: "Birthdays & social celebrations",
    icon: PartyPopper,
  },
];

/* ============================================================
   SHIFTS
   ============================================================ */

export interface ShiftConfig {
  id: ShiftType;
  title: string;
  time: string;
  description: string;
}

export const SHIFTS: ShiftConfig[] = [
  {
    id: "morning",
    title: "Morning",
    time: "9:00 AM – 4:00 PM",
    description:
      "A full daytime celebration with natural light.",
  },
  {
    id: "evening",
    title: "Evening",
    time: "6:00 PM – 12:00 AM",
    description:
      "An elegant evening experience under warm ambient lighting.",
  },
];

/* ============================================================
   FOOD PACKAGES
   ============================================================ */

export interface FoodPackageConfig {
  id: FoodPackageId;
  title: string;
  description: string;
  price: number;
  unit: "plate" | "guest";
  icon: LucideIcon;
}

export const FOOD_PACKAGES: FoodPackageConfig[] = [
  {
    id: "veg-premium",
    title: "Veg Premium Menu",
    description:
      "A refined vegetarian menu curated for elegant celebrations.",
    price: 800,
    unit: "plate",
    icon: Utensils,
  },
  {
    id: "live-counters",
    title: "Live Counters",
    description:
      "Interactive live food stations for a more engaging dining experience.",
    price: 400,
    unit: "plate",
    icon: ChefHat,
  },
  {
    id: "dessert-station",
    title: "Dessert Station",
    description:
      "A dedicated selection of premium desserts and sweet creations.",
    price: 250,
    unit: "plate",
    icon: IceCreamBowl,
  },
  {
    id: "premium-beverages",
    title: "Premium Beverage Package",
    description:
      "A curated non-alcoholic beverage selection for your guests.",
    price: 300,
    unit: "guest",
    icon: GlassWater,
  },
];

/* ============================================================
   VENUE PRICING
   ============================================================ */

export const VENUE_PRICING: Record<
  ShiftType,
  number
> = {
  morning: 50000,
  evening: 65000,
};

/* ============================================================
   BOOKING LIMITS
   ============================================================ */

export const BOOKING_LIMITS = {
  minGuests: 100,
  maxGuests: 500,
  guestStep: 10,

  minAdvanceDays: 1,

  maxAdvanceDays: 365,
} as const;

/* ============================================================
   VENUE CONFIG
   ============================================================ */

export const VENUE_CONFIG = {
  name: "Utsav Spaces & Banquets",

  capacity: {
    minimum: 100,
    maximum: 500,
  },

  parking: true,

  catering: "in-house",

  venueTypes: ["indoor"] as const,

  contact: {
    phone: "",
    email: "",
  },
} as const;