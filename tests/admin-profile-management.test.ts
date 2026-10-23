/**
 * @file Unit, Security, and Regression Tests: Admin Profile & Administrator Management Server Actions
 *
 * Verifies end-to-end security contracts, input validation, authorization gates, and data persistence
 * across all Server Actions implemented in `app/admin/profile/actions.ts`:
 * - `getAdminProfile`
 * - `updateAdminDisplayName`
 * - `changeAdminPassword`
 * - `listAdministrators`
 * - `createAdministrator`
 * - `removeAdministrator`
 *
 * Key Security & Architectural Scenarios Covered:
 * 1. Authorization boundaries (`requireAdminAuth` rejects unauthenticated/non-admin callers).
 * 2. Re-authentication verification prior to sensitive password mutations (`signInWithPassword`).
 * 3. Two-phase administrator creation with compensating rollback on partial failure.
 * 4. Multi-strategy admin directory retrieval (RPC vs service client fallback).
 * 5. Robust administrator removal protections:
 *    - Caller self-removal prevention.
 *    - Primary administrator protection (both SQL RPC business errors and application fallbacks).
 *    - Zero-admin prevention (preserving at least one administrator account).
 *    - Graceful degradation on PostgREST schema cache misses (`PGRST202`).
 * 6. Explicit regression suite preventing false-success reporting on failed database mutations.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getAdminProfile,
  updateAdminDisplayName,
  changeAdminPassword,
  listAdministrators,
  createAdministrator,
  removeAdministrator,
  type CreateAdminInput,
} from "@/app/admin/profile/actions";
import {
  validateAdminPassword,
  generateSecureAdminPassword,
  formatCredentialSharingMessage,
} from "@/lib/validation/password";

// Mock Next.js path revalidation to prevent SSR cache side-effects in unit test runner
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

interface MockAuthUser {
  id: string;
  email: string;
  created_at: string;
  user_metadata: {
    name?: string;
    full_name?: string;
    display_name?: string;
  };
}

// State variables for controlling authentication and database mocking states
let mockAuthorized = true;
let mockAuthUser: MockAuthUser = {
  id: "admin-uuid-1",
  email: "admin@e-wakku.com",
  created_at: "2026-01-01T00:00:00Z",
  user_metadata: {
    name: "Master Admin",
  },
};

const mockUpdateUser = vi.fn();
const mockSignInWithPassword = vi.fn();
const mockRpc = vi.fn();
const mockFromSelect = vi.fn();
const mockFromInsert = vi.fn();
const mockFromDelete = vi.fn();
const mockAdminCreateUser = vi.fn();
const mockAdminDeleteUser = vi.fn();
const mockAdminListUsers = vi.fn();
const mockAdminUpdateUserById = vi.fn();
const mockAdminGetUserById = vi.fn();

let mockHasServiceRoleKey = true;

vi.mock("@/lib/supabase/auth", () => ({
  requireAdminAuth: vi.fn(async () => {
    if (!mockAuthorized) {
      return { authorized: false, error: "Unauthorized: Admin session required." };
    }
    return {
      authorized: true,
      user: mockAuthUser,
      supabase: {
        auth: {
          updateUser: mockUpdateUser,
          signInWithPassword: mockSignInWithPassword,
        },
        rpc: mockRpc,
      },
    };
  }),
}));

vi.mock("@/lib/supabase/admin", () => ({
  hasAdminServiceRoleKey: vi.fn(() => mockHasServiceRoleKey),
  createAdminClient: vi.fn(() => ({
    from: (table: string) => {
      if (table === "admins") {
        return {
          select: mockFromSelect,
          insert: mockFromInsert,
          delete: () => {
            return {
              eq: (col: string, val: unknown) => {
                return mockFromDelete(col, val);
              },
            };
          },
        };
      }
      return {
        select: vi.fn(),
        insert: vi.fn(),
        delete: vi.fn(),
      };
    },
    auth: {
      admin: {
        createUser: mockAdminCreateUser,
        deleteUser: mockAdminDeleteUser,
        listUsers: mockAdminListUsers,
        updateUserById: mockAdminUpdateUserById,
        getUserById: mockAdminGetUserById,
      },
    },
  })),
}));

describe("Admin Profile & Admin Management Server Actions (Sections 5, 6, 7, 11)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuthorized = true;
    mockHasServiceRoleKey = true;
    mockAuthUser = {
      id: "admin-uuid-1",
      email: "admin@e-wakku.com",
      created_at: "2026-01-01T00:00:00Z",
      user_metadata: {
        name: "Master Admin",
      },
    };

    mockUpdateUser.mockResolvedValue({ data: { user: mockAuthUser }, error: null });
    mockSignInWithPassword.mockResolvedValue({ data: { session: {} }, error: null });
    mockRpc.mockResolvedValue({ data: null, error: { message: "RPC not found" } });
    mockFromSelect.mockResolvedValue({ data: [{ user_id: "admin-uuid-1" }], error: null });
    mockFromInsert.mockResolvedValue({ error: null });
    mockFromDelete.mockResolvedValue({ error: null });
    mockAdminCreateUser.mockResolvedValue({
      data: { user: { id: "new-admin-uuid", email: "newadmin@e-wakku.com" } },
      error: null,
    });
    mockAdminDeleteUser.mockResolvedValue({ data: {}, error: null });
    mockAdminUpdateUserById.mockImplementation(async (_id, payload) => {
      if (payload?.user_metadata) {
        mockAuthUser.user_metadata = { ...mockAuthUser.user_metadata, ...payload.user_metadata };
      }
      return { data: { user: mockAuthUser }, error: null };
    });
    mockAdminGetUserById.mockImplementation(async () => {
      return {
        data: {
          user: {
            ...mockAuthUser,
            user_metadata: { ...mockAuthUser.user_metadata },
          },
        },
        error: null,
      };
    });
    mockAdminListUsers.mockResolvedValue({
      data: {
        users: [
          {
            id: "admin-uuid-1",
            email: "admin@e-wakku.com",
            created_at: "2026-01-01T00:00:00Z",
            user_metadata: { name: "Master Admin" },
          },
        ],
      },
      error: null,
    });
  });

  describe("Section 5: Editing Admin Profile Name", () => {
    // Tests authoritative profile loading and input validation boundaries (2-100 characters).
    it("loads current profile correctly", async () => {
      const res = await getAdminProfile();
      expect(res.error).toBeUndefined();
      expect(res.profile).toBeDefined();
      expect(res.profile?.name).toBe("Master Admin");
      expect(res.profile?.email).toBe("admin@e-wakku.com");
      expect(res.profile?.id).toBe("admin-uuid-1");
    });

    it("rejects unauthorized access when getting profile", async () => {
      mockAuthorized = false;
      const res = await getAdminProfile();
      expect(res.error).toContain("Unauthorized");
      expect(res.profile).toBeUndefined();
    });

    it("successfully updates display name with trimmed string", async () => {
      const res = await updateAdminDisplayName("   Anu Thomas   ");
      expect(res.success).toBe(true);
      expect(res.name).toBe("Anu Thomas");
      expect(mockUpdateUser).toHaveBeenCalledWith({
        data: {
          name: "Anu Thomas",
          full_name: "Anu Thomas",
          display_name: "Anu Thomas",
        },
      });
    });

    it("rejects empty or whitespace-only name", async () => {
      const res = await updateAdminDisplayName("     ");
      expect(res.success).toBe(false);
      expect(res.error).toContain("Name must be at least 2 characters long.");
      expect(mockUpdateUser).not.toHaveBeenCalled();
    });

    it("rejects name longer than 100 characters", async () => {
      const longName = "A".repeat(101);
      const res = await updateAdminDisplayName(longName);
      expect(res.success).toBe(false);
      expect(res.error).toContain("Name cannot exceed 100 characters.");
      expect(mockUpdateUser).not.toHaveBeenCalled();
    });

    it("handles Supabase updateUser error gracefully", async () => {
      mockUpdateUser.mockResolvedValueOnce({
        data: null,
        error: { message: "Database timeout" },
      });
      const res = await updateAdminDisplayName("Valid Name");
      expect(res.success).toBe(false);
      expect(res.error).toBe("Database timeout");
    });
  });

  describe("Section 6: Change Password", () => {
    // Verifies mandatory re-authentication via `signInWithPassword` and strict 7-rule validation
    // before allowing password modification on the active administrator session.
    it("rejects change password when unauthorized", async () => {
      mockAuthorized = false;
      const formData = new FormData();
      formData.set("currentPassword", "OldPass123!");
      formData.set("newPassword", "NewValid#Pass8");
      formData.set("confirmPassword", "NewValid#Pass8");

      const res = await changeAdminPassword(formData);
      expect(res.success).toBe(false);
      expect(res.error).toContain("Unauthorized");
    });

    it("rejects mismatched new password and confirmation", async () => {
      const formData = new FormData();
      formData.set("currentPassword", "OldPass123!");
      formData.set("newPassword", "NewValid#Pass8");
      formData.set("confirmPassword", "Different#Pass8");

      const res = await changeAdminPassword(formData);
      expect(res.success).toBe(false);
      expect(res.error).toBe("New password and confirmation do not match.");
    });

    it("rejects new password violating 7 rules (e.g. consecutive ascending digits '123')", async () => {
      const formData = new FormData();
      formData.set("currentPassword", "OldPass123!");
      formData.set("newPassword", "Weak123!Pass");
      formData.set("confirmPassword", "Weak123!Pass");

      const res = await changeAdminPassword(formData);
      expect(res.success).toBe(false);
      expect(res.error).toContain("consecutive ascending digits");
      expect(mockSignInWithPassword).not.toHaveBeenCalled();
      expect(mockUpdateUser).not.toHaveBeenCalled();
    });

    it("rejects new password containing identity components (admin's name)", async () => {
      const formData = new FormData();
      formData.set("currentPassword", "OldPass123!");
      formData.set("newPassword", "Master#Pass99"); // Contains "Master" from "Master Admin"
      formData.set("confirmPassword", "Master#Pass99");

      const res = await changeAdminPassword(formData);
      expect(res.success).toBe(false);
      expect(res.error).toContain("must not contain components derived from your name or email address");
    });

    it("rejects when current password verification fails (wrong current password)", async () => {
      mockSignInWithPassword.mockResolvedValueOnce({
        data: null,
        error: { message: "Invalid login credentials" },
      });

      const formData = new FormData();
      formData.set("currentPassword", "WrongCurrentPass!");
      formData.set("newPassword", "K#m9Pq!vL2zW");
      formData.set("confirmPassword", "K#m9Pq!vL2zW");

      const res = await changeAdminPassword(formData);
      expect(res.success).toBe(false);
      expect(res.error).toBe("Current password is incorrect.");
      expect(mockUpdateUser).not.toHaveBeenCalled();
    });

    it("successfully changes password when current password is verified and new password meets all rules", async () => {
      const formData = new FormData();
      formData.set("currentPassword", "ValidCurrent1!");
      formData.set("newPassword", "K#m9Pq!vL2zW");
      formData.set("confirmPassword", "K#m9Pq!vL2zW");

      const res = await changeAdminPassword(formData);
      expect(res.success).toBe(true);
      expect(mockSignInWithPassword).toHaveBeenCalledWith({
        email: "admin@e-wakku.com",
        password: "ValidCurrent1!",
      });
      expect(mockUpdateUser).toHaveBeenCalledWith({
        password: "K#m9Pq!vL2zW",
      });
    });
  });

  describe("Section 7: Administrator Directory", () => {
    // Verifies directory resolution via SQL RPC `get_admin_directory()` and graceful fallback
    // to service-role `listUsers()` filtered against `public.admins` when the RPC is absent.
    it("returns directory from RPC when get_admin_directory is available", async () => {
      mockRpc.mockResolvedValueOnce({
        data: [
          {
            user_id: "admin-uuid-1",
            display_name: "Master Admin",
            email: "admin@e-wakku.com",
            is_active: true,
            created_at: "2026-01-01T00:00:00Z",
          },
          {
            user_id: "admin-uuid-2",
            display_name: "Second Admin",
            email: "second@e-wakku.com",
            is_active: true,
            created_at: "2026-02-01T00:00:00Z",
          },
        ],
        error: null,
      });

      const res = await listAdministrators();
      expect(res.error).toBeUndefined();
      expect(res.admins).toHaveLength(2);
      expect(res.admins![0].isCurrentAdmin).toBe(true);
      expect(res.admins![0].isPrimaryAdmin).toBe(true);
      expect(res.admins![1].isCurrentAdmin).toBe(false);
      expect(res.admins![1].isPrimaryAdmin).toBe(false);
    });

    it("falls back to admin client listUsers when RPC is unavailable", async () => {
      mockRpc.mockResolvedValueOnce({ data: null, error: { message: "function does not exist" } });
      mockAdminListUsers.mockResolvedValueOnce({
        data: {
          users: [
            {
              id: "admin-uuid-1",
              email: "admin@e-wakku.com",
              created_at: "2026-01-01T00:00:00Z",
              user_metadata: { name: "Master Admin" },
            },
            {
              id: "admin-uuid-2",
              email: "editor@e-wakku.com",
              created_at: "2026-02-01T00:00:00Z",
              user_metadata: { name: "Editor Admin" },
            },
          ],
        },
        error: null,
      });
      mockFromSelect.mockResolvedValueOnce({
        data: [{ user_id: "admin-uuid-1" }, { user_id: "admin-uuid-2" }],
        error: null,
      });

      const res = await listAdministrators();
      expect(res.error).toBeUndefined();
      expect(res.admins).toHaveLength(2);
      expect(res.admins![0].name).toBe("Master Admin");
      expect(res.admins![0].isPrimaryAdmin).toBe(true);
      expect(res.admins![1].name).toBe("Editor Admin");
      expect(res.admins![1].isPrimaryAdmin).toBe(false);
    });
  });

  describe("Section 11: Create Administrator & Safety Guarantees", () => {
    // Tests two-phase administrator provisioning:
    // 1. Validates input and password rules.
    // 2. Creates Supabase Auth user.
    // 3. Inserts privilege record into `public.admins`.
    // 4. Executes compensating rollback (deleting Auth user) if database privilege insertion fails.
    const validNewAdmin: CreateAdminInput = {
      name: "Rahul Sharma",
      email: "rahul@example.com",
      password: "K#m9Pq!vL2zW",
      confirmPassword: "K#m9Pq!vL2zW",
    };

    it("rejects unauthorized non-admin user", async () => {
      mockAuthorized = false;
      const res = await createAdministrator(validNewAdmin);
      expect(res.success).toBe(false);
      expect(res.error).toContain("Unauthorized");
    });

    it("rejects when passwords do not match", async () => {
      const res = await createAdministrator({
        ...validNewAdmin,
        confirmPassword: "MismatchPassword#123",
      });
      expect(res.success).toBe(false);
      expect(res.error).toBe("Passwords do not match.");
    });

    it("rejects password containing the new administrator's name", async () => {
      const res = await createAdministrator({
        ...validNewAdmin,
        password: "Rahul#SafePass98", // Contains "Rahul"
        confirmPassword: "Rahul#SafePass98",
      });
      expect(res.success).toBe(false);
      expect(res.error).toContain("must not contain components derived from your name or email address");
    });

    it("handles duplicate email safely without leaking credentials", async () => {
      mockAdminCreateUser.mockResolvedValueOnce({
        data: { user: null },
        error: { message: "A user with this email address has already registered", status: 422 },
      });

      const res = await createAdministrator(validNewAdmin);
      expect(res.success).toBe(false);
      expect(res.error).toBe("An account with this email address already exists.");
    });

    it("successfully creates auth user and records privilege in public.admins", async () => {
      const res = await createAdministrator(validNewAdmin);
      expect(res.success).toBe(true);
      expect(res.email).toBe("rahul@example.com");
      expect(res.name).toBe("Rahul Sharma");

      expect(mockAdminCreateUser).toHaveBeenCalledWith(
        expect.objectContaining({
          email: "rahul@example.com",
          email_confirm: true,
          user_metadata: expect.objectContaining({
            name: "Rahul Sharma",
            is_admin: true,
          }),
        })
      );

      expect(mockFromInsert).toHaveBeenCalledWith({
        user_id: "new-admin-uuid",
      });
      expect(mockAdminDeleteUser).not.toHaveBeenCalled();
    });

    // Regression prevention: Ensures failed database privilege insertion triggers immediate compensating
    // deletion of the Auth user, eliminating dangling or unprivileged administrative accounts.
    it("triggers compensating rollback (deletes auth user) if public.admins insert fails", async () => {
      mockFromInsert.mockResolvedValueOnce({
        error: { message: "violates foreign key constraint" },
      });

      const res = await createAdministrator(validNewAdmin);
      expect(res.success).toBe(false);
      expect(res.error).toContain("Failed to establish administrator database privileges. Creation rolled back.");

      // Check compensating rollback was executed
      expect(mockAdminDeleteUser).toHaveBeenCalledWith("new-admin-uuid");
    });
  });

  describe("Section 12: Credential-Sharing Message & Safeguards", () => {
    // Tests generation of clean clipboard sharing text and stochastic robustness of the CSPRNG generator.
    it("formats clean credentials message with email, password, and security notice", () => {
      const msg = formatCredentialSharingMessage(
        "New Administrator",
        "admin.new@e-wakku.com",
        "K#m9Pq!vL2zW"
      );
      expect(msg).toContain("E-Wakku Administrator Account");
      expect(msg).toContain("admin.new@e-wakku.com");
      expect(msg).toContain("K#m9Pq!vL2zW");
      expect(msg).toContain("Security Notice: These credentials are confidential.");
      expect(msg).toContain("Share this message only with the intended administrator");
    });

    it("automatic password generator reliably satisfies all 7 rules for any name/email", () => {
      for (let i = 0; i < 20; i++) {
        const generated = generateSecureAdminPassword({
          name: "Dr. K. R. Narayanan",
          email: "narayanan.kr@e-wakku.gov.in",
        });

        const validation = validateAdminPassword(generated, {
          name: "Dr. K. R. Narayanan",
          email: "narayanan.kr@e-wakku.gov.in",
        });

        expect(validation.valid).toBe(true);
        expect(validation.errors).toHaveLength(0);
      }
    });
  });

  describe("Section 13: Secure Admin Removal & Primary Administrator Protection", () => {
    // Verifies multi-layered safeguards protecting against unauthorized removal, self-lockout,
    // primary admin deletion, zero-admin lockout, and PostgREST schema cache misses.
    it("rejects removal when unauthorized or unauthenticated", async () => {
      mockAuthorized = false;
      const res = await removeAdministrator("22222222-2222-2222-2222-222222222222");
      expect(res.success).toBe(false);
      expect(res.error).toContain("Unauthorized");
    });

    it("rejects invalid UUID target ID", async () => {
      const res = await removeAdministrator("not-a-valid-uuid");
      expect(res.success).toBe(false);
      expect(res.error).toContain("Invalid administrator ID");
    });

    // Invariant: Caller cannot remove their own administrator membership.
    it("rejects self-removal (caller cannot remove own account)", async () => {
      // Caller ID is admin-uuid-1
      const res = await removeAdministrator("admin-uuid-1");
      expect(res.success).toBe(false);
      expect(res.error).toBe("You cannot remove your own administrator account.");
      expect(mockFromDelete).not.toHaveBeenCalled();
    });

    // Database RPC layer: Verifies handling of SQL exception raised by `remove_admin`.
    it("rejects removing the primary administrator account (via RPC business error)", async () => {
      mockRpc.mockResolvedValueOnce({
        data: null,
        error: { message: "Forbidden: The primary administrator account cannot be removed." },
      });

      const res = await removeAdministrator("22222222-2222-2222-2222-222222222222");
      expect(res.success).toBe(false);
      expect(res.error).toBe("The primary administrator account cannot be removed.");
    });

    // Strategy B Fallback: Verifies application-level protection when RPC is absent.
    it("rejects removing the primary administrator account (via fallback check)", async () => {
      mockRpc.mockResolvedValueOnce({ data: null, error: { message: "function remove_admin does not exist" } });
      mockFromSelect.mockResolvedValueOnce({
        data: [
          { user_id: "admin-uuid-1", is_primary: false },
          { user_id: "22222222-2222-2222-2222-222222222222", is_primary: true },
        ],
        error: null,
      });

      const res = await removeAdministrator("22222222-2222-2222-2222-222222222222");
      expect(res.success).toBe(false);
      expect(res.error).toBe("The primary administrator account cannot be removed.");
      expect(mockFromDelete).not.toHaveBeenCalled();
    });

    // Fallback: If `is_primary` column is unset or missing, oldest admin by created_at is protected.
    it("rejects removing the earliest administrator when is_primary column is not yet set", async () => {
      mockRpc.mockResolvedValueOnce({ data: null, error: { message: "function remove_admin does not exist" } });
      mockFromSelect.mockResolvedValueOnce({
        data: [
          { user_id: "11111111-1111-1111-1111-111111111111", is_primary: false },
          { user_id: "22222222-2222-2222-2222-222222222222", is_primary: false },
        ],
        error: null,
      });
      mockAdminListUsers.mockResolvedValueOnce({
        data: {
          users: [
            { id: "11111111-1111-1111-1111-111111111111", created_at: "2026-01-01T00:00:00Z" },
            { id: "22222222-2222-2222-2222-222222222222", created_at: "2026-06-01T00:00:00Z" },
          ],
        },
        error: null,
      });

      const res = await removeAdministrator("11111111-1111-1111-1111-111111111111");
      expect(res.success).toBe(false);
      expect(res.error).toBe("The primary administrator account cannot be removed.");
      expect(mockFromDelete).not.toHaveBeenCalled();
    });

    // Invariant: At least one administrator account must always remain in the system.
    it("rejects removing the last remaining administrator account", async () => {
      mockRpc.mockResolvedValueOnce({ data: null, error: { message: "function remove_admin does not exist" } });
      mockFromSelect.mockResolvedValueOnce({
        data: [{ user_id: "22222222-2222-2222-2222-222222222222", is_primary: false }],
        error: null,
      });

      const res = await removeAdministrator("22222222-2222-2222-2222-222222222222");
      expect(res.success).toBe(false);
      expect(res.error).toBe("Cannot remove the last administrator account. At least one administrator must remain.");
    });

    it("rejects removing a non-existent administrator safely", async () => {
      mockRpc.mockResolvedValueOnce({ data: null, error: { message: "function remove_admin does not exist" } });
      mockFromSelect.mockResolvedValueOnce({
        data: [
          { user_id: "admin-uuid-1", is_primary: true },
          { user_id: "other-admin-uuid", is_primary: false },
        ],
        error: null,
      });

      const res = await removeAdministrator("33333333-3333-3333-3333-333333333333");
      expect(res.success).toBe(false);
      expect(res.error).toBe("Administrator not found or already removed.");
    });

    it("successfully removes eligible administrator via RPC and demotes Auth metadata", async () => {
      mockRpc.mockResolvedValueOnce({
        data: { success: true },
        error: null,
      });

      const res = await removeAdministrator("22222222-2222-2222-2222-222222222222");
      expect(res.success).toBe(true);
      expect(mockAdminUpdateUserById).toHaveBeenCalledWith(
        "22222222-2222-2222-2222-222222222222",
        expect.objectContaining({
          app_metadata: expect.objectContaining({ role: "user", is_admin: false }),
          user_metadata: expect.objectContaining({ role: "user", is_admin: false }),
        })
      );
    });

    // Regression prevention: Specifically tests recovery when PostgREST has not reloaded schema cache
    // and throws error PGRST202 for `remove_admin`. Verifies seamless failover to Strategy B.
    it("gracefully falls back to Strategy B when PostgREST returns 'Could not find the function public.remove_admin(target_user_id) in the schema cache' (PGRST202)", async () => {
      mockRpc.mockResolvedValueOnce({
        data: null,
        error: {
          code: "PGRST202",
          details: "Searched for the function public.remove_admin with parameter target_user_id... but no matches were found in the schema cache.",
          hint: "Perhaps you meant to call the function public.is_admin",
          message: "Could not find the function public.remove_admin(target_user_id) in the schema cache",
        },
      });
      mockFromSelect.mockResolvedValueOnce({
        data: [
          { user_id: "admin-uuid-1", is_primary: true },
          { user_id: "22222222-2222-2222-2222-222222222222", is_primary: false },
        ],
        error: null,
      });
      mockFromDelete.mockResolvedValueOnce({ error: null });

      const res = await removeAdministrator("22222222-2222-2222-2222-222222222222");
      expect(res.success).toBe(true);
      expect(mockFromDelete).toHaveBeenCalled();
      expect(mockAdminUpdateUserById).toHaveBeenCalledWith(
        "22222222-2222-2222-2222-222222222222",
        expect.objectContaining({
          app_metadata: expect.objectContaining({ role: "user", is_admin: false }),
          user_metadata: expect.objectContaining({ role: "user", is_admin: false }),
        })
      );
    });
  });

  describe("Section 14: Regression Suite — Reliable Persistence for Admin Removal and Profile Save", () => {
    // Regression suite ensuring data modifications are authoritatively verified against the database
    // before actions return success, eliminating false-positive optimistic responses.
    // Regression prevention: Ensures created user UUID is returned to caller so UI can highlight/select
    // the newly provisioned row immediately without waiting for background re-sync.
    it("createAdministrator returns the created user UUID for UI state tracking", async () => {
      const input: CreateAdminInput = {
        name: "Editor Assistant",
        email: "editor@e-wakku.com",
        password: "K#m9Pq!vL2zW",
        confirmPassword: "K#m9Pq!vL2zW",
      };

      const res = await createAdministrator(input);
      expect(res.success).toBe(true);
      expect(res.id).toBe("new-admin-uuid");
      expect(res.email).toBe("editor@e-wakku.com");
      expect(res.name).toBe("Editor Assistant");
    });

    // Regression prevention: Verifies that database deletion failures return structured failure results
    // and do not trigger Auth account deletion or metadata demotion prematurely.
    it("rejects removal when database DELETE fails with explicit safe error", async () => {
      mockRpc.mockResolvedValueOnce({
        data: null,
        error: { code: "PGRST202", message: "RPC not found" },
      });
      mockFromSelect.mockResolvedValueOnce({
        data: [
          { user_id: "admin-uuid-1", is_primary: true },
          { user_id: "22222222-2222-2222-2222-222222222222", is_primary: false },
        ],
        error: null,
      });
      mockFromDelete.mockResolvedValueOnce({
        error: { message: "Database connection failed" },
      });

      const res = await removeAdministrator("22222222-2222-2222-2222-222222222222");
      expect(res.success).toBe(false);
      expect(res.error).toBe("Database connection failed");
      expect(mockAdminDeleteUser).not.toHaveBeenCalled();
    });

    // Regression prevention: Guards against silent failure or false-success reporting when a database
    // DELETE appears successful but the record remains present on immediate verification query.
    it("prevents false-success when public.admins deletion cannot be verified", async () => {
      mockRpc.mockResolvedValueOnce({
        data: null,
        error: { code: "PGRST202", message: "RPC not found" },
      });
      // First select for admin existence check
      mockFromSelect.mockResolvedValueOnce({
        data: [
          { user_id: "admin-uuid-1", is_primary: true },
          { user_id: "22222222-2222-2222-2222-222222222222", is_primary: false },
        ],
        error: null,
      });
      mockFromDelete.mockResolvedValueOnce({ error: null });
      // Second select (confirmation query) returns the row still present!
      mockFromSelect.mockResolvedValueOnce({
        data: [{ user_id: "22222222-2222-2222-2222-222222222222" }],
        error: null,
      });

      const res = await removeAdministrator("22222222-2222-2222-2222-222222222222");
      expect(res.success).toBe(false);
      expect(res.error).toContain("Failed to confirm administrator removal from database.");
    });

    // Invariant: `public.admins` is authoritative. Users with lingering `role: admin` in Auth metadata
    // who have been deleted from `public.admins` must be excluded from active administrator lists.
    it("listAdministrators excludes removed administrators whose Auth metadata still has role admin", async () => {
      // Auth user has role admin, but is NOT in public.admins
      mockAdminListUsers.mockResolvedValueOnce({
        data: {
          users: [
            {
              id: "admin-uuid-1",
              email: "master@e-wakku.com",
              created_at: "2026-01-01T00:00:00Z",
              user_metadata: { name: "Master Admin" },
            },
            {
              id: "revoked-admin-uuid",
              email: "revoked@e-wakku.com",
              created_at: "2026-02-01T00:00:00Z",
              user_metadata: { name: "Revoked Admin", role: "admin" },
              app_metadata: { role: "admin" },
            },
          ],
        },
        error: null,
      });
      // public.admins only contains admin-uuid-1
      mockFromSelect.mockResolvedValueOnce({
        data: [{ user_id: "admin-uuid-1", is_primary: true }],
        error: null,
      });

      const res = await listAdministrators();
      expect(res.admins).toBeDefined();
      expect(res.admins).toHaveLength(1);
      expect(res.admins?.[0].id).toBe("admin-uuid-1");
      expect(res.admins?.some((a) => a.id === "revoked-admin-uuid")).toBe(false);
    });

    // Regression prevention: Confirms that updateAdminDisplayName performs write verification via
    // `getUserById` before reporting success back to the caller.
    it("updateAdminDisplayName confirms database persistence and returns updated name", async () => {
      mockAdminGetUserById.mockResolvedValueOnce({
        data: {
          user: {
            id: "admin-uuid-1",
            user_metadata: { name: "Persisted Master Admin" },
          },
        },
        error: null,
      });

      const res = await updateAdminDisplayName("Persisted Master Admin");
      expect(res.success).toBe(true);
      expect(res.name).toBe("Persisted Master Admin");
      expect(mockAdminUpdateUserById).toHaveBeenCalledWith(
        "admin-uuid-1",
        expect.objectContaining({
          user_metadata: expect.objectContaining({ name: "Persisted Master Admin" }),
        })
      );
    });

    // Regression prevention: Ensures action fails gracefully with actionable error if write verification reveals
    // that the database still stores the old display name.
    it("updateAdminDisplayName fails if database persistence verification fails", async () => {
      mockAdminGetUserById.mockResolvedValueOnce({
        data: {
          user: {
            id: "admin-uuid-1",
            // Still returns old name!
            user_metadata: { name: "Old Master Admin" },
          },
        },
        error: null,
      });

      const res = await updateAdminDisplayName("New Name Failed Persist");
      expect(res.success).toBe(false);
      expect(res.error).toContain("Failed to confirm profile name persistence in database.");
    });

    // Invariant: Profile fetching queries the authoritative service-role client rather than stale session cookies.
    it("getAdminProfile authoritatively loads persisted name from Supabase Auth via admin client", async () => {
      mockAdminGetUserById.mockResolvedValueOnce({
        data: {
          user: {
            id: "admin-uuid-1",
            user_metadata: { name: "Authoritative Database Profile Name" },
          },
        },
        error: null,
      });

      const res = await getAdminProfile();
      expect(res.profile?.name).toBe("Authoritative Database Profile Name");
    });
  });
});
