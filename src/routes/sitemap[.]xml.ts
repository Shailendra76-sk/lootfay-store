import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { generateSlug } from "@/lib/slug";

const BASE_URL = "https://lootbazaar.in"; // Update to your actual production domain

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        // 1. Fetch static pages
        const entries: { path: string; changefreq: string; priority: string }[] = [
          { path: "/", changefreq: "daily", priority: "1.0" },
          { path: "/categories", changefreq: "weekly", priority: "0.8" },
          { path: "/blog", changefreq: "weekly", priority: "0.7" },
        ];

        // 2. Fetch all products for dynamic PDP URLs
        const { data: products } = await supabaseAdmin
          .from("amazon_products")
          .select("id, title")
          .order("id", { ascending: true });

        if (products) {
          products.forEach((p) => {
            entries.push({
              path: `/product/${generateSlug(p.title, p.id)}`,
              changefreq: "weekly",
              priority: "0.8",
            });
          });
        }

        // 3. Generate XML
        const urls = entries.map((e) =>
          [
            `  <url>`,
            `    <loc>${BASE_URL}${e.path}</loc>`,
            `    <changefreq>${e.changefreq}</changefreq>`,
            `    <priority>${e.priority}</priority>`,
            `  </url>`,
          ].join("\n"),
        );

        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
          ...urls,
          `</urlset>`,
        ].join("\n");

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml",
            "Cache-Control": "public, max-age=3600", // Cache for 1 hour
          },
        });
      },
    },
  },
});
