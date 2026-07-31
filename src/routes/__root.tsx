import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import type { ReactNode } from "react";

import appCss from "../styles.css?url";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { FloatingWhatsApp } from "@/components/common/WhatsAppButton";
import { siteConfig } from "@/config/site";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";

function NotFoundComponent() {
  return (
    <div className="container-content flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <p className="eyebrow text-action">Erro 404</p>
      <h1 className="mt-3 text-3xl font-bold text-road sm:text-4xl">Página não encontrada</h1>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
        O endereço acessado não existe ou foi movido. Você pode voltar ao início ou falar
        diretamente sobre sua operação.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button asChild variant="institutional" size="lg">
          <Link to="/">Voltar ao início</Link>
        </Button>
        <Button asChild variant="quiet" size="lg">
          <Link to="/diagnostico">Analisar minha operação</Link>
        </Button>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="container-content flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <h1 className="text-2xl font-bold text-road">Esta página não carregou</h1>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
        Algo falhou do nosso lado. Tente novamente ou volte ao início.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button
          variant="institutional"
          size="lg"
          onClick={() => {
            router.invalidate();
            reset();
          }}
        >
          Tentar novamente
        </Button>
        <Button asChild variant="quiet" size="lg">
          <a href="/">Ir para o início</a>
        </Button>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: siteConfig.title },
      { name: "description", content: siteConfig.description },
      { name: "author", content: siteConfig.legalName },
      { property: "og:site_name", content: siteConfig.siteName },
      { property: "og:type", content: "website" },
      { property: "og:locale", content: "pt_BR" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "theme-color", content: "#071A2F" },
      { property: "og:title", content: siteConfig.title },
      { name: "twitter:title", content: siteConfig.title },
      { property: "og:description", content: siteConfig.description },
      { name: "twitter:description", content: siteConfig.description },
      { property: "og:image", content: "/og-image.webp" },
      { name: "twitter:image", content: "/og-image.webp" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Roboto+Condensed:wght@400;600;700&display=swap",
      },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Person",
          name: "Christiano Tadeu",
          jobTitle: "Consultor de vendas de caminhões Volkswagen",
          description: siteConfig.description,
          slogan: siteConfig.signature,
          knowsAbout: [
            "Caminhões Volkswagen",
            "Transporte rodoviário de cargas",
            "Financiamento de veículos pesados",
          ],
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
    <html lang="pt-BR">
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

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <a
        href="#conteudo-principal"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-md focus:bg-road focus:px-4 focus:py-2 focus:text-sm focus:text-road-foreground"
      >
        Ir para o conteúdo principal
      </a>
      <div className="flex min-h-screen flex-col">
        <Header />
        <main id="conteudo-principal" className="flex-1">
          {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
          <Outlet />
        </main>
        <Footer />
      </div>
      <FloatingWhatsApp />
      <Toaster />
    </QueryClientProvider>
  );
}
