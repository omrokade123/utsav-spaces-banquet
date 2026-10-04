"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";

export function DashboardAnimation({
  children,
}: {
  children: React.ReactNode;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const node = containerRef.current;

    if (!node) {
      return;
    }

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) {
      return;
    }

    const headerNodes = node.querySelectorAll(".dashboard-header");
    const statNodes = node.querySelectorAll(".dashboard-stat-card");
    const panelNodes = node.querySelectorAll(".dashboard-panel");

    if (!headerNodes.length && !statNodes.length && !panelNodes.length) {
      return;
    }

    const ctx = gsap.context(() => {
      if (headerNodes.length) {
        gsap.fromTo(
          headerNodes,
          { autoAlpha: 0, y: 20 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.55,
            ease: "power2.out",
          }
        );
      }

      if (statNodes.length) {
        gsap.fromTo(
          statNodes,
          { autoAlpha: 0, y: 18 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.5,
            stagger: 0.08,
            ease: "power2.out",
            delay: 0.08,
          }
        );
      }

      if (panelNodes.length) {
        gsap.fromTo(
          panelNodes,
          { autoAlpha: 0, y: 18 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.6,
            stagger: 0.08,
            ease: "power2.out",
            delay: 0.12,
          }
        );
      }
    }, node);

    return () => ctx.revert();
  }, []);

  return <div ref={containerRef}>{children}</div>;
}
