import { createFileRoute } from "@tanstack/react-router";

import { siteConfig } from "@/config/site";
import { publishedPosts } from "@/data/content-posts";
import { inventoryItems } from "@/data/inventory";
import { truckFamilies } from "@/data/truck-families";

const staticPaths = [
  "/",
  "/sobre",
  "/caminhoes",
  "/operacoes",
  "/oportunidades",
  "/financiamento",
  "/entregas",
  "/conteudos",
  "/diagnostico",
  "/contato",
  "/privacidade",
] as const;

function escapeXml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const requestOrigin = new URL(request.url).origin;
        const origin = (siteConfig.siteUrl || requestOrigin).replace(/\/$/, "");
        const paths = [
          ...staticPaths,
          ...truckFamilies.map((family) => `/caminhoes/${family.slug}`),
          ...publishedPosts.map((post) => `/conteudos/${post.slug}`),
          ...inventoryItems
            .filter((item) => !item.isDemo)
            .map((item) => `/oportunidades/${item.id}`),
        ];

        const urls = [...new Set(paths)].map(
          (path) => `  <url><loc>${escapeXml(`${origin}${path}`)}</loc></url>`,
        );
        const body = [
          '<?xml version="1.0" encoding="UTF-8"?>',
          '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
          ...urls,
          "</urlset>",
        ].join("\n");

        return new Response(body, {
          headers: {
            "Content-Type": "application/xml; charset=utf-8",
            "Cache-Control": "public, max-age=3600, s-maxage=86400",
          },
        });
      },
    },
  },
});
