import {
  Body,
  Button,
  Column,
  Container,
  Head,
  Html,
  Img,
  Link,
  Preview,
  Row,
  Section,
  Text,
} from "@react-email/components";
import { articleTypeLabels, crimeTypeLabels } from "@/lib/data";
import { CONTACT_EMAIL } from "@/lib/contact";
import { DEFAULT_EDITOR_NOTE } from "@/lib/newsletter-slots";

// Layout follows the founder's Canva template ("The Monthly Briefing"):
// link bar → cobalt masthead → sink hero photo → editor's note → story
// list → "Find out more" → paintbrush jar + subscribe → cobalt footer.
// Colors are the site's tokens (DESIGN.md / globals.css), kept as literals
// because email clients render this HTML with no access to the stylesheet.
const TOKENS = {
  cobalt: "#334EAC", // Broadsheet Cobalt — masthead, footer, headings, CTA
  archiveBlue: "#CFE6F0", // Archive Blue — the page field
  agedPaper: "#FFEDBB", // Aged Paper — text on cobalt
  footerText: "#D4EAFF", // Canva footer text on cobalt
  sepia: "#544032", // Canva body-copy brown — reads warmer than black on archive blue
  driedBlood: "#65322C", // Dried Blood — subscribe button, section kickers
  pillWash: "#B4D7FF", // Canva tag highlight on archive blue
  ochreOnLight: "#775E2C", // article-type label (AA on light grounds)
  rule: "#8FA9B5", // hairline on archive blue
  outerField: "#F0F1F5", // canvas around the 600px card, as in Canva
};

const FONT_SERIF = "'Instrument Serif', Georgia, 'Times New Roman', serif";
const FONT_BODY = "Arial, Helvetica, sans-serif";

// Baked into the rendered HTML as literal text and swapped for a real,
// per-subscriber link at send time (src/app/api/newsletter/send) — the
// draft is rendered once and stored, not re-rendered per recipient.
export const UNSUBSCRIBE_PLACEHOLDER = "%%UNSUBSCRIBE_URL%%";

// Past this many stories a group collapses into a "more in the feed" link.
// Keeps the email under Gmail's ~102KB clip line (past which the footer
// and unsubscribe link get hidden behind "View entire message").
const MAX_PER_GROUP = 4;
const SUMMARY_MAX_CHARS = 220;

export interface NewsletterArticle {
  id: string;
  title: string;
  source_name: string;
  published_date: string | null;
  article_type: string | null;
  summary?: string | null;
  crime_types?: string[] | null;
}

export interface NewsletterGroup {
  key: string; // crime_type value, used for the /feed?crime= link
  label: string;
  articles: NewsletterArticle[];
}

export interface NewsletterDigestProps {
  periodLabel: string; // e.g. "October 2026"
  groups: NewsletterGroup[];
  leadStory?: NewsletterArticle | null;
  editionNumber?: number | null;
  editorNote?: string;
  feedRange?: { from: string; to: string }; // YYYY-MM-DD, for "more" links
  siteUrl?: string;
  unsubscribeUrl?: string;
}

function formatDate(dateString: string | null) {
  if (!dateString) return null;
  return new Date(dateString).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  });
}

function truncate(text: string, max: number) {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max);
  return `${cut.slice(0, cut.lastIndexOf(" ")).replace(/[,;:.\s]+$/, "")}…`;
}

function tagLine(article: NewsletterArticle) {
  const crime = article.crime_types?.[0] ? crimeTypeLabels[article.crime_types[0]] : null;
  const date = formatDate(article.published_date);
  return [crime, date].filter(Boolean).join(", ");
}

// Stacks the two-column rows on phones. Clients that strip <style> (a few
// webmail ones) just keep the side-by-side layout, which still fits 320px.
// A bare @font-face rather than React Email's <Font>, which also injects
// a global "* { font-family }" rule that turns every link serif. Clients
// that ignore web fonts (Gmail, Outlook) fall back to Georgia.
const RESPONSIVE_CSS = `
  @font-face {
    font-family: 'Instrument Serif';
    font-style: italic;
    font-weight: 400;
    src: url(https://fonts.gstatic.com/s/instrumentserif/v5/jizHRFtNs2ka5fXjeivQ4LroWlx-6zATiw.ttf) format('truetype');
  }
  @media (max-width: 600px) {
    .dp-card { width: 100% !important; }
    .dp-pad { padding-left: 20px !important; padding-right: 20px !important; }
    .dp-stack { display: block !important; width: 100% !important; text-align: left !important; }
    .dp-stack-gap { padding-top: 6px !important; }
    .dp-wordmark { font-size: 40px !important; }
  }
`;

function StoryBlock({
  article,
  siteUrl,
  lead = false,
}: {
  article: NewsletterArticle;
  siteUrl: string;
  lead?: boolean;
}) {
  const href = `${siteUrl}/articles/${article.id}`;
  const typeLabel = article.article_type
    ? articleTypeLabels[article.article_type] ?? article.article_type
    : null;
  const tags = tagLine(article);

  return (
    <Section style={{ margin: lead ? "0 0 8px" : "0 0 24px" }}>
      <Row>
        <Column className="dp-stack" style={{ verticalAlign: "top", width: "64%" }}>
          <Link
            href={href}
            style={{
              fontFamily: FONT_SERIF,
              fontStyle: "italic",
              fontSize: lead ? 30 : 22,
              lineHeight: 1.2,
              color: TOKENS.cobalt,
              textDecoration: "none",
            }}
          >
            {article.title}
          </Link>
        </Column>
        <Column
          className="dp-stack dp-stack-gap"
          style={{ verticalAlign: "top", width: "36%", textAlign: "right", paddingLeft: 16 }}
        >
          {tags && (
            <span
              style={{
                fontFamily: FONT_BODY,
                fontSize: 12,
                lineHeight: "20px",
                color: TOKENS.cobalt,
                backgroundColor: TOKENS.pillWash,
                padding: "2px 6px",
                whiteSpace: "nowrap",
              }}
            >
              {tags}
            </span>
          )}
        </Column>
      </Row>
      {article.summary && (
        <Text
          style={{
            fontFamily: FONT_BODY,
            fontSize: lead ? 15 : 14,
            lineHeight: "22px",
            color: TOKENS.sepia,
            margin: "10px 0 6px",
          }}
        >
          {truncate(article.summary, lead ? SUMMARY_MAX_CHARS + 120 : SUMMARY_MAX_CHARS)}
        </Text>
      )}
      <Text style={{ fontFamily: FONT_BODY, fontSize: 12, lineHeight: "18px", margin: 0, color: TOKENS.sepia }}>
        {typeLabel && (
          <span style={{ fontStyle: "italic", color: TOKENS.ochreOnLight }}>
            {typeLabel}
            {"  ·  "}
          </span>
        )}
        {article.source_name}
        {"  ·  "}
        <Link href={href} style={{ color: TOKENS.cobalt, textDecoration: "underline" }}>
          Read the story →
        </Link>
      </Text>
    </Section>
  );
}

function Hairline() {
  return (
    <Section style={{ margin: "8px 0 24px" }}>
      <Row>
        <Column style={{ height: 1, lineHeight: "1px", fontSize: 0, backgroundColor: TOKENS.rule }}>
          &nbsp;
        </Column>
      </Row>
    </Section>
  );
}

export default function NewsletterDigest({
  periodLabel,
  groups,
  leadStory = null,
  editionNumber = null,
  editorNote = DEFAULT_EDITOR_NOTE,
  feedRange,
  siteUrl = "https://dirtypaintbrushes.com",
  unsubscribeUrl = UNSUBSCRIBE_PLACEHOLDER,
}: NewsletterDigestProps) {
  const storyCount = groups.reduce((n, g) => n + g.articles.length, 0) + (leadStory ? 1 : 0);
  const editionLine = [periodLabel, editionNumber ? `Edition ${editionNumber}` : null]
    .filter(Boolean)
    .join(", ");
  const year = new Date().getUTCFullYear();
  const preview = leadStory
    ? `${periodLabel}: ${leadStory.title}`
    : `The Monthly Briefing, ${periodLabel}: ${storyCount} stories from the art market's underside`;

  const feedLink = (crime?: string) => {
    const params = new URLSearchParams();
    if (crime && crime !== "other") params.set("crime", crime);
    if (feedRange) {
      params.set("from", feedRange.from);
      params.set("to", feedRange.to);
    }
    const qs = params.toString();
    return `${siteUrl}/feed${qs ? `?${qs}` : ""}`;
  };

  return (
    <Html lang="en">
      <Head>
        <meta name="x-apple-disable-message-reformatting" />
        <meta name="format-detection" content="telephone=no, date=no, address=no, email=no" />
        <style>{RESPONSIVE_CSS}</style>
      </Head>
      <Preview>{preview}</Preview>
      <Body style={{ backgroundColor: TOKENS.outerField, margin: 0, padding: "24px 0" }}>
        <Container
          className="dp-card"
          style={{ width: 600, maxWidth: 600, margin: "0 auto", backgroundColor: TOKENS.archiveBlue }}
        >
          {/* 1. Link bar */}
          <Section className="dp-pad" style={{ padding: "20px 24px 16px" }}>
            <Row>
              <Column>
                <Link
                  href={siteUrl}
                  style={{ fontFamily: FONT_BODY, fontSize: 11, color: TOKENS.cobalt, textDecoration: "underline" }}
                >
                  www.dirtypaintbrushes.com
                </Link>
              </Column>
              <Column align="right">
                <Link href={siteUrl}>
                  <Img
                    src={`${siteUrl}/newsletter/arrow.png`}
                    width="16"
                    height="16"
                    alt="Visit the site"
                    style={{ display: "block" }}
                  />
                </Link>
              </Column>
            </Row>
          </Section>

          {/* 2. Masthead */}
          <Section style={{ backgroundColor: TOKENS.cobalt, padding: "36px 24px 32px", textAlign: "center" }}>
            <Text
              style={{
                fontFamily: FONT_SERIF,
                fontSize: 18,
                lineHeight: "24px",
                color: TOKENS.agedPaper,
                margin: "0 0 14px",
              }}
            >
              The Monthly Briefing
            </Text>
            <Text
              style={{
                fontFamily: FONT_BODY,
                fontWeight: 700,
                fontSize: 22,
                letterSpacing: "0.04em",
                lineHeight: "28px",
                color: TOKENS.agedPaper,
                margin: "0 0 10px",
              }}
            >
              INSIDE THE STORY:
            </Text>
            <Text
              className="dp-wordmark"
              style={{
                fontFamily: FONT_SERIF,
                fontStyle: "italic",
                fontSize: 56,
                letterSpacing: "-0.035em",
                lineHeight: 1,
                color: TOKENS.agedPaper,
                margin: "0 0 22px",
              }}
            >
              Dirty Paintbrushes
            </Text>
            <Text
              style={{
                fontFamily: FONT_BODY,
                fontSize: 12,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: TOKENS.agedPaper,
                margin: 0,
                opacity: 0.85,
              }}
            >
              {editionLine}
              {storyCount > 0 ? ` · ${storyCount} ${storyCount === 1 ? "story" : "stories"}` : ""}
            </Text>
          </Section>

          {/* 3. Hero photograph */}
          <Section>
            <Img
              src={`${siteUrl}/newsletter/hero-sink.jpg`}
              width="600"
              alt="A studio sink streaked with red, yellow, green, blue and black paint, swirling toward the drain"
              style={{ display: "block", width: "100%", maxWidth: 600, height: "auto" }}
            />
          </Section>

          {/* 4. Editor's note */}
          <Section className="dp-pad" style={{ padding: "28px 24px 8px" }}>
            <Row>
              <Column className="dp-stack" style={{ verticalAlign: "bottom" }}>
                <Text
                  style={{
                    fontFamily: FONT_SERIF,
                    fontStyle: "italic",
                    fontSize: 24,
                    lineHeight: "28px",
                    color: TOKENS.sepia,
                    margin: 0,
                  }}
                >
                  Editor&rsquo;s Note
                </Text>
              </Column>
              <Column
                className="dp-stack dp-stack-gap"
                style={{ verticalAlign: "bottom", textAlign: "right" }}
              >
                <Text style={{ fontFamily: FONT_BODY, fontSize: 13, lineHeight: "20px", color: TOKENS.sepia, margin: 0 }}>
                  {editionLine}
                </Text>
              </Column>
            </Row>
            <Text
              data-slot="editor-note"
              style={{
                fontFamily: FONT_BODY,
                fontSize: 15,
                lineHeight: "24px",
                color: TOKENS.sepia,
                margin: "14px 0 0",
              }}
            >
              {editorNote}
            </Text>
          </Section>

          <Section className="dp-pad" style={{ padding: "16px 24px 0" }}>
            <Hairline />

            {storyCount === 0 && (
              <Text style={{ fontFamily: FONT_BODY, fontSize: 14, color: TOKENS.sepia, margin: "0 0 24px" }}>
                A quiet month, with no new stories published. The full archive is always on the feed.
              </Text>
            )}

            {/* 5. In this issue */}
            {groups.length > 1 && (
              <Section style={{ margin: "0 0 24px" }}>
                <Text
                  style={{
                    fontFamily: FONT_BODY,
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: TOKENS.driedBlood,
                    margin: "0 0 8px",
                  }}
                >
                  In this issue
                </Text>
                <Text style={{ fontFamily: FONT_BODY, fontSize: 14, lineHeight: "22px", color: TOKENS.sepia, margin: 0 }}>
                  {groups.map((g, i) => (
                    <span key={g.key}>
                      {g.label} ({g.articles.length})
                      {i < groups.length - 1 ? "  ·  " : ""}
                    </span>
                  ))}
                </Text>
              </Section>
            )}

            {/* 6. Lead story */}
            {leadStory && (
              <>
                <Text
                  style={{
                    fontFamily: FONT_BODY,
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: TOKENS.driedBlood,
                    margin: "0 0 10px",
                  }}
                >
                  The lead
                </Text>
                <StoryBlock article={leadStory} siteUrl={siteUrl} lead />
                <Hairline />
              </>
            )}

            {/* 7. Stories, grouped by crime type */}
            {groups.map((group) => {
              const shown = group.articles.slice(0, MAX_PER_GROUP);
              const hidden = group.articles.length - shown.length;
              return (
                <Section key={group.key} style={{ margin: "0 0 8px" }}>
                  <Text
                    style={{
                      fontFamily: FONT_BODY,
                      fontSize: 11,
                      fontWeight: 700,
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                      color: TOKENS.driedBlood,
                      margin: "0 0 14px",
                    }}
                  >
                    {group.label}
                  </Text>
                  {shown.map((article) => (
                    <StoryBlock key={article.id} article={article} siteUrl={siteUrl} />
                  ))}
                  {hidden > 0 && (
                    <Text style={{ fontFamily: FONT_BODY, fontSize: 13, margin: "-8px 0 24px" }}>
                      <Link href={feedLink(group.key)} style={{ color: TOKENS.cobalt, textDecoration: "underline" }}>
                        + {hidden} more {group.label.toLowerCase()} {hidden === 1 ? "story" : "stories"} on the feed →
                      </Link>
                    </Text>
                  )}
                  <Hairline />
                </Section>
              );
            })}
          </Section>

          {/* 8. Find out more */}
          <Section className="dp-pad" style={{ padding: "8px 24px 40px", textAlign: "center" }}>
            <Button
              href={feedLink()}
              style={{
                backgroundColor: TOKENS.cobalt,
                color: TOKENS.agedPaper,
                fontFamily: FONT_SERIF,
                fontSize: 20,
                lineHeight: "28px",
                padding: "11px 28px",
                textDecoration: "none",
              }}
            >
              Find out more!
            </Button>
          </Section>

          {/* 9. Paintbrush jar + subscribe, for whoever this gets forwarded to */}
          <Section className="dp-pad" style={{ padding: "0 24px 40px", textAlign: "center" }}>
            <Img
              src={`${siteUrl}/newsletter/paintbrushes.png`}
              width="150"
              alt="A jar of well-used paintbrushes"
              style={{ display: "block", margin: "0 auto 16px", width: 150, height: "auto" }}
            />
            <Text
              style={{
                fontFamily: FONT_SERIF,
                fontStyle: "italic",
                fontSize: 20,
                lineHeight: "26px",
                color: TOKENS.sepia,
                margin: "0 0 18px",
              }}
            >
              Forwarded this by a colleague?
            </Text>
            <Button
              href={`${siteUrl}/newsletter`}
              style={{
                backgroundColor: TOKENS.driedBlood,
                color: TOKENS.agedPaper,
                fontFamily: FONT_SERIF,
                fontStyle: "italic",
                fontSize: 16,
                lineHeight: "20px",
                letterSpacing: "0.04em",
                padding: "18px 28px",
                borderRadius: 17,
                textDecoration: "none",
              }}
            >
              SUBSCRIBE TODAY
            </Button>
          </Section>

          {/* 10. Footer */}
          <Section className="dp-pad" style={{ backgroundColor: TOKENS.cobalt, padding: "28px 36px", textAlign: "center" }}>
            <Text
              style={{
                fontFamily: FONT_SERIF,
                fontStyle: "italic",
                fontSize: 22,
                lineHeight: "26px",
                color: TOKENS.agedPaper,
                margin: "0 0 14px",
              }}
            >
              Dirty Paintbrushes
            </Text>
            <Text style={{ fontFamily: FONT_BODY, fontSize: 12, lineHeight: "19px", color: TOKENS.footerText, margin: "0 0 14px" }}>
              <Link href={siteUrl} style={{ color: TOKENS.footerText, textDecoration: "underline" }}>
                Website
              </Link>
              {"   ·   "}
              <Link href={`mailto:${CONTACT_EMAIL}`} style={{ color: TOKENS.footerText, textDecoration: "underline" }}>
                Contact
              </Link>
              {"   ·   "}
              <Link href={unsubscribeUrl} style={{ color: TOKENS.footerText, textDecoration: "underline" }}>
                Unsubscribe
              </Link>
            </Text>
            <Text style={{ fontFamily: FONT_BODY, fontSize: 12, lineHeight: "19px", color: TOKENS.footerText, margin: 0 }}>
              © {year} Dirty Paintbrushes. All rights reserved.
              <br />
              You&rsquo;re receiving this email because you signed up for the Monthly Briefing from Dirty
              Paintbrushes.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
