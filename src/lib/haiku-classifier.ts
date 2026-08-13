// Haiku-based relevance/classification filter — replaces the keyword-based
// checkRelevance() (relevance-filter.ts) admission gate in /api/ingest.
// Ported from art_crime_filter.py; system prompt and schema kept identical
// so the two stay comparable if we ever need to A/B or roll back.

import Anthropic from "@anthropic-ai/sdk";

const MODEL = "claude-haiku-4-5-20251001";

const SYSTEM_PROMPT = `An article is relevant if it covers any of the following, specifically in relation to the art, antiquities, or collectibles market:
- Criminal prosecutions or investigations (fraud, forgery, theft, money laundering, sanctions evasion, tax evasion)
- Regulatory actions or enforcement (AML/KYC compliance failures, failure to report suspicious transactions, OFAC/sanctions designations, customs seizures)
- Policy, legislative, or regulatory developments (new AML rules for art dealers, FATF/EU/UK regulatory changes)
- Institutional/NGO initiatives explicitly focused on preventing art crime, trafficking, or financial crime in the art market
- Illicit antiquities trafficking or looting, even without an active criminal case

An article is NOT relevant if it is about general art market news (sales, exhibitions, appointments, closures, reviews) with no financial crime, trafficking, or compliance angle, even if it mentions an auction house, gallery, or museum by name.

Distinguish carefully: routine voluntary restitution or repatriation with no criminal proceeding is Policy & Prevention, not Trafficking & Looting. A standard high-value auction result with no crime angle is not relevant, even if the sale price is newsworthy.`;

export const PRIMARY_CATEGORY_VALUES = [
  "Fraud & Forgery",
  "Money Laundering & Illicit Finance",
  "Heists & Theft",
  "Trafficking & Looting",
  "Sanctions & Compliance",
  "Policy & Prevention",
  "None",
] as const;

export type PrimaryCategory = (typeof PRIMARY_CATEGORY_VALUES)[number];

export interface FilterResult {
  is_relevant: boolean;
  confidence_score: number;
  primary_category: PrimaryCategory;
  summary: string | null;
  key_actors: string[];
  agencies_or_courts: string[];
}

const TOOL_NAME = "record_filter_result";

const TOOL_SCHEMA = {
  name: TOOL_NAME,
  description: "Record the classification result for the article.",
  input_schema: {
    type: "object" as const,
    properties: {
      is_relevant: { type: "boolean" as const },
      confidence_score: { type: "number" as const },
      primary_category: { type: "string" as const, enum: [...PRIMARY_CATEGORY_VALUES] },
      summary: {
        type: ["string", "null"] as unknown as "string",
        description:
          "Two factual sentences focused on the crime/legal action if is_relevant is true, else None.",
      },
      key_actors: {
        type: "array" as const,
        items: { type: "string" as const },
        description: "Named individuals/companies involved.",
      },
      agencies_or_courts: {
        type: "array" as const,
        items: { type: "string" as const },
        description: "Law enforcement/courts/regulators named.",
      },
    },
    required: [
      "is_relevant",
      "confidence_score",
      "primary_category",
      "summary",
      "key_actors",
      "agencies_or_courts",
    ],
  },
};

let client: Anthropic | null = null;

function getClient(): Anthropic {
  if (!client) {
    client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return client;
}

export async function classifyWithHaiku(title: string, snippet: string): Promise<FilterResult> {
  const response = await getClient().messages.create({
    model: MODEL,
    max_tokens: 1024,
    temperature: 0,
    system: SYSTEM_PROMPT,
    tools: [TOOL_SCHEMA],
    tool_choice: { type: "tool", name: TOOL_NAME },
    messages: [{ role: "user", content: `${title}\n\n${snippet}` }],
  });

  const toolUse = response.content.find(
    (block): block is Anthropic.ToolUseBlock => block.type === "tool_use" && block.name === TOOL_NAME
  );

  if (!toolUse) {
    throw new Error("Haiku did not return a tool_use block with the expected tool name.");
  }

  return toolUse.input as FilterResult;
}
