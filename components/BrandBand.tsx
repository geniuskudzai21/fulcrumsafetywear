import Image from "next/image";
import fulcrumLogo from "@/images/logo.png";
import { WHATSAPP_LINK } from "@/lib/site";

export default function BrandBand() {
  return (
    <section className="relative isolate overflow-hidden bg-coal text-white">
      <div className="pointer-events-none absolute -left-40 -top-40 -z-10 h-96 w-96 rounded-full bg-gold/10 blur-3xl" />
      <div className="mx-auto grid max-w-7xl 2xl:max-w-[90rem] items-center gap-10 px-4 py-14 sm:px-6 md:grid-cols-2 md:py-20 lg:px-8">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-gold">
            <span className="h-1.5 w-1.5 rounded-full bg-gold" />
            For the people who do the work
          </p>
          <h2 className="d mt-5 text-3xl sm:text-4xl">
            Engineered beyond strength.
          </h2>
          <p className="mt-4 max-w-lg leading-7 text-white/65">
            Fulcrum Wear supplies industrial workwear and PPE to miners,
            builders and site crews. Need branded uniforms for a team? Message
            us for a quote.
          </p>
          <div className="mt-6 grid max-w-lg gap-3 sm:grid-cols-2">
            <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] p-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-gold/15 text-gold">
                <svg
                  width="19"
                  height="19"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  aria-hidden="true"
                >
                  <path d="M3 7h11v10H3zM14 10h4l3 3v4h-7z" />
                  <circle cx="7.5" cy="18" r="1.5" />
                  <circle cx="17.5" cy="18" r="1.5" />
                </svg>
              </span>
              <span className="text-sm font-semibold">Nationwide delivery</span>
            </div>
            <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] p-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-gold/15 text-gold">
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
              </span>
              <span className="text-sm font-semibold">Personal team quotes</span>
            </div>
          </div>
          <a
            id="waBand"
            href={WHATSAPP_LINK}
            className="group mt-7 inline-flex min-h-12 items-center gap-3 rounded-lg bg-gold px-6 py-3 font-bold text-ink transition hover:-translate-y-0.5 hover:bg-[#ffd84f]"
          >
            Ask us for a team quote
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
          </a>
        </div>
        <div className="brand-collage relative mx-auto w-full max-w-sm">
          <div className="brand-card relative z-10 aspect-[4/3] overflow-hidden rounded-2xl border border-white/15 bg-[#0a0b0e] shadow-xl shadow-black/40">
            <Image
              src="/images/logobanner.jpeg"
              alt="Fulcrum Safety Wear industrial workwear, mining and PPE"
              fill
              sizes="(max-width: 767px) 90vw, 384px"
              className="brand-banner-image object-cover"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
          </div>
          <div className="brand-logo-badge absolute -bottom-4 -left-4 z-20 rounded-xl border border-white/10 bg-[#07080a] px-3 py-2 shadow-lg shadow-black/40">
            <Image
              src={fulcrumLogo}
              alt="Fulcrum Safety Wear"
              sizes="96px"
              className="h-7 w-auto"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
