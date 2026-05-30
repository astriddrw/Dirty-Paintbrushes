"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const CRIME_TYPE_OPTIONS = [
  { value: "money_laundering",  label: "Money Laundering" },
  { value: "sanctions_evasion", label: "Sanctions Evasion" },
  { value: "fraud",             label: "Fraud" },
  { value: "forgery",           label: "Forgery" },
  { value: "tax_evasion",       label: "Tax Evasion" },
  { value: "terror_financing",  label: "Terror Financing" },
  { value: "trafficking",       label: "Trafficking" },
  { value: "bribery",           label: "Bribery" },
  { value: "corruption",        label: "Corruption" },
  { value: "looting",           label: "Looting" },
];

const REGION_OPTIONS = [
  { value: "united_states",     label: "United States" },
  { value: "united_kingdom",    label: "United Kingdom" },
  { value: "european_union",    label: "European Union" },
  { value: "russia",            label: "Russia" },
  { value: "switzerland",       label: "Switzerland" },
  { value: "united_arab_emirates", label: "UAE" },
  { value: "france",            label: "France" },
  { value: "italy",             label: "Italy" },
  { value: "germany",           label: "Germany" },
  { value: "singapore",         label: "Singapore" },
  { value: "malaysia",          label: "Malaysia" },
  { value: "india",             label: "India" },
  { value: "cambodia",          label: "Cambodia" },
  { value: "syria",             label: "Syria" },
  { value: "turkey",            label: "Turkey" },
  { value: "austria",           label: "Austria" },
  { value: "global",            label: "Global" },
];

const ENTITY_TYPE_OPTIONS = [
  { value: "auction_house",  label: "Auction House" },
  { value: "gallery",        label: "Gallery" },
  { value: "shell_company",  label: "Shell Company" },
  { value: "individual",     label: "Individual" },
  { value: "museum",         label: "Museum" },
  { value: "freeport",       label: "Freeport" },
  { value: "dealer",         label: "Dealer" },
  { value: "bank",           label: "Bank" },
  { value: "government",     label: "Government" },
];

const SOURCE_TIER_OPTIONS = [
  { value: "tier1",  label: "Tier 1 — Investigative" },
  { value: "tier2",  label: "Tier 2 — Art Industry" },
  { value: "tier3",  label: "Tier 3 — News" },
  { value: "tier4",  label: "Tier 4 — Legal" },
  { value: "manual", label: "Manual" },
];

const ARTICLE_TYPE_OPTIONS = [
  "news", "opinion", "regulation", "investigation", "ruling", "analysis",
];

type Status = "published" | "draft";

interface FormState {
  url: string;
  title: string;
  source_name: string;
  source_tier: string;
  published_date: string;
  summary: string;
  editor_note: string;
  article_type: string;
  crime_types: string[];
  regions: string[];
  entity_types: string[];
}

const empty: FormState = {
  url: "", title: "", source_name: "", source_tier: "manual",
  published_date: "", summary: "", editor_note: "", article_type: "",
  crime_types: [], regions: [], entity_types: [],
};

function toggle(arr: string[], val: string): string[] {
  return arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val];
}

export default function SubmitArticlePage() {
  const [form, setForm] = useState<FormState>(empty);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();

  const set = (key: keyof FormState) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = async (status: Status) => {
    if (!form.url || !form.title || !form.source_name) {
      setError("URL, title, and source name are required.");
      return;
    }
    setSaving(true);
    setError("");
    setSuccess("");

    const supabase = createClient();
    const { error: insertError } = await supabase.from("articles").insert({
      url: form.url,
      title: form.title,
      source_name: form.source_name,
      source_tier: form.source_tier,
      published_date: form.published_date || new Date().toISOString(),
      summary: form.summary || null,
      editor_note: form.editor_note || null,
      article_type: form.article_type || null,
      crime_types: form.crime_types,
      regions: form.regions,
      entity_types: form.entity_types,
      status,
    });

    setSaving(false);
    if (insertError) {
      setError(insertError.message);
      return;
    }
    setSuccess(`Article ${status === "published" ? "published" : "saved as draft"}.`);
    setForm(empty);
  };

  return (
    <main className="max-w-3xl mx-auto px-6 py-12">
      <div className="mb-10">
        <h1 className="text-3xl font-serif mb-1">Submit Article</h1>
        <p className="text-sm text-muted-foreground">Manually add an article to the feed.</p>
      </div>

      <div className="space-y-6">
        {/* URL */}
        <Field label="URL *">
          <input type="url" value={form.url} onChange={set("url")} required
            placeholder="https://..."
            className="input" />
        </Field>

        {/* Title */}
        <Field label="Title *">
          <input type="text" value={form.title} onChange={set("title")} required
            className="input" />
        </Field>

        {/* Source row */}
        <div className="grid grid-cols-2 gap-4">
          <Field label="Source name *">
            <input type="text" value={form.source_name} onChange={set("source_name")} required
              className="input" />
          </Field>
          <Field label="Source tier">
            <select value={form.source_tier} onChange={set("source_tier")} className="input">
              {SOURCE_TIER_OPTIONS.map(({ value, label }) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </Field>
        </div>

        {/* Date + Article type */}
        <div className="grid grid-cols-2 gap-4">
          <Field label="Publication date">
            <input type="date" value={form.published_date} onChange={set("published_date")}
              className="input" />
          </Field>
          <Field label="Article type">
            <select value={form.article_type} onChange={set("article_type")} className="input">
              <option value="">— select —</option>
              {ARTICLE_TYPE_OPTIONS.map((v) => (
                <option key={v} value={v}>{v.charAt(0).toUpperCase() + v.slice(1)}</option>
              ))}
            </select>
          </Field>
        </div>

        {/* Summary */}
        <Field label="Summary">
          <textarea value={form.summary} onChange={set("summary")} rows={4}
            placeholder="2–3 sentence summary..."
            className="input resize-none" />
        </Field>

        {/* Editor note */}
        <Field label="Editor's note (optional)">
          <textarea value={form.editor_note} onChange={set("editor_note")} rows={2}
            placeholder="Internal note shown on the article page..."
            className="input resize-none" />
        </Field>

        {/* Crime types */}
        <Field label="Crime types">
          <CheckboxGroup
            options={CRIME_TYPE_OPTIONS}
            selected={form.crime_types}
            onChange={(val) => setForm((f) => ({ ...f, crime_types: toggle(f.crime_types, val) }))}
          />
        </Field>

        {/* Regions */}
        <Field label="Regions">
          <CheckboxGroup
            options={REGION_OPTIONS}
            selected={form.regions}
            onChange={(val) => setForm((f) => ({ ...f, regions: toggle(f.regions, val) }))}
          />
        </Field>

        {/* Entity types */}
        <Field label="Entity types">
          <CheckboxGroup
            options={ENTITY_TYPE_OPTIONS}
            selected={form.entity_types}
            onChange={(val) => setForm((f) => ({ ...f, entity_types: toggle(f.entity_types, val) }))}
          />
        </Field>

        {error && <p className="text-sm text-destructive">{error}</p>}
        {success && <p className="text-sm text-green-600">{success}</p>}

        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={() => submit("published")}
            disabled={saving}
            className="px-6 py-2.5 bg-foreground text-background text-sm font-medium hover:opacity-80 disabled:opacity-30 transition-opacity"
          >
            {saving ? "Saving…" : "Publish"}
          </button>
          <button
            onClick={() => submit("draft")}
            disabled={saving}
            className="px-6 py-2.5 border border-border text-sm font-medium text-foreground hover:bg-secondary disabled:opacity-30 transition-colors"
          >
            Save as draft
          </button>
          <button
            onClick={() => router.push("/admin")}
            className="px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs text-muted-foreground mb-1.5">{label}</label>
      {children}
    </div>
  );
}

function CheckboxGroup({
  options,
  selected,
  onChange,
}: {
  options: { value: string; label: string }[];
  selected: string[];
  onChange: (val: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(({ value, label }) => (
        <label
          key={value}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 border text-xs cursor-pointer transition-colors ${
            selected.includes(value)
              ? "border-foreground bg-foreground text-background"
              : "border-border text-muted-foreground hover:border-foreground hover:text-foreground"
          }`}
        >
          <input
            type="checkbox"
            className="sr-only"
            checked={selected.includes(value)}
            onChange={() => onChange(value)}
          />
          {label}
        </label>
      ))}
    </div>
  );
}

// Tailwind class shorthand applied via globals
// Add to globals.css: .input { ... }
