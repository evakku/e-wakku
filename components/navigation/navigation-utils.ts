/**
 * Navigation utility functions for evaluating navigation clicks and pending states.
 */

export interface ShouldInterceptClickOptions {
  defaultPrevented?: boolean;
  button?: number;
  metaKey?: boolean;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  target?: string | null;
  hasDownload?: boolean;
  href: string;
  currentPath: string;
}

export function shouldInterceptClick(options: ShouldInterceptClickOptions): boolean {
  const {
    defaultPrevented = false,
    button = 0,
    metaKey = false,
    ctrlKey = false,
    shiftKey = false,
    altKey = false,
    target,
    hasDownload = false,
    href,
    currentPath,
  } = options;

  if (defaultPrevented) return false;
  if (button !== 0) return false;
  if (metaKey || ctrlKey || shiftKey || altKey) return false;
  if (target && target !== "_self") return false;
  if (hasDownload) return false;

  if (
    href.startsWith("http://") ||
    href.startsWith("https://") ||
    href.startsWith("//") ||
    href.startsWith("mailto:") ||
    href.startsWith("tel:")
  ) {
    return false;
  }

  if (href.startsWith("#")) return false;

  // Active route check
  if (normalizeRoute(href) === normalizeRoute(currentPath)) {
    return false;
  }

  return true;
}

export function normalizeRoute(path: string): string {
  if (!path) return "/";
  const trimmed = path.length > 1 && path.endsWith("/") ? path.slice(0, -1) : path;
  return trimmed;
}

export function isRoutePending(pendingHref: string | null, targetHref: string): boolean {
  if (!pendingHref) return false;
  if (pendingHref === targetHref) return true;

  const pendingBase = pendingHref.split("?")[0].split("#")[0];
  const targetBase = targetHref.split("?")[0].split("#")[0];

  if (targetBase === "/") {
    return pendingBase === "/";
  }
  return pendingBase === targetBase;
}
