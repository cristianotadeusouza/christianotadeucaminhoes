import { createFileRoute, notFound } from "@tanstack/react-router";

import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { CTASection } from "@/components/common/CTASection";
import { ImagePlaceholder } from "@/components/media/ImagePlaceholder";
import { contentCategoryLabels } from "@/data/content-posts";
import { whatsappMessages } from "@/services/whatsapp";
import { contentRepository } from "@/services/repositories";

export const Route = createFileRoute("/conteudos/$slug")({
  loader: async ({ params }) => {
    const post = await contentRepository.getBySlug(params.slug);
    if (!post || !post.isPublished) throw notFound();
    return { post };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Conteúdo indisponível" }, { name: "robots", content: "noindex" }],
      };
    }
    const { post } = loaderData;
    return {
      meta: [
        { title: post.title },
        { name: "description", content: post.description },
        { property: "og:title", content: post.title },
        { property: "og:description", content: post.description },
        { property: "og:type", content: "article" },
      ],
    };
  },
  component: ContentDetail,
});

function ContentDetail() {
  const { post } = Route.useLoaderData();

  return (
    <>
      <article className="container-content py-10 sm:py-14">
        <Breadcrumbs
          items={[
            { label: "Início", to: "/" },
            { label: "Conteúdos", to: "/conteudos" },
            { label: post.title },
          ]}
        />

        <header className="mt-8 max-w-3xl">
          <p className="eyebrow text-engineering">{contentCategoryLabels[post.category]}</p>
          <h1 className="mt-3 text-3xl font-bold text-road sm:text-4xl">{post.title}</h1>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            {post.description}
          </p>
          <p className="text-technical mt-4 text-xs text-muted-foreground">
            {post.author} ·{" "}
            <time dateTime={post.publishedAt}>
              {new Date(post.publishedAt).toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}
            </time>{" "}
            · {post.readingMinutes} min de leitura
          </p>
        </header>

        <ImagePlaceholder priority slot={post.cover} className="mt-8" />

        <div className="mt-10 max-w-3xl space-y-5">
          {post.body.map((block, index) => {
            if (block.type === "heading") {
              return (
                <h2 key={index} className="pt-4 text-xl font-semibold text-road sm:text-2xl">
                  {block.text}
                </h2>
              );
            }
            if (block.type === "list") {
              return (
                <ul key={index} className="space-y-2 text-base leading-relaxed text-foreground">
                  {(block.items ?? []).map((item) => (
                    <li key={item} className="flex gap-3">
                      <span aria-hidden="true" className="mt-3 h-px w-3 shrink-0 bg-action" />
                      {item}
                    </li>
                  ))}
                </ul>
              );
            }
            return (
              <p key={index} className="text-base leading-relaxed text-foreground">
                {block.text}
              </p>
            );
          })}
        </div>
      </article>

      <CTASection
        title="Quer aplicar isso à sua operação?"
        message={whatsappMessages.content(post.title)}
        context={{ placement: "content_cta", slug: post.slug }}
      />
    </>
  );
}
