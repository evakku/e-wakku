import { describe, it, expect, vi, beforeEach } from "vitest";
import { updateIssue, deleteIssue, toggleDraftStatus } from "@/app/admin/issues/manage/actions";
import { MAX_FILE_SIZE_BYTES } from "@/lib/validation/file-upload";

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("@/lib/analytics", () => ({
  removeIssueAnalytics: vi.fn(async () => {}),
}));

const mockStorageUpload = vi.fn();
const mockStorageRemove = vi.fn();
const mockStorageGetPublicUrl = vi.fn();
const mockDbUpdate = vi.fn();
const mockDbDelete = vi.fn();
const mockDbSelect = vi.fn();
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
            upload: (...args: unknown[]) => mockStorageUpload(bucket, ...args),
            remove: (...args: unknown[]) => mockStorageRemove(bucket, ...args),
            getPublicUrl: (path: string) => mockStorageGetPublicUrl(bucket, path),
          }),
        },
        from: (table: string) => ({
          select: (...args: unknown[]) => {
            mockDbSelect(table, ...args);
            return {
              eq: () => ({
                single: () => mockDbSingle(),
              }),
            };
          },
          update: (...args: unknown[]) => {
            mockDbUpdate(...args);
            return {
              eq: () => mockDbUpdate(),
            };
          },
          delete: () => {
            mockDbDelete();
            return {
              eq: () => mockDbDelete(),
            };
          },
        }),
      },
    };
  }),
}));

describe("Issue Management & Update Workflow (SEC-Update)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuthorized = true;

    mockStorageUpload.mockResolvedValue({ data: { path: "mock-path" }, error: null });
    mockStorageRemove.mockResolvedValue({ data: [], error: null });
    mockStorageGetPublicUrl.mockImplementation((bucket: string, path: string) => ({
      data: { publicUrl: `https://mock.supabase.co/storage/v1/object/public/${bucket}/${path}` },
    }));

    mockDbSingle.mockResolvedValue({
      data: {
        id: "existing-uuid-1",
        title: "Existing Issue",
        description: "Existing Description",
        month: "05",
        year: 2026,
        is_draft: true,
        cover_image_url: "https://mock.supabase.co/storage/v1/object/public/covers/old-cover.png",
        pdf_url: "https://mock.supabase.co/storage/v1/object/public/issue-pdfs/old-pdf.pdf",
      },
      error: null,
    });
    mockDbUpdate.mockResolvedValue({ error: null });
    mockDbDelete.mockResolvedValue({ error: null });
  });

  describe("Authorization & Validation", () => {
    it("rejects unauthorized update requests", async () => {
      mockAuthorized = false;
      const formData = new FormData();
      formData.append("id", "existing-uuid-1");
      formData.append("title", "Updated Title");
      formData.append("description", "Updated Description");
      formData.append("month", "06");
      formData.append("year", "2026");
      formData.append("isDraft", "false");

      const res = await updateIssue({}, formData);
      expect(res.error).toContain("Unauthorized");
      expect(mockDbUpdate).not.toHaveBeenCalled();
    });

    it("rejects update when ID is missing", async () => {
      const formData = new FormData();
      formData.append("title", "Updated Title");
      formData.append("description", "Updated Description");
      formData.append("month", "06");
      formData.append("year", "2026");
      formData.append("isDraft", "false");

      const res = await updateIssue({}, formData);
      expect(res.error).toBe("Missing issue ID.");
    });
  });

  describe("File Replacement & Storage Atomicity", () => {
    it("rejects replacement cover exceeding 7.5 MiB without storage upload", async () => {
      const oversizedCover = new File(
        [new Uint8Array(MAX_FILE_SIZE_BYTES + 100)],
        "huge-cover.png",
        { type: "image/png" }
      );

      const formData = new FormData();
      formData.append("id", "existing-uuid-1");
      formData.append("title", "Updated Title");
      formData.append("description", "Updated Description");
      formData.append("month", "06");
      formData.append("year", "2026");
      formData.append("isDraft", "false");
      formData.append("coverImage", oversizedCover);

      const res = await updateIssue({}, formData);
      expect(res.error).toContain("The maximum file size is 7.5 MiB per file");
      expect(mockStorageUpload).not.toHaveBeenCalled();
    });

    it("rolls back newly uploaded cover if database update fails", async () => {
      const validPng = new File(
        [new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0])],
        "new-cover.png",
        { type: "image/png" }
      );

      // Simulate DB update failure
      mockDbUpdate.mockResolvedValue({ error: { message: "Database write error" } });

      const formData = new FormData();
      formData.append("id", "existing-uuid-1");
      formData.append("title", "Updated Title");
      formData.append("description", "Updated Description");
      formData.append("month", "06");
      formData.append("year", "2026");
      formData.append("isDraft", "false");
      formData.append("coverImage", validPng);

      const res = await updateIssue({}, formData);
      expect(res.error).toContain("Database update failed");
      // Newly uploaded file should be removed to avoid orphan
      expect(mockStorageRemove).toHaveBeenCalledWith(
        "covers",
        expect.arrayContaining([expect.stringContaining("new-cover.png")])
      );
      // Old cover must NOT have been removed since DB write failed
      expect(mockStorageRemove).not.toHaveBeenCalledWith(
        "covers",
        ["old-cover.png"]
      );
    });

    it("cleans up old files only after database write succeeds", async () => {
      const validPng = new File(
        [new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0])],
        "replacement-cover.png",
        { type: "image/png" }
      );

      const formData = new FormData();
      formData.append("id", "existing-uuid-1");
      formData.append("title", "Updated Title");
      formData.append("description", "Updated Description");
      formData.append("month", "06");
      formData.append("year", "2026");
      formData.append("isDraft", "false");
      formData.append("coverImage", validPng);

      const res = await updateIssue({}, formData);
      expect(res.success).toBe(true);

      // Verify that old cover was cleaned up after successful write
      expect(mockStorageRemove).toHaveBeenCalledWith("covers", ["old-cover.png"]);
    });
  });

  describe("Draft Toggle & Delete", () => {
    it("toggles draft status and assigns published_at when publishing", async () => {
      const res = await toggleDraftStatus("existing-uuid-1", true); // currently draft -> publishing
      expect(res.success).toBe(true);
      expect(res.message).toBe("Issue published successfully");
      expect(mockDbUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          is_draft: false,
          published_at: expect.any(String),
        })
      );
    });

    it("deletes issue and removes files from storage", async () => {
      const res = await deleteIssue("existing-uuid-1");
      expect(res.success).toBe(true);
      expect(res.message).toBe("Issue deleted successfully");
      expect(mockStorageRemove).toHaveBeenCalledWith("covers", ["old-cover.png"]);
      expect(mockStorageRemove).toHaveBeenCalledWith("issue-pdfs", ["old-pdf.pdf"]);
    });
  });
});
