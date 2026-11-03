"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { WHATSAPP_LINK } from "@/lib/site";

const slides = [
  {
    image: "/images/combo.jpeg",
    alt: "Hi-vis jacket and cargo trousers set",
    eyebrow: "READY FOR THE SHIFT",
    title: "Workwear that works as hard as you do.",
    description:
      "Dependable workwear for Zimbabwe's miners, builders and site crews. Find the right fit for every shift.",
    note: "Head-to-toe protection",
  },
  {
    image: "/images/jacket.jpeg",
    alt: "Reflective safety polos in a range of high-visibility colours",
    eyebrow: "BE SEEN. STAY SAFE.",
    title: "High visibility. All-day confidence.",
    description:
      "Stand out on site with practical reflective workwear made for demanding days and changing conditions.",
    note: "Hi-vis essentials",
  },
  {
    image: "/images/trousers.jpeg",
    alt: "Durable cargo work trousers with reflective ankle bands",
    eyebrow: "MADE TO MOVE",
    title: "Room to move. Tough enough to last.",
    description:
      "Find hardworking trousers and everyday essentials designed to keep up from clock-in to clock-out.",
    note: "Built for the long haul",
  },
];

export default function Hero() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const interval = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % slides.length);
    }, 6000);

    return () => window.clearInterval(interval);
  }, [paused]);

  const slide = slides[activeSlide];
  const previous = () =>
    setActiveSlide((current) => (current - 1 + slides.length) % slides.length);
  const next = () => setActiveSlide((current) => (current + 1) % slides.length);

  return (
    <section
      className="hero-surface relative isolate overflow-hidden bg-ink text-white"
      aria-label="Featured Fulcrum Safety Wear"
      aria-roledescription="carousel"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setPaused(false);
      }}
    >
      <div className="hero-glow pointer-events-none absolute -right-36 -top-48 -z-10 h-[34rem] w-[34rem] rounded-full bg-gold/15 blur-3xl" />
      <div className="mx-auto grid min-h-[540px] max-w-7xl items-center gap-8 px-4 py-10 sm:px-6 md:grid-cols-[1fr_0.95fr] md:gap-12 md:py-14 lg:min-h-[590px] lg:px-8">
        <div className="relative z-10 py-4">
          <div className="flex items-center gap-3 text-xs font-bold tracking-[0.2em] text-gold sm:text-sm">
            <span className="h-px w-8 bg-gold" />
            {slide.eyebrow}
          </div>
          <h1
            key={slide.title}
            className="hero-copy d mt-5 max-w-2xl text-4xl leading-[1.02] sm:text-5xl lg:text-6xl xl:text-7xl"
            aria-live="polite"
          >
            {slide.title}
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-white/70 sm:text-lg">
            {slide.description}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="#shop"
              className="group inline-flex min-h-12 items-center gap-3 rounded-lg bg-gold px-6 py-3 font-bold text-ink shadow-lg shadow-gold/10 transition hover:-translate-y-0.5 hover:bg-[#ffd84f] focus-visible:outline-white"
            >
              Shop workwear
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
                className="transition-transform group-hover:translate-x-1"
              >
                <path d="M5 12h14m-6-6 6 6-6 6" />
              </svg>
            </Link>
            <a
              id="waHero"
              href={WHATSAPP_LINK}
              className="inline-flex min-h-12 items-center gap-2 rounded-lg border border-white/20 px-5 py-3 font-semibold text-white/90 transition hover:border-white/50 hover:bg-white/5"
            >
              <svg
                width="19"
                height="19"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                aria-hidden="true"
              >
                <path d="M20 11.5a8.4 8.4 0 0 1-12.4 7.4L4 20l1.1-3.4A8.4 8.4 0 1 1 20 11.5Z" />
                <path d="M8.5 8.3c.4 2.8 2.2 4.6 5 5" />
              </svg>
              Talk to our team
            </a>
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-white/10 pt-5 text-xs font-medium text-white/60 sm:text-sm">
            <span className="inline-flex items-center gap-2">
              <svg
                width="17"
                height="17"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="text-gold"
                aria-hidden="true"
              >
                <path d="m12 3 8 3v5c0 5-3.4 8.2-8 10-4.6-1.8-8-5-8-10V6l8-3Z" />
                <path d="m9 12 2 2 4-4" />
              </svg>
              Gear for demanding work
            </span>
            <span className="inline-flex items-center gap-2">
              <svg
                width="17"
                height="17"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="text-gold"
                aria-hidden="true"
              >
                <path d="M3 7h11v10H3zM14 10h4l3 3v4h-7z" />
                <circle cx="7.5" cy="18" r="1.5" />
                <circle cx="17.5" cy="18" r="1.5" />
              </svg>
              Delivery across Zimbabwe
            </span>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-[500px] md:ml-auto">
          <div className="pointer-events-none absolute -inset-3 rotate-3 rounded-[2rem] bg-gold/90 transition-transform duration-700" />
          <div
            className="hero-image-frame relative aspect-[0.98] overflow-hidden rounded-[1.65rem] border border-white/15 bg-gradient-to-br from-white to-mist shadow-2xl shadow-black/40"
            role="group"
            aria-label={`Featured item ${activeSlide + 1} of ${slides.length}`}
          >
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_55%_45%,rgba(252,196,25,0.2),transparent_60%)]" />
            <Image
              key={slide.image}
              src={slide.image}
              alt={slide.alt}
              fill
              priority={activeSlide === 0}
              sizes="(max-width: 767px) 100vw, (max-width: 1279px) 45vw, 520px"
              className="hero-product-image object-contain p-8 sm:p-10"
            />
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between gap-3 rounded-xl border border-white/60 bg-white/90 px-4 py-3 text-coal shadow-lg backdrop-blur sm:bottom-5 sm:left-5 sm:right-5">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-coal/45">
                  Fulcrum field notes
                </p>
                <p className="mt-0.5 font-bold">{slide.note}</p>
              </div>
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gold text-ink">
                <svg
                  width="19"
                  height="19"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  aria-hidden="true"
                >
                  <path d="m12 3 2.4 5.2 5.6.7-4.1 3.9 1 5.6-4.9-2.8-4.9 2.8 1-5.6L4 8.9l5.6-.7L12 3Z" />
                </svg>
              </span>
            </div>
          </div>

          <div className="mt-5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2" aria-label="Choose featured slide">
              {slides.map((item, index) => (
                <button
                  key={item.eyebrow}
                  type="button"
                  onClick={() => setActiveSlide(index)}
                  aria-label={`Show slide ${index + 1}: ${item.eyebrow}`}
                  aria-current={activeSlide === index ? "true" : undefined}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    activeSlide === index
                      ? "w-8 bg-gold"
                      : "w-2 bg-white/35 hover:bg-white/70"
                  }`}
                />
              ))}
              <span className="ml-2 font-mono text-xs text-white/50">
                0{activeSlide + 1} <span className="text-white/25">/ 0{slides.length}</span>
              </span>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={previous}
                aria-label="Previous featured item"
                className="grid h-10 w-10 place-items-center rounded-full border border-white/20 text-white transition hover:border-gold hover:bg-gold hover:text-ink"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden="true"
                >
                  <path d="m15 18-6-6 6-6" />
                </svg>
              </button>
              <button
                type="button"
                onClick={next}
                aria-label="Next featured item"
                className="grid h-10 w-10 place-items-center rounded-full border border-white/20 text-white transition hover:border-gold hover:bg-gold hover:text-ink"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden="true"
                >
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
