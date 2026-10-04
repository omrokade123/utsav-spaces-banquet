import Hero from "@/components/hero";
import VenuInfo from "@/components/venue_info";
import BookingExperience from "@/components/booking/booking-experience";

export default function Home() {
  return (
    <main>
      <Hero />

      <VenuInfo />

      <BookingExperience />
    </main>
  );
}