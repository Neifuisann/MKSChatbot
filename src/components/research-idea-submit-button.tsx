"use client";

import { LoaderCircle, Save, Send } from "lucide-react";
import { useFormStatus } from "react-dom";

type ResearchIdeaSubmitButtonProps = {
  disabled?: boolean;
  mode: "create" | "edit";
};

export function ResearchIdeaSubmitButton({
  disabled = false,
  mode,
}: ResearchIdeaSubmitButtonProps) {
  const { pending } = useFormStatus();
  const isDisabled = disabled || pending;

  return (
    <button
      className="flex h-11 items-center gap-2 rounded-full bg-[#275641] px-6 text-sm font-medium text-white shadow-[0_10px_24px_rgba(39,86,65,0.18)] transition hover:bg-[#1f4635] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#52715f] disabled:cursor-not-allowed disabled:bg-[#a6afa9] disabled:shadow-none"
      disabled={isDisabled}
      type="submit"
    >
      {pending ? (
        <LoaderCircle className="size-4 animate-spin" />
      ) : mode === "create" ? (
        <Send className="size-4" />
      ) : (
        <Save className="size-4" />
      )}
      {pending
        ? "AI đang đánh giá..."
        : mode === "create"
          ? "Gửi ý tưởng"
          : "Lưu và đánh giá lại"}
    </button>
  );
}
