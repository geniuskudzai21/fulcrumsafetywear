import type { Metadata } from "next";
import PrivacyPolicyContent from "@/components/legal/PrivacyPolicyContent";
import ShopShell from "@/components/ShopShell";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How Fulcrum Safety Wear collects, uses, shares and protects personal information, including information received when you sign in with Google.",
  alternates: { canonical: "/policy" },
};

export default function PolicyPage() {
  return (
    <ShopShell>
      <section className="max-w-3xl mx-auto px-4 py-10">
        <PrivacyPolicyContent />
      </section>
    </ShopShell>
  );
}
