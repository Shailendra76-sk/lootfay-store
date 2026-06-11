import { createFileRoute } from "@tanstack/react-router";
import { CATEGORIES, Category } from "@/lib/sync-products.server";
import { rotateCategoryProducts } from "@/lib/rotate-category.server";

function checkCronSecret(request: Request): Response | null {
  const expected = process.env.CRON_SECRET;
  if (!expected) {
    return new Response(JSON.stringify({ error: "CRON_SECRET not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
  const header = request.headers.get("x-cron-secret");
  if (!header || header !== expected) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }
  return null;
}

export const Route = createFileRoute("/api/public/hooks/sync-category")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const unauthorized = checkCronSecret(request);
        if (unauthorized) return unauthorized;

        let body: any = {};
        try {
          body = await request.json();
        } catch {
          /* allow empty body */
        }
        const url = new URL(request.url);
        const cat = (body?.category ?? url.searchParams.get("category")) as Category | null;
        if (!cat || !CATEGORIES.includes(cat)) {
          return new Response(
            JSON.stringify({ error: "Missing or invalid `category`" }),
            { status: 400, headers: { "Content-Type": "application/json" } },
          );
        }
        try {
          const result = await rotateCategoryProducts(cat);
          return new Response(JSON.stringify(result), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        } catch (e: any) {
          return new Response(
            JSON.stringify({ error: e?.message ?? "Sync failed" }),
            { status: 500, headers: { "Content-Type": "application/json" } },
          );
        }
      },
    },
  },
});
