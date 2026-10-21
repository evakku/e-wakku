"use client";

import { useFormStatus } from "react-dom";
import Spinner from "@/components/ui/spinner";

/**
 * SignOutButton
 *
 * Dedicated admin sign-out button using React 19's useFormStatus
 * to provide immediate pending/spinner visual feedback and prevent
 * duplicate submissions during sign out.
 */
export default function SignOutButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending ? "true" : undefined}
      className={[
        "inline-flex items-center gap-1.5 text-sm font-medium text-red-600 hover:text-red-700 px-3 py-1.5 rounded-md hover:bg-red-50 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-red-500",
        pending ? "opacity-75 cursor-wait" : "",
      ].join(" ")}
    >
      {pending && <Spinner size="xs" color="current" label="Signing out..." />}
      <span>{pending ? "Signing out..." : "Sign Out"}</span>
    </button>
  );
}
