/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getNextEditionMonthAndYear,
  formatEditionName,
  normalizeMonth,
} from "@/lib/utils/edition";
import { createIssue, checkEditionExists } from "@/app/admin/issues/new/action";
import { updateIssue } from "@/app/admin/issues/manage/actions";
import { getLatestIssue } from "@/lib/queries/issue";
import { toMagazineIssue, toDetailIssue } from "@/lib/queries/issue-adapter";

// Mock dependencies
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

const mockStorageUpload = vi.fn();
const mockStorageDownload = vi.fn();
const mockStorageRemove = vi.fn();
const mockStorageGetPublicUrl = vi.fn();
const mockDbInsert = vi.fn();
const mockDbUpdate = vi.fn();
const mockDbSingle = vi.fn();
const mockDbMaybeSingle = vi.fn();
const mockDbSelect = vi.fn();

let mockAuthorized = true;
let mockExistingIssues: Array<{
  id: string;
  title: string;
  description?: string;
  year: number;
  month: string;
  is_draft: boolean;
  published_at: string | null;
  created_at: string;
  pdf_url?: string;
  cover_image_url?: string;
}> = [];

// Mock Supabase Server Client (for lib/queries/issue.ts)
vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    from: () => {
      let isDraftFilter: boolean | undefined;
      const orderClauses: Array<{ column: string; ascending?: boolean; nullsFirst?: boolean }> = [];
      let limitCount: number | undefined;

      const builder: any = {
        select: () => builder,
        eq: (col: string, val: any) => {
          if (col === "is_draft") isDraftFilter = val;
          return builder;
        },
        neq: () => builder,
        order: (column: string, opts?: { ascending?: boolean; nullsFirst?: boolean }) => {
          orderClauses.push({ column, ...opts });
          return builder;
        },
        limit: (n: number) => {
          limitCount = n;
          return builder;
        },
        maybeSingle: async () => {
          let list = [...mockExistingIssues];
          if (isDraftFilter !== undefined) {
            list = list.filter((i) => i.is_draft === isDraftFilter);
          }
          list.sort((a, b) => {
            for (const { column, ascending } of orderClauses) {
              const asc = ascending ? 1 : -1;
              const aVal = (a as any)[column];
              const bVal = (b as any)[column];
              if (aVal === bVal) continue;
              if (aVal === null || aVal === undefined) return 1;
              if (bVal === null || bVal === undefined) return -1;
              if (aVal < bVal) return -1 * asc;
              if (aVal > bVal) return 1 * asc;
            }
            return 0;
          });

          return { data: list[0] ?? null, error: null };
        },
        then: (resolve: any) => {
          let list = [...mockExistingIssues];
          if (isDraftFilter !== undefined) {
            list = list.filter((i) => i.is_draft === isDraftFilter);
          }
          list.sort((a, b) => {
            for (const { column, ascending } of orderClauses) {
              const asc = ascending ? 1 : -1;
              const aVal = (a as any)[column];
              const bVal = (b as any)[column];
              if (aVal === bVal) continue;
              if (aVal === null || aVal === undefined) return 1;
              if (bVal === null || bVal === undefined) return -1;
              if (aVal < bVal) return -1 * asc;
              if (aVal > bVal) return 1 * asc;
            }
            return 0;
          });
          if (limitCount !== undefined) {
            list = list.slice(0, limitCount);
          }
          return resolve({ data: list, error: null });
        },
      };
      return builder;
    },
  })),
}));

// Mock requireAdminAuth (for server actions)
vi.mock("@/lib/supabase/auth", () => ({
  requireAdminAuth: vi.fn(async () => {
    if (!mockAuthorized) {
      return { authorized: false, error: "Unauthorized" };
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
        from: (table: string) => {
          const filters: Record<string, any> = {};
          const neqFilters: Record<string, any> = {};

          const queryBuilder: any = {
            select: (...args: unknown[]) => {
              mockDbSelect(table, ...args);
              return queryBuilder;
            },
            eq: (col: string, val: any) => {
              filters[col] = val;
              return queryBuilder;
            },
            neq: (col: string, val: any) => {
              neqFilters[col] = val;
              return queryBuilder;
            },
            maybeSingle: () => {
              mockDbMaybeSingle();
              const match = mockExistingIssues.find((issue) => {
                for (const [k, v] of Object.entries(filters)) {
                  if ((issue as any)[k] !== v) return false;
                }
                for (const [k, v] of Object.entries(neqFilters)) {
                  if ((issue as any)[k] === v) return false;
                }
                return true;
              });
              return Promise.resolve({
                data: match
                  ? { id: match.id, title: match.title, is_draft: match.is_draft }
                  : null,
                error: null,
              });
            },
            single: () => {
              // If querying by id in currentIssue check
              if (filters.id) {
                const match = mockExistingIssues.find((i) => i.id === filters.id);
                if (match) {
                  return Promise.resolve({ data: match, error: null });
                }
              }
              return mockDbSingle();
            },
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
                eq: () => mockDbUpdate(),
              };
            },
            delete: () => {
              return {
                eq: () => Promise.resolve({ error: null }),
              };
            },
          };
          return queryBuilder;
        },
      },
    };
  }),
}));

// Helper to construct a valid multipart form data with valid PDF and PNG magic bytes
function createMockIssueFormData(overrides: Record<string, string> = {}) {
  const pdfBytes = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x34]);
  const coverBytes = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  const formData = new FormData();
  formData.append("title", overrides.title || "Default Issue Title");
  formData.append("description", overrides.description || "Default issue description");
  formData.append("month", overrides.month || "11");
  formData.append("year", overrides.year || "2026");
  formData.append("isDraft", overrides.isDraft || "false");

  formData.append(
    "coverImage",
    new File([coverBytes], "cover.png", { type: "image/png" })
  );
  formData.append(
    "pdfFile",
    new File([pdfBytes], "issue.pdf", { type: "application/pdf" })
  );

  return formData;
}

describe("Monthly Magazine Release Validation & Latest Issue Logic", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuthorized = true;
    mockExistingIssues = [];

    mockStorageUpload.mockResolvedValue({ data: { path: "mock-path" }, error: null });
    mockStorageRemove.mockResolvedValue({ data: [], error: null });
    mockStorageGetPublicUrl.mockImplementation((bucket: string, path: string) => ({
      data: { publicUrl: `https://mock.supabase.co/storage/v1/object/public/${bucket}/${path}` },
    }));

    mockDbSingle.mockResolvedValue({
      data: {
        id: "mock-new-id",
        title: "Mock Title",
        pdf_url: "https://mock.supabase.co/mock.pdf",
        cover_image_url: "https://mock.supabase.co/mock.png",
        created_at: new Date().toISOString(),
        is_draft: false,
      },
      error: null,
    });
  });

  // =========================================================================
  // Section 1: Default Publication Date Behavior
  // =========================================================================
  describe("1. Default Publication Date Behavior", () => {
    it("1.1 defaults to November 2026 when reference date is in October 2026", () => {
      const refDate = new Date("2026-10-24T12:00:00Z");
      const next = getNextEditionMonthAndYear(refDate);

      expect(next.month).toBe("11");
      expect(next.year).toBe(2026);
      expect(next.monthName).toBe("November");
    });

    it("1.2 handles year rollover: defaults to January 2027 when reference date is in December 2026", () => {
      const refDate = new Date("2026-12-15T10:00:00Z");
      const next = getNextEditionMonthAndYear(refDate);

      expect(next.month).toBe("01");
      expect(next.year).toBe(2027);
      expect(next.monthName).toBe("January");
    });

    it("1.3 defaults to February 2027 when reference date is in January 2027", () => {
      const refDate = new Date("2027-01-05T08:00:00Z");
      const next = getNextEditionMonthAndYear(refDate);

      expect(next.month).toBe("02");
      expect(next.year).toBe(2027);
      expect(next.monthName).toBe("February");
    });

    it("1.4 preserves manually selected month and year on issue submission", async () => {
      const formData = createMockIssueFormData({
        title: "Historical Archive Edition",
        description: "A special edition from August 2025",
        month: "08",
        year: "2025",
      });

      const res = await createIssue({}, formData);

      expect(res.success).toBe(true);
      expect(mockDbInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          year: 2025,
          month: "08",
        })
      );
    });
  });

  // =========================================================================
  // Section 2: Duplicate Monthly Edition Protection
  // =========================================================================
  describe("2. Duplicate Monthly Edition Protection", () => {
    it("2.1 rejects creating a second November 2026 issue with a friendly error message", async () => {
      mockExistingIssues.push({
        id: "existing-nov-2026",
        title: "November 2026 Edition",
        year: 2026,
        month: "11",
        is_draft: false,
        published_at: "2026-11-01T00:00:00Z",
        created_at: "2026-10-20T00:00:00Z",
      });

      const formData = createMockIssueFormData({
        title: "Duplicate November 2026",
        month: "11",
        year: "2026",
      });

      const res = await createIssue({}, formData);

      expect(res.success).toBeFalsy();
      expect(res.error).toBe("An issue already exists for November 2026. Edit the existing issue instead.");
      expect(mockStorageUpload).not.toHaveBeenCalled();
      expect(mockDbInsert).not.toHaveBeenCalled();
    });

    it("2.2 ensures draft editions reserve the month/year pair", async () => {
      mockExistingIssues.push({
        id: "draft-dec-2026",
        title: "December Draft",
        year: 2026,
        month: "12",
        is_draft: true,
        published_at: null,
        created_at: "2026-10-21T00:00:00Z",
      });

      const formData = createMockIssueFormData({
        title: "Second December Attempt",
        month: "12",
        year: "2026",
      });

      const res = await createIssue({}, formData);

      expect(res.success).toBeFalsy();
      expect(res.error).toBe("An issue already exists for December 2026. Edit the existing issue instead.");
    });

    it("2.3 ensures published editions reserve the month/year pair", async () => {
      mockExistingIssues.push({
        id: "pub-oct-2026",
        title: "October 2026",
        year: 2026,
        month: "10",
        is_draft: false,
        published_at: "2026-10-01T00:00:00Z",
        created_at: "2026-10-01T00:00:00Z",
      });

      const formData = createMockIssueFormData({
        title: "October Again",
        month: "10",
        year: "2026",
      });

      const res = await createIssue({}, formData);

      expect(res.success).toBeFalsy();
      expect(res.error).toBe("An issue already exists for October 2026. Edit the existing issue instead.");
    });

    it("2.4 handles database unique constraint violation (23505) and rolls back storage", async () => {
      // Simulate race condition: pre-check passes, but insert encounters DB unique constraint
      mockDbSingle.mockResolvedValueOnce({
        data: null,
        error: {
          code: "23505",
          message: 'duplicate key value violates unique constraint "uq_issues_year_month"',
        },
      });

      const formData = createMockIssueFormData({
        title: "Race Condition Edition",
        month: "11",
        year: "2026",
      });

      const res = await createIssue({}, formData);

      expect(res.success).toBeFalsy();
      expect(res.error).toBe("An issue already exists for November 2026. Edit the existing issue instead.");
      // Verify rollback cleaned up the uploaded files
      expect(mockStorageRemove).toHaveBeenCalledWith(
        expect.arrayContaining([expect.stringContaining("-cover.png")])
      );
      expect(mockStorageRemove).toHaveBeenCalledWith(
        expect.arrayContaining([expect.stringContaining("-issue.pdf")])
      );
    });

    it("2.5 allows editing an existing issue without changing its month/year", async () => {
      mockExistingIssues.push({
        id: "issue-123",
        title: "Current Edition",
        description: "Initial description",
        year: 2026,
        month: "10",
        is_draft: false,
        published_at: "2026-10-01T00:00:00Z",
        created_at: "2026-10-01T00:00:00Z",
      });

      mockDbUpdate.mockResolvedValue({ error: null });

      const formData = new FormData();
      formData.append("id", "issue-123");
      formData.append("title", "Updated October Edition Title");
      formData.append("description", "Updated description");
      formData.append("month", "10");
      formData.append("year", "2026");
      formData.append("isDraft", "false");

      const res = await updateIssue({}, formData);

      expect(res.success).toBe(true);
      expect(mockDbUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Updated October Edition Title",
          month: "10",
          year: 2026,
        })
      );
    });

    it("2.6 rejects editing an existing issue to a month/year that already belongs to another issue", async () => {
      mockExistingIssues.push(
        {
          id: "issue-1",
          title: "September Edition",
          description: "September description",
          year: 2026,
          month: "09",
          is_draft: false,
          published_at: "2026-09-01T00:00:00Z",
          created_at: "2026-09-01T00:00:00Z",
        },
        {
          id: "issue-2",
          title: "October Edition",
          description: "October description",
          year: 2026,
          month: "10",
          is_draft: false,
          published_at: "2026-10-01T00:00:00Z",
          created_at: "2026-10-01T00:00:00Z",
        }
      );

      // Attempt to move issue-1 into October 2026 (occupied by issue-2)
      const formData = new FormData();
      formData.append("id", "issue-1");
      formData.append("title", "September moved to October");
      formData.append("description", "Desc");
      formData.append("month", "10");
      formData.append("year", "2026");
      formData.append("isDraft", "false");

      const res = await updateIssue({}, formData);

      expect(res.success).toBeFalsy();
      expect(res.error).toBe("An issue already exists for October 2026. Edit the existing issue instead.");
      expect(mockDbUpdate).not.toHaveBeenCalled();
    });

    it("2.7 checkEditionExists accurately reports existence and issue details", async () => {
      mockExistingIssues.push({
        id: "existing-edition-id",
        title: "December Special",
        year: 2026,
        month: "12",
        is_draft: true,
        published_at: null,
        created_at: "2026-10-24T00:00:00Z",
      });

      const resultOccupied = await checkEditionExists("12", 2026);
      expect(resultOccupied.exists).toBe(true);
      expect(resultOccupied.issueTitle).toBe("December Special");

      const resultFree = await checkEditionExists("03", 2027);
      expect(resultFree.exists).toBe(false);
    });
  });

  // =========================================================================
  // Section 3: Latest Issue Selection Logic
  // =========================================================================
  describe("3. Latest Issue Selection Logic", () => {
    it("3.1 selects October 2026 over September 2026 regardless of upload sequence", async () => {
      mockExistingIssues = [
        {
          id: "sept-id",
          title: "September 2026",
          year: 2026,
          month: "09",
          is_draft: false,
          published_at: "2026-10-24T12:00:00Z", // republish date later
          created_at: "2026-10-24T12:00:00Z",
        },
        {
          id: "oct-id",
          title: "October 2026",
          year: 2026,
          month: "10",
          is_draft: false,
          published_at: "2026-10-01T00:00:00Z",
          created_at: "2026-10-01T00:00:00Z",
        },
      ];

      const latest = await getLatestIssue();
      expect(latest).not.toBeNull();
      expect(latest?.id).toBe("oct-id");
      expect(latest?.year).toBe(2026);
      expect(latest?.month).toBe("10");
    });

    it("3.2 prevents historical backfill uploads from usurping the latest edition", async () => {
      mockExistingIssues = [
        {
          id: "current-oct-2026",
          title: "October 2026",
          year: 2026,
          month: "10",
          is_draft: false,
          published_at: "2026-10-01T00:00:00Z",
          created_at: "2026-10-01T00:00:00Z",
        },
        {
          id: "historical-jan-2024",
          title: "January 2024 Archive",
          year: 2024,
          month: "01",
          is_draft: false,
          published_at: "2026-10-24T22:00:00Z", // uploaded today
          created_at: "2026-10-24T22:00:00Z",
        },
      ];

      const latest = await getLatestIssue();
      expect(latest?.id).toBe("current-oct-2026");
      expect(latest?.year).toBe(2026);
      expect(latest?.month).toBe("10");
    });

    it("3.3 never selects a draft issue as the latest issue even if editorial year/month is higher", async () => {
      mockExistingIssues = [
        {
          id: "oct-pub",
          title: "October 2026 Published",
          year: 2026,
          month: "10",
          is_draft: false,
          published_at: "2026-10-01T00:00:00Z",
          created_at: "2026-10-01T00:00:00Z",
        },
        {
          id: "nov-draft",
          title: "November 2026 Draft Work In Progress",
          year: 2026,
          month: "11",
          is_draft: true,
          published_at: null,
          created_at: "2026-10-24T00:00:00Z",
        },
      ];

      const latest = await getLatestIssue();
      expect(latest?.id).toBe("oct-pub");
      expect(latest?.is_draft).toBe(false);
    });

    it("3.4 does not promote an older issue when republished over a newer edition", async () => {
      mockExistingIssues = [
        {
          id: "issue-2025-12",
          title: "December 2025",
          year: 2025,
          month: "12",
          is_draft: false,
          published_at: "2026-10-24T20:00:00Z", // edited/republished today
          created_at: "2025-12-01T00:00:00Z",
        },
        {
          id: "issue-2026-10",
          title: "October 2026",
          year: 2026,
          month: "10",
          is_draft: false,
          published_at: "2026-10-01T00:00:00Z",
          created_at: "2026-10-01T00:00:00Z",
        },
      ];

      const latest = await getLatestIssue();
      expect(latest?.id).toBe("issue-2026-10");
      expect(latest?.year).toBe(2026);
    });

    it("3.5 applies deterministic tie-breaking on published_at, created_at, and id", async () => {
      mockExistingIssues = [
        {
          id: "uuid-aaa",
          title: "Edition A",
          year: 2026,
          month: "10",
          is_draft: false,
          published_at: "2026-10-01T00:00:00Z",
          created_at: "2026-10-01T00:00:00Z",
        },
        {
          id: "uuid-bbb",
          title: "Edition B",
          year: 2026,
          month: "10",
          is_draft: false,
          published_at: "2026-10-01T00:00:00Z",
          created_at: "2026-10-01T00:00:00Z",
        },
      ];

      const latest = await getLatestIssue();
      // uuid-bbb > uuid-aaa descending
      expect(latest?.id).toBe("uuid-bbb");
    });

    it("3.6 verifies issue adapter maps edition subtitle, title, and URLs for hero section display", () => {
      const dbIssue = {
        id: "oct-2026-hero",
        title: "October 2026 Edition",
        description: "Official Malayalam digital magazine for October 2026",
        cover_image_url: "https://mock.supabase.co/covers/oct2026.png",
        pdf_url: "https://mock.supabase.co/issues/oct2026.pdf",
        month: "10",
        year: 2026,
        is_draft: false,
        published_at: "2026-10-01T00:00:00Z",
        created_at: "2026-10-01T00:00:00Z",
      };

      const magazineIssue = toMagazineIssue(dbIssue);

      expect(magazineIssue._id).toBe("oct-2026-hero");
      expect(magazineIssue.title).toBe("October 2026 Edition");
      expect(magazineIssue.subtitle).toBe("October 2026");
      expect(magazineIssue.coverImage).toBe("https://mock.supabase.co/covers/oct2026.png");
      expect(magazineIssue.pdfUrl).toBe("https://mock.supabase.co/issues/oct2026.pdf");
      expect(magazineIssue.slug).toBe("oct-2026-hero");

      const detailIssue = toDetailIssue(dbIssue);
      expect(detailIssue.id).toBe("oct-2026-hero");
      expect(detailIssue.season).toBe("October");
      expect(detailIssue.year).toBe("2026");
    });

    it("3.7 formatEditionName and normalizeMonth handle various month input formats accurately", () => {
      expect(formatEditionName("10", 2026)).toBe("October 2026");
      expect(formatEditionName("1", 2027)).toBe("January 2027");
      expect(formatEditionName("01", 2027)).toBe("January 2027");
      expect(formatEditionName("November", 2026)).toBe("November 2026");

      expect(normalizeMonth(1)).toBe("01");
      expect(normalizeMonth("9")).toBe("09");
      expect(normalizeMonth("10")).toBe("10");
      expect(normalizeMonth("December")).toBe("12");
      expect(normalizeMonth("december")).toBe("12");
    });
  });
});
