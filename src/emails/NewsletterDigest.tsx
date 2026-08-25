import {
  Body,
  Container,
  Font,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import { articleTypeLabels } from "@/lib/data";

// Every value below is pulled from the site's actual tokens, not
// approximated — src/app/globals.css (:root custom properties) for color,
// src/app/layout.tsx (next/font declarations) for the font each CSS
// variable resolves to. Kept as literals rather than CSS vars because
// email clients render this HTML standalone, with no access to the site's
// stylesheet — but every hex/font-family here has a named source of truth.
const TOKENS = {
  indigo: "#354A89", // --indigo — header band, matches nav/logo
  lightBlue: "#CFE6F0", // --light-blue — main body + footer band, same as the homepage's "Latest Intelligence" section
  lightBlueBorder: "#C9D4D9", // globals.css .bg-light-blue's --border override — the cool-toned hairline for this background
  agedVellum: "#E6E2C5", // --aged-vellum — hero/header text on the indigo band
  oxblood: "#65322C", // --oxblood — FadeInHeading's heading color site-wide
  inkBlack: "#1A1A1A", // --foreground — article titles, body text
  indigoText: "#354A89", // --indigo — crime-type tag color in ArticleRow; also the nav wordmark's color on light backgrounds
  ochreOnLight: "#775E2C", // --ochre-on-light — article-type tag color in ArticleRow (base ochre fails contrast as text)
  mutedForeground: "#5C5C5C", // --muted-foreground — source/date metadata
};

// --font-serif (layout.tsx: Instrument Serif, 400) — HomeHero's exact
// treatment: text-4xl/5xl font-serif italic font-normal text-aged-vellum.
const FONT_SERIF = "'Instrument Serif', Georgia, serif";
// --font-headline (layout.tsx: Archivo, 600/700) — same face every
// FadeInHeading on the live site (Feed's "Latest News", About, Sources) uses.
const FONT_HEADLINE = "'Archivo', Arial, sans-serif";
// --font-title (layout.tsx: Lora, 400/500) — ArticleRow's title font inside
// list rows on /feed and the homepage.
const FONT_TITLE = "'Lora', Georgia, serif";
// --font-body (layout.tsx: Roboto) — body copy, metadata, everything scanned.
const FONT_BODY = "'Roboto', ui-sans-serif, sans-serif";

// Baked into the rendered HTML as literal text and swapped for a real,
// per-subscriber link at send time (src/app/api/newsletter/send) — the
// draft is rendered once and stored, not re-rendered per recipient.
export const UNSUBSCRIBE_PLACEHOLDER = "%%UNSUBSCRIBE_URL%%";

export interface NewsletterArticle {
  id: string;
  title: string;
  source_name: string;
  published_date: string | null;
  article_type: string | null;
}

export interface NewsletterGroup {
  label: string;
  articles: NewsletterArticle[];
}

interface NewsletterDigestProps {
  periodLabel: string; // e.g. "August 2026"
  groups: NewsletterGroup[];
  siteUrl?: string;
  unsubscribeUrl?: string;
}

function formatDate(dateString: string | null) {
  if (!dateString) return null;
  return new Date(dateString).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });
}

export default function NewsletterDigest({
  periodLabel,
  groups,
  siteUrl = "https://dirtypaintbrushes.com",
  unsubscribeUrl = UNSUBSCRIBE_PLACEHOLDER,
}: NewsletterDigestProps) {
  return (
    <Html>
      <Head>
        <Font
          fontFamily="Instrument Serif"
          fallbackFontFamily="Georgia"
          webFont={{
            url: "https://fonts.gstatic.com/s/instrumentserif/v5/jizHRFtNs2ka5fXjeivQ4LroWlx-6zATiw.ttf",
            format: "truetype",
          }}
          fontStyle="italic"
          fontWeight={400}
        />
        <Font
          fontFamily="Archivo"
          fallbackFontFamily="Arial"
          webFont={{
            url: "https://fonts.gstatic.com/s/archivo/v25/k3k6o8UDI-1M0wlSV9XAw6lQkqWY8Q82sJaRE-NWIDdgffTT6jRp8A.ttf",
            format: "truetype",
          }}
          fontStyle="normal"
          fontWeight={600}
        />
        <Font
          fontFamily="Lora"
          fallbackFontFamily="Georgia"
          webFont={{
            url: "https://fonts.gstatic.com/s/lora/v37/0QI6MX1D_JOuGQbT0gvTJPa787weuyJG.ttf",
            format: "truetype",
          }}
          fontStyle="normal"
          fontWeight={400}
        />
        <Font
          fontFamily="Roboto"
          fallbackFontFamily="sans-serif"
          webFont={{
            url: "https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Mu4mxK.woff2",
            format: "woff2",
          }}
          fontStyle="normal"
          fontWeight={400}
        />
      </Head>
      <Preview>Dirty Paintbrushes: {periodLabel} digest</Preview>
      <Body style={{ backgroundColor: TOKENS.lightBlue, margin: 0, padding: 0 }}>
        <Container style={{ maxWidth: 600, margin: "0 auto" }}>
          {/* 1. Header band — navy, wordmark + issue date. Wordmark matches
              HomeHero.tsx exactly: text-4xl/5xl font-serif italic font-normal
              text-aged-vellum on bg-indigo. */}
          <Section style={{ backgroundColor: TOKENS.indigo, padding: "40px 40px 32px" }}>
            <Text
              style={{
                fontFamily: FONT_SERIF,
                fontStyle: "italic",
                fontWeight: 400,
                fontSize: 40,
                letterSpacing: "-0.01em",
                lineHeight: 1.1,
                color: TOKENS.agedVellum,
                margin: "0 0 8px",
              }}
            >
              Dirty Paintbrushes
            </Text>
            <Text
              style={{
                fontFamily: FONT_BODY,
                fontSize: 14,
                color: TOKENS.agedVellum,
                margin: 0,
                opacity: 0.85,
              }}
            >
              Monthly digest, {periodLabel} Edition
            </Text>
          </Section>

          {/* 2. Main body — light blue, same as the homepage's "Latest
              Intelligence" section, entries styled like ArticleRow on /feed */}
          <Section style={{ backgroundColor: TOKENS.lightBlue, padding: "32px 40px 8px" }}>
            {groups.length === 0 && (
              <Text style={{ fontFamily: FONT_BODY, fontSize: 14, color: TOKENS.mutedForeground }}>
                No new stories this month.
              </Text>
            )}

            {groups.map((group) => (
              <Section key={group.label} style={{ marginBottom: 28 }}>
                <Heading
                  as="h2"
                  style={{
                    fontFamily: FONT_HEADLINE,
                    fontWeight: 600,
                    fontSize: 20,
                    color: TOKENS.oxblood,
                    letterSpacing: "-0.01em",
                    margin: "0 0 14px",
                    paddingBottom: 8,
                    borderBottom: `1px solid ${TOKENS.lightBlueBorder}`,
                  }}
                >
                  {group.label}
                </Heading>
                {group.articles.map((article) => {
                  const date = formatDate(article.published_date);
                  const typeLabel = article.article_type
                    ? articleTypeLabels[article.article_type] ?? article.article_type
                    : null;
                  return (
                    <Section
                      key={article.id}
                      style={{
                        marginBottom: 16,
                        paddingBottom: 16,
                        borderBottom: `1px solid ${TOKENS.lightBlueBorder}`,
                      }}
                    >
                      <Link
                        href={`${siteUrl}/articles/${article.id}`}
                        style={{
                          fontFamily: FONT_TITLE,
                          fontWeight: 400,
                          fontSize: 16,
                          color: TOKENS.inkBlack,
                          textDecoration: "none",
                          lineHeight: 1.4,
                        }}
                      >
                        {article.title}
                      </Link>
                      <Text style={{ margin: "6px 0 0" }}>
                        {typeLabel && (
                          <span
                            style={{
                              fontFamily: FONT_BODY,
                              fontStyle: "italic",
                              fontWeight: 500,
                              fontSize: 12,
                              color: TOKENS.ochreOnLight,
                            }}
                          >
                            {typeLabel}
                            {"  ·  "}
                          </span>
                        )}
                        <span style={{ fontFamily: FONT_BODY, fontSize: 12, color: TOKENS.mutedForeground }}>
                          {article.source_name}
                          {date ? ` · ${date}` : ""}
                        </span>
                      </Text>
                    </Section>
                  );
                })}
              </Section>
            ))}
          </Section>

          {/* 3. Footer band — light blue, sender + contact + unsubscribe.
              Same field as the body above it, so a hairline (the light-blue
              section's own border override, globals.css .bg-light-blue)
              marks the seam instead of a color change. */}
          <Section
            style={{
              backgroundColor: TOKENS.lightBlue,
              padding: "24px 40px 32px",
              borderTop: `1px solid ${TOKENS.lightBlueBorder}`,
            }}
          >
            {/* Wordmark matches footer.tsx exactly: text-sm font-serif
                font-semibold, not italic (italic Instrument Serif is
                reserved for the hero, per the Serif Scarcity Rule). Color is
                the one deviation from footer.tsx's literal text-aged-vellum
                — that token is tuned for text on the dark indigo ground
                footer.tsx actually sits on; on this light-blue ground it
                would fail contrast, so this uses indigo instead, the same
                substitution the nav wordmark makes on light backgrounds. */}
            <Text
              style={{
                fontFamily: FONT_SERIF,
                fontStyle: "normal",
                fontWeight: 600,
                fontSize: 14,
                color: TOKENS.indigoText,
                margin: "0 0 6px",
              }}
            >
              Dirty Paintbrushes
            </Text>
            <Text
              style={{
                fontFamily: FONT_BODY,
                fontSize: 12,
                color: TOKENS.mutedForeground,
                margin: "0 0 4px",
                lineHeight: 1.6,
              }}
            >
              You&apos;re receiving this because you subscribed to the monthly digest.{" "}
              <Link
                href="mailto:astriddrw@gmail.com"
                style={{ color: TOKENS.indigoText, textDecoration: "underline" }}
              >
                Contact
              </Link>
            </Text>
            <Link
              href={unsubscribeUrl}
              style={{
                fontFamily: FONT_BODY,
                fontSize: 12,
                color: TOKENS.indigoText,
              }}
            >
              Unsubscribe
            </Link>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
