import { describe, it, expect } from "vitest";
import {
  validateCoverImageFile,
  validatePdfDocumentFile,
  MAX_COVER_IMAGE_SIZE,
  MAX_PDF_FILE_SIZE,
} from "@/lib/validation/file-upload";

describe("File Upload Validation (BE-04 Security)", () => {
  it("rejects missing or empty files", async () => {
    const res = await validateCoverImageFile(null);
    expect(res.valid).toBe(false);
    expect(res.error).toBe("Cover image is required.");
  });

  it("rejects files exceeding size limits", async () => {
    // Create dummy oversized file
    const oversizedBlob = new Blob([new Uint8Array(MAX_COVER_IMAGE_SIZE + 100)]);
    const file = new File([oversizedBlob], "large.png", { type: "image/png" });
    const res = await validateCoverImageFile(file);
    expect(res.valid).toBe(false);
    expect(res.error).toContain("exceeds maximum allowed size");
  });

  it("rejects invalid extension", async () => {
    const blob = new Blob(["not-png"]);
    const file = new File([blob], "test.jpg", { type: "image/jpeg" });
    const res = await validateCoverImageFile(file);
    expect(res.valid).toBe(false);
    expect(res.error).toContain("must have a .png extension");
  });

  it("rejects files disguised with .png extension but invalid magic bytes", async () => {
    const fakeContent = new TextEncoder().encode("NOT_A_REAL_PNG");
    const file = new File([fakeContent], "fake.png", { type: "image/png" });
    const res = await validateCoverImageFile(file);
    expect(res.valid).toBe(false);
    expect(res.error).toContain("magic bytes mismatch");
  });

  it("accepts valid PNG files with proper magic bytes", async () => {
    // PNG magic bytes: 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A
    const validPngHeader = new Uint8Array([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00,
    ]);
    const file = new File([validPngHeader], "cover.png", { type: "image/png" });
    const res = await validateCoverImageFile(file);
    expect(res.valid).toBe(true);
  });

  it("validates PDF magic bytes (%PDF-)", async () => {
    const validPdfHeader = new TextEncoder().encode("%PDF-1.7\nSample");
    const file = new File([validPdfHeader], "issue.pdf", {
      type: "application/pdf",
    });
    const res = await validatePdfDocumentFile(file);
    expect(res.valid).toBe(true);

    const invalidPdfHeader = new TextEncoder().encode("GIF89aNotAPdf");
    const badFile = new File([invalidPdfHeader], "bad.pdf", {
      type: "application/pdf",
    });
    const badRes = await validatePdfDocumentFile(badFile);
    expect(badRes.valid).toBe(false);
    expect(badRes.error).toContain("magic bytes mismatch");
  });
});
