import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { BookmarksProvider } from "@/lib/bookmarks-context";
import { ArticleBookmarkButton } from "@/components/article-bookmark-button";
import { OvalOutline } from "@/components/OvalOutline";
import CommentSection from "@/components/CommentSection";
import { crimeTypeLabels, crimeTypeColors, articleTypeLabels } from "@/lib/data";
import { cn, formatDate, formatSource } from "@/lib/utils";
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
  const title = `${data.title} | Dirty Paintbrushes`;
  const description = (data.summary ?? "").slice(0, 160);
  return {
    title,
    description,
    openGraph: { title, description, type: "article" },
    twitter: { card: "summary_large_image", title, description },
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

  // Shared between the mobile and desktop paper wrappers below — same
  // content, two different backgrounds underneath it.
  const articleContent = (
    <>
      <article>
        {/* Meta */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <span className="text-sm text-muted-foreground">{formatSource(article)}</span>
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
            className="btn-oval relative inline-flex items-center justify-center gap-2 px-12 py-5 text-sm font-medium"
          >
            <OvalOutline />
            <ExternalLink className="relative h-4 w-4" />
            <span className="relative">Read original</span>
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
    </>
  );

  return (
    <BookmarksProvider>
      <div className="min-h-screen flex flex-col">
        <Navigation />

        <main className="flex-1 px-6 lg:px-8 py-12 lg:py-16">
          <div className="max-w-3xl mx-auto">

            <Link
              href="/feed"
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-10 transition-colors animate-fade-in-up"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to feed
            </Link>

            {/* Article "page" — laid on a photographed ring-punched sheet
                instead of the plain page background. The sheet's six
                punched holes are genuinely transparent in the source
                image (not opaque white circles), so there's no fill color
                behind it on purpose — the site's own parchment shows
                through them, the way it would through a real hole-punched
                page.
                Two renders of the same content below, swapped by
                breakpoint (md = 768px):
                — Mobile: a single fixed-aspect photo doesn't have enough
                height at narrow widths before content runs past its
                bottom edge, so the sheet is sliced into three pieces —
                note-page-top.webp (holes 1-3), note-page-mid.webp (a
                plain, seamlessly-repeatable strip from the photo's own
                blank middle), note-page-bottom.webp (holes 4-6) — stacked
                in a flex column with the middle tile set to flex-1 and
                repeat-y. That column is absolutely positioned (inset-0)
                behind the content, which stays in normal flow, so the
                *content's own height* drives the box's height and the
                paper always stretches to match: holes 1-3 at the true
                top, holes 4-6 at the true bottom, any article length.
                — Desktop: reverts to the original single photographed
                sheet at its own fixed aspect ratio (note-page.webp),
                unstretched. */}
            <div className="md:hidden relative mx-auto animate-fade-in-up" style={{ width: "min(660px, 85vw)", animationDelay: "100ms" }}>
              <div className="absolute inset-0 flex flex-col" aria-hidden="true">
                <img
                  src="/note-page-top.webp"
                  alt=""
                  className="block w-full h-auto shrink-0 select-none pointer-events-none"
                />
                <div
                  className="flex-1 bg-repeat-y"
                  style={{ backgroundImage: "url(/note-page-mid.webp)", backgroundSize: "100% auto" }}
                />
                <img
                  src="/note-page-bottom.webp"
                  alt=""
                  className="block w-full h-auto shrink-0 select-none pointer-events-none"
                />
              </div>
              <div
                className="relative"
                style={{ paddingLeft: "10%", paddingRight: "7%", paddingTop: "6%", paddingBottom: "3rem" }}
              >
                {articleContent}
              </div>
            </div>

            <div
              className="hidden md:block relative mx-auto animate-fade-in-up"
              style={{
                width: "min(660px, 85vw)",
                minHeight: "calc(min(660px, 85vw) * 1420 / 1095)",
                animationDelay: "100ms",
              }}
            >
              <img
                src="/note-page.webp"
                alt=""
                aria-hidden="true"
                className="absolute left-0 top-0 block w-full h-auto select-none pointer-events-none"
              />
              <div
                className="relative"
                style={{ paddingLeft: "10%", paddingRight: "7%", paddingTop: "6%", paddingBottom: "3rem" }}
              >
                {articleContent}
              </div>
            </div>

            <CommentSection articleId={article.id} />
          </div>
        </main>

        <Footer />
      </div>
    </BookmarksProvider>
  );
}
