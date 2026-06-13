import { describe, expect, it } from "vitest";

import { calculateAvailableQuantity } from "@/lib/makerspace/availability";

describe("calculateAvailableQuantity", () => {
  it("reports enough capacity when the requested quantity fits", () => {
    expect(calculateAvailableQuantity(8, [2, 1], 4)).toEqual({
      available: 5,
      isAvailable: true,
      requested: 4,
    });
  });

  it("prevents booking beyond the remaining capacity", () => {
    expect(calculateAvailableQuantity(3, [2, 1], 1)).toEqual({
      available: 0,
      isAvailable: false,
      requested: 1,
    });
  });
});
