import { describe, expect, it } from "vitest";

import { profileSchema } from "@/schemas/profile";

const validProfile = {
  studentId: "23131234",
  fullName: "Nguyễn Văn An",
  learningField: "Công nghệ thông tin",
  studentEmail: "student@hcmute.edu.vn",
};

describe("profileSchema", () => {
  it("accepts and normalizes a valid profile", () => {
    expect(
      profileSchema.parse({
        ...validProfile,
        studentEmail: "STUDENT@HCMUTE.EDU.VN",
      }).studentEmail,
    ).toBe("student@hcmute.edu.vn");
  });

  it("rejects an invalid student id", () => {
    expect(
      profileSchema.safeParse({ ...validProfile, studentId: "MKS 001" })
        .success,
    ).toBe(false);
  });

  it("rejects an unsupported learning field", () => {
    expect(
      profileSchema.safeParse({ ...validProfile, learningField: "Unknown" })
        .success,
    ).toBe(false);
  });
});
