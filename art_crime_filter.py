"""Relevance/classification filter for Dirty Paintbrushes (dirtypaintbrushes.com),
a platform tracking art market financial crime.

Uses Claude with tool-use structured output to classify article headlines
against the FilterResult schema.
"""

import json
import os
import sys
from typing import List, Literal, Optional

import anthropic
from pydantic import BaseModel, Field

MODEL = "claude-haiku-4-5-20251001"

SYSTEM_PROMPT = """An article is relevant if it covers any of the following, specifically in relation to the art, antiquities, or collectibles market:
- Criminal prosecutions or investigations (fraud, forgery, theft, money laundering, sanctions evasion, tax evasion)
- Regulatory actions or enforcement (AML/KYC compliance failures, failure to report suspicious transactions, OFAC/sanctions designations, customs seizures)
- Policy, legislative, or regulatory developments (new AML rules for art dealers, FATF/EU/UK regulatory changes)
- Institutional/NGO initiatives explicitly focused on preventing art crime, trafficking, or financial crime in the art market
- Illicit antiquities trafficking or looting, even without an active criminal case

An article is NOT relevant if it is about general art market news (sales, exhibitions, appointments, closures, reviews) with no financial crime, trafficking, or compliance angle, even if it mentions an auction house, gallery, or museum by name.

Distinguish carefully: routine voluntary restitution or repatriation with no criminal proceeding is Policy & Prevention, not Trafficking & Looting. A standard high-value auction result with no crime angle is not relevant, even if the sale price is newsworthy."""


class FilterResult(BaseModel):
    is_relevant: bool
    confidence_score: float
    primary_category: Literal[
        "Fraud & Forgery",
        "Money Laundering & Illicit Finance",
        "Heists & Theft",
        "Trafficking & Looting",
        "Sanctions & Compliance",
        "Policy & Prevention",
        "None",
    ]
    summary: Optional[str] = Field(
        default=None,
        description="Two factual sentences focused on the crime/legal action if is_relevant is true, else None.",
    )
    key_actors: List[str] = Field(
        default_factory=list,
        description="Named individuals/companies involved.",
    )
    agencies_or_courts: List[str] = Field(
        default_factory=list,
        description="Law enforcement/courts/regulators named.",
    )


_TOOL_NAME = "record_filter_result"

_TOOL_SCHEMA = {
    "name": _TOOL_NAME,
    "description": "Record the classification result for the article.",
    "input_schema": FilterResult.model_json_schema(),
}


def classify_article(headline: str, client: Optional[anthropic.Anthropic] = None) -> FilterResult:
    """Classify a single article headline against the FilterResult schema."""
    client = client or anthropic.Anthropic()

    response = client.messages.create(
        model=MODEL,
        max_tokens=1024,
        temperature=0.0,
        system=SYSTEM_PROMPT,
        tools=[_TOOL_SCHEMA],
        tool_choice={"type": "tool", "name": _TOOL_NAME},
        messages=[{"role": "user", "content": headline}],
    )

    for block in response.content:
        if block.type == "tool_use" and block.name == _TOOL_NAME:
            return FilterResult.model_validate(block.input)

    raise RuntimeError("Model did not return a tool_use block with the expected tool name.")


TEST_CASES = [
    {
        "headline": "DOJ Indicts Former Geneva Freeport Dealer for $20M Wire Fraud Scheme",
        "expect_relevant": True,
        "expect_category": "Fraud & Forgery",
    },
    {
        "headline": "European Police Dismantle Network Forging Banksy and Picasso Works",
        "expect_relevant": True,
        "expect_category": "Fraud & Forgery",
    },
    {
        "headline": "Art dealer jailed for failing to report sales linked to suspected terrorist",
        "expect_relevant": True,
        "expect_category": "Sanctions & Compliance",
    },
    {
        "headline": "Antiquities Coalition Joins Global Leaders in Rome to Prevent Art Crime",
        "expect_relevant": True,
        "expect_category": "Policy & Prevention",
    },
    {
        "headline": "Sotheby's Realizes $40M at Spring Impressionist Sale in New York",
        "expect_relevant": False,
        "expect_category": "None",
    },
]


def run_tests() -> bool:
    if not os.environ.get("ANTHROPIC_API_KEY"):
        print("ERROR: ANTHROPIC_API_KEY environment variable is not set.", file=sys.stderr)
        return False

    client = anthropic.Anthropic()
    all_passed = True

    for i, case in enumerate(TEST_CASES, start=1):
        headline = case["headline"]
        print(f"\n[{i}/{len(TEST_CASES)}] {headline}")
        try:
            result = classify_article(headline, client=client)
        except Exception as e:
            print(f"  ERROR calling model: {e}")
            all_passed = False
            continue

        print(json.dumps(result.model_dump(), indent=2))

        relevant_ok = result.is_relevant == case["expect_relevant"]
        category_ok = result.primary_category == case["expect_category"]
        passed = relevant_ok and category_ok

        status = "PASS" if passed else "FAIL"
        print(
            f"  -> {status} "
            f"(is_relevant={result.is_relevant} expected={case['expect_relevant']}, "
            f"primary_category={result.primary_category!r} expected={case['expect_category']!r})"
        )

        all_passed = all_passed and passed

    print("\n" + "=" * 60)
    print("ALL TESTS PASSED" if all_passed else "SOME TESTS FAILED")
    print("=" * 60)
    return all_passed


if __name__ == "__main__":
    success = run_tests()
    sys.exit(0 if success else 1)
