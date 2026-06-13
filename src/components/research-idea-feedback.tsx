import { AlertCircle, ArrowRight, CheckCircle2, Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import type { ResearchIdeaFeedback as Feedback } from "@/schemas/research-idea";

const verdictLabels: Record<Feedback["verdict"], string> = {
  developing: "Cần phát triển thêm",
  needs_focus: "Cần làm rõ trọng tâm",
  promising: "Có tiềm năng",
};

function MarkdownText({ children }: { children: string }) {
  return (
    <div className="prose prose-stone max-w-none text-sm leading-6 text-[#536159] prose-p:my-0">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{children}</ReactMarkdown>
    </div>
  );
}

export function ResearchIdeaFeedback({ feedback }: { feedback: Feedback }) {
  return (
    <section className="rounded-2xl border border-[#dce5dc] bg-[#f1f6f1] p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#46705a]">
          <Sparkles className="size-3.5" />
          Đánh giá AI sơ bộ
        </p>
        <span className="rounded-full bg-[#dcebdd] px-3 py-1 text-[11px] font-medium text-[#376149]">
          {verdictLabels[feedback.verdict]}
        </span>
      </div>

      <div className="mt-3">
        <MarkdownText>{feedback.summary}</MarkdownText>
      </div>

      {feedback.strengths.length > 0 && (
        <div className="mt-4">
          <p className="mb-2 flex items-center gap-2 text-xs font-semibold text-[#426a55]">
            <CheckCircle2 className="size-3.5" />
            Điểm mạnh
          </p>
          <ul className="space-y-1.5">
            {feedback.strengths.map((item) => (
              <li className="flex gap-2 text-sm leading-6 text-[#536159]" key={item}>
                <span className="mt-2 size-1.5 shrink-0 rounded-full bg-[#6d927c]" />
                <MarkdownText>{item}</MarkdownText>
              </li>
            ))}
          </ul>
        </div>
      )}

      {feedback.considerations.length > 0 && (
        <div className="mt-4">
          <p className="mb-2 flex items-center gap-2 text-xs font-semibold text-[#8a604d]">
            <AlertCircle className="size-3.5" />
            Cần cân nhắc
          </p>
          <ul className="space-y-1.5">
            {feedback.considerations.map((item) => (
              <li className="flex gap-2 text-sm leading-6 text-[#655950]" key={item}>
                <span className="mt-2 size-1.5 shrink-0 rounded-full bg-[#ba8064]" />
                <MarkdownText>{item}</MarkdownText>
              </li>
            ))}
          </ul>
        </div>
      )}

      {feedback.nextSteps.length > 0 && (
        <div className="mt-4">
          <p className="mb-2 flex items-center gap-2 text-xs font-semibold text-[#52665b]">
            <ArrowRight className="size-3.5" />
            Bước tiếp theo
          </p>
          <ul className="space-y-1.5">
            {feedback.nextSteps.map((item) => (
              <li className="flex gap-2 text-sm leading-6 text-[#536159]" key={item}>
                <span className="mt-2 size-1.5 shrink-0 rounded-full bg-[#7c8d82]" />
                <MarkdownText>{item}</MarkdownText>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
