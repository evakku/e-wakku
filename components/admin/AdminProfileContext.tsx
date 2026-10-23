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

interface AdminProfileContextType {
  adminName: string;
  adminEmail: string;
  setAdminName: (name: string) => void;
  refreshProfile: () => Promise<void>;
}

const AdminProfileContext = createContext<AdminProfileContextType>({
  adminName: "",
  adminEmail: "",
  setAdminName: () => {},
  refreshProfile: async () => {},
});

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
