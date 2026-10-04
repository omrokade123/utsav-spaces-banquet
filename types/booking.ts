export type EventType =
  | "wedding"
  | "corporate"
  | "private";

export type ShiftType =
  | "morning"
  | "evening";

export type FoodPackageId =
  | "veg-premium"
  | "live-counters"
  | "dessert-station"
  | "premium-beverages";

export interface CustomerDetails {
  name: string;
  email: string;
  phone: string;
  message: string;
}

export interface BookingSelection {
  eventType: EventType;
  selectedDate: string;
  selectedShift: ShiftType;
  guestCount: number;
  selectedPackages: FoodPackageId[];
}

export interface BookingRequest
  extends BookingSelection {
  customer: CustomerDetails;
}

export type BookingErrorCode =
  | "VALIDATION_ERROR"
  | "DATE_UNAVAILABLE"
  | "SHIFT_UNAVAILABLE"
  | "BOOKING_EXISTS"
  | "SERVER_ERROR";

export interface BookingResponse {
  success: boolean;
  bookingId?: string;
  estimatedTotal?: number;
  message: string;
  errorCode?: BookingErrorCode;
}

export interface AvailabilityRequest {
  date: string;
  shift: ShiftType;
}

export interface AvailabilityResponse {
  available: boolean;
  date: string;
  shift: ShiftType;
  message?: string;
}