// Label and color maps keyed by DB column values (crime_types[], article_type)
// Colors match V0's crimeTypeColors/articleTypeColors exactly

export const crimeTypeLabels: Record<string, string> = {
  fraud:             "Fraud & Forgery",
  forgery:           "Forgery",
  money_laundering:  "Money Laundering",
  sanctions_evasion: "Sanctions",
  terror_financing:  "Terror Financing",
  tax_evasion:       "Tax Evasion",
  trafficking:       "Trafficking",
  bribery:           "Bribery",
  corruption:        "Corruption",
  looting:           "Looting",
}

export const crimeTypeColors: Record<string, { bg: string; text: string }> = {
  fraud:             { bg: "bg-red-50",    text: "text-red-700" },
  forgery:           { bg: "bg-red-50",    text: "text-red-700" },
  money_laundering:  { bg: "bg-blue-50",   text: "text-blue-700" },
  sanctions_evasion: { bg: "bg-amber-50",  text: "text-amber-700" },
  terror_financing:  { bg: "bg-teal-50",   text: "text-teal-700" },
  tax_evasion:       { bg: "bg-amber-50",  text: "text-amber-700" },
  trafficking:       { bg: "bg-orange-50", text: "text-orange-700" },
  bribery:           { bg: "bg-orange-50", text: "text-orange-700" },
  corruption:        { bg: "bg-orange-50", text: "text-orange-700" },
  looting:           { bg: "bg-red-50",    text: "text-red-700" },
}

// V0 uses neutral-100/neutral-700 for all article types
export const articleTypeColors: Record<string, { bg: string; text: string }> = {
  news:          { bg: "bg-neutral-100", text: "text-neutral-700" },
  opinion:       { bg: "bg-neutral-100", text: "text-neutral-700" },
  regulation:    { bg: "bg-neutral-100", text: "text-neutral-700" },
  investigation: { bg: "bg-neutral-100", text: "text-neutral-700" },
  ruling:        { bg: "bg-neutral-100", text: "text-neutral-700" },
  analysis:      { bg: "bg-neutral-100", text: "text-neutral-700" },
}

export const articleTypeLabels: Record<string, string> = {
  news:          "News",
  opinion:       "Opinion",
  regulation:    "Regulation",
  investigation: "Investigation",
  ruling:        "Ruling",
  analysis:      "Analysis",
}

// Filter options using DB column values
export const CRIME_FILTER_OPTIONS = [
  { value: "fraud",             label: "Fraud & Forgery" },
  { value: "money_laundering",  label: "Money Laundering" },
  { value: "sanctions_evasion", label: "Sanctions" },
  { value: "terror_financing",  label: "Terror Financing" },
] as const

export const ARTICLE_TYPE_OPTIONS = [
  { value: "news",          label: "News" },
  { value: "opinion",       label: "Opinion" },
  { value: "regulation",    label: "Regulation" },
  { value: "investigation", label: "Investigation" },
  { value: "ruling",        label: "Ruling" },
  { value: "analysis",      label: "Analysis" },
] as const

export const TIER_GROUP_LABELS: Record<string, string> = {
  tier1: "Investigative & Research",
  tier2: "Art Industry",
  tier3: "News & Investigations",
  tier4: "Legal & Regulatory",
}

export const TIER_DESCRIPTIONS: Record<string, string> = {
  tier1: "Core investigative and regulatory source",
  tier2: "Specialist art industry publication",
  tier3: "Mainstream news and investigative media",
  tier4: "Legal and compliance publication",
}
