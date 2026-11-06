import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-mist flex flex-col">
      <main className="flex-1 grid place-items-center px-4 py-6">
        {children}
      </main>
    </div>
  );
}
