import { describe, it, expect } from "vitest";
import { getImageUrl } from "@/lib/utils/image";

describe("getImageUrl (INF-03 Image Utility)", () => {
  it("returns static string URLs directly", () => {
    expect(getImageUrl("/images/cover.png")).toBe("/images/cover.png");
    expect(getImageUrl("https://example.com/photo.jpg")).toBe("https://example.com/photo.jpg");
  });

  it("handles empty or nullish values safely", () => {
    expect(getImageUrl(null)).toBe("");
    expect(getImageUrl(undefined)).toBe("");
    expect(getImageUrl("")).toBe("");
  });

  it("extracts url from asset objects", () => {
    const objectWithAsset = {
      asset: {
        url: "https://cdn.example.com/image.webp",
      },
    };
    expect(getImageUrl(objectWithAsset)).toBe("https://cdn.example.com/image.webp");
  });
});
