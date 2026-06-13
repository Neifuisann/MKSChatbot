import { BookOpen, FileText, FlaskConical } from "lucide-react";

import { researchIdeaFields, type ResearchIdeaInput } from "@/schemas/research-idea";

type ResearchIdeaFieldsProps = {
  defaultValues?: ResearchIdeaInput;
  disabled?: boolean;
};

const inputClass =
  "w-full rounded-xl border border-[#dcd7cc] bg-white px-3.5 text-sm text-[#263d31] outline-none transition placeholder:text-[#a6ada9] focus:border-[#799483] focus:ring-3 focus:ring-[#799483]/15 disabled:cursor-not-allowed disabled:bg-[#efede7] disabled:text-[#7e8781]";

export function ResearchIdeaFields({
  defaultValues,
  disabled = false,
}: ResearchIdeaFieldsProps) {
  return (
    <fieldset className="space-y-5" disabled={disabled}>
      <label className="block space-y-2 text-xs font-medium text-[#4b5e54]">
        <span className="flex items-center gap-2">
          <FlaskConical className="size-3.5 text-[#728078]" />
          Tên ý tưởng
        </span>
        <input
          className={`${inputClass} h-11`}
          defaultValue={defaultValues?.title}
          maxLength={200}
          minLength={5}
          name="title"
          placeholder="Ví dụ: Hệ thống tưới cây thông minh cho khuôn viên trường"
          required
        />
      </label>

      <label className="block space-y-2 text-xs font-medium text-[#4b5e54]">
        <span className="flex items-center gap-2">
          <BookOpen className="size-3.5 text-[#728078]" />
          Lĩnh vực
        </span>
        <select
          className={`${inputClass} h-11 appearance-none`}
          defaultValue={defaultValues?.field ?? ""}
          name="field"
          required
        >
          <option disabled value="">
            Chọn lĩnh vực nghiên cứu
          </option>
          {researchIdeaFields.map((field) => (
            <option key={field} value={field}>
              {field}
            </option>
          ))}
        </select>
      </label>

      <label className="block space-y-2 text-xs font-medium text-[#4b5e54]">
        <span className="flex items-center gap-2">
          <FileText className="size-3.5 text-[#728078]" />
          Mô tả ý tưởng
        </span>
        <textarea
          className={`${inputClass} min-h-36 resize-y py-3 leading-6`}
          defaultValue={defaultValues?.description}
          maxLength={5000}
          minLength={30}
          name="description"
          placeholder="Trình bày vấn đề bạn muốn nghiên cứu, đối tượng, cách tiếp cận dự kiến và kết quả mong đợi..."
          required
        />
      </label>
    </fieldset>
  );
}
