import { placeholderCases } from "@/lib/placeholder-data";
import Link from "next/link";
import CrimeTag from "@/components/CrimeTag";
import RegionTag from "@/components/RegionTag";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cases",
  description: "Documented cases of financial crime in the art market, tracked from investigation through to resolution.",
};

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; className: string }> = {
    ongoing:              { label: "Ongoing",              className: "bg-amber-50 text-amber-600 border border-amber-100" },
    resolved:             { label: "Resolved",             className: "bg-green-50 text-green-600 border border-green-100" },
    under_investigation:  { label: "Under investigation",  className: "bg-blue-50 text-blue-600 border border-blue-100" },
  };
  const { label, className } = map[status] ?? { label: status, className: "bg-gray-100 text-gray-500" };
  return (
    <span className={`text-[10px] font-semibold px-2 py-[3px] rounded-md uppercase tracking-wider leading-none ${className}`}>
      {label}
    </span>
  );
}

export default function CasesPage() {
  return (
    <div className="max-w-6xl mx-auto px-6 lg:px-8 pt-14 pb-24">
      <div className="mb-12">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-blue-600 mb-4">
          Case tracker
        </p>
        <h1 className="heading-page text-gray-950 mb-3">Documented Cases</h1>
        <p className="text-[15px] text-gray-400 leading-relaxed max-w-xl">
          Major cases involving the art market at the intersection of financial crime. Tracked from
          investigation through conviction, settlement, or ongoing proceedings.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {placeholderCases.map((c) => (
          <Link key={c.id} href={`/cases/${c.id}`} className="block group">
            <article className="h-full bg-white border border-gray-100 rounded-2xl p-6 hover:border-gray-200 hover:shadow-sm transition-all duration-150 flex flex-col gap-4">
              <div className="flex items-center justify-between gap-2">
                <StatusBadge status={c.status} />
                <span className="text-[12px] text-gray-300">{c.date_range}</span>
              </div>
              <h2 className="text-[15px] font-semibold text-gray-900 leading-snug tracking-[-0.01em] group-hover:text-blue-700 transition-colors flex-1">
                {c.name}
              </h2>
              <p className="text-[13px] text-gray-400 leading-relaxed line-clamp-2">
                {c.summary.split("\n")[0]}
              </p>
              <div className="flex flex-wrap gap-1.5 mt-auto">
                {c.crime_types.map((type) => <CrimeTag key={type} type={type} small />)}
                {c.regions.slice(0, 2).map((region) => <RegionTag key={region} region={region} small />)}
              </div>
            </article>
          </Link>
        ))}
      </div>
    </div>
  );
}
