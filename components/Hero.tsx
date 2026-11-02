import Image from "next/image";
import { WHATSAPP_LINK } from "@/lib/site";

export default function Hero() {
  return (
    <section className="bg-ink text-white">
      <div className="max-w-7xl mx-auto px-4 py-12 md:py-20 grid md:grid-cols-2 gap-10 items-center">
        <div>
          <h1 className="d text-4xl md:text-6xl leading-[1.05]">
            Workwear that holds up to the shift.
          </h1>
          <p className="mt-5 text-lg text-white/75 max-w-md">
            Industrial shirts, trousers and hi-vis for mining, construction and
            site crews. Ordered online, delivered to your door.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href="#shop"
              className="bg-gold text-ink font-bold px-7 py-3 rounded hover:brightness-95"
            >
              Shop workwear
            </a>
            <a
              id="waHero"
              href={WHATSAPP_LINK}
              className="border border-white/30 px-7 py-3 rounded font-semibold hover:bg-white/10"
            >
              Order on WhatsApp
            </a>
          </div>
        </div>
        <div className="relative">
          <div className="absolute inset-0 translate-x-3 translate-y-3 bg-gold rounded-lg"></div>
          <div className="relative bg-gradient-to-br from-mist to-steel rounded-lg p-6">
            <Image
              src="/images/combo.jpeg"
              alt="Hi-vis jacket and cargo trousers set"
              width={576}
              height={544}
              priority
              className="w-full max-h-[420px] object-contain mix-blend-multiply"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
