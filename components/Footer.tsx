import Image from "next/image";
import fulcrumLogo from "@/images/logo.png";

export default function Footer() {
  return (
    <footer className="bg-ink text-white/70 text-sm">
      <div className="tape"></div>
      <div className="max-w-7xl mx-auto px-4 py-10 grid sm:grid-cols-3 gap-8">
        <div>
          <Image
            src={fulcrumLogo}
            alt="Fulcrum Safety Wear"
            className="h-16 w-[96px] object-contain"
          />
          <p className="mt-3">
            Industrial workwear and PPE, delivered across Zimbabwe.
          </p>
        </div>
        <div>
          <p className="font-bold text-white">Contact</p>
          <p className="mt-2">
            WhatsApp: +263 77 000 0000
            <br />
            Email: sales@fulcrumwear.co.zw
            <br />
            Harare, Zimbabwe
          </p>
        </div>
        <div>
          <p className="font-bold text-white">We accept</p>
          <p className="mt-2">
            EcoCash via Paynow, Visa and Mastercard, cash on delivery
          </p>
        </div>
      </div>
    </footer>
  );
}
