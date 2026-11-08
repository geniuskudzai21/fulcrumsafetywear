import type { Metadata } from "next";
import Link from "next/link";
import ShopShell from "@/components/ShopShell";
import { SUPPORT_EMAIL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How Fulcrum Safety Wear collects, uses and protects your personal information.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <ShopShell>
      <section className="max-w-3xl mx-auto px-4 py-10">
        <p className="text-sm text-coal/60">Legal</p>
        <h1 className="d text-3xl md:text-4xl mt-1">Privacy Policy</h1>
        <p className="mt-2 text-sm text-coal/60">
          Last updated: 8 November 2026
        </p>

        <div className="mt-8 space-y-8 text-sm leading-7 text-coal/75">
          <div>
            <h2 className="d text-lg text-coal">1. Who we are</h2>
            <p className="mt-2">
              Fulcrum Safety Wear sells industrial workwear and PPE across
              Zimbabwe. This policy explains what personal information we
              collect when you use this website, why we collect it, and the
              choices you have.
            </p>
          </div>

          <div>
            <h2 className="d text-lg text-coal">2. Information we collect</h2>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>
                <span className="font-semibold text-coal">Account details</span>{" "}
                such as your name, email address and password. If you sign in
                with Google we receive your name and email address from Google.
              </li>
              <li>
                <span className="font-semibold text-coal">Order details</span>{" "}
                such as the items you buy, delivery address, phone number and
                order history.
              </li>
              <li>
                <span className="font-semibold text-coal">Payment information</span>{" "}
                needed to process payments through Paynow. We do not store your
                mobile money or card credentials on this site.
              </li>
              <li>
                <span className="font-semibold text-coal">Usage information</span>{" "}
                such as your cart contents and basic technical data needed to
                keep the site working and secure.
              </li>
            </ul>
          </div>

          <div>
            <h2 className="d text-lg text-coal">3. How we use your information</h2>
            <p className="mt-2">We use your information to:</p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>create and manage your account;</li>
              <li>process, deliver and support your orders;</li>
              <li>take payments and prevent fraud;</li>
              <li>respond to your questions and requests;</li>
              <li>keep our website secure and improve how it works;</li>
              <li>meet our legal and accounting obligations.</li>
            </ul>
          </div>

          <div>
            <h2 className="d text-lg text-coal">4. Sharing your information</h2>
            <p className="mt-2">
              We share personal information only where needed to run the store,
              including with:
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>
                <span className="font-semibold text-coal">Supabase</span> for
                secure authentication and database hosting;
              </li>
              <li>
                <span className="font-semibold text-coal">Paynow</span> to
                process EcoCash, InnBucks and Zimswitch payments;
              </li>
              <li>
                <span className="font-semibold text-coal">Delivery partners</span>{" "}
                to get your order to you;
              </li>
              <li>
                authorities or advisers where the law requires it.
              </li>
            </ul>
            <p className="mt-2">
              We do not sell your personal information.
            </p>
          </div>

          <div>
            <h2 className="d text-lg text-coal">5. Cookies and local storage</h2>
            <p className="mt-2">
              We use cookies and browser storage to keep you signed in, remember
              your cart and keep the site secure. You can clear or block these
              in your browser settings, but some parts of the site, such as
              checkout, will not work without them.
            </p>
          </div>

          <div>
            <h2 className="d text-lg text-coal">6. How long we keep information</h2>
            <p className="mt-2">
              We keep account and order information for as long as your account
              is active and for as long as we need it for legal, tax and
              accounting purposes. When it is no longer needed, we delete or
              anonymise it.
            </p>
          </div>

          <div>
            <h2 className="d text-lg text-coal">7. Keeping your information safe</h2>
            <p className="mt-2">
              We use encryption in transit, access controls and reputable
              service providers to protect your information. No system is
              completely secure, so please use a strong, unique password and
              keep it private.
            </p>
          </div>

          <div>
            <h2 className="d text-lg text-coal">8. Your choices and rights</h2>
            <p className="mt-2">
              You can ask us to access, correct or delete the personal
              information we hold about you, or to stop using it for a
              particular purpose. Email{" "}
              <a
                href={`mailto:${SUPPORT_EMAIL}`}
                className="font-semibold text-coal underline"
              >
                {SUPPORT_EMAIL}
              </a>{" "}
              and we will respond within a reasonable time. We may need to keep
              some records to comply with the law.
            </p>
          </div>

          <div>
            <h2 className="d text-lg text-coal">9. Children</h2>
            <p className="mt-2">
              This store is intended for adults buying workwear and PPE. We do
              not knowingly collect personal information from children. If you
              believe a child has given us information, contact us so we can
              remove it.
            </p>
          </div>

          <div>
            <h2 className="d text-lg text-coal">10. Changes and contact</h2>
            <p className="mt-2">
              We may update this policy from time to time. The latest version
              will always be on this page. For privacy questions, email{" "}
              <a
                href={`mailto:${SUPPORT_EMAIL}`}
                className="font-semibold text-coal underline"
              >
                {SUPPORT_EMAIL}
              </a>
              . See also our{" "}
              <Link href="/terms" className="font-semibold text-coal underline">
                Terms of Service
              </Link>
              .
            </p>
          </div>
        </div>
      </section>
    </ShopShell>
  );
}
