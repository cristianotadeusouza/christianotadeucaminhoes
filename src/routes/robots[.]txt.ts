import { createFileRoute } from "@tanstack/react-router";

import { siteConfig } from "@/config/site";

export const Route = createFileRoute("/robots.txt")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const requestOrigin = new URL(request.url).origin;
        const origin = (siteConfig.siteUrl || requestOrigin).replace(/\/$/, "");
        const body = [
          "User-agent: *",
          "Allow: /",
          "Disallow: /painel",
          "",
          `Sitemap: ${origin}/sitemap.xml`,
          "",
        ].join("\n");

        return new Response(body, {
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Cache-Control": "public, max-age=3600, s-maxage=86400",
          },
        });
      },
    },
  },
});
