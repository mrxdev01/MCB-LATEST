export const BRAND = {
  name: "MEENU COLLECTION",
  tagline: "Premium Cotton • Wholesale Prices",
  whatsapp: "919116374846",
  whatsappDisplay: "+91 91163 74846",
  phone: "+91 91163 74846",
  email: "meenucollectionshop@gmail.com",
  address: "Shop (MEENU COLLECTION) Kisan Marg, Jaipur, Rajasthan, India",
  city: "Jaipur",
  state: "Rajasthan",
  country: "India",
  indiamartUrl: "https://www.indiamart.com/meenucollection-jaipur/",
  trustsealUrl: "https://trustseal.indiamart.com/members/meenucollection-jaipur",
  gst: "08AUAPM0275D1ZZ",
};

export const CURRENCY = "₹";

export function formatPrice(n: number | string | null | undefined): string {
  const v = Number(n ?? 0);
  return `${CURRENCY}${v.toLocaleString("en-IN")}`;
}
