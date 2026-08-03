import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { BookmarksProvider } from "@/lib/bookmarks-context";
import { ArticleBookmarkButton } from "@/components/article-bookmark-button";
import CommentSection from "@/components/CommentSection";
import { crimeTypeLabels, crimeTypeColors, articleTypeLabels } from "@/lib/data";
import { cn, formatDate, tierBadge } from "@/lib/utils";
import { ExternalLink, ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { Article } from "@/lib/types";
import type { Metadata } from "next";

interface Props {
  params: { id: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const supabase = createClient();
  const { data } = await supabase
    .from("articles")
    .select("title, summary")
    .eq("id", params.id)
    .single();
  if (!data) return {};
  return {
    title: `${data.title} | Dirty Paintbrushes`,
    description: (data.summary ?? "").slice(0, 160),
  };
}

export default async function ArticlePage({ params }: Props) {
  const supabase = createClient();
  const { data } = await supabase
    .from("articles")
    .select("*")
    .eq("id", params.id)
    .single();

  if (!data) notFound();
  const article = data as Article;

  const primaryCrime = article.crime_types?.[0];
  const crimeColors  = primaryCrime ? (crimeTypeColors[primaryCrime] ?? { bg: "bg-secondary", text: "text-muted-foreground" }) : null;
  const crimeLabel   = primaryCrime ? (crimeTypeLabels[primaryCrime] ?? primaryCrime.replace(/_/g, " ")) : null;
  const typeLabel    = article.article_type ? (articleTypeLabels[article.article_type] ?? article.article_type) : null;
  const { label: tierLabel, className: tierClass } = tierBadge(article.source_tier);

  return (
    <BookmarksProvider>
      <div className="min-h-screen flex flex-col">
        <Navigation />

        <main className="flex-1 px-6 lg:px-8 py-12 lg:py-16">
          <div className="max-w-3xl mx-auto">

            <Link
              href="/feed"
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-10 transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to feed
            </Link>

            <article>
              {/* Meta */}
              <div className="flex flex-wrap items-center gap-3 mb-6">
                <span className={cn("text-xs font-semibold px-1.5 py-0.5 uppercase tracking-wider", tierClass)}>
                  {tierLabel}
                </span>
                <span className="text-sm text-muted-foreground">{article.source_name}</span>
                {article.published_date && (
                  <>
                    <span className="text-muted-foreground select-none">·</span>
                    <span className="text-sm text-muted-foreground">{formatDate(article.published_date)}</span>
                  </>
                )}
              </div>

              {/* Title */}
              <h1 className="text-3xl lg:text-4xl font-serif font-normal leading-tight text-foreground mb-8 max-w-2xl">
                {article.title}
              </h1>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-8 pb-8 border-b border-border">
                {crimeLabel && crimeColors && (
                  <span className={cn("inline-flex items-center px-2 py-0.5 rounded-[2px] text-xs font-medium", crimeColors.bg, crimeColors.text)}>
                    {crimeLabel}
                  </span>
                )}
                {typeLabel && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-[2px] bg-indigo-pale text-indigo text-xs font-medium">
                    {typeLabel}
                  </span>
                )}
                {article.crime_types?.slice(1).map((ct) => {
                  const col = crimeTypeColors[ct] ?? { bg: "bg-indigo-pale", text: "text-indigo" };
                  const lbl = crimeTypeLabels[ct] ?? ct.replace(/_/g, " ");
                  return (
                    <span key={ct} className={cn("inline-flex items-center px-2 py-0.5 rounded-[2px] text-xs font-medium", col.bg, col.text)}>
                      {lbl}
                    </span>
                  );
                })}
              </div>

              {/* Summary */}
              {article.summary && (
                <p className="text-base lg:text-lg text-foreground leading-relaxed mb-8">
                  {article.summary}
                </p>
              )}

              {/* Editor note */}
              {article.editor_note && (
                <div className="border-l-2 border-foreground pl-5 py-1 mb-8">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                    Editor&apos;s note
                  </p>
                  <p className="text-sm text-foreground leading-relaxed">{article.editor_note}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-wrap items-center gap-3 pt-8 border-t border-border">
                <a
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-foreground text-background text-sm font-medium hover:opacity-80 transition-opacity"
                >
                  <ExternalLink className="h-4 w-4" />
                  Read original
                </a>
                <ArticleBookmarkButton articleId={article.id} />
              </div>
            </article>

            {/* Entity types */}
            {article.entity_types && article.entity_types.length > 0 && (
              <div className="mt-12 pt-10 border-t border-border">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
                  Entities involved
                </p>
                <div className="flex flex-wrap gap-2">
                  {article.entity_types.map((type) => (
                    <span
                      key={type}
                      className="px-3 py-1.5 bg-secondary border border-border text-sm text-secondary-foreground"
                    >
                      {type.replace(/_/g, " ")}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <CommentSection articleId={article.id} />
          </div>
        </main>

        <Footer />
      </div>
    </BookmarksProvider>
  );
}
