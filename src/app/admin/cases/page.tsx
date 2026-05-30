"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Plus, Pencil, Trash2, X, Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface Case {
  id: string;
  name: string;
  status: string;
  date_range: string | null;
  summary: string | null;
  crime_types: string[];
  regions: string[];
  key_entities: string[];
  created_at: string;
}

interface LinkedArticle {
  id: string;
  title: string;
  source_name: string;
}

interface SearchArticle {
  id: string;
  title: string;
  source_name: string;
}

const CRIME_OPTIONS = [
  { value: "money_laundering",  label: "Money Laundering" },
  { value: "sanctions_evasion", label: "Sanctions" },
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
  { value: "united_states", label: "United States" },
  { value: "united_kingdom", label: "United Kingdom" },
  { value: "european_union", label: "EU" },
  { value: "russia", label: "Russia" },
  { value: "switzerland", label: "Switzerland" },
  { value: "united_arab_emirates", label: "UAE" },
  { value: "france", label: "France" },
  { value: "singapore", label: "Singapore" },
  { value: "malaysia", label: "Malaysia" },
  { value: "india", label: "India" },
  { value: "cambodia", label: "Cambodia" },
  { value: "global", label: "Global" },
];

const STATUS_OPTIONS = [
  { value: "ongoing", label: "Ongoing" },
  { value: "resolved", label: "Resolved" },
  { value: "under_investigation", label: "Under Investigation" },
];

const STATUS_COLORS: Record<string, string> = {
  ongoing: "bg-amber-50 text-amber-700",
  resolved: "bg-green-50 text-green-700",
  under_investigation: "bg-blue-50 text-blue-700",
};

type Mode = "list" | "create" | "edit";

const emptyForm = {
  name: "", status: "ongoing", date_range: "", summary: "",
  crime_types: [] as string[], regions: [] as string[],
  key_entities_text: "",
};

function toggle(arr: string[], val: string) {
  return arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val];
}

export default function CasesPage() {
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<Mode>("list");
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Article linking state
  const [linkedArticles, setLinkedArticles] = useState<LinkedArticle[]>([]);
  const [articleSearch, setArticleSearch] = useState("");
  const [searchResults, setSearchResults] = useState<SearchArticle[]>([]);
  const [searching, setSearching] = useState(false);

  const fetchCases = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("cases")
      .select("*")
      .order("created_at", { ascending: false });
    setCases((data ?? []) as Case[]);
    setLoading(false);
  }, []);

  useEffect(() => { fetchCases(); }, [fetchCases]);

  const fetchLinkedArticles = useCallback(async (caseId: string) => {
    const supabase = createClient();
    const { data } = await supabase
      .from("case_articles")
      .select("article_id, articles(id, title, source_name)")
      .eq("case_id", caseId);
    if (data) {
      const linked: LinkedArticle[] = [];
      for (const row of data) {
        const a = Array.isArray(row.articles) ? row.articles[0] : row.articles;
        if (a) linked.push(a as LinkedArticle);
      }
      setLinkedArticles(linked);
    }
  }, []);

  const searchArticles = useCallback(async (query: string) => {
    if (!query.trim()) { setSearchResults([]); return; }
    setSearching(true);
    const supabase = createClient();
    const { data } = await supabase
      .from("articles")
      .select("id, title, source_name")
      .ilike("title", `%${query}%`)
      .limit(6);
    setSearchResults((data ?? []) as SearchArticle[]);
    setSearching(false);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => searchArticles(articleSearch), 300);
    return () => clearTimeout(t);
  }, [articleSearch, searchArticles]);

  const startCreate = () => {
    setForm({ ...emptyForm });
    setEditId(null);
    setLinkedArticles([]);
    setArticleSearch("");
    setSearchResults([]);
    setError("");
    setMode("create");
  };

  const startEdit = (c: Case) => {
    setForm({
      name: c.name,
      status: c.status,
      date_range: c.date_range ?? "",
      summary: c.summary ?? "",
      crime_types: c.crime_types ?? [],
      regions: c.regions ?? [],
      key_entities_text: (c.key_entities ?? []).join(", "),
    });
    setEditId(c.id);
    setArticleSearch("");
    setSearchResults([]);
    setError("");
    fetchLinkedArticles(c.id);
    setMode("edit");
  };

  const cancel = () => { setMode("list"); setEditId(null); };

  const save = async () => {
    if (!form.name.trim()) { setError("Name is required."); return; }
    setSaving(true);
    setError("");
    const supabase = createClient();
    const payload = {
      name: form.name.trim(),
      status: form.status,
      date_range: form.date_range || null,
      summary: form.summary || null,
      crime_types: form.crime_types,
      regions: form.regions,
      key_entities: form.key_entities_text
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    };

    if (mode === "create") {
      const { error: e } = await supabase.from("cases").insert(payload);
      if (e) { setError(e.message); setSaving(false); return; }
    } else if (editId) {
      const { error: e } = await supabase.from("cases").update(payload).eq("id", editId);
      if (e) { setError(e.message); setSaving(false); return; }
    }

    setSaving(false);
    await fetchCases();
    setMode("list");
  };

  const deleteCase = async (id: string) => {
    if (!confirm("Delete this case?")) return;
    const supabase = createClient();
    await supabase.from("cases").delete().eq("id", id);
    setCases((prev) => prev.filter((c) => c.id !== id));
  };

  const linkArticle = async (article: SearchArticle) => {
    if (!editId) return;
    if (linkedArticles.some((a) => a.id === article.id)) return;
    const supabase = createClient();
    await supabase.from("case_articles").insert({ case_id: editId, article_id: article.id });
    setLinkedArticles((prev) => [...prev, article]);
    setArticleSearch("");
    setSearchResults([]);
  };

  const unlinkArticle = async (articleId: string) => {
    if (!editId) return;
    const supabase = createClient();
    await supabase.from("case_articles")
      .delete()
      .eq("case_id", editId)
      .eq("article_id", articleId);
    setLinkedArticles((prev) => prev.filter((a) => a.id !== articleId));
  };

  const setField = (key: keyof typeof form) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => setForm((f) => ({ ...f, [key]: e.target.value }));

  // ── Form view ──────────────────────────────────────────────────────
  if (mode === "create" || mode === "edit") {
    return (
      <main className="max-w-3xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-serif mb-1">
            {mode === "create" ? "New Case" : "Edit Case"}
          </h1>
        </div>

        <div className="space-y-6">
          <Field label="Case name *">
            <input type="text" value={form.name} onChange={setField("name")}
              className="input" placeholder="e.g. Rotenberg Brothers — Sanctions Evasion" />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Status">
              <select value={form.status} onChange={setField("status")} className="input">
                {STATUS_OPTIONS.map(({ value, label }) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </Field>
            <Field label="Date range">
              <input type="text" value={form.date_range} onChange={setField("date_range")}
                placeholder="e.g. 2014–present" className="input" />
            </Field>
          </div>

          <Field label="Summary">
            <textarea value={form.summary} onChange={setField("summary")} rows={5}
              placeholder="Case overview..." className="input resize-none" />
          </Field>

          <Field label="Crime types">
            <div className="flex flex-wrap gap-2">
              {CRIME_OPTIONS.map(({ value, label }) => (
                <ToggleChip
                  key={value}
                  active={form.crime_types.includes(value)}
                  onClick={() => setForm((f) => ({ ...f, crime_types: toggle(f.crime_types, value) }))}
                >
                  {label}
                </ToggleChip>
              ))}
            </div>
          </Field>

          <Field label="Regions">
            <div className="flex flex-wrap gap-2">
              {REGION_OPTIONS.map(({ value, label }) => (
                <ToggleChip
                  key={value}
                  active={form.regions.includes(value)}
                  onClick={() => setForm((f) => ({ ...f, regions: toggle(f.regions, value) }))}
                >
                  {label}
                </ToggleChip>
              ))}
            </div>
          </Field>

          <Field label="Key entities (comma-separated)">
            <input type="text" value={form.key_entities_text} onChange={setField("key_entities_text")}
              placeholder="e.g. Boris Rotenberg, OFAC, US Treasury" className="input" />
          </Field>

          {/* Article linking — only in edit mode */}
          {mode === "edit" && (
            <div className="pt-4 border-t border-border">
              <p className="text-xs text-muted-foreground mb-3">Linked articles</p>

              {linkedArticles.length > 0 && (
                <div className="space-y-1.5 mb-4">
                  {linkedArticles.map((a) => (
                    <div key={a.id} className="flex items-center justify-between gap-3 p-2.5 border border-border">
                      <div>
                        <p className="text-sm text-foreground leading-snug">{a.title}</p>
                        <p className="text-xs text-muted-foreground">{a.source_name}</p>
                      </div>
                      <button onClick={() => unlinkArticle(a.id)}
                        className="text-muted-foreground hover:text-destructive transition-colors flex-shrink-0">
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <input
                  type="text"
                  value={articleSearch}
                  onChange={(e) => setArticleSearch(e.target.value)}
                  placeholder="Search articles to link..."
                  className="input pl-9"
                />
              </div>
              {searchResults.length > 0 && (
                <div className="border border-border border-t-0 divide-y divide-border">
                  {searchResults.map((a) => (
                    <button
                      key={a.id}
                      onClick={() => linkArticle(a)}
                      disabled={linkedArticles.some((la) => la.id === a.id)}
                      className="w-full text-left px-3 py-2.5 hover:bg-secondary disabled:opacity-40 transition-colors"
                    >
                      <p className="text-sm text-foreground leading-snug">{a.title}</p>
                      <p className="text-xs text-muted-foreground">{a.source_name}</p>
                    </button>
                  ))}
                </div>
              )}
              {searching && <p className="text-xs text-muted-foreground mt-1">Searching…</p>}
            </div>
          )}

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex items-center gap-3 pt-2">
            <button onClick={save} disabled={saving}
              className="px-6 py-2.5 bg-foreground text-background text-sm font-medium hover:opacity-80 disabled:opacity-30 transition-opacity">
              {saving ? "Saving…" : "Save"}
            </button>
            <button onClick={cancel}
              className="px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
              Cancel
            </button>
          </div>
        </div>
      </main>
    );
  }

  // ── List view ──────────────────────────────────────────────────────
  return (
    <main className="max-w-5xl mx-auto px-6 py-12">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-3xl font-serif mb-1">Cases</h1>
          <p className="text-sm text-muted-foreground">
            {loading ? "Loading…" : `${cases.length} case${cases.length !== 1 ? "s" : ""}`}
          </p>
        </div>
        <button
          onClick={startCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-foreground text-background text-sm font-medium hover:opacity-80 transition-opacity"
        >
          <Plus className="h-4 w-4" />
          New Case
        </button>
      </div>

      {!loading && cases.length === 0 && (
        <div className="border border-border p-12 text-center">
          <p className="text-muted-foreground text-sm">No cases yet.</p>
        </div>
      )}

      <div className="divide-y divide-border border-t border-b border-border">
        {cases.map((c) => (
          <div key={c.id} className="py-5 flex items-start gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-sm font-medium text-foreground">{c.name}</h2>
                <span className={cn("text-xs px-1.5 py-0.5", STATUS_COLORS[c.status] ?? "bg-secondary text-muted-foreground")}>
                  {c.status.replace("_", " ")}
                </span>
              </div>
              {c.date_range && (
                <p className="text-xs text-muted-foreground mb-1">{c.date_range}</p>
              )}
              {c.summary && (
                <p className="text-xs text-muted-foreground line-clamp-2 max-w-2xl leading-relaxed">
                  {c.summary}
                </p>
              )}
              {c.crime_types?.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {c.crime_types.map((ct) => (
                    <span key={ct} className="text-xs px-1.5 py-0.5 bg-secondary text-muted-foreground">
                      {ct.replace(/_/g, " ")}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <button onClick={() => startEdit(c)}
                className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                title="Edit">
                <Pencil className="h-3.5 w-3.5" />
              </button>
              <button onClick={() => deleteCase(c.id)}
                className="p-2 text-muted-foreground hover:text-destructive hover:bg-muted transition-colors"
                title="Delete">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}
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

function ToggleChip({ active, onClick, children }: {
  active: boolean; onClick: () => void; children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "px-3 py-1.5 border text-xs transition-colors",
        active
          ? "border-foreground bg-foreground text-background"
          : "border-border text-muted-foreground hover:border-foreground hover:text-foreground"
      )}
    >
      {children}
    </button>
  );
}
