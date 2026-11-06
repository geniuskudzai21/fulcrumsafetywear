import Image from "next/image";
import type { ReactNode } from "react";
import fulcrumLogo from "@/images/logo.png";

export default function AuthCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <div className="w-full max-w-[20.3125rem] bg-white border border-mist rounded-xl shadow-xl shadow-coal/20 p-4 sm:max-w-[23.375rem] sm:p-5 lg:max-w-[27.375rem]">
      <div className="flex flex-col items-center text-center">
        <Image
          src={fulcrumLogo}
          alt="Fulcrum Safety Wear"
          className="h-12 w-auto object-contain"
        />
        <h1 className="d mt-2 text-xl">{title}</h1>
        <p className="mt-1 text-xs text-coal/65">{subtitle}</p>
      </div>
      <div className="mt-3">{children}</div>
    </div>
  );
}
