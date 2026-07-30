import { Link } from "@tanstack/react-router";
import type { ContentPost } from "@/types";
import { ImagePlaceholder } from "@/components/media/ImagePlaceholder";
import { contentCategoryLabels } from "@/data/content-posts";

export function ContentCard({ post }: { post: ContentPost }) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-lg border border-border bg-card shadow-card transition-shadow hover:shadow-raised">
      <ImagePlaceholder slot={post.cover} className="rounded-none" />
      <div className="flex flex-1 flex-col p-5">
        <p className="eyebrow text-engineering">{contentCategoryLabels[post.category]}</p>
        <h3 className="mt-2 text-lg font-semibold text-road">
          <Link to="/conteudos/$slug" params={{ slug: post.slug }} className="hover:underline">
            {post.title}
          </Link>
        </h3>
        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
          {post.description}
        </p>
        <p className="text-technical mt-4 text-xs text-muted-foreground">
          <time dateTime={post.publishedAt}>
            {new Date(post.publishedAt).toLocaleDateString("pt-BR", {
              day: "2-digit",
              month: "long",
              year: "numeric",
            })}
          </time>
          {" · "}
          {post.readingMinutes} min de leitura
        </p>
      </div>
    </article>
  );
}
