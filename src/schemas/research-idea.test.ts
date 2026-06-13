import { describe, expect, it } from "vitest";

import {
  researchIdeaFeedbackSchema,
  researchIdeaInputSchema,
} from "@/schemas/research-idea";

const validIdea = {
  title: "Hệ thống tưới cây thông minh cho khuôn viên trường",
  description:
    "Nghiên cứu cảm biến độ ẩm và lịch tưới để giảm lượng nước sử dụng trong khuôn viên trường.",
  field: "Công nghệ thông tin",
};

describe("researchIdeaInputSchema", () => {
  it("accepts and trims a valid idea", () => {
    expect(
      researchIdeaInputSchema.parse({ ...validIdea, title: `  ${validIdea.title}  ` })
        .title,
    ).toBe(validIdea.title);
  });

  it("rejects a description that is too short", () => {
    expect(
      researchIdeaInputSchema.safeParse({ ...validIdea, description: "Quá ngắn." })
        .success,
    ).toBe(false);
  });
});

describe("researchIdeaFeedbackSchema", () => {
  it("rejects feedback with more than three strengths", () => {
    expect(
      researchIdeaFeedbackSchema.safeParse({
        verdict: "promising",
        summary: "Ý tưởng có tiềm năng.",
        strengths: ["1", "2", "3", "4"],
        considerations: [],
        nextSteps: [],
      }).success,
    ).toBe(false);
  });
});
