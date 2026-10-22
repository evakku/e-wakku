import { describe, it, expect } from "vitest";
import {
  validateCoverImageFile,
  validatePdfDocumentFile,
  MAX_FILE_SIZE_BYTES,
  isPdfHeader,
  isPngHeader,
  isJpegHeader,
  isWebpHeader,
  formatFileSize,
} from "@/lib/validation/file-upload";

describe("File Upload Validation (BE-04 / SEC-Upload)", () => {
  describe("File size boundary tests (7.5 MiB = 7,864,320 bytes)", () => {
    it("confirms MAX_FILE_SIZE_BYTES is exactly 7,864,320 bytes", () => {
      expect(MAX_FILE_SIZE_BYTES).toBe(7.5 * 1024 * 1024);
      expect(MAX_FILE_SIZE_BYTES).toBe(7864320);
    });

    it("rejects zero-byte files with appropriate error message", async () => {
      const emptyCover = new File([new Uint8Array(0)], "empty.png", { type: "image/png" });
      const coverRes = await validateCoverImageFile(emptyCover);
      expect(coverRes.valid).toBe(false);
      expect(coverRes.error).toBe("The selected file is empty.");

      const emptyPdf = new File([new Uint8Array(0)], "empty.pdf", { type: "application/pdf" });
      const pdfRes = await validatePdfDocumentFile(emptyPdf);
      expect(pdfRes.valid).toBe(false);
      expect(pdfRes.error).toBe("The selected file is empty.");
    });

    it("rejects missing files (null / undefined)", async () => {
      const coverRes = await validateCoverImageFile(null);
      expect(coverRes.valid).toBe(false);
      expect(coverRes.error).toBe("Cover image is required.");

      const pdfRes = await validatePdfDocumentFile(undefined);
      expect(pdfRes.valid).toBe(false);
      expect(pdfRes.error).toBe("The issue PDF is required.");
    });

    it("accepts a file of exactly 7.5 MiB (7,864,320 bytes) if otherwise valid", async () => {
      // Create valid PDF with exactly 7,864,320 bytes
      const header = new TextEncoder().encode("%PDF-1.7\n");
      const fullBuffer = new Uint8Array(MAX_FILE_SIZE_BYTES);
      fullBuffer.set(header, 0);

      const exactPdf = new File([fullBuffer], "exact_limit.pdf", { type: "application/pdf" });
      expect(exactPdf.size).toBe(7864320);

      const res = await validatePdfDocumentFile(exactPdf);
      expect(res.valid).toBe(true);
    });

    it("rejects a file of 7.5 MiB + 1 byte (7,864,321 bytes)", async () => {
      const header = new TextEncoder().encode("%PDF-1.7\n");
      const overBuffer = new Uint8Array(MAX_FILE_SIZE_BYTES + 1);
      overBuffer.set(header, 0);

      const overPdf = new File([overBuffer], "over_limit.pdf", { type: "application/pdf" });
      expect(overPdf.size).toBe(7864321);

      const res = await validatePdfDocumentFile(overPdf);
      expect(res.valid).toBe(false);
      expect(res.error).toContain("The maximum file size is 7.5 MiB per file");
    });

    it("rejects oversized cover image (> 7.5 MiB)", async () => {
      const pngHeader = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
      const overBuffer = new Uint8Array(MAX_FILE_SIZE_BYTES + 500);
      overBuffer.set(pngHeader, 0);

      const overCover = new File([overBuffer], "large_cover.png", { type: "image/png" });
      const res = await validateCoverImageFile(overCover);
      expect(res.valid).toBe(false);
      expect(res.error).toContain("The maximum file size is 7.5 MiB per file");
    });

    it("accepts both cover and PDF when each individual file satisfies the 7.5 MiB limit", async () => {
      const pngHeader = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0]);
      const cover = new File([pngHeader], "valid_cover.png", { type: "image/png" });

      const pdfHeader = new TextEncoder().encode("%PDF-1.7\nSample content");
      const pdf = new File([pdfHeader], "valid_doc.pdf", { type: "application/pdf" });

      const coverRes = await validateCoverImageFile(cover);
      const pdfRes = await validatePdfDocumentFile(pdf);

      expect(coverRes.valid).toBe(true);
      expect(pdfRes.valid).toBe(true);
    });
  });

  describe("File integrity and signature tests", () => {
    it("accepts valid PNG files with proper magic bytes", async () => {
      const validPng = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0]);
      const file = new File([validPng], "cover.png", { type: "image/png" });
      const res = await validateCoverImageFile(file);
      expect(res.valid).toBe(true);
      expect(res.format).toBe("png");
    });

    it("accepts valid JPEG files with proper magic bytes", async () => {
      const validJpeg = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46]);
      const file = new File([validJpeg], "cover.jpg", { type: "image/jpeg" });
      const res = await validateCoverImageFile(file);
      expect(res.valid).toBe(true);
      expect(res.format).toBe("jpeg");
    });

    it("accepts valid WebP files with proper magic bytes", async () => {
      // RIFF at [0..3], WEBP at [8..11]
      const validWebp = new Uint8Array([
        0x52, 0x49, 0x46, 0x46, 0x20, 0x00, 0x00, 0x00,
        0x57, 0x45, 0x42, 0x50, 0x56, 0x50, 0x38, 0x20,
      ]);
      const file = new File([validWebp], "cover.webp", { type: "image/webp" });
      const res = await validateCoverImageFile(file);
      expect(res.valid).toBe(true);
      expect(res.format).toBe("webp");
    });

    it("rejects unsupported image extensions (e.g. .gif, .svg, .bmp)", async () => {
      const blob = new Blob(["not-supported"]);
      const file = new File([blob], "anim.gif", { type: "image/gif" });
      const res = await validateCoverImageFile(file);
      expect(res.valid).toBe(false);
      expect(res.error).toContain("Please select a supported cover image format");
    });

    it("rejects files disguised with supported extension but invalid magic bytes", async () => {
      const fakeContent = new TextEncoder().encode("NOT_A_REAL_PNG_JUST_TEXT");
      const file = new File([fakeContent], "disguised.png", { type: "image/png" });
      const res = await validateCoverImageFile(file);
      expect(res.valid).toBe(false);
      expect(res.error).toContain("Please select a supported cover image format");
    });

    it("validates genuine PDF magic bytes (%PDF-)", async () => {
      const validPdfHeader = new TextEncoder().encode("%PDF-1.7\nSample");
      const file = new File([validPdfHeader], "issue.pdf", { type: "application/pdf" });
      const res = await validatePdfDocumentFile(file);
      expect(res.valid).toBe(true);
      expect(res.format).toBe("pdf");
    });

    it("rejects files with .pdf extension but invalid header bytes", async () => {
      const fakePdf = new TextEncoder().encode("<html><body>Not a PDF</body></html>");
      const file = new File([fakePdf], "fake.pdf", { type: "application/pdf" });
      const res = await validatePdfDocumentFile(file);
      expect(res.valid).toBe(false);
      expect(res.error).toContain("Please select a valid PDF file");
    });

    it("rejects PDF files without .pdf extension", async () => {
      const validPdfHeader = new TextEncoder().encode("%PDF-1.7\nSample");
      const file = new File([validPdfHeader], "issue.doc", { type: "application/pdf" });
      const res = await validatePdfDocumentFile(file);
      expect(res.valid).toBe(false);
      expect(res.error).toBe("File must have a .pdf extension.");
    });
  });

  describe("Utility functions", () => {
    it("formats file sizes correctly", () => {
      expect(formatFileSize(0)).toBe("0 B");
      expect(formatFileSize(500)).toBe("500 B");
      expect(formatFileSize(1024)).toBe("1.0 KB");
      expect(formatFileSize(1024 * 1024)).toBe("1.00 MB");
      expect(formatFileSize(7.5 * 1024 * 1024)).toBe("7.50 MB");
    });

    it("correctly identifies byte headers", () => {
      expect(isPdfHeader(new TextEncoder().encode("%PDF-1.4"))).toBe(true);
      expect(isPdfHeader(new Uint8Array([1, 2, 3]))).toBe(false);

      expect(isPngHeader(new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))).toBe(true);
      expect(isJpegHeader(new Uint8Array([0xff, 0xd8, 0xff]))).toBe(true);
      expect(
        isWebpHeader(
          new Uint8Array([0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x57, 0x45, 0x42, 0x50])
        )
      ).toBe(true);
    });
  });
});
