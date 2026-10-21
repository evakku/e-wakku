import { describe, it, expect } from "vitest";
import {
  shouldInterceptClick,
  isRoutePending,
  normalizeRoute,
} from "@/components/navigation/navigation-utils";

describe("shouldInterceptClick (Navigation Loading Safety)", () => {
  it("allows normal left-click on a new internal route", () => {
    const result = shouldInterceptClick({
      href: "/about",
      currentPath: "/",
    });
    expect(result).toBe(true);
  });

  it("ignores click on the currently active route", () => {
    const result = shouldInterceptClick({
      href: "/about",
      currentPath: "/about",
    });
    expect(result).toBe(false);
  });

  it("allows click when query parameter changes on the same route", () => {
    const result = shouldInterceptClick({
      href: "/allIssues?page=2",
      currentPath: "/allIssues",
    });
    expect(result).toBe(true);
  });

  it("ignores click with modifier keys (Cmd/Ctrl/Shift/Alt)", () => {
    expect(
      shouldInterceptClick({
        href: "/allIssues",
        currentPath: "/",
        metaKey: true,
      })
    ).toBe(false);

    expect(
      shouldInterceptClick({
        href: "/allIssues",
        currentPath: "/",
        ctrlKey: true,
      })
    ).toBe(false);

    expect(
      shouldInterceptClick({
        href: "/allIssues",
        currentPath: "/",
        shiftKey: true,
      })
    ).toBe(false);

    expect(
      shouldInterceptClick({
        href: "/allIssues",
        currentPath: "/",
        altKey: true,
      })
    ).toBe(false);
  });

  it("ignores non-primary clicks (middle click or right click)", () => {
    expect(
      shouldInterceptClick({
        href: "/allIssues",
        currentPath: "/",
        button: 1, // middle click
      })
    ).toBe(false);

    expect(
      shouldInterceptClick({
        href: "/allIssues",
        currentPath: "/",
        button: 2, // right click
      })
    ).toBe(false);
  });

  it("ignores links targeted for new tabs (_blank)", () => {
    expect(
      shouldInterceptClick({
        href: "/about",
        currentPath: "/",
        target: "_blank",
      })
    ).toBe(false);
  });

  it("ignores download links", () => {
    expect(
      shouldInterceptClick({
        href: "/document.pdf",
        currentPath: "/",
        hasDownload: true,
      })
    ).toBe(false);
  });

  it("ignores external links and special protocols", () => {
    expect(
      shouldInterceptClick({
        href: "https://google.com",
        currentPath: "/",
      })
    ).toBe(false);

    expect(
      shouldInterceptClick({
        href: "http://example.com",
        currentPath: "/",
      })
    ).toBe(false);

    expect(
      shouldInterceptClick({
        href: "mailto:editor@e-wakku.com",
        currentPath: "/",
      })
    ).toBe(false);

    expect(
      shouldInterceptClick({
        href: "tel:+1234567890",
        currentPath: "/",
      })
    ).toBe(false);
  });

  it("ignores same-page hash anchors with and without full path", () => {
    expect(
      shouldInterceptClick({
        href: "#features",
        currentPath: "/",
      })
    ).toBe(false);

    expect(
      shouldInterceptClick({
        href: "/about#team",
        currentPath: "/about",
      })
    ).toBe(false);

    // But should intercept cross-page navigation with hash
    expect(
      shouldInterceptClick({
        href: "/about#team",
        currentPath: "/contact",
      })
    ).toBe(true);
  });

  it("ignores already defaultPrevented clicks", () => {
    expect(
      shouldInterceptClick({
        href: "/about",
        currentPath: "/",
        defaultPrevented: true,
      })
    ).toBe(false);
  });
});

describe("isRoutePending (Destination Identification)", () => {
  it("identifies matching pending destination", () => {
    expect(isRoutePending("/about", "/about")).toBe(true);
    expect(isRoutePending("/allIssues", "/allIssues")).toBe(true);
    expect(isRoutePending("/", "/")).toBe(true);
  });

  it("handles trailing slash equivalence in pending check", () => {
    expect(isRoutePending("/about/", "/about")).toBe(true);
    expect(isRoutePending("/about", "/about/")).toBe(true);
  });

  it("identifies matching destination with query parameters", () => {
    expect(isRoutePending("/allIssues?page=2", "/allIssues")).toBe(true);
  });

  it("does not match different destinations", () => {
    expect(isRoutePending("/about", "/contact")).toBe(false);
    expect(isRoutePending("/admin", "/")).toBe(false);
    expect(isRoutePending("/", "/admin")).toBe(false);
    expect(isRoutePending("/admin/issues/manage", "/admin")).toBe(false);
  });

  it("returns false when no navigation is pending", () => {
    expect(isRoutePending(null, "/about")).toBe(false);
  });
});

describe("normalizeRoute", () => {
  it("normalizes trailing slashes properly", () => {
    expect(normalizeRoute("/about/")).toBe("/about");
    expect(normalizeRoute("/about")).toBe("/about");
    expect(normalizeRoute("/")).toBe("/");
    expect(normalizeRoute("")).toBe("/");
  });

  it("normalizes trailing slashes before query parameters", () => {
    expect(normalizeRoute("/allIssues/?page=2")).toBe("/allIssues?page=2");
    expect(normalizeRoute("/allIssues?page=2")).toBe("/allIssues?page=2");
  });
});
