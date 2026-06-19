import { PAGE_SIZES } from "@/features/pm/constants";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PropertyFiltersProps {
  q: string;
  onQChange: (q: string) => void;
  occupancy: "occupied" | "vacant" | "";
  onOccupancyChange: (occupancy: "occupied" | "vacant" | "") => void;
  limit: number;
  onLimitChange: (limit: number) => void;
}

export default function PropertyFilters({
  q,
  onQChange,
  occupancy,
  onOccupancyChange,
  limit,
  onLimitChange,
}: PropertyFiltersProps) {
  return (
    <div className="grid gap-3 md:grid-cols-3">
      <Input
        value={q}
        onChange={(e) => onQChange(e.target.value)}
        placeholder="Search title/address…"
        aria-label="Search properties"
      />
      <Select
        value={occupancy || "all"}
        onValueChange={(v) =>
          onOccupancyChange(v === "all" ? "" : (v as "occupied" | "vacant"))
        }
      >
        <SelectTrigger aria-label="Filter by occupancy">
          <SelectValue placeholder="Occupancy" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All</SelectItem>
          <SelectItem value="occupied">Occupied</SelectItem>
          <SelectItem value="vacant">Vacant</SelectItem>
        </SelectContent>
      </Select>
      <Select
        value={String(limit)}
        onValueChange={(v) => onLimitChange(Number(v))}
      >
        <SelectTrigger aria-label="Page size">
          <SelectValue placeholder="Page size" />
        </SelectTrigger>
        <SelectContent>
          {PAGE_SIZES.map((size) => (
            <SelectItem key={size} value={String(size)}>
              {size}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
