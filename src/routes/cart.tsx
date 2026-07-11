import { createFileRoute, Link } from "@tanstack/react-router";
import { Minus, Plus, Trash2, MessageCircle } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useCart } from "@/lib/cart";
import { formatPrice } from "@/lib/brand";
import { cartOrderUrl } from "@/lib/whatsapp";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Your Cart — MEENU COLLECTION" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const { items, setQty, remove, total, clear } = useCart();
  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <h1 className="text-3xl font-bold text-brand-secondary sm:text-4xl">Your Cart</h1>
        {items.length === 0 ? (
          <div className="mt-12 rounded-3xl bg-card p-10 text-center shadow-soft">
            <p className="text-muted-foreground">Your cart is empty.</p>
            <Link to="/products" className="mt-4 inline-block rounded-full bg-brand-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-soft">
              Browse products
            </Link>
          </div>
        ) : (
          <>
            <ul className="mt-8 space-y-3">
              {items.map((it) => (
                <li key={`${it.id}|${it.size ?? ""}`} className="flex items-center gap-4 rounded-2xl bg-card p-4 shadow-soft">
                  {it.image && <img loading="lazy" decoding="async" src={it.image} alt="" className="h-16 w-16 rounded-xl object-cover" />}
                  <div className="flex-1">
                    <p className="font-semibold text-brand-secondary">{it.title}</p>
                    {it.size && <p className="text-xs text-muted-foreground">Size: {it.size}</p>}
                    <p className="text-sm text-brand-primary">{formatPrice(it.price)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setQty(it.id, it.qty - 1, it.size)} className="rounded-full bg-brand-soft p-1"><Minus className="h-3 w-3" /></button>
                    <span className="w-6 text-center text-sm">{it.qty}</span>
                    <button onClick={() => setQty(it.id, it.qty + 1, it.size)} className="rounded-full bg-brand-soft p-1"><Plus className="h-3 w-3" /></button>
                  </div>
                  <button onClick={() => remove(it.id, it.size)} className="text-destructive"><Trash2 className="h-4 w-4" /></button>
                </li>
              ))}
            </ul>
            <div className="mt-6 flex items-center justify-between rounded-2xl bg-card p-5 shadow-soft">
              <span className="text-sm text-muted-foreground">Total</span>
              <span className="text-2xl font-bold text-brand-primary">{formatPrice(total)}</span>
            </div>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <a
                href={cartOrderUrl(items, total)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-[#25D366] px-6 py-3 text-sm font-semibold text-white shadow-soft"
              >
                <MessageCircle className="h-4 w-4" /> Send order on WhatsApp
              </a>
              <button onClick={clear} className="rounded-full border border-input bg-card px-6 py-3 text-sm font-semibold text-brand-secondary">
                Clear cart
              </button>
            </div>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}
