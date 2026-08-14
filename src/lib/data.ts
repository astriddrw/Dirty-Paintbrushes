// Label and color maps keyed by DB column values (crime_types[], article_type)

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

// One unified pill style — indigo text on pale indigo — for every tag.
const pillStyle = { bg: "bg-indigo-pale", text: "text-indigo" }

export const crimeTypeColors: Record<string, { bg: string; text: string }> = {
  fraud: pillStyle,
  forgery: pillStyle,
  money_laundering: pillStyle,
  sanctions_evasion: pillStyle,
  terror_financing: pillStyle,
  tax_evasion: pillStyle,
  trafficking: pillStyle,
  bribery: pillStyle,
  corruption: pillStyle,
  looting: pillStyle,
}

export const articleTypeColors: Record<string, { bg: string; text: string }> = {
  news: pillStyle,
  opinion: pillStyle,
  regulation: pillStyle,
  investigation: pillStyle,
  ruling: pillStyle,
  analysis: pillStyle,
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
  tier5: "Google Alerts",
  tier4: "Legal & Regulatory",
}

export const TIER_DESCRIPTIONS: Record<string, string> = {
  tier1: "Core investigative and regulatory source",
  tier2: "Specialist art industry publication",
  tier3: "Mainstream news and investigative media",
  tier5: "Automated search alert",
  tier4: "Legal and compliance publication",
}
