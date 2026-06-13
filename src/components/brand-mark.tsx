import { cn } from "@/lib/utils";

type BrandMarkProps = {
  className?: string;
  compact?: boolean;
};

export function BrandMark({ className, compact = false }: BrandMarkProps) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <span className="grid size-9 place-items-center rounded-full border border-[#2f5747]/20 bg-[#e1ecdf] text-sm font-semibold tracking-[-0.08em] text-[#244638]">
        MK
      </span>
      {!compact && (
        <span className="text-sm font-semibold tracking-[-0.02em] text-[#24352d]">
          MKS School
        </span>
      )}
    </div>
  );
}
