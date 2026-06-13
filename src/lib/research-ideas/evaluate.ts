import { generateText, Output } from "ai";

import { getChatModel } from "@/lib/ai/models";
import {
  researchIdeaFeedbackSchema,
  type ResearchIdeaFeedback,
  type ResearchIdeaInput,
} from "@/schemas/research-idea";

const evaluationInstructions = `
Bạn là cố vấn nghiên cứu học đường. Hãy đánh giá sơ bộ ý tưởng của học sinh một
cách xây dựng, ngắn gọn và phù hợp độ tuổi. Không khẳng định ý tưởng đã được phê
duyệt. Tập trung vào tính rõ ràng, khả thi, giá trị học tập, an toàn và bước tiếp
theo. Không bịa đặt dữ liệu hay nguồn tham khảo.
`.trim();

const fallbackFeedback: ResearchIdeaFeedback = {
  verdict: "developing",
  summary:
    "Ý tưởng đã được ghi nhận. Hệ thống chưa thể hoàn tất đánh giá AI sơ bộ lúc này.",
  strengths: [],
  considerations: [
    "Hãy làm rõ câu hỏi nghiên cứu, đối tượng khảo sát và kết quả mong đợi.",
  ],
  nextSteps: [
    "Trao đổi với giáo viên hướng dẫn để xác định phạm vi và phương pháp phù hợp.",
  ],
};

export type EvaluatedResearchIdea = {
  feedback: ResearchIdeaFeedback;
  model: string;
};

export async function evaluateResearchIdea(
  input: ResearchIdeaInput,
): Promise<EvaluatedResearchIdea> {
  const model = process.env.AI_CHAT_MODEL ?? "deepseek/deepseek-v4-flash";

  try {
    const { output } = await generateText({
      model: getChatModel(),
      output: Output.object({ schema: researchIdeaFeedbackSchema }),
      system: evaluationInstructions,
      prompt: `Lĩnh vực: ${input.field}\nTên ý tưởng: ${input.title}\nMô tả: ${input.description}`,
    });

    return { feedback: output, model };
  } catch (error) {
    console.error("Failed to evaluate research idea", error);
    return { feedback: fallbackFeedback, model: `${model}:fallback` };
  }
}
