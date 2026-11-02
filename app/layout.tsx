import type { Metadata } from "next";
import { Archivo, Source_Sans_3 } from "next/font/google";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { CartProvider } from "@/components/CartProvider";
import { SITE_URL } from "@/lib/site";
import "./globals.css";

const archivo = Archivo({
  subsets: ["latin"],
  axes: ["wdth"],
  variable: "--font-archivo",
  display: "swap",
});

const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-source-sans",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Fulcrum Wear | Safety workwear in Zimbabwe",
  description:
    "Industrial workwear and PPE for mining, construction and site crews across Zimbabwe.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${archivo.variable} ${sourceSans.variable} bg-white text-coal font-sans antialiased`}
      >
        <AuthProvider>
          <CartProvider>{children}</CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
