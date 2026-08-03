// Label and color maps keyed by DB column values (crime_types[], article_type)
// Crime type colors: newspaper-ink palette — desaturated, like ink on newsprint

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
  // Dusty red — crimes against objects/provenance
  fraud:             { bg: "bg-[#F5EEEE]", text: "text-[#8B3A3A]" },
  forgery:           { bg: "bg-[#F5EEEE]", text: "text-[#8B3A3A]" },
  looting:           { bg: "bg-[#F5EEEE]", text: "text-[#8B3A3A]" },

  // Slate blue — financial/sanctions (matches navy accent)
  money_laundering:  { bg: "bg-[#EDF0F5]", text: "text-[#1E3A5F]" },
  sanctions_evasion: { bg: "bg-[#EDF0F5]", text: "text-[#1E3A5F]" },

  // Olive — security/terrorism/trafficking
  terror_financing:  { bg: "bg-[#ECEEE8]", text: "text-[#3B4A28]" },
  trafficking:       { bg: "bg-[#ECEEE8]", text: "text-[#3B4A28]" },

  // Dark amber/tobacco — white-collar crime
  tax_evasion:       { bg: "bg-[#F5F0E6]", text: "text-[#6B4A18]" },
  corruption:        { bg: "bg-[#F5F0E6]", text: "text-[#6B4A18]" },
  bribery:           { bg: "bg-[#F5F0E6]", text: "text-[#6B4A18]" },
}

// Article type tags — restrained warm grey, like a newspaper section label
export const articleTypeColors: Record<string, { bg: string; text: string }> = {
  news:          { bg: "bg-[#F2F0EC]", text: "text-[#5C5C5C]" },
  opinion:       { bg: "bg-[#F2F0EC]", text: "text-[#5C5C5C]" },
  regulation:    { bg: "bg-[#EDF0F5]", text: "text-[#1E3A5F]" },
  investigation: { bg: "bg-[#F2F0EC]", text: "text-[#5C5C5C]" },
  ruling:        { bg: "bg-[#F2F0EC]", text: "text-[#5C5C5C]" },
  analysis:      { bg: "bg-[#F2F0EC]", text: "text-[#5C5C5C]" },
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
