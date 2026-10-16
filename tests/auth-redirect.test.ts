import { describe, it, expect } from "vitest";
import { getSafeRedirectPath } from "@/app/auth/callback/route";

describe("getSafeRedirectPath (BE-03 Security)", () => {
  it("allows whitelisted internal paths", () => {
    expect(getSafeRedirectPath("/admin")).toBe("/admin");
    expect(getSafeRedirectPath("/admin/reset-password")).toBe("/admin/reset-password");
    expect(getSafeRedirectPath("/admin/issues/manage")).toBe("/admin/issues/manage");
  });

  it("preserves safe query parameters on whitelisted paths", () => {
    expect(getSafeRedirectPath("/admin?tab=overview")).toBe("/admin?tab=overview");
  });

  it("rejects open redirect attempts to external protocols", () => {
    expect(getSafeRedirectPath("https://attacker.com")).toBe("/admin/reset-password");
    expect(getSafeRedirectPath("http://evil.org/phish")).toBe("/admin/reset-password");
  });

  it("rejects protocol-relative URLs", () => {
    expect(getSafeRedirectPath("//evil.com")).toBe("/admin/reset-password");
    expect(getSafeRedirectPath("/\\evil.com")).toBe("/admin/reset-password");
  });

  it("rejects non-whitelisted internal paths", () => {
    expect(getSafeRedirectPath("/unauthorized")).toBe("/admin/reset-password");
    expect(getSafeRedirectPath("/api/secret")).toBe("/admin/reset-password");
  });

  it("falls back to default when input is null or empty", () => {
    expect(getSafeRedirectPath(null)).toBe("/admin/reset-password");
    expect(getSafeRedirectPath("")).toBe("/admin/reset-password");
  });
});
