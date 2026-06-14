import type { LucideIcon } from "lucide-react";

type AdminPageHeaderProps = {
  description: string;
  eyebrow: string;
  title: string;
};

export function AdminPageHeader({
  description,
  eyebrow,
  title,
}: AdminPageHeaderProps) {
  return (
    <header className="max-w-3xl">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#a75942]">
        {eyebrow}
      </p>
      <h1 className="mt-3 font-serif text-4xl tracking-[-0.04em] text-[#203a2e] sm:text-5xl">
        {title}
      </h1>
      <p className="mt-4 max-w-2xl text-sm leading-6 text-[#667a70]">{description}</p>
    </header>
  );
}

export function AdminStatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: number | string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-[#cdd9d1] bg-[#f8faf8] px-4 py-3 shadow-[0_8px_24px_rgba(41,71,59,0.05)]">
      <span className="grid size-9 place-items-center rounded-xl bg-[#f2e6df] text-[#a75942]">
        <Icon className="size-4" />
      </span>
      <span>
        <span className="block text-[11px] uppercase tracking-[0.12em] text-[#71847a]">
          {label}
        </span>
        <span className="mt-0.5 block font-serif text-2xl text-[#294536]">{value}</span>
      </span>
    </div>
  );
}

export function AdminNotice({
  error,
  success,
}: {
  error?: string;
  success?: string;
}) {
  if (!error && !success) return null;
  return (
    <p
      className={
        error
          ? "mt-6 rounded-2xl border border-[#dfb8a9] bg-[#f8eae4] px-4 py-3 text-sm text-[#8b4935]"
          : "mt-6 rounded-2xl border border-[#bfd5c5] bg-[#eaf3eb] px-4 py-3 text-sm text-[#356249]"
      }
    >
      {error || success}
    </p>
  );
}

export const adminPanelClass =
  "rounded-[1.6rem] border border-[#cfdad3] bg-[#f9fbf9] p-5 shadow-[0_18px_50px_rgba(41,71,59,0.08)]";

export const adminInputClass =
  "w-full rounded-xl border border-[#c9d5cd] bg-white px-3.5 text-sm text-[#294536] outline-none transition placeholder:text-[#91a098] focus:border-[#a96b55] focus:ring-3 focus:ring-[#a96b55]/15 disabled:bg-[#edf1ee] disabled:text-[#718078]";

export const adminButtonClass =
  "inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#d76d4c] px-4 text-sm font-medium text-white transition hover:bg-[#c45f40] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#e6a18b] disabled:cursor-not-allowed disabled:opacity-50";
