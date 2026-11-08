import type { Metadata } from "next";
import Link from "next/link";
import ShopShell from "@/components/ShopShell";
import { SUPPORT_EMAIL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms of Service | Fulcrum Wear",
  description:
    "The terms that apply when you shop for workwear and PPE from Fulcrum Safety Wear.",
};

export default function TermsPage() {
  return (
    <ShopShell>
      <section className="max-w-3xl mx-auto px-4 py-10">
        <p className="text-sm text-coal/60">Legal</p>
        <h1 className="d text-3xl md:text-4xl mt-1">Terms of Service</h1>
        <p className="mt-2 text-sm text-coal/60">
          Last updated: 8 November 2026
        </p>

        <div className="mt-8 space-y-8 text-sm leading-7 text-coal/75">
          <div>
            <h2 className="d text-lg text-coal">1. About these terms</h2>
            <p className="mt-2">
              These terms govern your use of the Fulcrum Safety Wear website
              and any order you place through it. By browsing the site or
              placing an order you agree to these terms. If you do not agree,
              please do not use the site.
            </p>
          </div>

          <div>
            <h2 className="d text-lg text-coal">2. Products and availability</h2>
            <p className="mt-2">
              We sell industrial workwear and personal protective equipment
              (PPE). Product images, colours and descriptions are for guidance
              only and may vary slightly from the delivered item. All products
              are subject to availability. If an item you ordered is out of
              stock, we will contact you to arrange a substitute, a backorder
              or a refund.
            </p>
          </div>

          <div>
            <h2 className="d text-lg text-coal">3. Orders and pricing</h2>
            <p className="mt-2">
              An order is an offer to buy. We confirm the order once payment is
              confirmed. Prices are shown in the store currency and may change
              without notice. Delivery costs, where applicable, are shown before
              you pay.
            </p>
          </div>

          <div>
            <h2 className="d text-lg text-coal">4. Payment</h2>
            <p className="mt-2">
              Online payments are processed securely by Paynow using EcoCash,
              OneMoney or Zimswitch. We do not store your payment card or mobile
              money credentials on this site. Your order is prepared once Paynow
              confirms the payment.
            </p>
          </div>

          <div>
            <h2 className="d text-lg text-coal">5. Delivery</h2>
            <p className="mt-2">
              We deliver across Zimbabwe using third-party couriers. Delivery
              times are estimates and may be affected by location, weather or
              courier delays. Risk in the goods passes to you on delivery.
            </p>
          </div>

          <div>
            <h2 className="d text-lg text-coal">6. Returns and exchanges</h2>
            <p className="mt-2">
              If an item is defective, damaged on arrival or not what you
              ordered, contact us within 7 days of delivery with your order
              number and photos where possible. Items must be unused and in
              their original packaging to qualify for an exchange or refund,
              except where the item is faulty. Refunds are returned through the
              original payment method once the return is approved.
            </p>
          </div>

          <div>
            <h2 className="d text-lg text-coal">
              7. Safety and proper use of PPE
            </h2>
            <p className="mt-2">
              Our products support workplace safety but do not replace proper
              training, risk assessments, supervision or correct use. You are
              responsible for choosing products that meet the requirements of
              your workplace and for using and maintaining them correctly.
            </p>
          </div>

          <div>
            <h2 className="d text-lg text-coal">8. Your account</h2>
            <p className="mt-2">
              You are responsible for keeping your account details accurate and
              your password secure. Tell us promptly if you believe your account
              has been used without your permission.
            </p>
          </div>

          <div>
            <h2 className="d text-lg text-coal">9. Intellectual property</h2>
            <p className="mt-2">
              The Fulcrum Safety Wear name, logo, text and images on this site
              belong to us or our licensors and may not be used without our
              written permission.
            </p>
          </div>

          <div>
            <h2 className="d text-lg text-coal">10. Limitation of liability</h2>
            <p className="mt-2">
              To the extent permitted by law, we are not liable for indirect or
              consequential loss arising from the use of this site or the
              products sold on it. Nothing in these terms limits any rights you
              have under the laws of Zimbabwe that cannot be excluded.
            </p>
          </div>

          <div>
            <h2 className="d text-lg text-coal">11. Governing law</h2>
            <p className="mt-2">
              These terms are governed by the laws of Zimbabwe. Any disputes
              will be handled by the courts of Zimbabwe.
            </p>
          </div>

          <div>
            <h2 className="d text-lg text-coal">12. Changes and contact</h2>
            <p className="mt-2">
              We may update these terms from time to time. The current version
              applies whenever you use the site. Questions about these terms?{" "}
              <Link href="/privacy" className="font-semibold text-coal underline">
                Read our Privacy Policy
              </Link>{" "}
              or email{" "}
              <a
                href={`mailto:${SUPPORT_EMAIL}`}
                className="font-semibold text-coal underline"
              >
                {SUPPORT_EMAIL}
              </a>
              .
            </p>
          </div>
        </div>
      </section>
    </ShopShell>
  );
}
