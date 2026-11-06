import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import fulcrumLogo from "@/images/logo.png";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-mist flex flex-col">
      <header className="bg-ink text-white">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <Link href="/" aria-label="Fulcrum Wear home">
            <Image
              src={fulcrumLogo}
              alt="Fulcrum Safety Wear"
              className="h-12 w-[80px] object-contain"
            />
          </Link>
          <Link href="/" className="text-sm font-semibold hover:text-gold">
            Back to shop
          </Link>
        </div>
        <div className="tape"></div>
      </header>
      <main className="flex-1 grid place-items-center px-4 py-6">
        {children}
      </main>
    </div>
  );
}
