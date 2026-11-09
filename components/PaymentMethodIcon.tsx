import Image from "next/image";
import type { PaymentMethod } from "@/lib/validation/checkout";

const LOGOS: Record<
  PaymentMethod,
  {
    src: string;
    alt: string;
    width: number;
    height: number;
    className: string;
  }
> = {
  ecocash: {
    src: "/payments/ecocash.png",
    alt: "EcoCash",
    width: 225,
    height: 225,
    className: "h-7 w-7",
  },
  inbucks: {
    src: "/payments/innbucks.png",
    alt: "InnBucks",
    width: 800,
    height: 312,
    className: "h-5 w-16",
  },
  zimswitch: {
    src: "/payments/zimswitch.svg",
    alt: "ZimSwitch",
    width: 117,
    height: 58,
    className: "h-5 w-16",
  },
};

export default function PaymentMethodIcon({
  method,
}: {
  method: PaymentMethod;
}) {
  const logo = LOGOS[method];

  return (
    <span className="grid h-9 w-20 shrink-0 place-items-center rounded-md border border-mist bg-white p-1">
      <Image
        src={logo.src}
        alt={logo.alt}
        width={logo.width}
        height={logo.height}
        className={`${logo.className} object-contain`}
        unoptimized
      />
    </span>
  );
}
