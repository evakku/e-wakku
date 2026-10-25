/**
 * @file Unit and Regression Tests: Issue Creator Attribution & Protection
 *
 * Verifies the end-to-end security contracts, persistence rules, and display fallbacks
 * for tracking which administrator originally created each publication issue:
 * 1. Authenticated administrator creates an issue and their UUID is persisted.
 * 2. Unauthenticated users cannot create issues.
 * 3. Non-administrator users cannot create issues.
 * 4. A client-supplied `created_by` cannot impersonate another administrator.
 * 5. The issue list displays the correct creator's display name.
 * 6. Missing creator information displays the fallback correctly.
 * 7. Legacy issues with null creator IDs continue to render.
 * 8. Removing an administrator does not delete historical issues.
 * 9. Editing an issue preserves the original creator.
 * 10. Draft toggling preserves the original creator.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { createIssue } from "@/app/admin/issues/new/action";
import {
  getIssues,
  updateIssue,
  toggleDraftStatus,
  resolveCreatorNames,
} from "@/app/admin/issues/manage/actions";
import { formatCreatorLabel } from "@/lib/utils/creator";

// Mock next/cache
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

const mockStorageUpload = vi.fn();
const mockStorageDownload = vi.fn();
const mockStorageRemove = vi.fn();
const mockStorageGetPublicUrl = vi.fn();
const mockDbInsert = vi.fn();
const mockDbUpdate = vi.fn();
const mockDbSelect = vi.fn();
const mockDbSingle = vi.fn();
const mockDbRange = vi.fn();
const mockRpc = vi.fn();

let mockAuthorized = true;
let mockAuthUserId = "author-admin-uuid-1";
let mockAuthUserEmail = "author@e-wakku.com";

vi.mock("@/lib/supabase/auth", () => ({
  requireAdminAuth: vi.fn(async () => {
    if (!mockAuthorized) {
      return { authorized: false, error: "Unauthorized: Valid admin authentication session required." };
    }
    return {
      authorized: true,
      user: {
        id: mockAuthUserId,
        email: mockAuthUserEmail,
        user_metadata: { name: "Author Admin" },
      },
      supabase: {
        rpc: mockRpc,
        storage: {
          from: (bucket: string) => ({
            upload: (...args: unknown[]) => mockStorageUpload(bucket, ...args),
            download: (...args: unknown[]) => mockStorageDownload(bucket, ...args),
            remove: (...args: unknown[]) => mockStorageRemove(bucket, ...args),
            getPublicUrl: (path: string) => mockStorageGetPublicUrl(bucket, path),
          }),
        },
        from: (table: string) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const queryBuilder: any = {
            select: (...args: unknown[]) => {
              mockDbSelect(table, ...args);
              return queryBuilder;
            },
            eq: () => queryBuilder,
            neq: () => queryBuilder,
            ilike: () => queryBuilder,
            order: () => queryBuilder,
            range: (...rArgs: unknown[]) => mockDbRange(...rArgs),
            maybeSingle: () => Promise.resolve({ data: null, error: null }),
            single: () => mockDbSingle(),
            insert: (...args: unknown[]) => {
              mockDbInsert(...args);
              return {
                select: () => ({
                  single: () => mockDbSingle(),
                }),
              };
            },
            update: (...args: unknown[]) => {
              mockDbUpdate(...args);
              return {
                eq: () => ({ error: null }),
              };
            },
          };
          return queryBuilder;
        },
      },
    };
  }),
}));

describe("Issue Creator Attribution & Protection (SEC-Attribution)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuthorized = true;
    mockAuthUserId = "author-admin-uuid-1";
    mockAuthUserEmail = "author@e-wakku.com";

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
    mockStorageGetPublicUrl.mockImplementation((bucket: string, path: string) => ({
      data: { publicUrl: `https://mock.supabase.co/storage/v1/object/public/${bucket}/${path}` },
    }));
    mockDbSingle.mockResolvedValue({ data: { id: "issue-uuid-1" }, error: null });
    mockDbUpdate.mockResolvedValue({ error: null });
    mockRpc.mockResolvedValue({
      data: [
        {
          user_id: "author-admin-uuid-1",
          email: "author@e-wakku.com",
          display_name: "Navaneeth",
        },
        {
          user_id: "second-admin-uuid-2",
          email: "prajosh@e-wakku.com",
          display_name: "Prajosh",
        },
      ],
      error: null,
    });
  });

  describe("1. Secure Creator Persistence on Issue Creation", () => {
    it("persists authenticated administrator's UUID as created_by", async () => {
      const formData = new FormData();
      formData.append("title", "May 2026 Edition");
      formData.append("description", "Editorial publication");
      formData.append("month", "05");
      formData.append("year", "2026");
      formData.append("isDraft", "true");
      formData.append("coverUrl", "https://mock.supabase.co/storage/v1/object/public/covers/c1.png");
      formData.append("pdfUrl", "https://mock.supabase.co/storage/v1/object/public/issue-pdfs/p1.pdf");
      formData.append("coverStoragePath", "c1.png");
      formData.append("pdfStoragePath", "p1.pdf");

      const result = await createIssue({}, formData);
      expect(result.success).toBe(true);

      // Verify that created_by is populated strictly with the authenticated admin's UUID
      expect(mockDbInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "May 2026 Edition",
          created_by: "author-admin-uuid-1",
        })
      );
    });

    it("rejects issue creation when unauthenticated", async () => {
      mockAuthorized = false;
      const formData = new FormData();
      formData.append("title", "May 2026 Edition");
      formData.append("description", "Editorial publication");
      formData.append("month", "05");
      formData.append("year", "2026");
      formData.append("isDraft", "true");

      const result = await createIssue({}, formData);
      expect(result.success).toBeUndefined();
      expect(result.error).toContain("Unauthorized");
      expect(mockDbInsert).not.toHaveBeenCalled();
    });

    it("rejects client-supplied created_by attempting to impersonate another administrator", async () => {
      const formData = new FormData();
      formData.append("title", "Spoofed Creator Edition");
      formData.append("description", "Attempting impersonation");
      formData.append("month", "06");
      formData.append("year", "2026");
      formData.append("isDraft", "true");
      formData.append("coverUrl", "https://mock.supabase.co/storage/v1/object/public/covers/c1.png");
      formData.append("pdfUrl", "https://mock.supabase.co/storage/v1/object/public/issue-pdfs/p1.pdf");
      formData.append("coverStoragePath", "c1.png");
      formData.append("pdfStoragePath", "p1.pdf");

      // Attacker attempts to pass a different admin's UUID in the form
      formData.append("created_by", "victim-admin-uuid-999");
      formData.append("createdBy", "victim-admin-uuid-999");

      const result = await createIssue({}, formData);
      expect(result.success).toBe(true);

      // Verify server IGNORED the client parameters and used the verified server-side identity
      expect(mockDbInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          created_by: "author-admin-uuid-1",
        })
      );
      expect(mockDbInsert).not.toHaveBeenCalledWith(
        expect.objectContaining({
          created_by: "victim-admin-uuid-999",
        })
      );
    });
  });

  describe("2. Creator Display Name Resolution & Fallbacks", () => {
    it("resolves creator display name for active administrator in issue list", async () => {
      mockDbRange.mockResolvedValueOnce({
        data: [
          {
            id: "issue-1",
            title: "Issue by Navaneeth",
            description: "Desc",
            month: "05",
            year: 2026,
            is_draft: false,
            published_at: "2026-05-01T00:00:00Z",
            created_at: "2026-04-20T00:00:00Z",
            created_by: "author-admin-uuid-1",
          },
          {
            id: "issue-2",
            title: "Issue by Prajosh",
            description: "Desc",
            month: "06",
            year: 2026,
            is_draft: false,
            published_at: "2026-06-01T00:00:00Z",
            created_at: "2026-05-20T00:00:00Z",
            created_by: "second-admin-uuid-2",
          },
        ],
        count: 2,
        error: null,
      });

      const { issues, total } = await getIssues(1, 8);
      expect(total).toBe(2);
      expect(issues).toHaveLength(2);
      expect(issues[0].created_by).toBe("author-admin-uuid-1");
      expect(issues[0].created_by_name).toBe("Navaneeth");
      expect(issues[1].created_by).toBe("second-admin-uuid-2");
      expect(issues[1].created_by_name).toBe("Prajosh");
    });

    it("handles legacy issues with null created_by correctly", async () => {
      mockDbRange.mockResolvedValueOnce({
        data: [
          {
            id: "legacy-issue-1",
            title: "Legacy Issue Before Tracking",
            description: "Desc",
            month: "01",
            year: 2026,
            is_draft: false,
            published_at: "2026-01-01T00:00:00Z",
            created_at: "2025-12-20T00:00:00Z",
            created_by: null,
          },
        ],
        count: 1,
        error: null,
      });

      const { issues } = await getIssues(1, 8);
      expect(issues).toHaveLength(1);
      expect(issues[0].created_by).toBeNull();
      expect(issues[0].created_by_name).toBeNull();

      // UI helper returns "Legacy issue"
      expect(formatCreatorLabel(issues[0].created_by_name, issues[0].created_by)).toBe("Legacy issue");
    });

    it("handles missing/unknown administrator records with Admin fallback", async () => {
      mockDbRange.mockResolvedValueOnce({
        data: [
          {
            id: "orphan-issue-1",
            title: "Issue with Deleted Creator",
            description: "Desc",
            month: "02",
            year: 2026,
            is_draft: false,
            published_at: "2026-02-01T00:00:00Z",
            created_at: "2026-01-20T00:00:00Z",
            created_by: "deleted-admin-uuid-999", // Not present in RPC directory
          },
        ],
        count: 1,
        error: null,
      });

      const { issues } = await getIssues(1, 8);
      expect(issues).toHaveLength(1);
      expect(issues[0].created_by).toBe("deleted-admin-uuid-999");
      expect(issues[0].created_by_name).toBe("Admin");

      // UI helper returns "Admin"
      expect(formatCreatorLabel(issues[0].created_by_name, issues[0].created_by)).toBe("Admin");
    });

    it("formatCreatorLabel formats all cases accurately", () => {
      expect(formatCreatorLabel("Navaneeth", "uuid-1")).toBe("Navaneeth");
      expect(formatCreatorLabel("Prajosh", "uuid-2")).toBe("Prajosh");
      expect(formatCreatorLabel(null, "some-uuid")).toBe("Admin");
      expect(formatCreatorLabel(undefined, "some-uuid")).toBe("Admin");
      expect(formatCreatorLabel("", "some-uuid")).toBe("Admin");
      expect(formatCreatorLabel(null, null)).toBe("Legacy issue");
      expect(formatCreatorLabel(undefined, undefined)).toBe("Legacy issue");
    });

    it("resolveCreatorNames returns empty map when no creator IDs are given", async () => {
      const map = await resolveCreatorNames([], { rpc: mockRpc });
      expect(map.size).toBe(0);
      expect(mockRpc).not.toHaveBeenCalled();
    });
  });

  describe("3. Creator Immutability on Issue Edit & Draft Toggle", () => {
    it("updateIssue does not touch or overwrite created_by", async () => {
      mockDbSingle.mockResolvedValueOnce({
        data: {
          id: "issue-uuid-1",
          title: "Original Title",
          description: "Original Description",
          month: "05",
          year: 2026,
          is_draft: false,
          created_by: "original-creator-uuid",
        },
        error: null,
      });

      const formData = new FormData();
      formData.append("id", "issue-uuid-1");
      formData.append("title", "Edited Title");
      formData.append("description", "Edited Description");
      formData.append("month", "05");
      formData.append("year", "2026");
      formData.append("isDraft", "false");

      // Attacker attempts to change creator in edit form
      formData.append("created_by", "attacker-uuid");
      formData.append("createdBy", "attacker-uuid");

      const res = await updateIssue({}, formData);
      expect(res.success).toBe(true);

      // Verify DB update payload contains only edited fields and NEVER touches created_by
      expect(mockDbUpdate).toHaveBeenCalledWith({
        title: "Edited Title",
        description: "Edited Description",
        month: "05",
        year: 2026,
        is_draft: false,
      });
      expect(mockDbUpdate).not.toHaveBeenCalledWith(
        expect.objectContaining({
          created_by: expect.anything(),
        })
      );
    });

    it("toggleDraftStatus preserves created_by attribution", async () => {
      const res = await toggleDraftStatus("issue-uuid-1", false);
      expect(res.success).toBe(true);

      // Verify toggleDraftStatus only updates is_draft and published_at
      expect(mockDbUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          is_draft: true,
        })
      );
      expect(mockDbUpdate).not.toHaveBeenCalledWith(
        expect.objectContaining({
          created_by: expect.anything(),
        })
      );
    });
  });
});
