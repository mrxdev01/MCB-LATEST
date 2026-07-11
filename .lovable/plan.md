
# MEENU COLLECTION — SEO + AEO + GEO Master Plan
Domain: **https://meenucollection.in** • Business: Jaipur-based cotton bedsheets, men's shirts, women's nighty (retail + wholesale, pan-India, WhatsApp-led)

Goal: Rank on Google + Bing for buying-intent queries, get quoted by AI answer engines (ChatGPT, Perplexity, Gemini, Claude), and dominate local/geo searches in Jaipur + India-wide "buy cotton …" queries.

---

## Phase A — Technical SEO foundation (site health)

**A1. Domain & indexing**
- Connect `meenucollection.in` + `www.meenucollection.in` in Lovable Domains. Set `meenucollection.in` as **Primary** (301 from www).
- Force HTTPS (Lovable auto-SSL).
- Submit to Google Search Console (Domain property) + Bing Webmaster Tools + IndexNow.
- Submit `sitemap.xml` in both. Verify robots.txt is reachable.
- Turn on GSC "URL Inspection → Request indexing" for top 20 pages.

**A2. Crawlability (already done, verify)**
- `robots.txt`: `Allow: /`, block `/admin`, `/auth`, `/cart`; explicit `Allow` for GPTBot, PerplexityBot, ClaudeBot, Google-Extended, OAI-SearchBot, ChatGPT-User. ✅
- `sitemap.xml`: dynamic, lastmod per row, includes products/collections/blog + policy pages. ✅

**A3. Core Web Vitals (mobile-first)**
- LCP image on `/` and product detail: add `fetchpriority="high"` + `<link rel="preload" as="image">` in that route's `head().links`.
- All grid images: `loading="lazy" decoding="async"` + explicit `width`/`height` (kills CLS). ✅ done, sweep new ones.
- Preload only Ubuntu weights actually used (400, 600, 700). Add `&display=swap` (already).
- Target: mobile LCP < 2.5s, CLS < 0.05, INP < 200ms.

**A4. Rendering & caching**
- SSR head + JSON-LD verified server-rendered (view-source check). ✅
- `sitemap.xml` served with `Cache-Control: public, max-age=3600`. ✅

---

## Phase B — On-page SEO (per-route optimization)

**B1. Metadata contract per route** — every route has UNIQUE:
- `title` (55–60 chars, primary keyword front-loaded, brand suffix)
- `description` (150–160 chars, benefit + CTA + Jaipur/India signal)
- `og:title`, `og:description`, `og:url`, `og:type`
- self-referencing `<link rel="canonical">`
- `twitter:card = summary_large_image`

**B2. Keyword map (India English + Hinglish intent)**

| Route | Primary keyword | Secondary |
|---|---|---|
| `/` | pure cotton bedsheets online india | jaipur wholesale cotton |
| `/bedsheets` | cotton bedsheets king size | double bed cotton bedsheet online |
| `/men-shirts` | printed cotton shirts for men | half sleeve cotton shirt online |
| `/nighty` | cotton nighty for women online | xxl plus size cotton nighty |
| `/products/[slug]` | `{product title} {size}` | `buy {product} online india` |
| `/collections/[slug]` | `{collection} cotton collection` | jaipur wholesale {collection} |
| `/blog/[slug]` | long-tail how-to | care guide, buying guide |
| `/faq` | shipping / return / size FAQs | — |
| `/about` | meenu collection jaipur | cotton wholesaler jaipur |
| `/contact` | cotton wholesaler jaipur contact | whatsapp order cotton |

**B3. Heading hierarchy**
- Single `<h1>` per route (already). Add `<h2>` sections with keyword variations. `<h3>` for sub-features (Fabric, Size, Care).

**B4. Internal linking**
- `RelatedCategories` on every category page. ✅
- Add "You may also like" on product detail (same category, exclude current).
- Add contextual links from blog → product/category (3–5 per post).
- Footer: primary categories + policy links (crawl equity). ✅

**B5. Image SEO**
- Every `<img>` gets descriptive `alt` (product title + attribute, not "image1.jpg"). Audit and fix.
- File names on upload: slugified product title (compress-image.ts).
- WebP output from compress-image.ts (verify).

**B6. URL hygiene**
- No trailing slash, lowercase, hyphenated slugs (enforced). ✅
- 301 any legacy `/product?id=` → `/products/{slug}` if present.

---

## Phase C — Structured data (schema.org) — powers rich results + AEO

Add JSON-LD via each route's `head().scripts`:

1. **`__root.tsx`** — `Organization` + `WebSite` (with `SearchAction` sitelinks searchbox).
2. **`/` (index)** — `Store` / `LocalBusiness` (see Phase D for GEO details).
3. **`/products/[slug]`** — `Product` with:
   - `name`, `image[]`, `description`, `sku`, `brand: MEENU COLLECTION`
   - `offers`: `Offer` with `price`, `priceCurrency: INR`, `availability`, `url`, `priceValidUntil`
   - `aggregateRating` when reviews exist (from `reviews` table)
   - `review[]` (top 3)
4. **`/collections/[slug]`** — `CollectionPage` + `ItemList` (product URLs). ✅
5. **`/bedsheets`, `/men-shirts`, `/nighty`** — `CollectionPage` + `ItemList` + `BreadcrumbList`. ✅ partial.
6. **`/blog/[slug]`** — `Article` with `author`, `datePublished`, `dateModified`, `image`, `publisher` (Organization).
7. **`/blog`** — `Blog` + `ItemList`.
8. **`/faq`** — `FAQPage` from `faq-data.ts`.
9. **`/contact`, `/about`** — `ContactPage` / `AboutPage` + reference to Organization.
10. **Breadcrumbs** — `BreadcrumbList` on every non-root route.

Validate every schema in Google Rich Results Test + Schema.org Validator.

---

## Phase D — GEO (Geographic / Local SEO for Jaipur + pan-India)

**D1. LocalBusiness schema on `/` and `/contact`:**
```json
{
  "@type": "Store",
  "name": "MEENU COLLECTION",
  "image": "https://meenucollection.in/og-cover.jpg",
  "@id": "https://meenucollection.in/#store",
  "url": "https://meenucollection.in",
  "telephone": "+919116374846",
  "email": "meenucollectionshop@gmail.com",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Kisan Marg",
    "addressLocality": "Jaipur",
    "addressRegion": "Rajasthan",
    "postalCode": "<add>",
    "addressCountry": "IN"
  },
  "geo": { "@type": "GeoCoordinates", "latitude": "<add>", "longitude": "<add>" },
  "areaServed": { "@type": "Country", "name": "India" },
  "openingHoursSpecification": [{ "@type": "OpeningHoursSpecification", "dayOfWeek": ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"], "opens": "10:00", "closes": "20:00" }],
  "priceRange": "₹₹",
  "sameAs": ["https://www.indiamart.com/meenucollection-jaipur/", "<instagram>", "<facebook>", "<youtube>"]
}
```

**D2. Google Business Profile (GBP)**
- Claim/create GBP at exact address. Category: "Bed shop" + secondary "Wholesaler" + "Clothing store".
- Add 10+ real photos (shop, products, packaging), weekly posts, Q&A seeded.
- Enable messaging, add WhatsApp link, add products in GBP catalog.
- Collect Google reviews via WhatsApp follow-up link.

**D3. Local citations (NAP consistency — same Name/Address/Phone)**
- IndiaMART ✅, JustDial, Sulekha, TradeIndia, ExportersIndia, Yellow Pages India, Grotal, AskLaila.
- Facebook Page, Instagram Business, LinkedIn Company Page — all with identical NAP.

**D4. Geo-targeted content pages** (later phase)
- `/wholesale-cotton-bedsheets-jaipur`
- `/bulk-order-cotton-shirts-india`
- City landing pages if wholesale demand: Delhi, Mumbai, Ahmedabad resellers.

**D5. hreflang**
- Add `<link rel="alternate" hreflang="en-IN" href="…">` and `hreflang="x-default"` on every page (India English is primary market).

---

## Phase E — AEO (Answer Engine Optimization for ChatGPT / Perplexity / Gemini / Claude / Google AI Overviews)

**E1. Content structure that AI engines quote**
- Every product page: opening 2-line factual summary (Fabric, Size, Price range, Ships from) → AI models extract these.
- Every blog post: TL;DR block at top + FAQ block at bottom.
- FAQ page uses proper Q/A pairs (already wired to `FAQPage` schema).

**E2. llms.txt** ✅ present. Expand to include:
- Latest product highlights (top 10 SKUs with 1-liner)
- Shipping/return/payment in plain English
- "How to order" step-by-step (WhatsApp flow)
- Wholesale terms

**E3. Crawler allow-list** ✅ (GPTBot, PerplexityBot, ClaudeBot, Google-Extended, OAI-SearchBot, ChatGPT-User in robots.txt).

**E4. Entity + author signals**
- About page has founder/owner name, years in business, GST, IndiaMART TrustSeal → makes the brand an "entity" in Google's Knowledge Graph.
- Add `sameAs` links to all social + IndiaMART + trustseal in Organization JSON-LD.
- Blog posts have real `author` (name + link to about) → Article schema `author.name`.

**E5. Answer-shaped H2 sections**
- Use question-format H2s: "What size bedsheet fits a king bed?", "Is cotton nighty good for summer?" — AI engines cite these verbatim.

**E6. Freshness signals**
- Blog: publish 2 posts/month minimum. Update `dateModified` on edits.
- Homepage: rotate featured/best-seller block weekly (already realtime-invalidated).

---

## Phase F — Content strategy (blog + landing pages)

**F1. Seed cluster (first 12 posts, all Hinglish-friendly English)**
1. How to choose the right cotton bedsheet for Indian summer
2. King vs Queen vs Double bedsheet sizes (with size chart)
3. Thread count myth — what actually matters in cotton bedsheets
4. How to wash & care for pure cotton bedsheets
5. Best cotton shirt fits for Indian men (regular vs slim)
6. Half sleeve vs full sleeve cotton shirts — when to wear what
7. Why cotton nighty is the best sleepwear for Indian women
8. Plus-size cotton nighty buying guide (XL / XXL / 3XL)
9. Wholesale cotton bedsheets in Jaipur — direct-from-manufacturer guide
10. How to order bulk cotton products on WhatsApp (step-by-step with screenshots)
11. Cotton vs poly-cotton vs microfiber — honest comparison
12. Festive gifting: cotton bedsheet sets under ₹1000

Each post: 800–1500 words, 1 hero image, 3–5 internal product links, FAQ block, `Article` + `FAQPage` schema.

**F2. Landing pages for money keywords**
- `/wholesale` — B2B pitch, MOQ, GST invoice, WhatsApp CTA
- `/bulk-orders` — form + WhatsApp
- Category pages already exist. ✅

---

## Phase G — Off-page & authority

- **Backlinks**: submit to Indian directories (IndiaMART ✅, TradeIndia, ExportersIndia, JustDial, Sulekha).
- **Guest posts** on Indian home-décor / fashion blogs (1/month target).
- **HARO India / Qwoted** for quotes as "Jaipur cotton wholesaler".
- **YouTube shorts** — product close-ups, factory tour → embed on `/about` and product pages (adds dwell time + VideoObject schema).
- **Instagram Reels** cross-post → drive branded search ("meenu collection jaipur").
- **Reviews** — WhatsApp follow-up asking for Google + IndiaMART review.

---

## Phase H — Measurement & iteration

**H1. Install (in this order)**
1. Google Search Console (Domain property)
2. Bing Webmaster Tools
3. Google Analytics 4 (via measurement ID, cookie-consent aware)
4. Microsoft Clarity (heatmaps + session recordings — free)
5. IndexNow ping on new/updated product & blog (optional endpoint)

**H2. Weekly review**
- GSC: impressions, CTR, avg position per query. Fix pages ranked 8–20 (quick wins).
- Rich results status.
- Core Web Vitals report.
- Top pages report → double-down on winning topics.

**H3. Monthly**
- Add 4 blog posts.
- Refresh 4 old posts (update `dateModified`).
- Audit broken links + 404s.
- Rebuild XML sitemap (auto ✅) — resubmit.

**H4. KPIs (90-day targets)**
- 500+ indexed URLs
- 30+ ranking keywords in top 20
- 10+ keywords top 3
- LCP < 2.5s mobile on all money pages
- 5+ Google reviews on GBP

---

## Technical execution — code changes required

**Files to add/modify:**
```
src/routes/__root.tsx              — Organization + WebSite JSON-LD, SearchAction, hreflang
src/routes/index.tsx               — Store/LocalBusiness JSON-LD, LCP preload
src/routes/products.$slug.tsx      — Product JSON-LD (offers, aggregateRating, review)
src/routes/collections.$slug.tsx   — verify CollectionPage + ItemList
src/routes/blog.$slug.tsx          — Article JSON-LD (author, publisher, datePublished)
src/routes/blog.index.tsx          — Blog + ItemList
src/routes/faq.tsx                 — FAQPage JSON-LD from faq-data.ts
src/routes/about.tsx               — AboutPage + reference Organization
src/routes/contact.tsx             — ContactPage + LocalBusiness
src/routes/bedsheets|men-shirts|nighty.tsx — BreadcrumbList + CollectionPage refinement
src/lib/seo.ts                     — helpers: buildProductLD, buildArticleLD, buildLocalBusinessLD, buildBreadcrumbLD
public/llms.txt                    — expand (top products, ordering steps, wholesale terms)
```

**Rollout order (small commits):**
1. Phase C schemas (Product, Article, FAQ, LocalBusiness) — biggest rich-result win, 1 day.
2. Phase B metadata audit + heading/alt sweep — 1 day.
3. Phase D GEO — LocalBusiness JSON-LD + GBP setup (user action) — 1 day.
4. Phase A3 CWV fixes (LCP preload, image dims audit) — half day.
5. Phase E AEO polish — llms.txt expansion, TL;DR blocks on blog — half day.
6. Phase F content — ongoing, 2 posts/week.
7. Phase G off-page — ongoing.
8. Phase H measurement — one-time install, weekly review.

---

## What the user (you) needs to do outside code

1. **Connect domain** in Lovable → Project Settings → Domains → `meenucollection.in`.
2. **Publish** the project.
3. **Google Search Console** — verify Domain property, submit sitemap.
4. **Google Business Profile** — claim/create for the Jaipur shop, add photos, enable messaging.
5. **Provide** exact PIN code + geo coordinates + shop opening hours for `LocalBusiness` schema.
6. **Social profiles** — send me the URLs (Instagram, Facebook, YouTube) to wire into `sameAs`.
7. **Collect Google reviews** via WhatsApp after each order (link generator: I can add a `/review-us` redirect).

---

## Risks & non-goals

- No black-hat: no keyword stuffing, no cloaking, no PBNs.
- No paid links (Google penalty risk).
- No content spam — every blog post must be genuinely useful.
- Rankings take 60–120 days; AEO citations start within 2–4 weeks of schema deployment.
- Do not change brand voice or visual identity for SEO reasons.

---

Ready to execute Phase C (schemas) first — highest ROI, lowest risk. Confirm and I start.
