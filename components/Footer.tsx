import Image from "next/image";
import Link from "next/link";
import fulcrumLogo from "@/images/logo.png";
import {
  CONTACT_PHONE,
  SOCIAL_LINKS,
  SUPPORT_EMAIL,
  WHATSAPP_LINK,
} from "@/lib/site";

const socials = [
  {
    name: "X",
    href: SOCIAL_LINKS.x,
    path: "M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z",
  },
  {
    name: "Instagram",
    href: SOCIAL_LINKS.instagram,
    path: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069ZM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0Zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324ZM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8Zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881Z",
  },
  {
    name: "Facebook",
    href: SOCIAL_LINKS.facebook,
    path: "M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z",
  },
  {
    name: "TikTok",
    href: SOCIAL_LINKS.tiktok,
    path: "M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07Z",
  },
];

export default function Footer() {
  return (
    <footer className="bg-ink text-white/70 text-sm">
      <div className="tape"></div>
      <div className="max-w-7xl 2xl:max-w-[90rem] mx-auto px-4 py-10 grid sm:grid-cols-3 gap-8">
        <div>
          <Image
            src={fulcrumLogo}
            alt="Fulcrum Safety Wear"
            className="h-16 w-[96px] object-contain"
          />
          <p className="mt-3">
            Industrial workwear and PPE, delivered across Zimbabwe.
          </p>
          <div className="mt-4 flex items-center gap-2">
            {socials.map((social) => (
              <a
                key={social.name}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Follow Fulcrum Safety Wear on ${social.name}`}
                className="grid h-9 w-9 place-items-center rounded-full border border-white/15 text-white/70 transition-colors hover:border-gold hover:bg-gold hover:text-ink"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d={social.path} />
                </svg>
              </a>
            ))}
          </div>
        </div>
        <div>
          <p className="font-bold text-white">Contact</p>
          <p className="mt-2">
            WhatsApp / Calls:{" "}
            <a href={`tel:${CONTACT_PHONE}`} className="hover:text-gold">
              +263 78 573 7355
            </a>
            <br />
            <a href={WHATSAPP_LINK} className="hover:text-gold">
              Chat on WhatsApp
            </a>
            <br />
            Email:{" "}
            <a href={`mailto:${SUPPORT_EMAIL}`} className="hover:text-gold">
              {SUPPORT_EMAIL}
            </a>
            <br />
            Harare, Zimbabwe
          </p>
        </div>
        <div>
          <p className="font-bold text-white">We accept</p>
          <p className="mt-2">
            EcoCash, InnBucks and Zimswitch via Paynow
            <br />
            EcoCash / InnBucks: +263 78 573 7355
          </p>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="max-w-7xl 2xl:max-w-[90rem] mx-auto px-4 py-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-white/50">
            &copy; {new Date().getFullYear()} Fulcrum Safety Wear. All rights
            reserved.
          </p>
          <nav
            aria-label="Legal"
            className="flex items-center gap-4 text-xs text-white/60"
          >
            <Link href="/terms" className="hover:text-gold">
              Terms of Service
            </Link>
            <Link href="/policy" className="hover:text-gold">
              Privacy Policy
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
