import { Icon, type IconName } from "@/components/shared/Icons";

const TONES: Record<string, { fg: string; bg: string }> = {
  cuti: { fg: "var(--cuti)", bg: "var(--cuti-weak)" },
  libur: { fg: "var(--libur)", bg: "var(--libur-weak)" },
  faint: { fg: "var(--muted)", bg: "var(--surface-3)" },
};

export function StatusCard({
  tone,
  icon,
  title,
  body,
  children,
}: {
  tone: keyof typeof TONES;
  icon: IconName;
  title: string;
  body: string;
  children?: React.ReactNode;
}) {
  const t = TONES[tone];
  return (
    <div className="rounded-2xl border border-border bg-surface p-6 text-center shadow-sm">
      <div
        className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl"
        style={{ background: t.bg, color: t.fg }}
      >
        <Icon name={icon} size={30} />
      </div>
      <h1 className="mt-4 text-[18px] font-extrabold tracking-[-.3px]">{title}</h1>
      <p className="mx-auto mt-2 max-w-[360px] text-[13px] leading-relaxed text-muted">{body}</p>
      {children && <div className="mt-6 flex justify-center gap-3">{children}</div>}
    </div>
  );
}
