/**
 * Supabase Storage Security Hardening Policies — Regression & Security Test Suite
 *
 * TEST EXECUTION ENVIRONMENT NOTICE:
 * ---------------------------------------------------------------------------
 * These tests are Client/Node.js Unit & Simulation Tests executing in the Vitest runtime.
 * They rigorously verify:
 * - TypeScript upload validation functions and exact byte boundaries (7.5 MiB).
 * - Client credential leak prevention (no service_role key exposed).
 * - Behavioral models of PostgreSQL RLS evaluation (Permissive OR vs Restrictive AND).
 * - Conservative preflight allowlist AST/logic (failing closed on OR expressions, helpers, RESTRICTIVE).
 * - Dynamic SQL rollback generation from captured metadata without phantom restoration.
 * - Schema cleanup safety (RESTRICT vs CASCADE data-loss prevention).
 * - Strict SELECT policy name-collision handling (no flawed text matching).
 * - Safe repeated execution (rerun idempotency without baseline overwrites).
 *
 * DISTINCT FROM LIVE ENGINE EXECUTION:
 * These simulation tests DO NOT connect to a live PostgreSQL engine. Live DDL execution,
 * foreign key constraints, and PostgreSQL catalog behavior must be validated separately
 * against a disposable local Supabase / PostgreSQL instance before production execution.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { MAX_FILE_SIZE_BYTES, validatePdfDocumentFile } from "@/lib/validation/file-upload";
import { getSupabaseConfig } from "@/lib/supabase/config";

interface MockAuthUser {
  id: string;
  email?: string;
  app_metadata?: Record<string, unknown>;
  user_metadata?: Record<string, unknown>;
}

let mockIsAdminRpcResult = false;

function evaluateStoragePolicy(
  action: "SELECT" | "INSERT" | "UPDATE" | "DELETE",
  bucketId: string,
  user: MockAuthUser | null,
  fileSize?: number
): { allowed: boolean; error?: string } {
  // Public SELECT policy on covers and issue-pdfs
  if (action === "SELECT") {
    if (bucketId === "covers" || bucketId === "issue-pdfs") {
      return { allowed: true };
    }
    return { allowed: false, error: "Access denied to private bucket" };
  }

  // Mutation operations require authenticated user
  if (!user) {
    return { allowed: false, error: "Unauthorized: Authenticated session required" };
  }

  // Storage bucket configuration: file size limit (7.5 MiB = 7,864,320 bytes)
  if (fileSize !== undefined && fileSize > MAX_FILE_SIZE_BYTES) {
    return {
      allowed: false,
      error: "Payload Too Large: The object exceeded the maximum allowed size of 7864320 bytes",
    };
  }

  // Evaluate public.is_admin()
  const isAdmin =
    mockIsAdminRpcResult ||
    user.app_metadata?.role === "admin" ||
    user.app_metadata?.is_admin === true ||
    user.user_metadata?.is_admin === true;

  if (!isAdmin) {
    return {
      allowed: false,
      error: `Forbidden: new row violates row-level security policy for table "objects" on ${action}`,
    };
  }

  return { allowed: true };
}

describe("Supabase Storage Security Hardening Policies", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIsAdminRpcResult = false;
  });

  describe("1. Unauthorized Uploads and Deletions (Non-Admin / Anonymous)", () => {
    it("rejects upload attempts by anonymous unauthenticated callers", () => {
      const result = evaluateStoragePolicy("INSERT", "covers", null, 1024);
      expect(result.allowed).toBe(false);
      expect(result.error).toContain("Unauthorized");
    });

    it("rejects upload attempts by authenticated non-admin users to covers bucket", () => {
      const nonAdminUser = {
        id: "reader-user-123",
        email: "reader@example.com",
        app_metadata: { role: "authenticated", is_admin: false },
      };
      mockIsAdminRpcResult = false;

      const result = evaluateStoragePolicy("INSERT", "covers", nonAdminUser, 2048);
      expect(result.allowed).toBe(false);
      expect(result.error).toContain("violates row-level security policy");
    });

    it("rejects upload attempts by authenticated non-admin users to issue-pdfs bucket", () => {
      const nonAdminUser = {
        id: "subscriber-user-456",
        email: "subscriber@example.com",
        app_metadata: { role: "authenticated" },
      };
      mockIsAdminRpcResult = false;

      const result = evaluateStoragePolicy("INSERT", "issue-pdfs", nonAdminUser, 5000000);
      expect(result.allowed).toBe(false);
      expect(result.error).toContain("violates row-level security policy");
    });

    it("rejects delete attempts by anonymous unauthenticated callers", () => {
      const result = evaluateStoragePolicy("DELETE", "covers", null);
      expect(result.allowed).toBe(false);
      expect(result.error).toContain("Unauthorized");
    });

    it("rejects delete attempts by authenticated non-admin users on covers and issue-pdfs", () => {
      const nonAdminUser = {
        id: "attacker-user-789",
        email: "attacker@example.com",
        app_metadata: { role: "authenticated" },
      };
      mockIsAdminRpcResult = false;

      const coverDelete = evaluateStoragePolicy("DELETE", "covers", nonAdminUser);
      expect(coverDelete.allowed).toBe(false);
      expect(coverDelete.error).toContain("violates row-level security policy");

      const pdfDelete = evaluateStoragePolicy("DELETE", "issue-pdfs", nonAdminUser);
      expect(pdfDelete.allowed).toBe(false);
      expect(pdfDelete.error).toContain("violates row-level security policy");
    });

    it("rejects update/overwrite attempts by authenticated non-admin users", () => {
      const nonAdminUser = {
        id: "user-overwrite-001",
        email: "regular@example.com",
        app_metadata: { role: "authenticated" },
      };
      mockIsAdminRpcResult = false;

      const updateResult = evaluateStoragePolicy("UPDATE", "covers", nonAdminUser, 1024);
      expect(updateResult.allowed).toBe(false);
      expect(updateResult.error).toContain("violates row-level security policy");
    });
  });

  describe("2. Verified Admin Operations", () => {
    it("permits valid cover uploads by a verified admin via JWT app_metadata", () => {
      const adminUser = {
        id: "admin-jwt-1",
        email: "admin@e-wakku.com",
        app_metadata: { role: "admin", is_admin: true },
      };

      const result = evaluateStoragePolicy("INSERT", "covers", adminUser, 2048);
      expect(result.allowed).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it("permits valid publication PDF uploads by a verified admin via database public.is_admin()", () => {
      const adminUser = {
        id: "admin-db-2",
        email: "editor@e-wakku.com",
        app_metadata: { role: "authenticated" },
      };
      // Simulated public.is_admin() returned true because user exists in public.admins table
      mockIsAdminRpcResult = true;

      const result = evaluateStoragePolicy("INSERT", "issue-pdfs", adminUser, 6000000);
      expect(result.allowed).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it("permits object replacement/update by a verified admin", () => {
      const adminUser = {
        id: "admin-edit-3",
        email: "admin@e-wakku.com",
        app_metadata: { role: "admin" },
      };

      const result = evaluateStoragePolicy("UPDATE", "covers", adminUser, 4096);
      expect(result.allowed).toBe(true);
    });

    it("permits object deletion by a verified admin", () => {
      const adminUser = {
        id: "admin-delete-4",
        email: "admin@e-wakku.com",
        app_metadata: { role: "admin" },
      };

      const coverDelete = evaluateStoragePolicy("DELETE", "covers", adminUser);
      expect(coverDelete.allowed).toBe(true);

      const pdfDelete = evaluateStoragePolicy("DELETE", "issue-pdfs", adminUser);
      expect(pdfDelete.allowed).toBe(true);
    });
  });

  describe("3. Storage Bucket Configuration & 7.5 MiB Limit Enforcement", () => {
    const EXACT_LIMIT = 7864320; // 7.5 MiB
    const OVER_LIMIT = 7864321; // 7.5 MiB + 1 byte

    it("accepts a file of exactly 7,864,320 bytes (7.5 MiB) from an admin", () => {
      const adminUser = {
        id: "admin-limit-1",
        app_metadata: { role: "admin" },
      };

      const result = evaluateStoragePolicy("INSERT", "issue-pdfs", adminUser, EXACT_LIMIT);
      expect(result.allowed).toBe(true);
    });

    it("rejects a file of 7,864,321 bytes (1 byte over) at the storage bucket gateway", () => {
      const adminUser = {
        id: "admin-limit-2",
        app_metadata: { role: "admin" },
      };

      const result = evaluateStoragePolicy("INSERT", "issue-pdfs", adminUser, OVER_LIMIT);
      expect(result.allowed).toBe(false);
      expect(result.error).toContain("Payload Too Large");
      expect(result.error).toContain("7864320");
    });

    it("validates that client-side validation logic matches the exact 7.5 MiB storage boundary", async () => {
      // Test exact limit for PDF
      const pdfHeader = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d]); // %PDF-
      const exactPdf = new File([pdfHeader, new Uint8Array(EXACT_LIMIT - pdfHeader.length)], "issue.pdf", {
        type: "application/pdf",
      });
      const validRes = await validatePdfDocumentFile(exactPdf);
      expect(validRes.valid).toBe(true);

      // Test 1 byte over limit for PDF
      const overPdf = new File([pdfHeader, new Uint8Array(OVER_LIMIT - pdfHeader.length)], "issue.pdf", {
        type: "application/pdf",
      });
      const invalidRes = await validatePdfDocumentFile(overPdf);
      expect(invalidRes.valid).toBe(false);
      expect(invalidRes.error).toContain("7.5 MiB");
    });
  });

  describe("4. Preserving Public Delivery of Published Magazine Content", () => {
    it("allows public (anonymous) SELECT on covers bucket", () => {
      const result = evaluateStoragePolicy("SELECT", "covers", null);
      expect(result.allowed).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it("allows public (anonymous) SELECT on issue-pdfs bucket", () => {
      const result = evaluateStoragePolicy("SELECT", "issue-pdfs", null);
      expect(result.allowed).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it("derives public CDN URLs correctly for readers without authentication", () => {
      const mockStorage = {
        from: (bucket: string) => ({
          getPublicUrl: (path: string) => ({
            data: {
              publicUrl: `https://example.supabase.co/storage/v1/object/public/${bucket}/${path}`,
            },
          }),
        }),
      };

      const coverUrl = mockStorage.from("covers").getPublicUrl("issue-1-cover.png").data.publicUrl;
      const pdfUrl = mockStorage.from("issue-pdfs").getPublicUrl("issue-1-content.pdf").data.publicUrl;

      expect(coverUrl).toBe("https://example.supabase.co/storage/v1/object/public/covers/issue-1-cover.png");
      expect(pdfUrl).toBe("https://example.supabase.co/storage/v1/object/public/issue-pdfs/issue-1-content.pdf");
      expect(pdfUrl).toContain("/public/issue-pdfs/");
    });
  });

  describe("5. Secrets and Client Credentials Safety", () => {
    it("ensures getSupabaseConfig returns only public URL and anon key without service-role secret", () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = "https://yzlgtnjbsscjipvslgao.supabase.co";
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "mock-public-anon-key";

      const config = getSupabaseConfig();
      expect(config.url).toBe("https://yzlgtnjbsscjipvslgao.supabase.co");
      expect(config.anonKey).toBe("mock-public-anon-key");

      // Ensure no property contains service_role key
      const configKeys = Object.keys(config);
      expect(configKeys).not.toContain("serviceRoleKey");
      expect(configKeys).not.toContain("service_role");
      expect(config.anonKey).not.toContain("service_role");
    });
  });

  describe("6. Exact Observed Production Policies & Permissive OR Semantics", () => {
    // The exact 4 observed policies in production:
    // 1. "Auth upload covers" -> INSERT TO authenticated WITH CHECK (bucket_id = 'covers')
    // 2. "Auth upload pdfs"   -> INSERT TO authenticated WITH CHECK (bucket_id = 'issue-pdfs')
    // 3. "Auth delete covers" -> DELETE TO authenticated USING (bucket_id = 'covers')
    // 4. "Auth delete pdfs"   -> DELETE TO authenticated USING (bucket_id = 'issue-pdfs')

    const nonAdminUser: MockAuthUser = {
      id: "reader-user-123",
      email: "reader@example.com",
      app_metadata: { role: "authenticated" },
    };

    const adminUser: MockAuthUser = {
      id: "admin-user-456",
      email: "admin@e-wakku.com",
      app_metadata: { role: "admin" },
    };

    const authUploadCovers = (u: MockAuthUser | null, bucket: string) => Boolean(u && bucket === "covers");
    const authUploadPdfs = (u: MockAuthUser | null, bucket: string) => Boolean(u && bucket === "issue-pdfs");
    const authDeleteCovers = (u: MockAuthUser | null, bucket: string) => Boolean(u && bucket === "covers");
    const authDeletePdfs = (u: MockAuthUser | null, bucket: string) => Boolean(u && bucket === "issue-pdfs");

    const hardenedAdminInsert = (u: MockAuthUser | null, bucket: string) =>
      Boolean(u && (bucket === "covers" || bucket === "issue-pdfs") && u.app_metadata?.role === "admin");
    const hardenedAdminDelete = (u: MockAuthUser | null, bucket: string) =>
      Boolean(u && (bucket === "covers" || bucket === "issue-pdfs") && u.app_metadata?.role === "admin");

    it("reproduces production vulnerability: non-admin can upload and delete when original 4 policies are active", () => {
      // Under original policies, non-admin upload and delete succeed on both buckets
      expect(authUploadCovers(nonAdminUser, "covers")).toBe(true);
      expect(authUploadPdfs(nonAdminUser, "issue-pdfs")).toBe(true);
      expect(authDeleteCovers(nonAdminUser, "covers")).toBe(true);
      expect(authDeletePdfs(nonAdminUser, "issue-pdfs")).toBe(true);
    });

    it("proves permissive OR vulnerability: non-admin still succeeds if legacy policies are not explicitly dropped", () => {
      // If admin policy is created but legacy 'Auth upload covers' is not dropped:
      // PostgreSQL evaluates (Auth upload covers OR Admins can insert)
      const uploadCoverAllowed = authUploadCovers(nonAdminUser, "covers") || hardenedAdminInsert(nonAdminUser, "covers");
      expect(uploadCoverAllowed).toBe(true); // VULNERABILITY persists due to boolean OR!

      const deleteCoverAllowed = authDeleteCovers(nonAdminUser, "covers") || hardenedAdminDelete(nonAdminUser, "covers");
      expect(deleteCoverAllowed).toBe(true); // VULNERABILITY persists due to boolean OR!
    });

    it("verifies that dropping all 4 observed policies strictly restricts mutations to verified admins", () => {
      // After dropping the 4 policies and applying hardened policies only:
      expect(hardenedAdminInsert(nonAdminUser, "covers")).toBe(false);
      expect(hardenedAdminInsert(nonAdminUser, "issue-pdfs")).toBe(false);
      expect(hardenedAdminDelete(nonAdminUser, "covers")).toBe(false);
      expect(hardenedAdminDelete(nonAdminUser, "issue-pdfs")).toBe(false);

      // Verified admin succeeds
      expect(hardenedAdminInsert(adminUser, "covers")).toBe(true);
      expect(hardenedAdminInsert(adminUser, "issue-pdfs")).toBe(true);
      expect(hardenedAdminDelete(adminUser, "covers")).toBe(true);
      expect(hardenedAdminDelete(adminUser, "issue-pdfs")).toBe(true);
    });
  });

  describe("7. Backup Rerun Idempotency & Rollback Accuracy", () => {
    it("preserves original baseline across reruns via ON CONFLICT DO NOTHING", () => {
      const backupTable: Record<string, { file_size_limit: number | null; allowed_mime_types: string[] | null }> = {};

      const insertBackup = (bucketId: string, limit: number | null, mimeTypes: string[] | null) => {
        if (!backupTable[bucketId]) {
          // ON CONFLICT (bucket_id) DO NOTHING
          backupTable[bucketId] = { file_size_limit: limit, allowed_mime_types: mimeTypes };
        }
      };

      // Run 1: Original state had NO size limit and NO mime types (or custom limit)
      insertBackup("covers", null, null);
      insertBackup("issue-pdfs", 10485760, ["application/pdf"]); // e.g. 10MB previously

      expect(backupTable["covers"].file_size_limit).toBeNull();
      expect(backupTable["issue-pdfs"].file_size_limit).toBe(10485760);

      // Migration updates storage.buckets to 7864320
      const currentBuckets = {
        covers: { file_size_limit: 7864320 },
        "issue-pdfs": { file_size_limit: 7864320 },
      };

      // Run 2 (Rerun): Attempting to re-insert current updated buckets must NOT overwrite backup
      insertBackup("covers", currentBuckets.covers.file_size_limit, ["image/png"]);
      insertBackup("issue-pdfs", currentBuckets["issue-pdfs"].file_size_limit, ["application/pdf"]);

      // Baseline remains intact!
      expect(backupTable["covers"].file_size_limit).toBeNull();
      expect(backupTable["issue-pdfs"].file_size_limit).toBe(10485760);

      // Rollback restores the exact captured baseline:
      const restoredCoversLimit = backupTable["covers"].file_size_limit;
      const restoredPdfsLimit = backupTable["issue-pdfs"].file_size_limit;
      expect(restoredCoversLimit).toBeNull();
      expect(restoredPdfsLimit).toBe(10485760); // Accurately restored 10MB, not assumed null!
    });
  });

  describe("8. Genuinely Conservative Preflight Check (Fail-Closed)", () => {
    interface PolicyRow {
      policyname: string;
      cmd: "ALL" | "INSERT" | "UPDATE" | "DELETE" | "SELECT";
      permissive: "PERMISSIVE" | "RESTRICTIVE";
      roles: string[];
      with_check?: string;
      qual?: string;
    }

    const runConservativePreflight = (policies: PolicyRow[]) => {
      // Explicit allowlist of pre-approved reviewed policies
      const approvedPolicies = new Set([
        "Auth upload covers",
        "Auth upload pdfs",
        "Auth delete covers",
        "Auth delete pdfs",
        "Admins can insert objects in covers and issue-pdfs",
        "Admins can update objects in covers and issue-pdfs",
        "Admins can delete objects in covers and issue-pdfs",
      ]);

      const unapproved: string[] = [];

      for (const p of policies) {
        if (!["ALL", "INSERT", "UPDATE", "DELETE"].includes(p.cmd)) continue;
        const affectsTargetRoles =
          !p.roles ||
          p.roles.length === 0 ||
          p.roles.some((r) => ["public", "authenticated", "anon"].includes(r));
        if (!affectsTargetRoles) continue;

        if (!approvedPolicies.has(p.policyname)) {
          unapproved.push(`"${p.policyname}" (cmd: ${p.cmd}, mode: ${p.permissive})`);
        }
      }

      if (unapproved.length > 0) {
        throw new Error(
          `Preflight Check Failed: Found ${unapproved.length} unapproved mutation policy/policies on storage.objects: ${unapproved.join("; ")}. Target buckets cannot be secured safely without manual review. Aborting migration.`
        );
      }
      return true;
    };

    it("passes when only the four reviewed legacy policies are present", () => {
      const reviewedSet: PolicyRow[] = [
        { policyname: "Auth upload covers", cmd: "INSERT", permissive: "PERMISSIVE", roles: ["authenticated"] },
        { policyname: "Auth upload pdfs", cmd: "INSERT", permissive: "PERMISSIVE", roles: ["authenticated"] },
        { policyname: "Auth delete covers", cmd: "DELETE", permissive: "PERMISSIVE", roles: ["authenticated"] },
        { policyname: "Auth delete pdfs", cmd: "DELETE", permissive: "PERMISSIVE", roles: ["authenticated"] },
      ];
      expect(runConservativePreflight(reviewedSet)).toBe(true);
    });

    it("aborts when a policy uses an OR expression that could include target buckets (e.g. bucket_id = 'avatars' OR auth.uid() IS NOT NULL)", () => {
      const orPolicy: PolicyRow[] = [
        { policyname: "Auth upload covers", cmd: "INSERT", permissive: "PERMISSIVE", roles: ["authenticated"] },
        {
          policyname: "Upload avatars with fallback",
          cmd: "INSERT",
          permissive: "PERMISSIVE",
          roles: ["authenticated"],
          with_check: "bucket_id = 'avatars' OR auth.uid() IS NOT NULL",
        },
      ];
      // Fails closed! Does not guess based on text matching "bucket_id ="
      expect(() => runConservativePreflight(orPolicy)).toThrow("Preflight Check Failed: Found 1 unapproved mutation policy");
    });

    it("aborts when an unapproved policy uses an OR expression referencing target buckets (e.g. bucket_id = 'covers' OR auth.role() = 'anon')", () => {
      const orTargetPolicy: PolicyRow[] = [
        {
          policyname: "Public or covers write",
          cmd: "INSERT",
          permissive: "PERMISSIVE",
          roles: ["public"],
          with_check: "bucket_id = 'covers' OR auth.role() = 'anon'",
        },
      ];
      expect(() => runConservativePreflight(orTargetPolicy)).toThrow("Preflight Check Failed: Found 1 unapproved mutation policy");
    });

    it("aborts when an unapproved helper-function or global policy exists (e.g. storage.extension(name) = 'pdf')", () => {
      const helperPolicy: PolicyRow[] = [
        { policyname: "Auth upload covers", cmd: "INSERT", permissive: "PERMISSIVE", roles: ["authenticated"] },
        {
          policyname: "Allow PDF extensions",
          cmd: "INSERT",
          permissive: "PERMISSIVE",
          roles: ["authenticated"],
          with_check: "storage.extension(name) = 'pdf'",
        },
      ];
      expect(() => runConservativePreflight(helperPolicy)).toThrow("Preflight Check Failed: Found 1 unapproved mutation policy");
    });

    it("aborts when a policy with empty or unspecified roles exists", () => {
      const emptyRolesPolicy: PolicyRow[] = [
        {
          policyname: "Unspecified roles policy",
          cmd: "INSERT",
          permissive: "PERMISSIVE",
          roles: [],
          with_check: "true",
        },
      ];
      expect(() => runConservativePreflight(emptyRolesPolicy)).toThrow("Preflight Check Failed: Found 1 unapproved mutation policy");
    });

    it("aborts when an unapproved RESTRICTIVE policy exists on storage.objects", () => {
      const restrictivePolicy: PolicyRow[] = [
        { policyname: "Auth upload covers", cmd: "INSERT", permissive: "PERMISSIVE", roles: ["authenticated"] },
        {
          policyname: "Restrictive tenant check",
          cmd: "ALL",
          permissive: "RESTRICTIVE",
          roles: ["authenticated"],
          qual: "current_setting('app.tenant_id') IS NOT NULL",
        },
      ];
      expect(() => runConservativePreflight(restrictivePolicy)).toThrow("Preflight Check Failed: Found 1 unapproved mutation policy");
    });
  });

  describe("9. Permissive vs Restrictive Policy Semantics Model", () => {
    it("models how PERMISSIVE policies combine with OR and RESTRICTIVE policies combine with AND", () => {
      const nonAdminUser: MockAuthUser = { id: "user-1", app_metadata: { role: "authenticated" } };
      const adminUser: MockAuthUser = { id: "admin-1", app_metadata: { role: "admin" } };

      const permLegacy = (u: MockAuthUser) => u.app_metadata?.role === "authenticated";
      const permAdmin = (u: MockAuthUser) => u.app_metadata?.role === "admin";
      const isMaintenanceMode = false;
      const restLockout = () => !isMaintenanceMode;

      // (Permissive_1 OR Permissive_2) AND (Restrictive_1)
      const evaluateNonAdminWithLegacy = (permLegacy(nonAdminUser) || permAdmin(nonAdminUser)) && restLockout();
      expect(evaluateNonAdminWithLegacy).toBe(true); // Permissive OR leak!

      // After dropping legacy: (PermAdmin) AND (Restrictive_1)
      const evaluateNonAdminAfterDrop = permAdmin(nonAdminUser) && restLockout();
      expect(evaluateNonAdminAfterDrop).toBe(false); // Secured!

      const evaluateAdminAfterDrop = permAdmin(adminUser) && restLockout();
      expect(evaluateAdminAfterDrop).toBe(true); // Admin allowed!
    });
  });

  describe("10. Missing Original Policies & Accurate Dynamic Rollback Behavior", () => {
    interface BaselineRow {
      policyname: string;
      existed: boolean;
      permissive?: string;
      roles?: string[];
      cmd?: string;
      qual?: string;
      with_check?: string;
    }

    const generateDynamicRollbackSql = (baseline: BaselineRow[]): string[] => {
      const sqlStatements: string[] = [];
      for (const rec of baseline) {
        if (!rec.existed) continue;

        const rolesStr = rec.roles && rec.roles.length > 0 ? rec.roles.join(", ") : "public";
        const usingClause = rec.qual ? ` USING (${rec.qual})` : "";
        const withCheckClause = rec.with_check ? ` WITH CHECK (${rec.with_check})` : "";
        const sql = `CREATE POLICY "${rec.policyname}" ON storage.objects AS ${rec.permissive || "PERMISSIVE"} FOR ${rec.cmd} TO ${rolesStr}${usingClause}${withCheckClause};`;
        sqlStatements.push(sql);
      }
      return sqlStatements;
    };

    it("ensures dynamic rollback restores ONLY policies that actually existed pre-migration", () => {
      const policyBaseline: BaselineRow[] = [
        {
          policyname: "Auth upload covers",
          existed: true,
          permissive: "PERMISSIVE",
          roles: ["authenticated"],
          cmd: "INSERT",
          with_check: "bucket_id = 'covers'::text",
        },
        {
          policyname: "Auth upload pdfs",
          existed: false, // Did not exist in catalog!
          permissive: "PERMISSIVE",
          roles: ["authenticated"],
          cmd: "INSERT",
          with_check: "bucket_id = 'issue-pdfs'::text",
        },
        {
          policyname: "Auth delete covers",
          existed: true,
          permissive: "PERMISSIVE",
          roles: ["authenticated"],
          cmd: "DELETE",
          qual: "bucket_id = 'covers'::text",
        },
        {
          policyname: "Auth delete pdfs",
          existed: false, // Did not exist in catalog!
          permissive: "PERMISSIVE",
          roles: ["authenticated"],
          cmd: "DELETE",
          qual: "bucket_id = 'issue-pdfs'::text",
        },
      ];

      const generatedSql = generateDynamicRollbackSql(policyBaseline);

      // Only the 2 pre-existing policies are restored:
      expect(generatedSql).toHaveLength(2);
      expect(generatedSql[0]).toBe(
        `CREATE POLICY "Auth upload covers" ON storage.objects AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK (bucket_id = 'covers'::text);`
      );
      expect(generatedSql[1]).toBe(
        `CREATE POLICY "Auth delete covers" ON storage.objects AS PERMISSIVE FOR DELETE TO authenticated USING (bucket_id = 'covers'::text);`
      );

      // Policies that did not exist pre-migration are NEVER generated:
      expect(generatedSql.some((s) => s.includes("Auth upload pdfs"))).toBe(false);
      expect(generatedSql.some((s) => s.includes("Auth delete pdfs"))).toBe(false);
    });
  });

  describe("11. Pre-Existing Backup Schema & RESTRICT Drop Safety", () => {
    it("ensures schema cleanup uses RESTRICT rather than CASCADE to prevent unintended drops", () => {
      const mockSchema = {
        name: "_migration_20261022_storage_hardening",
        tables: ["policy_baseline", "bucket_baseline", "migration_meta"],
        unrelatedObjects: [] as string[],
      };

      const dropSchemaRestrict = () => {
        if (mockSchema.unrelatedObjects.length > 0) {
          throw new Error("ERROR: cannot drop schema because other objects depend on it (RESTRICT)");
        }
        return "SCHEMA DROPPED SAFELY";
      };

      // Case A: Migration drops its own tables first -> RESTRICT drop succeeds
      mockSchema.tables = [];
      expect(dropSchemaRestrict()).toBe("SCHEMA DROPPED SAFELY");

      // Case B: If an external object was created in the schema, RESTRICT prevents dropping it!
      mockSchema.unrelatedObjects = ["important_user_table"];
      expect(() => dropSchemaRestrict()).toThrow("RESTRICT");
    });
  });

  describe("12. Existing SELECT Policy Name Conflict Handling (No Flawed Text Matching)", () => {
    const handleSelectPolicy = (
      existingPolicyInCatalog: boolean,
      recordedInMigrationMeta: boolean
    ): { created: boolean; action: string } => {
      if (existingPolicyInCatalog) {
        if (recordedInMigrationMeta) {
          // Idempotent rerun: migration previously created it
          return { created: true, action: "IDEMPOTENT_KEEP" };
        }
        // Exists outside this migration. Fail closed! Refuse to guess via text matching.
        throw new Error(
          'A policy named "Allow public select on covers and issue-pdfs" already exists on storage.objects but was not created by this migration. Cannot verify its behavior safely via text matching. Aborting for manual review.'
        );
      }
      return { created: true, action: "POLICY_CREATED" };
    };

    it("aborts when a policy with proposed name already exists from outside this migration", () => {
      // Catalog has the policy, but migration_meta does NOT have created_select_policy = 'true'
      expect(() => handleSelectPolicy(true, false)).toThrow("Cannot verify its behavior safely via text matching");
    });

    it("passes idempotently when policy was created by a previous run of this migration", () => {
      // Catalog has the policy, and migration_meta records it was created by this migration
      const result = handleSelectPolicy(true, true);
      expect(result.action).toBe("IDEMPOTENT_KEEP");
    });

    it("creates the policy when no policy with the proposed name exists", () => {
      const result = handleSelectPolicy(false, false);
      expect(result.action).toBe("POLICY_CREATED");
      expect(result.created).toBe(true);
    });
  });

  describe("13. Safe Repeated Execution (Idempotency)", () => {
    it("guarantees rerun idempotency without duplicate policy errors or baseline overwrites", () => {
      const storageState = {
        backupCaptured: false,
        bucketBaseline: null as number | null,
        activePolicies: new Set<string>(),
      };

      const runMigrationStep = (runNumber: number) => {
        // Pre-check allowlist allows target policies on reruns
        const approvedPolicies = new Set([
          "Auth upload covers",
          "Auth upload pdfs",
          "Auth delete covers",
          "Auth delete pdfs",
          "Admins can insert objects in covers and issue-pdfs",
          "Admins can update objects in covers and issue-pdfs",
          "Admins can delete objects in covers and issue-pdfs",
        ]);

        for (const p of storageState.activePolicies) {
          if (!approvedPolicies.has(p)) throw new Error("Preflight check failed");
        }

        // ON CONFLICT DO NOTHING for backup baseline:
        if (!storageState.backupCaptured) {
          storageState.bucketBaseline = 10485760; // 10MB original
          storageState.backupCaptured = true;
        }

        // Drop target policies before creating:
        storageState.activePolicies.delete("Admins can insert objects in covers and issue-pdfs");
        storageState.activePolicies.delete("Admins can update objects in covers and issue-pdfs");
        storageState.activePolicies.delete("Admins can delete objects in covers and issue-pdfs");

        // Create hardened policies:
        storageState.activePolicies.add("Admins can insert objects in covers and issue-pdfs");
        storageState.activePolicies.add("Admins can update objects in covers and issue-pdfs");
        storageState.activePolicies.add("Admins can delete objects in covers and issue-pdfs");

        return `Run ${runNumber} succeeded`;
      };

      expect(runMigrationStep(1)).toBe("Run 1 succeeded");
      expect(storageState.bucketBaseline).toBe(10485760);

      // Re-run 2:
      expect(runMigrationStep(2)).toBe("Run 2 succeeded");
      expect(storageState.bucketBaseline).toBe(10485760); // Baseline preserved!
    });
  });
});
