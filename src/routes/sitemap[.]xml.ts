import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/database-types";

const BASE = "https://meenucollection.in";

type Entry = { path: string; lastmod?: string; changefreq?: string; priority?: string };

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const url = process.env.SUPABASE_URL;
        const anon = process.env.SUPABASE_PUBLISHABLE_KEY;
        const today = new Date().toISOString().slice(0, 10);

        const entries: Entry[] = [
          { path: "/", changefreq: "daily", priority: "1.0", lastmod: today },
          { path: "/products", changefreq: "daily", priority: "0.9", lastmod: today },
          { path: "/bedsheets", changefreq: "weekly", priority: "0.9", lastmod: today },
          { path: "/men-shirts", changefreq: "weekly", priority: "0.9", lastmod: today },
          { path: "/nighty", changefreq: "weekly", priority: "0.9", lastmod: today },
          { path: "/blog", changefreq: "weekly", priority: "0.7", lastmod: today },
          { path: "/faq", changefreq: "monthly", priority: "0.6" },
          { path: "/about", changefreq: "monthly", priority: "0.6" },
          { path: "/contact", changefreq: "monthly", priority: "0.6" },
          { path: "/trust", changefreq: "monthly", priority: "0.5" },
          { path: "/shipping-policy", changefreq: "yearly", priority: "0.4" },
          { path: "/return-refund", changefreq: "yearly", priority: "0.4" },
          { path: "/privacy", changefreq: "yearly", priority: "0.3" },
          { path: "/terms", changefreq: "yearly", priority: "0.3" },
        ];

        if (url && anon) {
          const sb = createClient<Database>(url, anon, { auth: { persistSession: false, autoRefreshToken: false } });
          const [prodsRes, colsRes, blogRes] = await Promise.all([
            sb.from("products").select("slug, updated_at"),
            sb.from("collections").select("slug, updated_at"),
            sb.from("blog_posts").select("slug, updated_at").eq("published", true),
          ]);
          for (const p of (prodsRes.data ?? []) as { slug: string; updated_at: string | null }[]) {
            entries.push({ path: `/products/${p.slug}`, changefreq: "weekly", priority: "0.8", lastmod: (p.updated_at ?? "").slice(0, 10) || today });
          }
          for (const c of (colsRes.data ?? []) as { slug: string; updated_at: string | null }[]) {
            entries.push({ path: `/collections/${c.slug}`, changefreq: "weekly", priority: "0.7", lastmod: (c.updated_at ?? "").slice(0, 10) || today });
          }
          if (!blogRes.error) {
            for (const b of (blogRes.data ?? []) as { slug: string; updated_at: string | null }[]) {
              entries.push({ path: `/blog/${b.slug}`, changefreq: "monthly", priority: "0.6", lastmod: (b.updated_at ?? "").slice(0, 10) || today });
            }
          }
        }

        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
          ...entries.map((e) =>
            [
              `  <url>`,
              `    <loc>${BASE}${e.path}</loc>`,
              e.lastmod ? `    <lastmod>${e.lastmod}</lastmod>` : "",
              e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : "",
              e.priority ? `    <priority>${e.priority}</priority>` : "",
              `  </url>`,
            ].filter(Boolean).join("\n"),
          ),
          `</urlset>`,
        ].join("\n");

        return new Response(xml, { headers: { "Content-Type": "application/xml", "Cache-Control": "public, max-age=3600" } });
      },
    },
  },
});
