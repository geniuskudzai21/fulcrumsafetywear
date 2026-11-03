const benefits = [
  {
    title: "Built for demanding shifts",
    detail: "Workwear made for real site conditions",
    icon: (
      <>
        <path d="m12 3 8 3v5c0 5-3.4 8.2-8 10-4.6-1.8-8-5-8-10V6l8-3Z" />
        <path d="m9 12 2 2 4-4" />
      </>
    ),
  },
  {
    title: "Visibility that matters",
    detail: "Reflective details for active work sites",
    icon: (
      <>
        <path d="M12 3v2m0 14v2M3 12h2m14 0h2M5.6 5.6 7 7m10 10 1.4 1.4m0-12.8L17 7M7 17l-1.4 1.4" />
        <circle cx="12" cy="12" r="5" />
        <path d="M12 8v8m-3-5h6" />
      </>
    ),
  },
  {
    title: "Options for every crew",
    detail: "Explore sizes, colours and practical styles",
    icon: (
      <>
        <path d="M4 7h16M4 12h16M4 17h16" />
        <circle cx="9" cy="7" r="2" fill="currentColor" stroke="none" />
        <circle cx="15" cy="12" r="2" fill="currentColor" stroke="none" />
        <circle cx="11" cy="17" r="2" fill="currentColor" stroke="none" />
      </>
    ),
  },
  {
    title: "Here to help",
    detail: "Talk to our team about your workwear needs",
    icon: (
      <>
        <path d="M4 13v-2a8 8 0 0 1 16 0v2" />
        <path d="M4 12H3a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h2v-6Zm16 0h1a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-2v-6Z" />
        <path d="M18 18a6 6 0 0 1-6 3h-1" />
      </>
    ),
  },
];

export default function TrustStrip() {
  return (
    <section className="border-b border-mist bg-white">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-3 px-4 py-5 sm:grid-cols-2 sm:px-6 md:grid-cols-4 md:gap-4 md:py-7 lg:px-8">
        {benefits.map((benefit) => (
          <div
            key={benefit.title}
            className="group flex items-center gap-3 rounded-xl border border-mist/80 bg-white p-3 transition duration-300 hover:-translate-y-1 hover:border-gold/60 hover:shadow-lg hover:shadow-coal/5"
          >
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gold/15 text-ink transition-colors group-hover:bg-gold">
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                {benefit.icon}
              </svg>
            </span>
            <span>
              <span className="block text-sm font-bold">{benefit.title}</span>
              <span className="mt-0.5 block text-xs leading-5 text-coal/55">
                {benefit.detail}
              </span>
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
