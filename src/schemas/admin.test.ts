import { describe, expect, it } from "vitest";

import { adminPromptSchema, adminResourceSchema } from "@/schemas/admin";

describe("adminPromptSchema", () => {
  it("rejects malformed prompt codes", () => {
    const result = adminPromptSchema.safeParse({
      category: "Nghiên cứu",
      code: "prompt-1",
      content: "Nội dung prompt đủ dài.",
      isActive: true,
      purpose: "Hỗ trợ nghiên cứu",
      sortOrder: 0,
      tip: "",
      title: "Prompt mẫu",
    });

    expect(result.success).toBe(false);
  });
});

describe("adminResourceSchema", () => {
  it("rejects invalid resource capacity", () => {
    const result = adminResourceSchema.safeParse({
      autoApprove: false,
      capacity: 0,
      category: "equipment",
      description: "Thiết bị phục vụ hoạt động thử nghiệm.",
      isActive: true,
      location: "Tầng 2",
      maxPeople: 1,
      name: "Thiết bị mẫu",
    });

    expect(result.success).toBe(false);
  });
});
