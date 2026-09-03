"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useReducedMotion } from "framer-motion";

// Inline icons — zero external icon dependency for this component.
const ChevronLeftIcon = () => (
  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
  </svg>
);
const ChevronRightIcon = () => (
  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
  </svg>
);
const ArrowRightIcon = () => (
  <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
  </svg>
);

export interface CarouselItem {
  tag?: string;
  titleLine1: string;
  titleLine2?: string;
  desc?: string;
  /** Short line shown below the description — e.g. a formatted price. */
  meta?: string;
  img: string;
  ctaText?: string;
  ctaUrl?: string;
}

export interface CoverFlowCarouselProps {
  items: CarouselItem[];
  sectionLabel?: string;
  autoplay?: boolean;
  autoplayDelay?: number;
  className?: string;
  onCtaClick?: (item: CarouselItem) => void;
}

// Brand palette (matches the site's navy/gold theme).
const NAVY_BG = "#0a0e1a";
const GOLD = "#e8c158";
const GOLD_DEEP = "#b8860b";

export function CoverFlowCarousel({
  items,
  sectionLabel = "FEATURED LISTINGS",
  autoplay = true,
  autoplayDelay = 5000,
  className = "",
  onCtaClick,
}: CoverFlowCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const touchStartX = useRef(0);
  const total = items.length;
  const reduceMotion = useReducedMotion();

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % total);
  }, [total]);
  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  }, [total]);
  const goToSlide = (idx: number) => {
    setCurrentIndex(idx % total);
  };

  useEffect(() => {
    if (!autoplay || isHovered || reduceMotion || total <= 1) return;
    const interval = setInterval(nextSlide, autoplayDelay);
    return () => clearInterval(interval);
  }, [autoplay, autoplayDelay, isHovered, nextSlide, total, reduceMotion]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prevSlide();
      if (e.key === "ArrowRight") nextSlide();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [nextSlide, prevSlide]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(diff) > 45) {
      if (diff < 0) nextSlide();
      else prevSlide();
    }
  };

  if (!items || items.length === 0) return null;

  const transitionMs = reduceMotion ? 0 : 800;

  return (
    <section
      className={`relative w-full min-h-[720px] flex items-center justify-center overflow-hidden py-12 select-none ${className}`}
      style={{ backgroundColor: NAVY_BG, color: "#ffffff", fontFamily: "inherit" }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Background ambience */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <img
          src={items[currentIndex]?.img}
          alt=""
          aria-hidden
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            filter: "brightness(0.22) blur(32px)",
            transform: "scale(1.15)",
            transition: reduceMotion ? "none" : "opacity 1000ms ease, filter 1000ms ease",
          }}
        />
        <div
          className="absolute inset-0"
          style={{ background: `radial-gradient(circle at center, rgba(5,11,22,0.35) 0%, rgba(5,11,22,0.94) 100%)` }}
        />
      </div>

      <div className="relative w-full max-w-6xl mx-auto px-4 z-10 flex flex-col items-center">
        {sectionLabel && (
          <div className="flex items-center gap-3 mb-8">
            <span style={{ width: "36px", height: "1px", background: `linear-gradient(90deg, transparent, ${GOLD})` }} />
            <h3
              style={{
                fontSize: "0.75rem",
                fontWeight: 700,
                letterSpacing: "0.3em",
                textTransform: "uppercase",
                color: GOLD,
                margin: 0,
              }}
            >
              {sectionLabel}
            </h3>
            <span style={{ width: "36px", height: "1px", background: `linear-gradient(90deg, ${GOLD}, transparent)` }} />
          </div>
        )}

        <div className="relative w-full h-[500px] flex justify-center items-center mb-8" style={{ perspective: "1400px" }}>
          {items.map((item, idx) => {
            const offset = (idx - currentIndex + total) % total;
            let transform = "translateX(0px) scale(0.4) rotateY(0deg)";
            let opacity = 0;
            let zIndex = 0;
            let filter = "brightness(0.4) blur(2px)";
            let isCenter = false;

            if (offset === 0) {
              isCenter = true;
              transform = "translateX(0px) scale(1) rotateY(0deg)";
              opacity = 1;
              zIndex = 30;
              filter = "brightness(1)";
            } else if (offset === 1) {
              transform = "translateX(275px) scale(0.84) rotateY(-24deg)";
              opacity = 0.65;
              zIndex = 20;
              filter = "brightness(0.75)";
            } else if (offset === 2) {
              transform = "translateX(490px) scale(0.68) rotateY(-38deg)";
              opacity = 0.38;
              zIndex = 10;
              filter = "brightness(0.55) blur(1px)";
            } else if (offset === total - 1) {
              transform = "translateX(-275px) scale(0.84) rotateY(24deg)";
              opacity = 0.65;
              zIndex = 20;
              filter = "brightness(0.75)";
            } else if (offset === total - 2) {
              transform = "translateX(-490px) scale(0.68) rotateY(38deg)";
              opacity = 0.38;
              zIndex = 10;
              filter = "brightness(0.55) blur(1px)";
            }

            return (
              <div
                key={idx}
                onClick={() => !isCenter && goToSlide(idx)}
                style={{
                  position: "absolute",
                  width: "310px",
                  height: "480px",
                  borderRadius: "18px",
                  overflow: "hidden",
                  backgroundColor: "#0b1226",
                  border: "1px solid rgba(255, 255, 255, 0.12)",
                  transform,
                  opacity,
                  zIndex,
                  filter,
                  transformOrigin: "center center",
                  transition: `all ${transitionMs}ms cubic-bezier(0.25, 1, 0.5, 1)`,
                  boxShadow: isCenter
                    ? `0 25px 60px rgba(0,0,0,0.9), 0 0 35px rgba(217,179,79,0.22)`
                    : "0 15px 35px rgba(0,0,0,0.5)",
                  cursor: isCenter ? "default" : "pointer",
                }}
              >
                <img src={item.img} alt={item.titleLine1} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background:
                      "linear-gradient(180deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.1) 25%, rgba(0,0,0,0.68) 60%, rgba(0,0,0,0.96) 100%)",
                    pointerEvents: "none",
                    zIndex: 10,
                  }}
                />
                <div
                  style={{
                    position: "relative",
                    width: "100%",
                    height: "100%",
                    padding: "20px 18px 22px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    textAlign: "center",
                    zIndex: 20,
                    opacity: isCenter ? 1 : 0,
                    transform: isCenter ? "translateY(0px)" : "translateY(16px)",
                    transition: reduceMotion ? "none" : "opacity 500ms ease, transform 500ms ease",
                    pointerEvents: isCenter ? "auto" : "none",
                  }}
                >
                  <div style={{ textAlign: "right", width: "100%", paddingRight: "4px" }}>
                    <span style={{ fontSize: "0.78rem", fontWeight: 600, letterSpacing: "0.06em", color: "rgba(255,255,255,0.9)", textShadow: "0 2px 6px rgba(0,0,0,0.8)" }}>
                      {item.tag}
                    </span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "3px", marginTop: "auto", paddingBottom: "4px" }}>
                    <h2
                      style={{
                        fontSize: "1.5rem",
                        fontWeight: 900,
                        textTransform: "uppercase",
                        letterSpacing: "0.03em",
                        color: "#ffffff",
                        margin: 0,
                        lineHeight: 1.15,
                        textShadow: "0 3px 12px rgba(0,0,0,0.95)",
                      }}
                    >
                      {item.titleLine1}
                    </h2>
                    {item.titleLine2 && (
                      <span style={{ fontSize: "1rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "#f3f0ea", lineHeight: 1.2, textShadow: "0 3px 10px rgba(0,0,0,0.9)" }}>
                        {item.titleLine2}
                      </span>
                    )}
                    <div style={{ width: "34px", height: "2px", backgroundColor: GOLD, borderRadius: "2px", margin: "6px auto 5px", boxShadow: `0 0 8px rgba(217,179,79,0.7)` }} />
                    {item.meta && (
                      <p style={{ fontSize: "1.05rem", fontWeight: 700, color: GOLD, margin: "0 0 4px", textShadow: "0 2px 8px rgba(0,0,0,0.9)" }}>{item.meta}</p>
                    )}
                    {item.desc && (
                      <p style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.85)", maxWidth: "260px", margin: "0 0 10px", lineHeight: 1.35, textShadow: "0 2px 8px rgba(0,0,0,0.9)" }}>
                        {item.desc}
                      </p>
                    )}
                    <a
                      href={item.ctaUrl || "#"}
                      onClick={(e) => {
                        if (onCtaClick) {
                          e.preventDefault();
                          onCtaClick(item);
                        }
                      }}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        padding: "7px 18px",
                        borderRadius: "9999px",
                        background: `linear-gradient(135deg, ${GOLD} 0%, ${GOLD_DEEP} 100%)`,
                        color: "#0b0f16",
                        fontSize: "0.72rem",
                        fontWeight: 800,
                        letterSpacing: "0.14em",
                        textTransform: "uppercase",
                        textDecoration: "none",
                        boxShadow: "0 4px 14px rgba(0,0,0,0.4), 0 0 15px rgba(217,179,79,0.3)",
                        cursor: "pointer",
                      }}
                    >
                      <span>{item.ctaText || "View Details"}</span>
                      <ArrowRightIcon />
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <button
          onClick={prevSlide}
          aria-label="Previous"
          className="absolute left-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full text-white backdrop-blur transition-transform hover:scale-110 sm:left-6"
          style={{ backgroundColor: "rgba(0,0,0,0.55)", border: "1px solid rgba(255,255,255,0.2)", boxShadow: "0 8px 24px rgba(0,0,0,0.4)", zIndex: 40 }}
        >
          <ChevronLeftIcon />
        </button>
        <button
          onClick={nextSlide}
          aria-label="Next"
          className="absolute right-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full text-white backdrop-blur transition-transform hover:scale-110 sm:right-6"
          style={{ backgroundColor: "rgba(0,0,0,0.55)", border: "1px solid rgba(255,255,255,0.2)", boxShadow: "0 8px 24px rgba(0,0,0,0.4)", zIndex: 40 }}
        >
          <ChevronRightIcon />
        </button>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", zIndex: 30 }}>
          {items.map((_, idx) => (
            <button
              key={idx}
              onClick={() => goToSlide(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              style={{
                height: "8px",
                width: idx === currentIndex ? "28px" : "8px",
                borderRadius: "9999px",
                backgroundColor: idx === currentIndex ? GOLD : "rgba(255,255,255,0.25)",
                border: "none",
                cursor: "pointer",
                boxShadow: idx === currentIndex ? `0 0 10px rgba(217,179,79,0.7)` : "none",
                transition: "all 300ms ease",
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default CoverFlowCarousel;
