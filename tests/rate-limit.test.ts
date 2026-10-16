import { describe, it, expect, beforeEach } from "vitest";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

describe("In-Memory Rate Limiter", () => {
  it("allows requests under the limit", () => {
    const key = `test-ip-${Date.now()}-1`;
    const res1 = checkRateLimit(key, 5, 10000);
    expect(res1.success).toBe(true);
    expect(res1.remaining).toBe(4);

    const res2 = checkRateLimit(key, 5, 10000);
    expect(res2.success).toBe(true);
    expect(res2.remaining).toBe(3);
  });

  it("blocks requests once the limit is exceeded", () => {
    const key = `test-ip-${Date.now()}-2`;
    for (let i = 0; i < 3; i++) {
      checkRateLimit(key, 3, 10000);
    }
    const blockedRes = checkRateLimit(key, 3, 10000);
    expect(blockedRes.success).toBe(false);
    expect(blockedRes.remaining).toBe(0);
  });

  it("extracts client IP from headers", () => {
    const headers = new Headers();
    headers.set("x-forwarded-for", "203.0.113.195, 70.41.3.18");
    expect(getClientIp(headers)).toBe("203.0.113.195");

    const realIpHeaders = new Headers();
    realIpHeaders.set("x-real-ip", "198.51.100.42");
    expect(getClientIp(realIpHeaders)).toBe("198.51.100.42");

    expect(getClientIp()).toBe("127.0.0.1");
  });
});
