"use client";

import {
  createContext,
  useContext,
  useState,
  useTransition,
  useCallback,
  useEffect,
  useRef,
  Suspense,
  type ReactNode,
  type MouseEvent,
} from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { shouldInterceptClick, isRoutePending } from "./navigation-utils";

export interface NavigationLoadingContextValue {
  /** The destination path currently being navigated to, or null if idle */
  pendingHref: string | null;
  /** Whether any navigation is currently pending */
  isNavigating: boolean;
  /** Manually trigger navigation with loading state (e.g. for buttons) */
  startNavigation: (href: string, onComplete?: () => void) => void;
  /** Check if a specific href matches the currently pending destination */
  isHrefPending: (href: string) => boolean;
  /** Smart click handler for anchor links with modifier and active route detection */
  handleLinkClick: (
    e: MouseEvent<HTMLAnchorElement>,
    href: string,
    onClick?: () => void
  ) => void;
}

const NavigationLoadingContext = createContext<NavigationLoadingContextValue | null>(null);

function SearchParamsWatcher({ onChange }: { onChange: (sp: string) => void }) {
  const searchParams = useSearchParams();
  const spString = searchParams?.toString() ?? "";

  useEffect(() => {
    onChange(spString);
  }, [spString, onChange]);

  return null;
}

export function NavigationLoadingProvider({ children }: { children: ReactNode }) {
  const [pendingHref, setPendingHref] = useState<string | null>(null);
  const [isTransitionPending, startTransition] = useTransition();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const searchParamsRef = useRef<string>("");

  const router = useRouter();
  const pathname = usePathname();

  // Reset loading state when pathname changes (React 19 render-phase adjustment)
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setPendingHref(null);
  }

  // Clear pending fallback timeout on route change
  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, [pathname]);

  // Handle search params update
  const handleSearchParamsChange = useCallback((sp: string) => {
    if (searchParamsRef.current !== sp) {
      searchParamsRef.current = sp;
      setPendingHref(null);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    }
  }, []);

  // Watch transition status: if transition ends and pathname didn't change (e.g. cancelled/same destination)
  useEffect(() => {
    if (!isTransitionPending && pendingHref) {
      const fallback = setTimeout(() => {
        setPendingHref(null);
      }, 400);
      return () => clearTimeout(fallback);
    }
  }, [isTransitionPending, pendingHref]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const startNavigation = useCallback(
    (href: string, onComplete?: () => void) => {
      const currentFull = searchParamsRef.current
        ? `${pathname}?${searchParamsRef.current}`
        : pathname;

      // Do not show loading state if already on destination
      if (href === currentFull || href === pathname) {
        onComplete?.();
        return;
      }

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      setPendingHref(href);

      // Safety timeout: auto-clear after 8 seconds if navigation is aborted or hangs
      timeoutRef.current = setTimeout(() => {
        setPendingHref(null);
        timeoutRef.current = null;
      }, 8000);

      startTransition(() => {
        router.push(href);
        onComplete?.();
      });
    },
    [pathname, router]
  );

  const isHrefPending = useCallback(
    (href: string): boolean => {
      return isRoutePending(pendingHref, href);
    },
    [pendingHref]
  );

  const handleLinkClick = useCallback(
    (
      e: MouseEvent<HTMLAnchorElement>,
      href: string,
      onClick?: () => void
    ) => {
      const currentFull = searchParamsRef.current
        ? `${pathname}?${searchParamsRef.current}`
        : pathname;

      const shouldIntercept = shouldInterceptClick({
        defaultPrevented: e.defaultPrevented,
        button: e.button,
        metaKey: e.metaKey,
        ctrlKey: e.ctrlKey,
        shiftKey: e.shiftKey,
        altKey: e.altKey,
        target: e.currentTarget.target,
        hasDownload: e.currentTarget.hasAttribute("download"),
        href,
        currentPath: currentFull,
      });

      if (!shouldIntercept) {
        // If it's an active route click, trigger the callback (e.g. close mobile drawer) without loading state
        if (href === currentFull || href === pathname) {
          onClick?.();
        }
        return;
      }

      // Intercept and initiate transition
      e.preventDefault();
      startNavigation(href, onClick);
    },
    [pathname, startNavigation]
  );

  const value: NavigationLoadingContextValue = {
    pendingHref,
    isNavigating: Boolean(pendingHref),
    startNavigation,
    isHrefPending,
    handleLinkClick,
  };

  return (
    <NavigationLoadingContext.Provider value={value}>
      <Suspense fallback={null}>
        <SearchParamsWatcher onChange={handleSearchParamsChange} />
      </Suspense>
      {children}
    </NavigationLoadingContext.Provider>
  );
}

export function useNavigationLoading(): NavigationLoadingContextValue {
  const context = useContext(NavigationLoadingContext);
  if (!context) {
    return {
      pendingHref: null,
      isNavigating: false,
      startNavigation: () => {},
      isHrefPending: () => false,
      handleLinkClick: () => {},
    };
  }
  return context;
}
