"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { createClient } from "@/lib/supabase/client";

/**
 * Context state shape for administrator profile data across the admin dashboard.
 */
interface AdminProfileContextType {
  /** The currently authenticated administrator's display name. */
  adminName: string;
  /** The currently authenticated administrator's email address. */
  adminEmail: string;
  /** Synchronous state updater to reflect display name changes immediately across layout components. */
  setAdminName: (name: string) => void;
  /** Asynchronously re-fetches administrator metadata from the active Supabase session. */
  refreshProfile: () => Promise<void>;
}

const AdminProfileContext = createContext<AdminProfileContextType>({
  adminName: "",
  adminEmail: "",
  setAdminName: () => {},
  refreshProfile: async () => {},
});

/**
 * Top-level React Context Provider for administrator identity and navigation synchronization.
 *
 * Architecture & Data Flow:
 * 1. Scope: Wraps the entire administrative dashboard shell in `app/admin/layout.tsx`.
 * 2. Top-Bar Propagation: Consumed by `<AdminLayout />` to dynamically render the administrator's
 *    display name in the sticky top header (falling back to "Admin" if unset).
 * 3. Immediate Optimistic Sync: When an administrator saves a new display name in `<AdminProfileView />`,
 *    calling `setAdminName(newName)` immediately updates the header title without requiring a page reload.
 * 4. Auth State Synchronization: Automatically registers a Supabase `onAuthStateChange` listener on mount
 *    to synchronize name and email whenever the browser session is initialized or refreshed.
 *
 * @param props.children - Child component tree.
 * @param props.initialName - Optional server-rendered display name to prevent layout shift during SSR.
 * @param props.initialEmail - Optional server-rendered email address.
 */
export function AdminProfileProvider({
  children,
  initialName = "",
  initialEmail = "",
}: {
  children: ReactNode;
  initialName?: string;
  initialEmail?: string;
}) {
  const [adminName, setAdminNameState] = useState<string>(initialName);
  const [adminEmail, setAdminEmailState] = useState<string>(initialEmail);

  const setAdminName = useCallback((name: string) => {
    setAdminNameState(name.trim());
  }, []);

  const refreshProfile = useCallback(async () => {
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const name =
          user.user_metadata?.name ||
          user.user_metadata?.full_name ||
          user.user_metadata?.display_name ||
          "";
        if (typeof name === "string" && name.trim()) {
          setAdminNameState(name.trim());
        }
        if (user.email) {
          setAdminEmailState(user.email);
        }
      }
    } catch {
      // Fallback silently if offline or unauthenticated
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    const supabase = createClient();

    if (!initialName) {
      supabase.auth
        .getUser()
        .then(({ data: { user } }) => {
          if (!isMounted || !user) return;
          const name =
            user.user_metadata?.name ||
            user.user_metadata?.full_name ||
            user.user_metadata?.display_name ||
            "";
          if (typeof name === "string" && name.trim()) {
            setAdminNameState(name.trim());
          }
          if (user.email) {
            setAdminEmailState(user.email);
          }
        })
        .catch(() => {});
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!isMounted) return;
      if (session?.user) {
        const name =
          session.user.user_metadata?.name ||
          session.user.user_metadata?.full_name ||
          session.user.user_metadata?.display_name ||
          "";
        if (typeof name === "string" && name.trim()) {
          setAdminNameState(name.trim());
        }
        if (session.user.email) {
          setAdminEmailState(session.user.email);
        }
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [initialName]);

  return (
    <AdminProfileContext.Provider
      value={{
        adminName,
        adminEmail,
        setAdminName,
        refreshProfile,
      }}
    >
      {children}
    </AdminProfileContext.Provider>
  );
}

export function useAdminProfile() {
  return useContext(AdminProfileContext);
}
