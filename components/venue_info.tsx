"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  Car,
  Utensils,
  Users,
  Clock3,
  Building2,
  Sparkles,
  ArrowUpRight,
} from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const VENUE_FEATURES = [
  {
    icon: Users,
    value: "100–500",
    label: "Guest Capacity",
  },
  {
    icon: Clock3,
    value: "2 Shifts",
    label: "Flexible Timing",
  },
  {
    icon: Car,
    value: "On-site",
    label: "Parking",
  },
  {
    icon: Utensils,
    value: "In-house",
    label: "Catering",
  },
  {
    icon: Building2,
    value: "Indoor",
    label: "Premium Hall",
  },
  {
    icon: Sparkles,
    value: "Custom",
    label: "Event Setup",
  },
];

export default function VenuInfo() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;

    if (!section) return;

    const ctx = gsap.context(() => {
      const eyebrow = section.querySelector(".venue-eyebrow");
      const heading = section.querySelector(".venue-heading");
      const description = section.querySelector(".venue-description");
      const features = section.querySelectorAll(".venue-feature");
      const visual = section.querySelector(".venue-visual");
      const bottomText = section.querySelector(".venue-bottom");

      /* Initial states */

      gsap.set(
        [eyebrow, heading, description, bottomText],
        {
          opacity: 0,
          y: 45,
        }
      );

      gsap.set(features, {
        opacity: 0,
        y: 35,
      });

      gsap.set(visual, {
        opacity: 0,
        scale: 0.94,
        y: 40,
      });

      /* --------------------------------
         Main Section Animation
      -------------------------------- */

      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top 75%",
          once: true,
        },
      });

      timeline
        .to(eyebrow, {
          opacity: 1,
          y: 0,
          duration: 0.7,
          ease: "power3.out",
        })

        .to(
          heading,
          {
            opacity: 1,
            y: 0,
            duration: 0.9,
            ease: "power3.out",
          },
          "-=0.35"
        )

        .to(
          description,
          {
            opacity: 1,
            y: 0,
            duration: 0.7,
            ease: "power3.out",
          },
          "-=0.45"
        )

        .to(
          features,
          {
            opacity: 1,
            y: 0,
            duration: 0.65,
            stagger: 0.08,
            ease: "power3.out",
          },
          "-=0.25"
        )

        .to(
          visual,
          {
            opacity: 1,
            scale: 1,
            y: 0,
            duration: 1,
            ease: "power3.out",
          },
          "-=0.5"
        )

        .to(
          bottomText,
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: "power3.out",
          },
          "-=0.35"
        );
    }, section);

    return () => {
      ctx.revert();
    };
  }, []);

  return (
    <section
      id="venue"
      ref={sectionRef}
      className="relative overflow-hidden bg-[#f5f1e8] text-[#211e1a]"
    >
      {/* =================================
          MAIN CONTENT
      ================================= */}

      <div className="mx-auto max-w-7xl px-6 py-24 lg:px-10 lg:py-32">
        <div className="grid gap-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-24">
          {/* =================================
              LEFT CONTENT
          ================================= */}

          <div>
            <p className="venue-eyebrow mb-5 text-[10px] font-semibold uppercase tracking-[0.35em] text-[#a68a56] sm:text-xs">
              The Venue
            </p>

            <h2 className="venue-heading max-w-2xl font-serif text-4xl leading-[0.95] tracking-[-0.025em] sm:text-5xl lg:text-6xl">
              A space designed
              <br />
              <span className="text-[#8d7650]">for your moments.</span>
            </h2>

            <p className="venue-description mt-7 max-w-xl text-sm leading-7 text-[#211e1a]/65 sm:text-base">
              From intimate gatherings to grand celebrations, Utsav offers a
              thoughtfully designed setting where every detail can be shaped
              around your event.
            </p>

            {/* =================================
                FEATURES
            ================================= */}

            <div className="mt-10 grid grid-cols-2 border-t border-[#211e1a]/10 sm:grid-cols-3">
              {VENUE_FEATURES.map((feature) => {
                const Icon = feature.icon;

                return (
                  <div
                    key={feature.label}
                    className="venue-feature border-b border-r border-[#211e1a]/10 py-6 pr-5 first:border-l-0"
                  >
                    <Icon
                      size={19}
                      strokeWidth={1.4}
                      className="mb-4 text-[#a68a56]"
                    />

                    <p className="font-serif text-xl tracking-tight">
                      {feature.value}
                    </p>

                    <p className="mt-1 text-[10px] uppercase tracking-[0.16em] text-[#211e1a]/50">
                      {feature.label}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* =================================
              VISUAL PANEL
          ================================= */}

          <div className="venue-visual relative">
            <div className="relative aspect-[4/5] overflow-hidden bg-[#ded7c9] sm:aspect-[5/6]">
              <img
                src="/images/venue-main.png"
                alt="Elegant interior of Utsav Spaces and Banquets"
                className="h-full w-full object-cover"
              />

              {/* Image overlay */}

              <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />

              {/* Floating label */}

              <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between">
                <div>
                  <p className="text-[9px] uppercase tracking-[0.3em] text-white/60">
                    Utsav Spaces
                  </p>

                  <p className="mt-1 font-serif text-2xl text-white">
                    Made for celebrations.
                  </p>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/30 bg-black/10 text-white backdrop-blur-sm">
                  <ArrowUpRight size={17} strokeWidth={1.4} />
                </div>
              </div>
            </div>

            {/* Decorative frame */}

            <div className="pointer-events-none absolute -bottom-4 -right-4 -z-0 h-28 w-28 border-b border-r border-[#a68a56]/40" />
          </div>
        </div>

        {/* =================================
            BOTTOM STATEMENT
        ================================= */}

        <div className="venue-bottom mt-20 flex flex-col justify-between gap-6 border-t border-[#211e1a]/10 pt-7 sm:flex-row sm:items-center">
          <p className="max-w-xl font-serif text-xl leading-snug text-[#211e1a]/80 sm:text-2xl">
            “The setting should feel like part of the celebration.”
          </p>

          <p className="max-w-xs text-xs leading-5 text-[#211e1a]/45 sm:text-right">
            Flexible spaces, curated setups and event-focused hospitality
            designed around your occasion.
          </p>
        </div>
      </div>
    </section>
  );
}