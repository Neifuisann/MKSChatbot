import { describe, expect, it } from "vitest";

import { stackCheckSchema } from "@/schemas/stack-check";

describe("stackCheckSchema", () => {
  it("accepts a useful question", () => {
    expect(
      stackCheckSchema.parse({ question: "When does enrollment open?" }),
    ).toEqual({ question: "When does enrollment open?" });
  });

  it("rejects empty input", () => {
    expect(stackCheckSchema.safeParse({ question: " " }).success).toBe(false);
  });
});
