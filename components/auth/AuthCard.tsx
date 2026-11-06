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
    <div className="w-full max-w-sm bg-white border border-mist rounded-xl shadow-sm p-5 sm:p-6">
      <h1 className="d text-xl">{title}</h1>
      <p className="mt-1 text-xs text-coal/65">{subtitle}</p>
      <div className="mt-4">{children}</div>
    </div>
  );
}
