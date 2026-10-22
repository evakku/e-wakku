import { describe, it, expect, vi, beforeEach } from "vitest";
import { createIssue } from "@/app/admin/issues/new/action";
import { MAX_FILE_SIZE_BYTES } from "@/lib/validation/file-upload";

// Mock dependencies
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

const mockStorageUpload = vi.fn();
const mockStorageDownload = vi.fn();
const mockStorageRemove = vi.fn();
const mockStorageGetPublicUrl = vi.fn();
const mockDbInsert = vi.fn();
const mockDbSingle = vi.fn();

let mockAuthorized = true;
const mockAuthError = "Unauthorized: Valid admin authentication session required.";

vi.mock("@/lib/supabase/auth", () => ({
  requireAdminAuth: vi.fn(async () => {
    if (!mockAuthorized) {
      return { authorized: false, error: mockAuthError };
    }
    return {
      authorized: true,
      user: { id: "admin-user-id", email: "admin@e-wakku.com" },
      supabase: {
        storage: {
          from: (bucket: string) => ({
            upload: (...args: unknown[]) => mockStorageUpload(...args),
            download: (...args: unknown[]) => mockStorageDownload(bucket, ...args),
            remove: (...args: unknown[]) => mockStorageRemove(...args),
            getPublicUrl: (path: string) => mockStorageGetPublicUrl(bucket, path),
          }),
        },
        from: () => ({
          insert: (...args: unknown[]) => {
            mockDbInsert(...args);
            return {
              select: () => ({
                single: () => mockDbSingle(),
              }),
            };
          },
        }),
      },
    };
  }),
}));

describe("Issue Upload Server Action Workflow (SEC-Upload)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuthorized = true;

    mockStorageUpload.mockResolvedValue({ data: { path: "mock-path" }, error: null });
    mockStorageDownload.mockImplementation(async (bucket: string) => {
      if (bucket === "covers") {
        const header = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0]);
        return { data: new Blob([header]), error: null };
      } else {
        const header = new TextEncoder().encode("%PDF-1.7\nSample");
        return { data: new Blob([header]), error: null };
      }
    });
    mockStorageRemove.mockResolvedValue({ data: [], error: null });
    mockStorageGetPublicUrl.mockImplementation((bucket: string, path: string) => ({
      data: { publicUrl: `https://mock.supabase.co/storage/v1/object/public/${bucket}/${path}` },
    }));
    mockDbSingle.mockResolvedValue({ data: { id: "new-issue-uuid" }, error: null });
  });

  describe("Authorization & Security Guards", () => {
    it("rejects unauthorized upload attempts with an auth error", async () => {
      mockAuthorized = false;
      const formData = new FormData();
      formData.append("title", "Test Title");
      formData.append("description", "Test Description");
      formData.append("month", "05");
      formData.append("year", "2026");
      formData.append("isDraft", "true");

      const result = await createIssue({}, formData);
      expect(result.error).toContain("Unauthorized");
      expect(result.success).toBeUndefined();
      expect(mockDbInsert).not.toHaveBeenCalled();
    });

    it("rejects missing required metadata fields", async () => {
      const formData = new FormData();
      formData.append("title", ""); // empty title
      formData.append("description", "Some description");
      formData.append("month", "05");
      formData.append("year", "2026");
      formData.append("isDraft", "true");

      const result = await createIssue({}, formData);
      expect(result.error).toBe("Title is required.");
      expect(mockDbInsert).not.toHaveBeenCalled();
    });

    it("rejects invalid publication month", async () => {
      const formData = new FormData();
      formData.append("title", "Valid Title");
      formData.append("description", "Some description");
      formData.append("month", "13"); // invalid month
      formData.append("year", "2026");
      formData.append("isDraft", "true");

      const result = await createIssue({}, formData);
      expect(result.error).toContain("Select a valid month");
      expect(mockDbInsert).not.toHaveBeenCalled();
    });
  });

  describe("Direct Storage Asset Path Workflow (Preferred Architecture)", () => {
    it("successfully validates storage assets, inserts DB row, and defaults to draft", async () => {
      const formData = new FormData();
      formData.append("title", "New Editorial Issue");
      formData.append("description", "A deep dive into Malayalam typography.");
      formData.append("month", "11");
      formData.append("year", "2026");
      formData.append("isDraft", "true"); // Draft default
      formData.append("coverUrl", "https://mock.supabase.co/storage/v1/object/public/covers/cover-123.png");
      formData.append("pdfUrl", "https://mock.supabase.co/storage/v1/object/public/issue-pdfs/doc-123.pdf");
      formData.append("coverStoragePath", "cover-123.png");
      formData.append("pdfStoragePath", "doc-123.pdf");

      const result = await createIssue({}, formData);
      expect(result.success).toBe(true);
      expect(result.issueId).toBe("new-issue-uuid");

      // Verify DB insert payload
      expect(mockDbInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "New Editorial Issue",
          description: "A deep dive into Malayalam typography.",
          month: "11",
          year: 2026,
          is_draft: true,
          published_at: null, // Drafts must have null published_at
          cover_image_url: "https://mock.supabase.co/storage/v1/object/public/covers/cover-123.png",
          pdf_url: "https://mock.supabase.co/storage/v1/object/public/issue-pdfs/doc-123.pdf",
        })
      );
    });

    it("assigns published_at timestamp when explicitly published", async () => {
      const formData = new FormData();
      formData.append("title", "Published Edition");
      formData.append("description", "Directly published issue.");
      formData.append("month", "12");
      formData.append("year", "2026");
      formData.append("isDraft", "false"); // Explicitly published
      formData.append("coverUrl", "https://mock.supabase.co/storage/v1/object/public/covers/cover-456.png");
      formData.append("pdfUrl", "https://mock.supabase.co/storage/v1/object/public/issue-pdfs/doc-456.pdf");
      formData.append("coverStoragePath", "cover-456.png");
      formData.append("pdfStoragePath", "doc-456.pdf");

      const result = await createIssue({}, formData);
      expect(result.success).toBe(true);

      expect(mockDbInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          is_draft: false,
          published_at: expect.any(String),
        })
      );
    });

    it("rejects if uploaded storage asset exceeds 7.5 MiB and cleans up files", async () => {
      // Mock storage download returning an oversized blob for PDF
      mockStorageDownload.mockImplementation(async (bucket: string) => {
        if (bucket === "covers") {
          const header = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0]);
          return { data: new Blob([header]), error: null };
        } else {
          // Oversized PDF > 7.5 MiB
          const fakeBytes = new Uint8Array(MAX_FILE_SIZE_BYTES + 100);
          fakeBytes.set(new TextEncoder().encode("%PDF-1.7\n"), 0);
          return { data: new Blob([fakeBytes]), error: null };
        }
      });

      const formData = new FormData();
      formData.append("title", "Oversized Test");
      formData.append("description", "Should be rejected.");
      formData.append("month", "01");
      formData.append("year", "2027");
      formData.append("isDraft", "true");
      formData.append("coverUrl", "https://mock.supabase.co/covers/cover-large.png");
      formData.append("pdfUrl", "https://mock.supabase.co/issue-pdfs/doc-large.pdf");
      formData.append("coverStoragePath", "cover-large.png");
      formData.append("pdfStoragePath", "doc-large.pdf");

      const result = await createIssue({}, formData);
      expect(result.error).toContain("The maximum file size is 7.5 MiB per file");
      expect(mockDbInsert).not.toHaveBeenCalled();

      // Ensure both uploaded files are deleted from storage (no orphaned assets)
      expect(mockStorageRemove).toHaveBeenCalledWith(["cover-large.png"]);
      expect(mockStorageRemove).toHaveBeenCalledWith(["doc-large.pdf"]);
    });

    it("rejects if storage PDF has invalid header bytes and cleans up files", async () => {
      mockStorageDownload.mockImplementation(async (bucket: string) => {
        if (bucket === "covers") {
          const header = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0]);
          return { data: new Blob([header]), error: null };
        } else {
          // Fake PDF with HTML content
          const fakeBytes = new TextEncoder().encode("<html>Fake PDF</html>");
          return { data: new Blob([fakeBytes]), error: null };
        }
      });

      const formData = new FormData();
      formData.append("title", "Fake Header Test");
      formData.append("description", "Should be rejected.");
      formData.append("month", "01");
      formData.append("year", "2027");
      formData.append("isDraft", "true");
      formData.append("coverUrl", "https://mock.supabase.co/covers/cover-fake.png");
      formData.append("pdfUrl", "https://mock.supabase.co/issue-pdfs/doc-fake.pdf");
      formData.append("coverStoragePath", "cover-fake.png");
      formData.append("pdfStoragePath", "doc-fake.pdf");

      const result = await createIssue({}, formData);
      expect(result.error).toContain("Please select a valid PDF file");
      expect(mockDbInsert).not.toHaveBeenCalled();
      expect(mockStorageRemove).toHaveBeenCalledWith(["cover-fake.png"]);
      expect(mockStorageRemove).toHaveBeenCalledWith(["doc-fake.pdf"]);
    });

    it("rolls back storage files if database insertion fails", async () => {
      // Mock DB insert returning error
      mockDbSingle.mockResolvedValue({
        data: null,
        error: { message: "Database connection timeout" },
      });

      const formData = new FormData();
      formData.append("title", "DB Failure Test");
      formData.append("description", "Testing rollback.");
      formData.append("month", "03");
      formData.append("year", "2026");
      formData.append("isDraft", "true");
      formData.append("coverUrl", "https://mock.supabase.co/covers/cover-rollback.png");
      formData.append("pdfUrl", "https://mock.supabase.co/issue-pdfs/doc-rollback.pdf");
      formData.append("coverStoragePath", "cover-rollback.png");
      formData.append("pdfStoragePath", "doc-rollback.pdf");

      const result = await createIssue({}, formData);
      expect(result.error).toContain("Failed to save issue: Database connection timeout");

      // Verify rollback called for both uploaded assets
      expect(mockStorageRemove).toHaveBeenCalledWith(["cover-rollback.png"]);
      expect(mockStorageRemove).toHaveBeenCalledWith(["doc-rollback.pdf"]);
    });
  });

  describe("FormData File Upload Fallback Path", () => {
    it("validates FormData files, uploads to storage, and persists issue", async () => {
      const pngHeader = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0]);
      const coverFile = new File([pngHeader], "valid_cover.png", { type: "image/png" });

      const pdfHeader = new TextEncoder().encode("%PDF-1.7\nSample");
      const pdfFile = new File([pdfHeader], "valid_doc.pdf", { type: "application/pdf" });

      const formData = new FormData();
      formData.append("title", "Fallback Upload Test");
      formData.append("description", "Testing server-mediated upload.");
      formData.append("month", "04");
      formData.append("year", "2026");
      formData.append("isDraft", "true");
      formData.append("coverImage", coverFile);
      formData.append("pdfFile", pdfFile);

      const result = await createIssue({}, formData);
      expect(result.success).toBe(true);
      expect(mockStorageUpload).toHaveBeenCalledTimes(2);
      expect(mockDbInsert).toHaveBeenCalled();
    });

    it("rejects oversized FormData files before storage upload", async () => {
      const oversizedPdf = new File(
        [new Uint8Array(MAX_FILE_SIZE_BYTES + 10)],
        "huge.pdf",
        { type: "application/pdf" }
      );
      const validPng = new File(
        [new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])],
        "cover.png",
        { type: "image/png" }
      );

      const formData = new FormData();
      formData.append("title", "Server Validation Check");
      formData.append("description", "Oversized file should never reach storage upload.");
      formData.append("month", "04");
      formData.append("year", "2026");
      formData.append("isDraft", "true");
      formData.append("coverImage", validPng);
      formData.append("pdfFile", oversizedPdf);

      const result = await createIssue({}, formData);
      expect(result.error).toContain("The maximum file size is 7.5 MiB per file");
      expect(mockStorageUpload).not.toHaveBeenCalled();
      expect(mockDbInsert).not.toHaveBeenCalled();
    });
  });
});
