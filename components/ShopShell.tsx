import type { ReactNode } from "react";
import CartDrawer from "./CartDrawer";
import CheckoutForm from "./CheckoutForm";
import Footer from "./Footer";
import Header from "./Header";
import { StoreProvider } from "./StoreProvider";

export default function ShopShell({ children }: { children: ReactNode }) {
  return (
    <StoreProvider>
      <Header />
      <main id="top">{children}</main>
      <Footer />
      <CartDrawer />
      <CheckoutForm />
    </StoreProvider>
  );
}
