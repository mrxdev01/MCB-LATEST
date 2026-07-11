import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { supabase } from "../integrations/supabase/client";
import { BRAND } from "../lib/brand";
import { trackVisit, joinLivePresence } from "../lib/visitor-tracker";
const logo = "/logo.png";
import { Toaster } from "sonner";
import { ScrollReveal } from "../components/ScrollReveal";


function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-brand-primary">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-brand-secondary">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-full bg-brand-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-soft hover:opacity-90"
          >
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-brand-secondary">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong. Try again or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-full bg-brand-primary px-5 py-2.5 text-sm font-medium text-primary-foreground"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-full border border-input bg-background px-5 py-2.5 text-sm font-medium text-brand-secondary hover:bg-brand-soft"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

const title = `${BRAND.name} — Premium Cotton Bedsheets, Men Shirts & Nighty | Jaipur`;
const description =
  "Wholesale & retail premium pure cotton bedsheets (king/queen/single), printed men shirts and cotton nighty from Jaipur, India. Order on WhatsApp.";

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title },
      { name: "description", content: description },
      { name: "author", content: BRAND.name },
      { name: "keywords", content: "wholesale cotton bedsheets Jaipur, printed cotton shirts men, cotton nighty online India, MEENU COLLECTION Jaipur" },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: BRAND.name },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: logo, type: "image/png" },
      { rel: "apple-touch-icon", href: logo },
      { rel: "preload", as: "image", href: logo, fetchPriority: "high" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "dns-prefetch", href: "https://fonts.gstatic.com" },
      { rel: "alternate", hrefLang: "en-IN", href: "https://meenucollection.in" },
      { rel: "alternate", hrefLang: "x-default", href: "https://meenucollection.in" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Ubuntu:wght@300;400;500;700&display=swap",
      },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": ["ClothingStore", "LocalBusiness"],
          "@id": "https://meenucollection.in/#store",
          name: BRAND.name,
          image: "https://meenucollection.in/logo.png",
          logo: "https://meenucollection.in/logo.png",
          url: "https://meenucollection.in",
          telephone: BRAND.phone,
          email: BRAND.email,
          priceRange: "₹₹",
          currenciesAccepted: "INR",
          paymentAccepted: "Cash, UPI, Bank Transfer, COD",
          address: {
            "@type": "PostalAddress",
            streetAddress: "Shop (MEENU COLLECTION) Kisan Marg",
            addressLocality: BRAND.city,
            addressRegion: BRAND.state,
            postalCode: "302018",
            addressCountry: "IN",
          },
          geo: {
            "@type": "GeoCoordinates",
            latitude: 26.8467,
            longitude: 75.7873,
          },
          areaServed: [
            { "@type": "Country", name: "India" },
            { "@type": "City", name: "Jaipur" },
          ],
          openingHoursSpecification: [{
            "@type": "OpeningHoursSpecification",
            dayOfWeek: ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],
            opens: "10:00",
            closes: "20:00",
          }],
          sameAs: [BRAND.indiamartUrl, BRAND.trustsealUrl],
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: BRAND.name,
          url: "https://meenucollection.in",
          potentialAction: {
            "@type": "SearchAction",
            target: "https://meenucollection.in/products?q={search_term_string}",
            "query-input": "required name=search_term_string",
          },
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          name: BRAND.name,
          url: "https://meenucollection.in",
          logo: "https://meenucollection.in/logo.png",
          contactPoint: {
            "@type": "ContactPoint",
            telephone: BRAND.phone,
            contactType: "customer service",
            areaServed: "IN",
            availableLanguage: ["en", "hi"],
          },
          sameAs: [BRAND.indiamartUrl, BRAND.trustsealUrl],
        }),
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RealtimeSync() {
  const qc = useQueryClient();
  const router = useRouter();
  useEffect(() => {
    let ch: ReturnType<typeof supabase.channel> | null = null;
    try {
      ch = supabase
        .channel("global-mc")
        .on("postgres_changes", { event: "*", schema: "public", table: "products" }, () =>
          qc.invalidateQueries({ queryKey: ["products"] }),
        )
        .on("postgres_changes", { event: "*", schema: "public", table: "collections" }, () =>
          qc.invalidateQueries({ queryKey: ["collections"] }),
        )
        .on("postgres_changes", { event: "*", schema: "public", table: "categories" }, () =>
          qc.invalidateQueries({ queryKey: ["categories"] }),
        )
        .on("postgres_changes", { event: "*", schema: "public", table: "announcements" }, () =>
          qc.invalidateQueries({ queryKey: ["announcements"] }),
        )
        .on("postgres_changes", { event: "*", schema: "public", table: "tags" }, () => {
          qc.invalidateQueries({ queryKey: ["tags"] });
          qc.invalidateQueries({ queryKey: ["products"] });
          qc.invalidateQueries({ queryKey: ["collections"] });
        })
        .on("postgres_changes", { event: "*", schema: "public", table: "product_tags" }, () =>
          qc.invalidateQueries({ queryKey: ["products"] }),
        )
        .on("postgres_changes", { event: "*", schema: "public", table: "collection_tags" }, () =>
          qc.invalidateQueries({ queryKey: ["collections"] }),
        )
        .on("postgres_changes", { event: "*", schema: "public", table: "product_collections" }, () => {
          qc.invalidateQueries({ queryKey: ["products"] });
          qc.invalidateQueries({ queryKey: ["collections"] });
        })
        .on("postgres_changes", { event: "*", schema: "public", table: "product_images" }, () =>
          qc.invalidateQueries({ queryKey: ["products"] }),
        )
        .on("postgres_changes", { event: "*", schema: "public", table: "nav_items" }, () =>
          qc.invalidateQueries({ queryKey: ["nav"] }),
        )
        .on("postgres_changes", { event: "*", schema: "public", table: "blog_posts" }, () =>
          qc.invalidateQueries({ queryKey: ["blog"] }),
        )
        .on("postgres_changes", { event: "*", schema: "public", table: "product_reviews" }, () => {
          qc.invalidateQueries({ queryKey: ["reviews"] });
          qc.invalidateQueries({ queryKey: ["admin", "reviews"] });
        })
        .subscribe();
    } catch {
      // supabase not configured yet — ignore
    }

    let authSub: { unsubscribe: () => void } | null = null;
    try {
      const { data } = supabase.auth.onAuthStateChange((event) => {
        if (event !== "SIGNED_IN" && event !== "SIGNED_OUT" && event !== "USER_UPDATED") return;
        router.invalidate();
        if (event !== "SIGNED_OUT") qc.invalidateQueries();
      });
      authSub = data.subscription;
    } catch {
      // ignore
    }

    return () => {
      if (ch) {
        try {
          supabase.removeChannel(ch);
        } catch {
          /* noop */
        }
      }
      authSub?.unsubscribe();
    };
  }, [qc, router]);
  return null;
}

function VisitorTracker() {
  const router = useRouter();
  useEffect(() => {
    if (typeof window === "undefined") return;
    trackVisit(window.location.pathname);
    const leavePresence = joinLivePresence();
    const unsub = router.subscribe("onResolved", (evt) => {
      const p = evt.toLocation?.pathname ?? window.location.pathname;
      trackVisit(p);
    });
    return () => {
      unsub();
      leavePresence();
    };
  }, [router]);
  return null;
}

function ScrollToTop() {
  const router = useRouter();
  useEffect(() => {
    if (typeof window === "undefined") return;
    // Disable browser scroll restoration so we always land at the top
    // on route change (SPA nav + skeleton -> content swap).
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
    const unsub = router.subscribe("onBeforeLoad", () => {
      window.scrollTo(0, 0);
    });
    return () => unsub();
  }, [router]);
  return null;
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <RealtimeSync />
      <VisitorTracker />
      <ScrollToTop />
      <ScrollReveal />
      <Outlet />
      <Toaster position="top-center" richColors />
    </QueryClientProvider>
  );
}
