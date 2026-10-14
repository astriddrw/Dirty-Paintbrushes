// The editor's note is the one hand-written part of each issue. Rather than
// add a DB column for it, the rendered draft carries it inside a tagged
// <p data-slot="editor-note"> — /admin/newsletter reads and rewrites just
// that element, and generate-draft carries it across a re-generation, so
// the note survives without anyone editing raw HTML.
// Client-safe on purpose (no server imports): the admin page uses it too.

const EDITOR_NOTE_RE = /(<p\b[^>]*data-slot="editor-note"[^>]*>)([\s\S]*?)(<\/p>)/;

export const DEFAULT_EDITOR_NOTE =
  "Here is your monthly roundup of all things financial crime and art market related.";

function escapeHtml(text: string) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function unescapeHtml(html: string) {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&");
}

export function getEditorNote(html: string): string | null {
  const match = html.match(EDITOR_NOTE_RE);
  return match ? unescapeHtml(match[2]).trim() : null;
}

export function setEditorNote(html: string, note: string): string {
  const body = escapeHtml(note.trim() || DEFAULT_EDITOR_NOTE).replace(/\r?\n/g, "<br>");
  return html.replace(EDITOR_NOTE_RE, (_, open, __, close) => `${open}${body}${close}`);
}
