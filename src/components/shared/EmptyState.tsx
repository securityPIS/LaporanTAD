import { Icon, type IconName } from "@/components/shared/Icons";

export function EmptyState({ icon, title, hint }: { icon: IconName; title: string; hint?: string }) {
  return (
    <div className="mt-10 flex flex-col items-center px-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-3 text-faint">
        <Icon name={icon} size={28} />
      </div>
      <div className="mt-3 text-[14px] font-extrabold text-text">{title}</div>
      {hint && <div className="mt-1 text-[12.5px] text-faint">{hint}</div>}
    </div>
  );
}
