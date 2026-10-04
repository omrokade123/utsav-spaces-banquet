"use client";

import { ArrowDownRight, ArrowRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

const HERO_IMAGES = [
  {
    src: "/images/hero-venue-1.png",
    alt: "Grand luxury banquet hall prepared for a celebration",
  },
  {
    src: "/images/hero-venue-2.png",
    alt: "Elegant wedding stage with floral decoration",
  },
  {
    src: "/images/hero-venue-3.png",
    alt: "Guests celebrating inside the banquet venue",
  },
  {
    src: "/images/hero-venue-4.png",
    alt: "Premium dining setup inside the banquet hall",
  },
  {
    src: "/images/hero-venue-5.png",
    alt: "Elegant intimate outdoor event space",
  },
];

const IMAGE_CHANGE_INTERVAL = 3000;

export default function Hero() {
  const heroRef = useRef<HTMLElement>(null);

  const imageRefs = useRef<(HTMLImageElement | null)[]>([]);

  const loaderRef = useRef<HTMLDivElement>(null);
  const loaderLogoRef = useRef<HTMLDivElement>(null);
  const loaderLineRef = useRef<HTMLDivElement>(null);

  const [activeImage, setActiveImage] = useState(0);

  /* --------------------------------
     Scroll Helpers
  -------------------------------- */

  const scrollToBooking = () => {
    document
      .getElementById("booking")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToVenue = () => {
    document
      .getElementById("venue")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  /* --------------------------------
     Initial Page Load Animation
  -------------------------------- */

  useEffect(() => {
    const hero = heroRef.current;

    if (!hero) return;

    const ctx = gsap.context(() => {
      const loader = loaderRef.current;
      const logo = loaderLogoRef.current;
      const line = loaderLineRef.current;

      const navigation = hero.querySelector(".hero-navigation");
      const eyebrow = hero.querySelector(".hero-eyebrow");
      const heading = hero.querySelector(".hero-heading");
      const description = hero.querySelector(".hero-description");
      const cta = hero.querySelector(".hero-cta");
      const indicator = hero.querySelector(".hero-indicator");
      const explore = hero.querySelector(".hero-explore");

      /* Initial hidden states */

      gsap.set(
        [
          navigation,
          eyebrow,
          heading,
          description,
          cta,
          indicator,
          explore,
        ],
        {
          opacity: 0,
          y: 25,
        }
      );

      gsap.set(imageRefs.current, {
        opacity: 0,
        scale: 1.08,
      });

      /* First image */

      gsap.set(imageRefs.current[0], {
        opacity: 1,
      });

      /* --------------------------------
         Loader Timeline
      -------------------------------- */

      const loaderTimeline = gsap.timeline();

      loaderTimeline
        /* Logo */
        .fromTo(
          logo,
          {
            opacity: 0,
            y: 20,
            letterSpacing: "0.15em",
          },
          {
            opacity: 1,
            y: 0,
            letterSpacing: "0.35em",
            duration: 0.8,
            ease: "power3.out",
          }
        )

        /* Loading Line */
        .fromTo(
          line,
          {
            scaleX: 0,
            transformOrigin: "left center",
          },
          {
            scaleX: 1,
            duration: 1.1,
            ease: "power2.inOut",
          },
          "-=0.2"
        )

        /* Loader Exit */
        .to(
          loader,
          {
            yPercent: -100,
            duration: 1,
            ease: "power4.inOut",
          },
          "+=0.15"
        )

        /* Hero Image */
        .to(
          imageRefs.current[0],
          {
            opacity: 1,
            scale: 1,
            duration: 1.5,
            ease: "power3.out",
          },
          "-=0.55"
        )

        /* Navigation */
        .to(
          navigation,
          {
            opacity: 1,
            y: 0,
            duration: 0.7,
            ease: "power3.out",
          },
          "-=1"
        )

        /* Eyebrow */
        .to(
          eyebrow,
          {
            opacity: 1,
            y: 0,
            duration: 0.65,
            ease: "power3.out",
          },
          "-=0.35"
        )

        /* Heading */
        .to(
          heading,
          {
            opacity: 1,
            y: 0,
            duration: 0.85,
            ease: "power3.out",
          },
          "-=0.35"
        )

        /* Description */
        .to(
          description,
          {
            opacity: 1,
            y: 0,
            duration: 0.65,
            ease: "power3.out",
          },
          "-=0.45"
        )

        /* CTA */
        .to(
          cta,
          {
            opacity: 1,
            y: 0,
            duration: 0.65,
            ease: "power3.out",
          },
          "-=0.35"
        )

        /* Indicators */
        .to(
          indicator,
          {
            opacity: 1,
            y: 0,
            duration: 0.5,
          },
          "-=0.2"
        )

        /* Explore */
        .to(
          explore,
          {
            opacity: 1,
            y: 0,
            duration: 0.5,
          },
          "-=0.25"
        );
    }, hero);

    return () => ctx.revert();
  }, []);

  /* --------------------------------
     Automatic Image Rotation
  -------------------------------- */

  useEffect(() => {
    const interval = window.setInterval(() => {
      setActiveImage((current) => {
        return (current + 1) % HERO_IMAGES.length;
      });
    }, IMAGE_CHANGE_INTERVAL);

    return () => {
      window.clearInterval(interval);
    };
  }, []);

  /* --------------------------------
     Image Transition Animation
  -------------------------------- */

  useEffect(() => {
    const currentImage = imageRefs.current[activeImage];

    if (!currentImage) return;

    const previousImages = imageRefs.current.filter(
      (_, index) => index !== activeImage
    );

    /* Hide previous images */

    gsap.to(previousImages, {
      opacity: 0,
      duration: 0.9,
      ease: "power2.inOut",
    });

    /* Show current image */

    gsap.fromTo(
      currentImage,
      {
        opacity: 0,
        scale: 1.055,
      },
      {
        opacity: 1,
        scale: 1,
        duration: 1.2,
        ease: "power2.inOut",
      }
    );
  }, [activeImage]);

  /* --------------------------------
     JSX
  -------------------------------- */

  return (
    <section
      ref={heroRef}
      className="relative min-h-[100svh] overflow-hidden bg-[#211e1a] text-[#f8f4ec]"
    >
      {/* =================================
          LOADING SCREEN
      ================================= */}

      <div
        ref={loaderRef}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-[#211e1a]"
      >
        <div className="flex flex-col items-center">
          {/* Logo */}

          <div
            ref={loaderLogoRef}
            className="font-serif text-3xl uppercase tracking-[0.3em] text-[#f8f4ec] sm:text-4xl"
          >
            Utsav
          </div>

          {/* Loading Line */}

          <div className="mt-5 h-px w-40 overflow-hidden bg-white/15">
            <div
              ref={loaderLineRef}
              className="h-full w-full origin-left bg-[#d6bd8a]"
            />
          </div>

          {/* Subtitle */}

          <p className="mt-4 text-[9px] uppercase tracking-[0.4em] text-white/45">
            Spaces & Banquets
          </p>
        </div>
      </div>

      {/* =================================
          BACKGROUND IMAGES
      ================================= */}

      <div className="absolute inset-0">
        {HERO_IMAGES.map((image, index) => (
          <img
            key={image.src}
            ref={(element) => {
              imageRefs.current[index] = element;
            }}
            src={image.src}
            alt={image.alt}
            className="absolute inset-0 h-full w-full object-cover object-center"
          />
        ))}

        {/* Overall Overlay */}

        <div className="absolute inset-0 bg-black/20" />

        {/* Bottom readability */}

        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-black/20" />

        {/* Left readability */}

        <div className="absolute inset-0 bg-gradient-to-r from-black/25 via-transparent to-transparent" />
      </div>

      {/* =================================
          NAVIGATION
      ================================= */}

      <nav className="hero-navigation relative z-20 mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-10 lg:py-7">
        {/* Logo */}

        <button
          onClick={() =>
            window.scrollTo({
              top: 0,
              behavior: "smooth",
            })
          }
          className="group flex items-baseline"
          aria-label="Back to top"
        >
          <span className="font-serif text-xl tracking-tight sm:text-2xl">
            Utsav
          </span>

          <span className="ml-2 text-[11px] font-medium uppercase tracking-[0.28em] text-[#d6bd8a]">
            Spaces
          </span>
        </button>

        {/* Desktop Navigation */}

        <div className="hidden items-center gap-8 md:flex">
          <button
            onClick={scrollToVenue}
            className="text-sm text-white/75 transition-colors hover:text-white"
          >
            The Venue
          </button>

          <button
            onClick={scrollToBooking}
            className="group flex items-center gap-2 text-sm text-white/90"
          >
            Plan Your Event

            <ArrowRight
              size={16}
              strokeWidth={1.5}
              className="transition-transform duration-300 group-hover:translate-x-1"
            />
          </button>
        </div>

        {/* Mobile CTA */}

        <button
          onClick={scrollToBooking}
          className="rounded-full border border-white/25 px-4 py-2 text-xs text-white/90 backdrop-blur-sm transition hover:bg-white/10 md:hidden"
        >
          Plan Event
        </button>
      </nav>

      {/* =================================
          HERO CONTENT
      ================================= */}

      <div className="relative z-10 mx-auto flex min-h-[calc(100svh-88px)] max-w-7xl items-end px-6 pb-20 lg:px-10 lg:pb-24">
        <div className="max-w-4xl">
          {/* Eyebrow */}

          <p className="hero-eyebrow mb-5 text-[10px] font-medium uppercase tracking-[0.38em] text-[#d6bd8a] sm:text-xs">
            Utsav Spaces & Banquets
          </p>

          {/* Heading */}

          <h1 className="hero-heading max-w-4xl font-serif text-[3.5rem] leading-[0.9] tracking-[-0.025em] sm:text-6xl md:text-7xl lg:text-7xl xl:text-8xl">
            Celebrations,
            <br />
            beautifully hosted.
          </h1>

          {/* Description */}

          <p className="hero-description mt-7 max-w-xl text-sm leading-6 text-white/75 sm:text-base sm:leading-7">
            An elegant setting for weddings, corporate gatherings and
            unforgettable private celebrations.
          </p>

          {/* CTA */}

          <div className="hero-cta mt-8">
            <button
              onClick={scrollToBooking}
              className="group inline-flex items-center gap-4 rounded-full bg-[#f8f4ec] px-6 py-3.5 text-sm font-medium text-[#211e1a] shadow-lg shadow-black/10 transition-all duration-300 hover:bg-[#ead7b0]"
            >
              <span>Plan Your Event</span>

              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#211e1a] text-[#f8f4ec] transition-transform duration-300 group-hover:translate-x-1">
                <ArrowRight size={14} strokeWidth={1.8} />
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* =================================
          IMAGE INDICATORS
      ================================= */}

      <div className="hero-indicator absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2">
        {HERO_IMAGES.map((image, index) => (
          <button
            key={image.src}
            onClick={() => setActiveImage(index)}
            aria-label={`Show venue image ${index + 1}`}
            className="group flex h-5 items-center"
          >
            <span
              className={`block h-[2px] rounded-full transition-all duration-500 ${
                index === activeImage
                  ? "w-10 bg-[#f8f4ec]"
                  : "w-4 bg-white/35 group-hover:bg-white/70"
              }`}
            />
          </button>
        ))}
      </div>

      {/* =================================
          EXPLORE VENUE
      ================================= */}

      <button
        onClick={scrollToVenue}
        className="hero-explore group absolute bottom-7 right-6 z-20 hidden items-center gap-3 sm:flex lg:right-10"
      >
        <span className="text-[10px] uppercase tracking-[0.3em] text-white/60 transition-colors group-hover:text-white/90">
          Explore the venue
        </span>

        <ArrowDownRight
          size={16}
          strokeWidth={1.4}
          className="text-white/65 transition-transform duration-300 group-hover:translate-x-1 group-hover:translate-y-1"
        />
      </button>

      {/* =================================
          BOTTOM BORDER
      ================================= */}

      <div className="absolute bottom-0 left-0 right-0 z-20 h-px bg-white/10" />
    </section>
  );
}