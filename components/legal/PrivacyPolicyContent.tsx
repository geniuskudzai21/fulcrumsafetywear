import Link from "next/link";
import { CONTACT_PHONE, SUPPORT_EMAIL } from "@/lib/site";

const SITE = "https://fulcrumindustrial.co.zw";

export default function PrivacyPolicyContent() {
  return (
    <>
      <p className="text-sm text-coal/60">Legal</p>
      <h1 className="d text-3xl md:text-4xl mt-1">Privacy Policy</h1>
      <p className="mt-2 text-sm text-coal/60">
        Last updated: 8 November 2026
      </p>

      <div className="mt-8 space-y-8 text-sm leading-7 text-coal/75">
        <div>
          <h2 className="d text-lg text-coal">1. Who we are</h2>
          <p className="mt-2">
            Fulcrum Safety Wear (&quot;Fulcrum&quot;, &quot;we&quot;,
            &quot;us&quot; or &quot;our&quot;) is an industrial workwear and
            personal protective equipment (PPE) retailer based in Harare,
            Zimbabwe. We operate the website at{" "}
            <a
              href={SITE}
              className="font-semibold text-coal underline"
            >
              {SITE}
            </a>{" "}
            and sell workwear, safety clothing and PPE to customers in Zimbabwe.
          </p>
          <p className="mt-2">
            We are responsible for the personal information collected through
            this website. If you have questions about this policy or want to
            exercise your privacy rights, contact us at{" "}
            <a
              href={`mailto:${SUPPORT_EMAIL}`}
              className="font-semibold text-coal underline"
            >
              {SUPPORT_EMAIL}
            </a>
            ,{" "}
            <a
              href={`tel:${CONTACT_PHONE}`}
              className="font-semibold text-coal underline"
            >
              +263 78 573 7355
            </a>
            , or Fulcrum Safety Wear, Harare, Zimbabwe.
          </p>
        </div>

        <div>
          <h2 className="d text-lg text-coal">2. Scope of this policy</h2>
          <p className="mt-2">
            This policy applies to personal information we collect when you
            browse our website, create an account, sign in with Google, add
            items to your cart, place an order, make a payment, contact us, or
            otherwise interact with our store.
          </p>
          <p className="mt-2">
            It does not apply to Google, Paynow or other third-party websites
            and services. Those services have their own privacy policies, and we
            encourage you to read them. This policy is provided in English.
          </p>
        </div>

        <div>
          <h2 className="d text-lg text-coal">
            3. Information we collect
          </h2>
          <p className="mt-2">
            We collect only the information we need to run the store, fulfil
            orders and keep your account secure. The information we collect
            falls into the categories below.
          </p>

          <h3 className="mt-4 font-semibold text-coal">
            3.1 Information you give us
          </h3>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>
              <span className="font-semibold text-coal">Account details:</span>{" "}
              your name, email address, password and account preferences. Your
              password is stored by our authentication provider as a salted
              hash; we do not see your plain-text password.
            </li>
            <li>
              <span className="font-semibold text-coal">
                Order and delivery details:
              </span>{" "}
              your name, phone number, city, delivery address, the items you
              order, order history, returns and delivery notes.
            </li>
            <li>
              <span className="font-semibold text-coal">Communications:</span>{" "}
              emails, WhatsApp messages, phone calls and other messages you send
              to us, including support requests and order enquiries.
            </li>
          </ul>

          <h3 className="mt-4 font-semibold text-coal">
            3.2 Information from Google Sign-In
          </h3>
          <p className="mt-2">
            If you choose &quot;Continue with Google&quot;, Google shares
            certain information with us so we can create or sign you into your
            account. This may include your name, email address, profile image
            URL and a Google account identifier. We do not receive your Google
            password, and we do not access Gmail, Google Drive, Google Calendar,
            Google Contacts or any other Google service.
          </p>

          <h3 className="mt-4 font-semibold text-coal">
            3.3 Order and payment information
          </h3>
          <p className="mt-2">
            When you place an order, we collect the order details, amount,
            payment method, payment status, the phone number used for mobile
            money and the payment reference returned by Paynow. Payments are
            processed by Paynow. We do not receive or store your full card
            number, CVV, mobile money PIN or other payment credentials on this
            website.
          </p>

          <h3 className="mt-4 font-semibold text-coal">
            3.4 Cart, device and usage information
          </h3>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>
              <span className="font-semibold text-coal">Cart information:</span>{" "}
              the items, quantities and prices in your cart. Your cart is kept
              in your browser&apos;s local storage and, when you are signed in,
              linked to your account so it can sync across devices.
            </li>
            <li>
              <span className="font-semibold text-coal">
                Technical information:
              </span>{" "}
              IP address, browser and device type, operating system, pages
              requested, timestamps, error logs, security logs and general
              location derived from your IP address.
            </li>
            <li>
              <span className="font-semibold text-coal">Cookie data:</span>{" "}
              authentication cookies and similar technologies needed to keep
              you signed in and protect your account. See section 7 below.
            </li>
          </ul>

          <h3 className="mt-4 font-semibold text-coal">
            3.5 Information from other sources
          </h3>
          <p className="mt-2">
            We may receive information from Google when you sign in, from
            Paynow when a payment is confirmed or fails, from delivery partners
            about delivery status, and from service providers that help us
            prevent fraud and secure the site. We do not buy personal
            information from data brokers.
          </p>
        </div>

        <div>
          <h2 className="d text-lg text-coal">
            4. How we use your information
          </h2>
          <p className="mt-2">We use personal information to:</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>create, authenticate and manage your account;</li>
            <li>
              process orders, take payments, arrange delivery and handle returns
              or exchanges;
            </li>
            <li>
              send you order updates, receipts, delivery information and
              responses to your questions;
            </li>
            <li>
              detect and prevent fraud, abuse, unauthorised access and other
              security risks;
            </li>
            <li>
              maintain, troubleshoot and improve the website, its features and
              performance;
            </li>
            <li>
              enforce our{" "}
              <Link
                href="/terms"
                className="font-semibold text-coal underline"
              >
                Terms of Service
              </Link>
              ;
            </li>
            <li>
              meet our legal, tax, accounting and regulatory obligations; and
            </li>
            <li>
              establish, exercise or defend legal claims where necessary.
            </li>
          </ul>
          <p className="mt-2">
            We do not use your personal information for third-party advertising,
            we do not sell it, and we do not use Google user data to build
            advertising profiles.
          </p>
        </div>

        <div>
          <h2 className="d text-lg text-coal">5. Legal bases for processing</h2>
          <p className="mt-2">
            Where required by applicable law, we rely on one or more of the
            following legal bases:
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>
              <span className="font-semibold text-coal">
                Performance of a contract:
              </span>{" "}
              to create your account, process your order and provide the
              products and services you request.
            </li>
            <li>
              <span className="font-semibold text-coal">
                Legitimate interests:
              </span>{" "}
              to secure the site, prevent fraud, improve our store and respond
              to enquiries, where those interests are not overridden by your
              rights.
            </li>
            <li>
              <span className="font-semibold text-coal">Legal obligation:</span>{" "}
              to keep records for tax, accounting, consumer-protection and
              regulatory purposes.
            </li>
            <li>
              <span className="font-semibold text-coal">Consent:</span> where we
              ask for your consent for a specific use, such as optional
              communications. You can withdraw consent at any time.
            </li>
          </ul>
        </div>

        <div>
          <h2 className="d text-lg text-coal">
            6. Google user data and Limited Use
          </h2>
          <p className="mt-2">
            We use information received from Google only to authenticate you,
            create and manage your account, and display your name and email
            address in your account and in communications with you. We do not
            use Google user data for advertising, profiling, resale or any
            purpose unrelated to providing our store and account services.
          </p>
          <p className="mt-2">
            We do not share Google user data with third parties except with
            service providers that help us operate the website (such as our
            authentication and database provider, Supabase), or where required
            by law. Those providers are only permitted to use the data to
            provide services to us.
          </p>
          <p className="mt-2">
            Our use of information received from Google APIs adheres to the{" "}
            <a
              href="https://developers.google.com/terms/api-services-user-data-policy"
              className="font-semibold text-coal underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Google API Services User Data Policy
            </a>
            , including its Limited Use requirements. You can revoke our access
            to your Google account at any time in your Google Account
            permissions, and you can ask us to delete your account as described
            in section 13.
          </p>
        </div>

        <div>
          <h2 className="d text-lg text-coal">
            7. Cookies and local storage
          </h2>
          <p className="mt-2">
            We use cookies and browser storage to keep the site working and
            secure. Specifically:
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>
              <span className="font-semibold text-coal">
                Authentication cookies:
              </span>{" "}
              set by our authentication provider, Supabase, to keep you signed
              in and protect your session.
            </li>
            <li>
              <span className="font-semibold text-coal">
                Local storage for your cart:
              </span>{" "}
              we store your cart items in your browser under the key
              &quot;fw-cart&quot; so your cart survives page reloads. When you
              sign in, your cart can also be linked to your account.
            </li>
            <li>
              <span className="font-semibold text-coal">
                Security and load-balancing:
              </span>{" "}
              our hosting provider may use technical cookies or similar
              mechanisms needed to deliver and secure the site.
            </li>
          </ul>
          <p className="mt-2">
            We do not currently use advertising cookies or third-party analytics
            cookies. You can clear or block cookies and local storage in your
            browser settings, but parts of the site that depend on them, such as
            sign-in and checkout, may not work properly.
          </p>
        </div>

        <div>
          <h2 className="d text-lg text-coal">
            8. Sharing your information
          </h2>
          <p className="mt-2">
            We share personal information only where needed to run our store and
            only with parties who are required to protect it. We share
            information with:
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>
              <span className="font-semibold text-coal">Supabase</span>, which
              provides authentication, database and file storage services;
            </li>
            <li>
              <span className="font-semibold text-coal">Paynow</span>, which
              processes EcoCash, InnBucks and Zimswitch payments and returns
              payment status to us;
            </li>
            <li>
              <span className="font-semibold text-coal">Vercel</span>, which
              hosts and delivers the website;
            </li>
            <li>
              <span className="font-semibold text-coal">Delivery partners</span>{" "}
              and couriers, so we can deliver your order;
            </li>
            <li>
              <span className="font-semibold text-coal">
                Professional advisers, authorities or courts
              </span>{" "}
              where we are required by law, or where needed to establish,
              exercise or defend legal claims; and
            </li>
            <li>
              <span className="font-semibold text-coal">
                A successor or buyer
              </span>{" "}
              if our business or assets are transferred, subject to this policy
              continuing to apply.
            </li>
          </ul>
          <p className="mt-2">
            We do not sell, rent or trade your personal information. Our service
            providers are only allowed to use your information to provide
            services to us.
          </p>
        </div>

        <div>
          <h2 className="d text-lg text-coal">
            9. International transfers
          </h2>
          <p className="mt-2">
            Some of our service providers, including Supabase and Vercel, may
            store or process information in countries other than Zimbabwe. Where
            information is transferred across borders, we take reasonable steps
            to ensure it receives an appropriate level of protection, including
            through contractual protections and the security measures described
            in this policy.
          </p>
        </div>

        <div>
          <h2 className="d text-lg text-coal">
            10. How long we keep information
          </h2>
          <p className="mt-2">
            We keep personal information only for as long as we need it for the
            purposes described in this policy:
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>
              <span className="font-semibold text-coal">Account information:</span>{" "}
              while your account is active and for a reasonable period after
              account deletion to handle disputes, security issues and legal
              obligations.
            </li>
            <li>
              <span className="font-semibold text-coal">Order and payment records:</span>{" "}
              for up to 7 years after your order, or longer where required by
              tax, accounting, consumer-protection or other applicable law.
            </li>
            <li>
              <span className="font-semibold text-coal">Cart information:</span>{" "}
              until you clear your cart, clear your browser storage, or ask us
              to delete your account.
            </li>
            <li>
              <span className="font-semibold text-coal">Support communications:</span>{" "}
              for as long as needed to resolve your enquiry and for a reasonable
              period afterwards for quality and legal purposes.
            </li>
            <li>
              <span className="font-semibold text-coal">Technical and security logs:</span>{" "}
              for a limited period, typically no longer than 30 days, unless we
              need to keep them longer to investigate a security incident.
            </li>
          </ul>
          <p className="mt-2">
            When information is no longer needed, we delete it or anonymise it
            so that it can no longer identify you.
          </p>
        </div>

        <div>
          <h2 className="d text-lg text-coal">
            11. Keeping your information safe
          </h2>
          <p className="mt-2">
            We use HTTPS encryption in transit, hashed passwords, access
            controls, database row-level security and reputable service
            providers to protect your information. Access to personal
            information is limited to people and systems that need it to
            operate the store.
          </p>
          <p className="mt-2">
            No method of transmission or storage is completely secure. Please use
            a strong, unique password for your account, keep it private and tell
            us promptly if you believe your account has been compromised.
          </p>
        </div>

        <div>
          <h2 className="d text-lg text-coal">
            12. Your rights and choices
          </h2>
          <p className="mt-2">
            Subject to applicable law, you have the right to:
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>access the personal information we hold about you;</li>
            <li>ask us to correct information that is inaccurate or incomplete;</li>
            <li>ask us to delete your personal information;</li>
            <li>
              ask us to restrict or object to certain processing, including
              processing based on legitimate interests;
            </li>
            <li>
              receive a copy of information you provided to us in a portable
              format where technically feasible;
            </li>
            <li>withdraw consent where processing is based on consent; and</li>
            <li>complain to a data protection authority.</li>
          </ul>
          <p className="mt-2">
            To exercise a right, email{" "}
            <a
              href={`mailto:${SUPPORT_EMAIL}`}
              className="font-semibold text-coal underline"
            >
              {SUPPORT_EMAIL}
            </a>{" "}
            from the email address associated with your account. We may need to
            verify your identity before acting on a request. We will respond
            within a reasonable time, normally within 30 days. We may keep
            information where we are required to do so by law, or where we need
            it to establish, exercise or defend legal claims.
          </p>
          <p className="mt-2">
            If you are not satisfied with our response, you may contact the
            relevant data protection authority in Zimbabwe.
          </p>
        </div>

        <div>
          <h2 className="d text-lg text-coal">
            13. Deleting your account
          </h2>
          <p className="mt-2">
            You can ask us to delete your account and the personal information
            associated with it by emailing{" "}
            <a
              href={`mailto:${SUPPORT_EMAIL}?subject=Delete%20my%20account`}
              className="font-semibold text-coal underline"
            >
              {SUPPORT_EMAIL}
            </a>{" "}
            with the subject &quot;Delete my account&quot; from your registered
            email address. We will verify the request and delete or anonymise
            your account information, except for records we must keep for legal,
            tax, accounting, fraud-prevention or dispute-resolution purposes.
          </p>
          <p className="mt-2">
            If you signed in with Google, you can also remove our access in your
            Google Account permissions. Deleting your account does not
            automatically delete information held by Google, Paynow or other
            third parties; please use their privacy controls for that.
          </p>
        </div>

        <div>
          <h2 className="d text-lg text-coal">14. Children</h2>
          <p className="mt-2">
            This store is intended for adults buying workwear and PPE. We do not
            knowingly collect personal information from children under 18. If
            you believe a child has given us personal information, contact us
            and we will take reasonable steps to delete it.
          </p>
        </div>

        <div>
          <h2 className="d text-lg text-coal">15. Third-party links</h2>
          <p className="mt-2">
            Our website may link to third-party sites or services, including
            Google, Paynow and social media platforms. We are not responsible
            for their privacy practices. Please review their privacy policies
            before providing them with personal information.
          </p>
        </div>

        <div>
          <h2 className="d text-lg text-coal">
            16. Changes to this policy
          </h2>
          <p className="mt-2">
            We may update this policy from time to time to reflect changes in
            our services, technology or legal requirements. The latest version
            will always be available on this page and the &quot;Last
            updated&quot; date will change. If we make a material change, we
            will take reasonable steps to notify you, such as by email or a
            notice on the website.
          </p>
        </div>

        <div>
          <h2 className="d text-lg text-coal">
            17. How to contact us
          </h2>
          <p className="mt-2">
            For any question, concern or request about this policy or your
            personal information, contact:
          </p>
          <p className="mt-2">
            Fulcrum Safety Wear
            <br />
            Harare, Zimbabwe
            <br />
            Email:{" "}
            <a
              href={`mailto:${SUPPORT_EMAIL}`}
              className="font-semibold text-coal underline"
            >
              {SUPPORT_EMAIL}
            </a>
            <br />
            Phone / WhatsApp:{" "}
            <a
              href={`tel:${CONTACT_PHONE}`}
              className="font-semibold text-coal underline"
            >
              +263 78 573 7355
            </a>
          </p>
          <p className="mt-2">
            You can also read our{" "}
            <Link
              href="/terms"
              className="font-semibold text-coal underline"
            >
              Terms of Service
            </Link>
            .
          </p>
        </div>
      </div>
    </>
  );
}
