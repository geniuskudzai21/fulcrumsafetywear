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
      <div className="mx-auto grid max-w-7xl items-center gap-2 px-4 py-3 sm:gap-4 sm:px-6 sm:py-5 md:min-h-[430px] md:grid-cols-[1fr_0.88fr] md:gap-8 md:py-7 lg:min-h-[465px] lg:gap-10 lg:px-8">
        <div className="relative z-10 py-2 md:py-3">
          <div className="flex items-center gap-3 text-xs font-bold tracking-[0.2em] text-gold sm:text-sm">
            <span className="h-px w-8 bg-gold" />
            {slide.eyebrow}
          </div>
          <h1
            key={slide.title}
            className="hero-copy d mt-3 max-w-2xl text-3xl leading-[1.02] sm:mt-4 sm:text-5xl lg:text-[3.4rem] xl:text-6xl"
            aria-live="polite"
          >
            {slide.title}
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-white/70 sm:mt-4 sm:text-lg sm:leading-7">
            {slide.description}
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-2 sm:mt-6 sm:gap-3">
            <Link
              href="#shop"
              className="group inline-flex min-h-10 items-center gap-2 rounded-lg bg-gold px-4 py-2.5 text-sm font-bold text-ink shadow-lg shadow-gold/10 transition hover:-translate-y-0.5 hover:bg-[#ffd84f] focus-visible:outline-white sm:min-h-12 sm:gap-3 sm:px-6 sm:py-3 sm:text-base"
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
              className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-white/20 px-4 py-2.5 text-sm font-semibold text-white/90 transition hover:border-white/50 hover:bg-white/5 sm:min-h-12 sm:px-5 sm:py-3 sm:text-base"
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

          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-white/10 pt-3 text-[11px] font-medium text-white/60 sm:mt-6 sm:gap-x-6 sm:gap-y-3 sm:pt-4 sm:text-sm">
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

        <div className="relative mx-auto w-full max-w-[440px] md:ml-auto">
          <div className="hero-card-shadow pointer-events-none absolute inset-x-7 inset-y-4 rotate-[-8deg] rounded-[1.65rem] bg-white/10" />
          <div className="hero-card-shadow hero-card-shadow-back pointer-events-none absolute inset-x-4 inset-y-2 rotate-[6deg] rounded-[1.65rem] bg-gold/80" />
          <div
            className="hero-image-frame relative aspect-[1.7] overflow-hidden rounded-[1.35rem] border border-white/15 bg-[radial-gradient(ellipse_at_50%_45%,#fff_0%,#f1f2f4_70%)] shadow-2xl shadow-black/40 sm:aspect-[1.45] sm:rounded-[1.65rem] md:aspect-[1.08] lg:aspect-[1.12]"
            role="group"
            aria-label={`Featured item ${activeSlide + 1} of ${slides.length}`}
          >
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_55%_45%,rgba(252,196,25,0.2),transparent_60%)]" />
            <div
              key={`deck-${activeSlide}`}
              className="hero-product-deck absolute inset-0"
            >
              <div className="hero-feature-card absolute inset-[7%_12%_12%_7%] overflow-hidden rounded-2xl border border-white/90 bg-white/80 shadow-[0_22px_48px_rgba(20,21,26,0.18)] sm:inset-[7%_14%_12%_8%]">
                <Image
                  src={slide.image}
                  alt={slide.alt}
                  fill
                  priority={activeSlide === 0}
                  sizes="(max-width: 767px) 80vw, (max-width: 1279px) 42vw, 480px"
                  className="hero-product-image object-contain p-3 sm:p-5"
                />
              </div>
              {[1, 2].map((offset) => {
                const imageIndex = (activeSlide + offset) % slides.length;
                const item = slides[imageIndex];
                return (
                  <div
                    key={item.image}
                    className={`hero-orbit-card hero-orbit-card-${offset} absolute aspect-square w-[29%] overflow-hidden rounded-xl border-[3px] border-white bg-mist shadow-[0_14px_32px_rgba(0,0,0,0.22)] sm:rounded-2xl sm:border-4`}
                    aria-hidden="true"
                  >
                    <Image
                      src={item.image}
                      alt=""
                      fill
                      sizes="(max-width: 767px) 28vw, 140px"
                      className="object-contain p-1.5 mix-blend-multiply sm:p-2"
                    />
                    <span className="absolute inset-x-0 bottom-0 bg-ink/80 py-1 text-center text-[8px] font-bold uppercase tracking-wider text-white sm:text-[9px]">
                      {item.note}
                    </span>
                  </div>
                );
              })}
              <span className="hero-edition-stamp absolute right-[4%] top-[8%] grid h-12 w-12 place-items-center rounded-full border border-white/70 bg-gold text-center text-[8px] font-black uppercase leading-tight tracking-wide text-ink shadow-lg sm:h-14 sm:w-14 sm:text-[9px]">
                Site
                <br />
                tested
              </span>
            </div>
            <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between gap-3 rounded-xl border border-white/60 bg-white/90 px-2.5 py-1.5 text-coal shadow-lg backdrop-blur sm:bottom-4 sm:left-4 sm:right-4 sm:px-3 sm:py-2">
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

          <div className="relative z-10 mt-2 flex items-center justify-between gap-4 sm:mt-3">
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
