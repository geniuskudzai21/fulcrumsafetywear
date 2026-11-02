import type { ReactNode } from "react";

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
    <div className="w-full max-w-md bg-white border border-mist rounded-xl shadow-sm p-6 sm:p-8">
      <h1 className="d text-2xl">{title}</h1>
      <p className="mt-2 text-sm text-coal/65">{subtitle}</p>
      <div className="mt-6">{children}</div>
    </div>
  );
}
