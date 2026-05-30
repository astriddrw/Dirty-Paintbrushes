import { regionLabels } from "@/lib/placeholder-data";

interface RegionTagProps {
  region: string;
  small?: boolean;
}

export default function RegionTag({ region, small = false }: RegionTagProps) {
  const label = regionLabels[region] ?? region.replace(/_/g, " ");

  return (
    <span
      className={`inline-flex items-center rounded font-medium bg-gray-100 text-gray-500 border border-gray-200 ${
        small ? "px-1.5 py-px text-[10px]" : "px-2 py-0.5 text-xs"
      }`}
    >
      {label}
    </span>
  );
}
