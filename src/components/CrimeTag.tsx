import { crimeTypeColors, crimeTypeLabels } from "@/lib/placeholder-data";

interface CrimeTagProps {
  type: string;
  small?: boolean;
}

export default function CrimeTag({ type, small = false }: CrimeTagProps) {
  const colorClass = crimeTypeColors[type] ?? "bg-gray-100 text-gray-600 border border-gray-200";
  const label = crimeTypeLabels[type] ?? type.replace(/_/g, " ");

  return (
    <span
      className={`inline-flex items-center rounded font-medium ${colorClass} ${
        small ? "px-1.5 py-px text-[10px]" : "px-2 py-0.5 text-xs"
      }`}
    >
      {label}
    </span>
  );
}
