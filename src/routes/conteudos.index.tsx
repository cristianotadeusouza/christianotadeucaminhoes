import { createFileRoute } from "@tanstack/react-router";

import type { ContentPost } from "@/types";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { SectionHeader } from "@/components/common/SectionHeader";
import { CTASection } from "@/components/common/CTASection";
import { EmptyState } from "@/components/common/EmptyState";
import { ContentCard } from "@/components/cards/ContentCard";
import { contentRepository } from "@/services/repositories";

const title = "Conteúdos sobre operação e escolha de caminhão";
const description =
  "Textos consultivos sobre escolha de configuração, operação de frota, manutenção, produtividade e financiamento de caminhões.";

export const Route = createFileRoute("/conteudos/")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  loader: async () => ({ posts: await contentRepository.list() }),
  component: ContentIndex,
});

function ContentIndex() {
  const { posts } = Route.useLoaderData();

  return (
    <>
      <section className="border-b border-border bg-surface py-10 sm:py-14">
        <div className="container-content">
          <Breadcrumbs items={[{ label: "Início", to: "/" }, { label: "Conteúdos" }]} />
          <SectionHeader
            as="h1"
            className="mt-6 max-w-3xl"
            eyebrow="Conteúdos"
            title="Material para decidir com critério"
            description="Sem promessa de número e sem dado inventado: apenas o raciocínio que costuma levar a uma boa decisão de compra."
          />
        </div>
      </section>

      <section className="container-content py-14 sm:py-20">
        <h2 className="sr-only">Conteúdos publicados</h2>
        {posts.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post: ContentPost) => (
              <ContentCard key={post.slug} post={post} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="Conteúdos em produção"
            description="Os primeiros textos serão publicados em breve."
          />
        )}
      </section>

      <CTASection />
    </>
  );
}
