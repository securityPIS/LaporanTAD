import { Skeleton } from "@/components/shared/Skeleton";

// Kerangka instan saat berpindah menu admin.
export default function Loading() {
  return (
    <div>
      <div className="h-6 w-1/4 rounded bg-surface-3" style={{ animation: "ltFade 1s ease infinite alternate" }} />
      <div className="mt-3 h-3 w-1/3 rounded bg-surface-3" style={{ animation: "ltFade 1s ease infinite alternate" }} />
      <Skeleton rows={4} />
    </div>
  );
}
