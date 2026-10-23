import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getAdminProfile,
  updateAdminDisplayName,
  changeAdminPassword,
  listAdministrators,
  createAdministrator,
  type CreateAdminInput,
} from "@/app/admin/profile/actions";
import {
  validateAdminPassword,
  generateSecureAdminPassword,
  formatCredentialSharingMessage,
} from "@/lib/validation/password";

// Mock next/cache
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

// State variables for mocking auth and supabase
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
const mockAdminCreateUser = vi.fn();
const mockAdminDeleteUser = vi.fn();
const mockAdminListUsers = vi.fn();

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
        };
      }
      return {
        select: vi.fn(),
        insert: vi.fn(),
      };
    },
    auth: {
      admin: {
        createUser: mockAdminCreateUser,
        deleteUser: mockAdminDeleteUser,
        listUsers: mockAdminListUsers,
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
    mockAdminCreateUser.mockResolvedValue({
      data: { user: { id: "new-admin-uuid", email: "newadmin@e-wakku.com" } },
      error: null,
    });
    mockAdminDeleteUser.mockResolvedValue({ data: {}, error: null });
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
      expect(res.admins![1].isCurrentAdmin).toBe(false);
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
      expect(res.admins![1].name).toBe("Editor Admin");
    });
  });

  describe("Section 11: Create Administrator & Safety Guarantees", () => {
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
});
