import { describe, expect, it } from "vitest";

import { makerspaceBookingInputSchema } from "@/schemas/makerspace-booking";

const validBooking = {
  attendeeCount: 4,
  endsAt: "2026-07-01T04:00:00.000Z",
  notes: "",
  purpose: "Thử nghiệm mô hình cho dự án học kỳ.",
  quantity: 1,
  resourceId: "0f554632-9fe0-4f6c-b3f3-f2f52134bc5e",
  startsAt: "2026-07-01T02:00:00.000Z",
};

describe("makerspaceBookingInputSchema", () => {
  it("accepts a valid booking", () => {
    expect(makerspaceBookingInputSchema.safeParse(validBooking).success).toBe(true);
  });

  it("rejects an end time before the start time", () => {
    expect(
      makerspaceBookingInputSchema.safeParse({
        ...validBooking,
        endsAt: "2026-07-01T01:00:00.000Z",
      }).success,
    ).toBe(false);
  });

  it("rejects a booking longer than eight hours", () => {
    expect(
      makerspaceBookingInputSchema.safeParse({
        ...validBooking,
        endsAt: "2026-07-01T11:00:00.000Z",
      }).success,
    ).toBe(false);
  });
});
