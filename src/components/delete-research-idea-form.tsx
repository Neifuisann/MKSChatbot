"use client";

import { Trash2 } from "lucide-react";
import { useFormStatus } from "react-dom";

type DeleteResearchIdeaFormProps = {
  action: (formData: FormData) => void | Promise<void>;
};

export function DeleteResearchIdeaForm({ action }: DeleteResearchIdeaFormProps) {
  const { pending } = useFormStatus();

  return (
    <button
      className="flex h-9 items-center gap-2 rounded-full border border-[#dfb8a9] px-4 text-xs font-medium text-[#98513d] transition hover:bg-[#f8eae4] disabled:cursor-not-allowed disabled:opacity-50"
      disabled={pending}
      type="submit"
      formAction={action}
      onClick={(event) => {
        if (!window.confirm("Bạn chắc chắn muốn xóa ý tưởng này?")) {
          event.preventDefault();
        }
      }}
    >
      <Trash2 className="size-3.5" />
      {pending ? "Đang xóa..." : "Xóa"}
    </button>
  );
}
