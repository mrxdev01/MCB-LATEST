import { BRAND, formatPrice } from "./brand";

export type CartItem = {
  id: string;
  slug: string;
  title: string;
  price: number;
  qty: number;
  size?: string;
  image?: string;
};

function base(text: string) {
  // api.whatsapp.com/send is the most reliable format across desktop web,
  // mobile web, iOS and Android — wa.me sometimes 404s inside embedded
  // browsers and preview iframes.
  const params = new URLSearchParams({
    phone: BRAND.whatsapp,
    text,
    type: "phone_number",
    app_absent: "0",
  });
  return `https://api.whatsapp.com/send/?${params.toString()}`;
}

export function productEnquiryUrl(product: {
  title: string;
  slug: string;
  price: number;
  sku?: string;
}, size?: string) {
  const url = typeof window !== "undefined" ? `${window.location.origin}/products/${product.slug}` : "";
  const lines = [
    `Hi ${BRAND.name},`,
    ``,
    `I'd like to enquire about:`,
    `*${product.title}*`,
    product.sku ? `SKU: ${product.sku}` : "",
    size ? `Size: ${size}` : "",
    `Price: ${formatPrice(product.price)}`,
    url ? `Link: ${url}` : "",
    ``,
    `Please share more details.`,
  ].filter(Boolean);
  return base(lines.join("\n"));
}

export function cartOrderUrl(items: CartItem[], total: number) {
  const lines = [
    `Hi ${BRAND.name},`,
    ``,
    `I'd like to place an order:`,
    ``,
  ];
  items.forEach((it, i) => {
    lines.push(
      `${i + 1}. *${it.title}*${it.size ? ` (${it.size})` : ""}`,
      `   Qty: ${it.qty} × ${formatPrice(it.price)} = ${formatPrice(it.price * it.qty)}`,
    );
  });
  lines.push(``, `*Total: ${formatPrice(total)}*`, ``, `Please confirm availability & delivery.`);
  return base(lines.join("\n"));
}

export function genericEnquiryUrl() {
  return base(`Hi ${BRAND.name}, I'd like to know more about your products.`);
}
