import Image from "next/image";
import { WHATSAPP_LINK } from "@/lib/site";

export default function BrandBand() {
  return (
    <section className="bg-coal text-white">
      <div className="max-w-7xl mx-auto px-4 py-12 grid md:grid-cols-2 gap-8 items-center">
        <div>
          <h2 className="d text-3xl">Engineered beyond strength.</h2>
          <p className="mt-3 text-white/70 max-w-md">
            Fulcrum Wear supplies industrial workwear and PPE to miners,
            builders and site crews. Need branded uniforms for a team? Message
            us for a quote.
          </p>
          <a
            id="waBand"
            href={WHATSAPP_LINK}
            className="inline-block mt-6 bg-gold text-ink font-bold px-6 py-3 rounded"
          >
            Ask for a team quote
          </a>
        </div>
        <Image
          src="/images/logobanner.jpeg"
          alt="Fulcrum Safety Wear: Industrial Workwear, Mining, PPE"
          width={719}
          height={556}
          className="rounded-2xl w-full max-w-sm justify-self-center md:justify-self-end"
        />
      </div>
    </section>
  );
}
