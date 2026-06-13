import { afterEach, describe, expect, it } from "vitest";

import { getRequestOrigin } from "@/lib/http/origin";

const originalEnv = { ...process.env };

afterEach(() => {
  process.env = { ...originalEnv };
});

describe("getRequestOrigin", () => {
  it("keeps local development redirects on localhost", () => {
    const headers = new Headers({ host: "localhost:3000" });

    expect(getRequestOrigin(headers)).toBe("http://localhost:3000");
  });

  it("uses Vercel's forwarded public origin", () => {
    const headers = new Headers({
      host: "localhost:3000",
      "x-forwarded-host": "school.example.com",
      "x-forwarded-proto": "https",
    });

    expect(getRequestOrigin(headers)).toBe("https://school.example.com");
  });

  it("prefers Vercel's deployment URL over a localhost fallback", () => {
    process.env.VERCEL_URL = "mks-chatbot-git-main.vercel.app";
    process.env.NEXT_PUBLIC_APP_URL = "http://localhost:3000";

    expect(getRequestOrigin(new Headers())).toBe(
      "https://mks-chatbot-git-main.vercel.app",
    );
  });
});
