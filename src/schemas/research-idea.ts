import { z } from "zod";

export const researchIdeaFields = [
  "Khoa học tự nhiên",
  "Khoa học xã hội",
  "Công nghệ thông tin",
  "Kinh tế và quản lý",
  "Ngôn ngữ và văn hóa",
  "Nghệ thuật và thiết kế",
  "Liên ngành",
  "Khác",
] as const;

export const researchIdeaInputSchema = z.object({
  title: z
    .string()
    .trim()
    .min(5, "Tên ý tưởng cần ít nhất 5 ký tự.")
    .max(200, "Tên ý tưởng không được vượt quá 200 ký tự."),
  description: z
    .string()
    .trim()
    .min(30, "Mô tả cần ít nhất 30 ký tự để AI có thể đánh giá.")
    .max(5000, "Mô tả không được vượt quá 5.000 ký tự."),
  field: z.enum(researchIdeaFields, {
    error: "Vui lòng chọn lĩnh vực nghiên cứu.",
  }),
});

export const researchIdeaFeedbackSchema = z.object({
  verdict: z.enum(["promising", "developing", "needs_focus"]),
  summary: z.string().trim().min(1).max(1200),
  strengths: z.array(z.string().trim().min(1).max(500)).max(3),
  considerations: z.array(z.string().trim().min(1).max(500)).max(3),
  nextSteps: z.array(z.string().trim().min(1).max(500)).max(3),
});

export const researchIdeaIdSchema = z.uuid("Mã ý tưởng không hợp lệ.");

export type ResearchIdeaFeedback = z.infer<typeof researchIdeaFeedbackSchema>;
export type ResearchIdeaInput = z.infer<typeof researchIdeaInputSchema>;
