import { placeholderCases, placeholderArticles } from "@/lib/placeholder-data";
import { notFound } from "next/navigation";
import Link from "next/link";
import CrimeTag from "@/components/CrimeTag";
import RegionTag from "@/components/RegionTag";
import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import { CrimeType } from "@/lib/types";

interface Props {
  params: { id: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const c = placeholderCases.find((c) => c.id === params.id);
  if (!c) return {};
  return { title: c.name };
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; className: string }> = {
    ongoing:             { label: "Ongoing",             className: "bg-amber-50 text-amber-600 border border-amber-100" },
    resolved:            { label: "Resolved",            className: "bg-green-50 text-green-600 border border-green-100" },
    under_investigation: { label: "Under investigation", className: "bg-blue-50 text-blue-600 border border-blue-100" },
  };
  const { label, className } = map[status] ?? { label: status, className: "bg-gray-100 text-gray-500" };
  return (
    <span className={`text-[10px] font-semibold px-2 py-[3px] rounded-md uppercase tracking-wider leading-none ${className}`}>
      {label}
    </span>
  );
}

export default function CaseDetailPage({ params }: Props) {
  const c = placeholderCases.find((c) => c.id === params.id);
  if (!c) notFound();

  const relatedArticles = placeholderArticles
    .filter((a) => a.crime_types.some((t) => c.crime_types.includes(t as CrimeType)))
    .slice(0, 3);

  return (
    <div className="max-w-6xl mx-auto px-6 lg:px-8 pt-12 pb-24">
      <div className="max-w-2xl">

        <Link
          href="/cases"
          className="inline-flex items-center gap-1.5 text-[13px] text-gray-300 hover:text-gray-600 mb-10 transition-colors"
        >
          <ArrowLeft size={13} />
          Back to cases
        </Link>

        <div className="mb-8 pb-8 border-b border-gray-100">
          <div className="flex flex-wrap items-center gap-3 mb-5">
            <StatusBadge status={c.status} />
            <span className="text-[13px] text-gray-300">{c.date_range}</span>
          </div>
          <h1 className="heading-page text-gray-950 mb-6">{c.name}</h1>
          <div className="flex flex-wrap gap-2">
            {c.crime_types.map((type) => <CrimeTag key={type} type={type} />)}
            {c.regions.map((region) => <RegionTag key={region} region={region} />)}
          </div>
        </div>

        <div className="mb-10">
          {c.summary.split("\n\n").map((para, i) => (
            <p key={i} className="text-[15px] text-gray-600 leading-[1.8] mb-5">{para}</p>
          ))}
        </div>

        {c.key_entities.length > 0 && (
          <div className="mb-10 p-5 bg-gray-50/60 border border-gray-100 rounded-2xl">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-gray-300 mb-4">
              Key entities
            </p>
            <div className="flex flex-wrap gap-2">
              {c.key_entities.map((entity) => (
                <span
                  key={entity}
                  className="px-3 py-1.5 bg-white border border-gray-100 rounded-lg text-[13px] text-gray-600"
                >
                  {entity}
                </span>
              ))}
            </div>
          </div>
        )}

        {relatedArticles.length > 0 && (
          <div>
            <p className="text-[13px] font-semibold text-gray-700 mb-1">Related articles</p>
            <p className="text-[12px] text-gray-300 mb-5">Matched by crime type</p>
            <div className="divide-y" style={{ borderColor: "#f2f2f2" }}>
              {relatedArticles.map((article) => (
                <Link
                  key={article.id}
                  href={`/articles/${article.id}`}
                  className="block py-4 group"
                >
                  <p className="text-[14px] font-medium text-gray-800 group-hover:text-blue-600 transition-colors mb-1 leading-snug tracking-[-0.01em]">
                    {article.title}
                  </p>
                  <p className="text-[12px] text-gray-300">
                    {article.source_name}{" · "}
                    {new Date(article.published_date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
