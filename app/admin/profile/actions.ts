"use server";

import { revalidatePath } from "next/cache";
import { requireAdminAuth } from "@/lib/supabase/auth";
import { createAdminClient, hasAdminServiceRoleKey } from "@/lib/supabase/admin";
import { validateAdminPassword } from "@/lib/validation/password";
import { z } from "zod";

export interface AdminUserItem {
  id: string;
  name: string;
  email: string;
  status: "active" | "inactive" | "pending";
  createdAt?: string;
  isCurrentAdmin: boolean;
}

export interface AdminProfileData {
  id: string;
  email: string;
  name: string;
}

const updateNameSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters long.")
    .max(100, "Name cannot exceed 100 characters."),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required."),
  newPassword: z.string().min(8, "New password must be at least 8 characters long."),
  confirmPassword: z.string().min(1, "Please confirm your new password."),
});

const createAdminSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters long.")
    .max(100, "Name cannot exceed 100 characters."),
  email: z.string().trim().email("Please enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters long."),
  confirmPassword: z.string().min(1, "Please confirm the password."),
});

/**
 * Loads the currently authenticated administrator's profile data.
 */
export async function getAdminProfile(): Promise<{
  profile?: AdminProfileData;
  error?: string;
}> {
  const auth = await requireAdminAuth();
  if (!auth.authorized || !auth.user) {
    return { error: auth.error || "Unauthorized" };
  }

  const { user } = auth;
  const name =
    user.user_metadata?.name ||
    user.user_metadata?.full_name ||
    user.user_metadata?.display_name ||
    "";

  return {
    profile: {
      id: user.id,
      email: user.email || "",
      name: typeof name === "string" ? name : "",
    },
  };
}

/**
 * Updates the display name of the currently authenticated administrator.
 * Updates the authoritative profile metadata in Supabase Auth.
 */
export async function updateAdminDisplayName(
  newName: string
): Promise<{ success: boolean; name?: string; error?: string }> {
  const auth = await requireAdminAuth();
  if (!auth.authorized || !auth.user || !auth.supabase) {
    return { success: false, error: auth.error || "Unauthorized" };
  }

  const parsed = updateNameSchema.safeParse({ name: newName });
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0].message,
    };
  }

  const trimmedName = parsed.data.name;

  try {
    const { error: updateError } = await auth.supabase.auth.updateUser({
      data: {
        name: trimmedName,
        full_name: trimmedName,
        display_name: trimmedName,
      },
    });

    if (updateError) {
      return { success: false, error: updateError.message };
    }

    revalidatePath("/admin");
    revalidatePath("/admin/profile");

    return { success: true, name: trimmedName };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to update profile name.";
    return { success: false, error: msg };
  }
}

/**
 * Changes the authenticated administrator's password after verifying their current password.
 */
export async function changeAdminPassword(
  formData: FormData
): Promise<{ success: boolean; error?: string }> {
  const auth = await requireAdminAuth();
  if (!auth.authorized || !auth.user || !auth.supabase) {
    return { success: false, error: auth.error || "Unauthorized" };
  }

  const currentPassword = formData.get("currentPassword") as string;
  const newPassword = formData.get("newPassword") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  const parsed = changePasswordSchema.safeParse({
    currentPassword,
    newPassword,
    confirmPassword,
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  if (newPassword !== confirmPassword) {
    return { success: false, error: "New password and confirmation do not match." };
  }

  // Enforce all 7 password conditions
  const currentAdminName =
    auth.user.user_metadata?.name || auth.user.user_metadata?.full_name || "";
  const validation = validateAdminPassword(newPassword, {
    name: typeof currentAdminName === "string" ? currentAdminName : undefined,
    email: auth.user.email,
  });

  if (!validation.valid) {
    return {
      success: false,
      error: validation.errors[0] || "New password does not satisfy security requirements.",
    };
  }

  try {
    // 1. Verify current password by reauthenticating
    const { error: reauthError } = await auth.supabase.auth.signInWithPassword({
      email: auth.user.email!,
      password: currentPassword,
    });

    if (reauthError) {
      return { success: false, error: "Current password is incorrect." };
    }

    // 2. Apply new password
    const { error: updateError } = await auth.supabase.auth.updateUser({
      password: newPassword,
    });

    if (updateError) {
      return { success: false, error: updateError.message };
    }

    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to update password.";
    return { success: false, error: msg };
  }
}

/**
 * Lists administrators authorized to access the dashboard.
 */
export async function listAdministrators(): Promise<{
  admins?: AdminUserItem[];
  error?: string;
}> {
  const auth = await requireAdminAuth();
  if (!auth.authorized || !auth.user || !auth.supabase) {
    return { error: auth.error || "Unauthorized" };
  }

  const currentUserId = auth.user.id;

  try {
    // Strategy A: Try database RPC if get_admin_directory() exists
    const { data: rpcData, error: rpcError } = await auth.supabase.rpc(
      "get_admin_directory"
    );

    if (!rpcError && Array.isArray(rpcData) && rpcData.length > 0) {
      interface RpcRow {
        user_id: string;
        display_name?: string | null;
        email: string;
        is_active?: boolean;
        created_at?: string;
      }
      const items: AdminUserItem[] = (rpcData as RpcRow[]).map((row) => ({
        id: row.user_id,
        name: row.display_name || "Admin",
        email: row.email,
        status: row.is_active ? "active" : "inactive",
        createdAt: row.created_at,
        isCurrentAdmin: row.user_id === currentUserId,
      }));
      return { admins: items };
    }

    // Strategy B: Use server-side admin client if SUPABASE_SERVICE_ROLE_KEY is available
    if (hasAdminServiceRoleKey()) {
      const adminClient = createAdminClient();

      // 1. Fetch admin user_ids from public.admins
      const { data: adminRows, error: adminsErr } = await adminClient
        .from("admins")
        .select("user_id");

      if (adminsErr) {
        console.warn("Could not query public.admins table directly:", adminsErr.message);
      }

      // 2. Fetch all users from Supabase Auth
      const { data: usersData, error: usersErr } =
        await adminClient.auth.admin.listUsers();

      if (!usersErr && usersData?.users) {
        const adminIdSet = new Set<string>();
        if (adminRows && adminRows.length > 0) {
          adminRows.forEach((r: { user_id: string }) => adminIdSet.add(r.user_id));
        }

        // Include current user in set unconditionally as baseline
        adminIdSet.add(currentUserId);

        const items: AdminUserItem[] = usersData.users
          .filter(
            (u) =>
              adminIdSet.has(u.id) ||
              u.app_metadata?.role === "admin" ||
              u.user_metadata?.role === "admin" ||
              u.app_metadata?.is_admin === true ||
              u.id === currentUserId
          )
          .map((u) => {
            const rawName =
              u.user_metadata?.name ||
              u.user_metadata?.full_name ||
              u.user_metadata?.display_name ||
              (u.email ? u.email.split("@")[0] : "Admin");

            return {
              id: u.id,
              name: typeof rawName === "string" ? rawName : "Admin",
              email: u.email || "",
              status: u.banned_until ? "inactive" : "active",
              createdAt: u.created_at,
              isCurrentAdmin: u.id === currentUserId,
            };
          });

        return { admins: items };
      }
    }

    // Strategy C: Baseline fallback returning current authenticated admin
    const currentName =
      auth.user.user_metadata?.name ||
      auth.user.user_metadata?.full_name ||
      "Admin";

    return {
      admins: [
        {
          id: currentUserId,
          name: typeof currentName === "string" ? currentName : "Admin",
          email: auth.user.email || "",
          status: "active",
          createdAt: auth.user.created_at,
          isCurrentAdmin: true,
        },
      ],
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to load administrators.";
    return { error: msg };
  }
}

export interface CreateAdminInput {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

/**
 * Creates a new administrator account.
 * Requires an authenticated, authorized admin session.
 * Provisions Auth user and records privileges in public.admins atomically.
 */
export async function createAdministrator(
  input: CreateAdminInput
): Promise<{ success: boolean; email?: string; name?: string; error?: string }> {
  // 1. Authenticate & Authorize caller
  const auth = await requireAdminAuth();
  if (!auth.authorized || !auth.user) {
    return { success: false, error: auth.error || "Unauthorized: Admin access required." };
  }

  // 2. Validate input schema
  const parsed = createAdminSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const { name, email, password, confirmPassword } = parsed.data;

  if (password !== confirmPassword) {
    return { success: false, error: "Passwords do not match." };
  }

  // 3. Enforce all 7 password rules
  const validation = validateAdminPassword(password, { name, email });
  if (!validation.valid) {
    return {
      success: false,
      error: validation.errors[0] || "Password does not meet security requirements.",
    };
  }

  // 4. Verify server-side admin client key availability
  if (!hasAdminServiceRoleKey()) {
    return {
      success: false,
      error:
        "Administrator creation requires SUPABASE_SERVICE_ROLE_KEY configured in the server environment.",
    };
  }

  const adminClient = createAdminClient();
  let createdUserId: string | null = null;

  try {
    // 5. Create the Supabase Auth user
    const { data: createdUserData, error: createAuthError } =
      await adminClient.auth.admin.createUser({
        email,
        password,
        email_confirm: true, // Confirm email so admin can sign in immediately with temporary credentials
        user_metadata: {
          name,
          full_name: name,
          display_name: name,
          role: "admin",
          is_admin: true,
        },
        app_metadata: {
          role: "admin",
          is_admin: true,
        },
      });

    if (createAuthError || !createdUserData?.user) {
      if (
        createAuthError?.message.toLowerCase().includes("already registered") ||
        createAuthError?.message.toLowerCase().includes("email_exists") ||
        createAuthError?.status === 422
      ) {
        return {
          success: false,
          error: "An account with this email address already exists.",
        };
      }
      return {
        success: false,
        error: createAuthError?.message || "Failed to create administrator account.",
      };
    }

    createdUserId = createdUserData.user.id;

    // 6. Record authorization row in public.admins
    const { error: adminInsertError } = await adminClient
      .from("admins")
      .insert({ user_id: createdUserId });

    if (adminInsertError) {
      // Compensating rollback: delete newly created auth user so no unprivileged zombie user remains
      console.error(
        "Failed to insert into public.admins; rolling back auth user:",
        adminInsertError.message
      );
      await adminClient.auth.admin.deleteUser(createdUserId);
      return {
        success: false,
        error: "Failed to establish administrator database privileges. Creation rolled back.",
      };
    }

    revalidatePath("/admin/profile");

    return {
      success: true,
      email,
      name,
    };
  } catch (err: unknown) {
    // Compensating rollback if exception thrown after auth user creation
    if (createdUserId) {
      try {
        await adminClient.auth.admin.deleteUser(createdUserId);
      } catch (rollbackErr) {
        console.error("Compensating rollback failed:", rollbackErr);
      }
    }
    const msg = err instanceof Error ? err.message : "Failed to create administrator account.";
    return { success: false, error: msg };
  }
}
