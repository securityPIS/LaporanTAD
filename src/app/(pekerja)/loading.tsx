import { PHONE_SCROLL } from "@/components/layout/PhoneFrame";
import { Skeleton } from "@/components/shared/Skeleton";

// Kerangka instan saat pindah menu — konten server (mis. Beranda) masih dimuat.
export default function Loading() {
  return (
    <div className={PHONE_SCROLL}>
      <div className="px-[18px] pb-2 pt-[22px]">
        <div className="h-4 w-1/3 rounded bg-surface-3" style={{ animation: "ltFade 1s ease infinite alternate" }} />
        <div className="mt-3 h-6 w-1/2 rounded bg-surface-3" style={{ animation: "ltFade 1s ease infinite alternate" }} />
        <Skeleton rows={3} />
      </div>
    </div>
  );
}
