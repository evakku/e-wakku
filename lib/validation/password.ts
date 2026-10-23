/**
 * Admin Password Validation & Cryptographic Generator
 *
 * Enforces the 7 security conditions required for manual entry and automatic generation:
 * 1. Minimum Length: At least 8 characters (provides baseline search-space entropy).
 * 2. Uppercase Letters: At least one [A-Z] character (expands keyspace diversity).
 * 3. Lowercase Letters: At least one [a-z] character (expands keyspace diversity).
 * 4. Numbers: At least one digit [0-9] (expands keyspace diversity).
 * 5. Special Characters: At least one accepted symbol (resists dictionary attacks).
 * 6. No Ascending Consecutive Digits: Forbids sequences like '123', '234', '789'
 *    (mitigates common predictable keyboard patterns; note: descending sequences
 *    like '321' are intentionally not penalized by this specific rule).
 * 7. Identity Exclusion: Forbids tokens derived from the administrator's name,
 *    email handle, or organization domain (mitigates targeted social engineering).
 */

/**
 * Live validation state for an individual password requirement rule.
 * Consumed by UI components to render interactive checklists.
 */
export interface PasswordRuleState {
  /** Unique identifier for the rule (e.g. 'minLength', 'hasUppercase'). */
  id: string;
  /** Human-readable label displayed in the UI checklist. */
  label: string;
  /** Whether the password currently meets this rule requirement. */
  satisfied: boolean;
  /**
   * For negative rules (e.g. ascending digits, identity tokens), indicates that
   * the user has actively violated the condition rather than merely not yet meeting it.
   */
  isViolation?: boolean;
}

/**
 * Result structure returned by `validateAdminPassword`.
 */
export interface PasswordValidationResult {
  /** True if every single rule is satisfied; false if any error exists. */
  valid: boolean;
  /** List of user-facing failure error messages. Empty when `valid` is true. */
  errors: string[];
  /** Granular boolean breakdown of each individual condition evaluated. */
  rules: {
    minLength: boolean;
    hasUppercase: boolean;
    hasLowercase: boolean;
    hasNumber: boolean;
    hasSpecial: boolean;
    noConsecutiveAscendingDigits: boolean;
    noIdentityComponents: boolean;
  };
}

/**
 * Contextual administrator identity details evaluated for password exclusion.
 */
export interface UserIdentityContext {
  /** Display or legal name of the administrator (e.g. 'Rahul Menon'). */
  name?: string | null;
  /** Login email address of the administrator (e.g. 'rahul@e-wakku.com'). */
  email?: string | null;
}

/**
 * Set of accepted special characters for password validation.
 * Includes common punctuation, math symbols, and keyboard glyphs:
 * `!@#$%^&*()_+-=[]{};':"|,.<>/?`~`
 */
export const SPECIAL_CHAR_REGEX = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/;

// Generic email provider domain tokens to ignore to prevent false positives
const COMMON_EMAIL_DOMAINS = new Set([
  "gmail",
  "yahoo",
  "outlook",
  "hotmail",
  "icloud",
  "proton",
  "protonmail",
  "mail",
  "email",
  "live",
  "aol",
  "zoho",
]);

// Generic top-level domains to ignore
const COMMON_TLDS = new Set([
  "com",
  "org",
  "net",
  "edu",
  "gov",
  "mil",
  "io",
  "co",
  "in",
  "info",
  "biz",
  "app",
  "dev",
  "ai",
  "me",
  "xyz",
]);

/**
 * Normalizes name and email strings into meaningful token components for exclusion matching.
 *
 * Algorithm:
 * 1. Tokenizes `name` by non-alphanumeric boundaries, retaining tokens with length >= 3.
 * 2. Tokenizes the local part of `email` (before '@') by non-alphanumerics, retaining tokens length >= 3.
 * 3. Tokenizes the domain part of `email`, ignoring generic webmail providers (gmail, yahoo, etc.)
 *    and standard top-level domains (com, net, org, in, etc.) to prevent false-positive rejections.
 *
 * @param identity - Context containing administrator name and email.
 * @returns Array of unique lowercased identity substrings of length >= 3.
 */
export function extractIdentityTokens(identity?: UserIdentityContext): string[] {
  if (!identity) return [];

  const tokens = new Set<string>();

  // 1. Process name
  if (identity.name) {
    const rawName = identity.name.trim().toLowerCase();
    // Split by non-alphanumeric characters
    const nameParts = rawName.split(/[^a-z0-9]+/);
    for (const part of nameParts) {
      if (part.length >= 3) {
        tokens.add(part);
      }
    }
    // Also add full alphanumeric sequence of name if length >= 3
    const alphaName = rawName.replace(/[^a-z0-9]/g, "");
    if (alphaName.length >= 3) {
      tokens.add(alphaName);
    }
  }

  // 2. Process email
  if (identity.email) {
    const rawEmail = identity.email.trim().toLowerCase();
    const [localPart, domainPart] = rawEmail.split("@");

    if (localPart) {
      // Split local part by non-alphanumeric (dots, underscores, plus, etc.)
      const localTokens = localPart.split(/[^a-z0-9]+/);
      for (const token of localTokens) {
        if (token.length >= 3) {
          tokens.add(token);
        }
      }
      const alphaLocal = localPart.replace(/[^a-z0-9]/g, "");
      if (alphaLocal.length >= 3) {
        tokens.add(alphaLocal);
      }
    }

    if (domainPart) {
      const domainTokens = domainPart.split(/[^a-z0-9]+/);
      for (const token of domainTokens) {
        if (
          token.length >= 3 &&
          !COMMON_TLDS.has(token) &&
          !COMMON_EMAIL_DOMAINS.has(token)
        ) {
          tokens.add(token);
        }
      }
    }
  }

  return Array.from(tokens);
}

/**
 * Evaluates whether a password contains 3 or more consecutive ascending digits.
 *
 * Purpose & Scope:
 * Prevents predictable numeric runs (e.g. '123', '234', '567', '789', '012', '1234')
 * which are heavily represented in common dictionary attack dictionaries.
 *
 * Limitation:
 * Only evaluates strictly ascending consecutive numerical runs (where each digit equals
 * previous digit + 1). It intentionally does not restrict descending sequences (e.g. '321')
 * or repeated digits (e.g. '111') unless ruled out by other criteria.
 *
 * @param password - The candidate password string to inspect.
 * @returns `true` if 3 or more consecutive ascending digits are found; otherwise `false`.
 */
export function hasConsecutiveAscendingDigits(password: string): boolean {
  if (password.length < 3) return false;

  for (let i = 0; i <= password.length - 3; i++) {
    const c1 = password.charCodeAt(i);
    const c2 = password.charCodeAt(i + 1);
    const c3 = password.charCodeAt(i + 2);

    // ASCII 48 is '0', 57 is '9'
    if (
      c1 >= 48 &&
      c1 <= 57 &&
      c2 === c1 + 1 &&
      c3 === c2 + 1
    ) {
      return true;
    }
  }

  return false;
}

/**
 * Checks whether the password contains any meaningful component derived from name or email.
 *
 * Performs case-insensitive substring search against all tokens extracted by `extractIdentityTokens`.
 *
 * @param password - The password string being evaluated.
 * @param identity - Context containing administrator name and email.
 * @returns `true` if any identity token is a substring of the candidate password; otherwise `false`.
 */
export function containsIdentityComponents(
  password: string,
  identity?: UserIdentityContext
): boolean {
  if (!password || !identity) return false;

  const tokens = extractIdentityTokens(identity);
  if (tokens.length === 0) return false;

  const lowerPassword = password.toLowerCase();

  for (const token of tokens) {
    if (lowerPassword.includes(token)) {
      return true;
    }
  }

  return false;
}

/**
 * Validates a candidate password against all 7 administrative security conditions.
 *
 * Evaluated conditions:
 * - Length: At least 8 characters.
 * - Character Composition: At least one uppercase [A-Z], one lowercase [a-z],
 *   one number [0-9], and one special character matching `SPECIAL_CHAR_REGEX`.
 * - Negative Constraints: No 3+ ascending consecutive digits, and no identity tokens.
 *
 * @param password - The raw candidate password to validate.
 * @param identity - Optional identity context (name and email) for identity component exclusion.
 * @returns An object containing a master `valid` boolean, list of user-facing `errors`,
 * and an exhaustive boolean breakdown in `rules`.
 */
export function validateAdminPassword(
  password: string,
  identity?: UserIdentityContext
): PasswordValidationResult {
  const minLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = SPECIAL_CHAR_REGEX.test(password);
  const noConsecutiveAscendingDigits = !hasConsecutiveAscendingDigits(password);
  const noIdentityComponents = !containsIdentityComponents(password, identity);

  const errors: string[] = [];

  if (!minLength) {
    errors.push("Password must be at least 8 characters long.");
  }
  if (!hasUppercase) {
    errors.push("Password must contain at least one uppercase letter (A-Z).");
  }
  if (!hasLowercase) {
    errors.push("Password must contain at least one lowercase letter (a-z).");
  }
  if (!hasNumber) {
    errors.push("Password must contain at least one number (0-9).");
  }
  if (!hasSpecial) {
    errors.push("Password must contain at least one special character (!@#$%^&*...).");
  }
  if (!noConsecutiveAscendingDigits) {
    errors.push("Password must not contain three or more consecutive ascending digits (e.g. 123, 234).");
  }
  if (!noIdentityComponents) {
    errors.push("Password must not contain components derived from your name or email address.");
  }

  return {
    valid: errors.length === 0,
    errors,
    rules: {
      minLength,
      hasUppercase,
      hasLowercase,
      hasNumber,
      hasSpecial,
      noConsecutiveAscendingDigits,
      noIdentityComponents,
    },
  };
}

/**
 * Transforms password validation results into an array of checklist states for live UI feedback.
 *
 * Used by `<AdminProfileView />` to render real-time color-coded indicators
 * (green check, gray neutral, red violation) as the administrator types.
 *
 * @param password - The current password input value.
 * @param identity - The administrator identity context for name/email checking.
 * @returns Array of `PasswordRuleState` objects corresponding to each rule.
 */
export function getPasswordRuleChecklist(
  password: string,
  identity?: UserIdentityContext
): PasswordRuleState[] {
  const result = validateAdminPassword(password, identity);

  return [
    {
      id: "minLength",
      label: "At least 8 characters",
      satisfied: result.rules.minLength,
    },
    {
      id: "hasUppercase",
      label: "At least one uppercase letter (A-Z)",
      satisfied: result.rules.hasUppercase,
    },
    {
      id: "hasLowercase",
      label: "At least one lowercase letter (a-z)",
      satisfied: result.rules.hasLowercase,
    },
    {
      id: "hasNumber",
      label: "At least one number (0-9)",
      satisfied: result.rules.hasNumber,
    },
    {
      id: "hasSpecial",
      label: "At least one special character (!@#$%^&*)",
      satisfied: result.rules.hasSpecial,
    },
    {
      id: "noConsecutiveAscendingDigits",
      label: "No consecutive ascending digits (e.g. 123, 456)",
      satisfied: result.rules.noConsecutiveAscendingDigits,
      isViolation: !result.rules.noConsecutiveAscendingDigits && /[0-9]{3,}/.test(password),
    },
    {
      id: "noIdentityComponents",
      label: "No name or email parts",
      satisfied: result.rules.noIdentityComponents,
      isViolation: !result.rules.noIdentityComponents && password.length >= 3,
    },
  ];
}

/**
 * Generates a cryptographically secure random password strictly satisfying all 7 security rules.
 *
 * Entropy and Security Guarantees:
 * - Uses Web Crypto API (`crypto.getRandomValues`) for cryptographically secure pseudo-randomness
 *   (never `Math.random`).
 * - Length: 15 characters (well in excess of the 8-character minimum).
 * - Excludes visually ambiguous characters (e.g. 'I', 'O', 'l', '0', '1') to prevent transcription errors.
 * - Guaranteed distribution: Explicitly seeds at least 2 uppercase letters, 2 lowercase letters,
 *   2 numbers, and 2 special symbols before filling remaining positions.
 * - Permutation: Uses the Fisher-Yates shuffle with cryptographic random indices.
 * - Verification: Every candidate password is validated against `validateAdminPassword(candidate, identity)`.
 *   If any rule fails (or if accidental consecutive digits occur), the loop retries up to 50 times.
 *
 * @param identity - Optional identity context to ensure generated password does not conflict with name/email.
 * @returns A cryptographically secure 15-character password string.
 * @throws {Error} If unable to satisfy all constraints after 50 generation attempts.
 */
export function generateSecureAdminPassword(identity?: UserIdentityContext): string {
  const UPPER = "ABCDEFGHJKLMNPQRSTUVWXYZ"; // exclude easily confused I, O
  const LOWER = "abcdefghijkmnopqrstuvwxyz"; // exclude easily confused l
  const NUMBERS = "23456789"; // exclude 0, 1 for clarity and to prevent trivial sequences
  const SPECIALS = "!@#$%^&*-_=+";

  const ALL_CHARS = UPPER + LOWER + NUMBERS + SPECIALS;

  // Helper to pick random index using crypto
  const getRandomIndex = (max: number): number => {
    const array = new Uint32Array(1);
    crypto.getRandomValues(array);
    return array[0] % max;
  };

  const MAX_ATTEMPTS = 50;

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const length = 15; // 15 characters provides strong entropy well above 8 minimum
    const chars: string[] = [];

    // Guarantee minimums
    chars.push(UPPER[getRandomIndex(UPPER.length)]);
    chars.push(UPPER[getRandomIndex(UPPER.length)]);
    chars.push(LOWER[getRandomIndex(LOWER.length)]);
    chars.push(LOWER[getRandomIndex(LOWER.length)]);
    chars.push(NUMBERS[getRandomIndex(NUMBERS.length)]);
    chars.push(NUMBERS[getRandomIndex(NUMBERS.length)]);
    chars.push(SPECIALS[getRandomIndex(SPECIALS.length)]);
    chars.push(SPECIALS[getRandomIndex(SPECIALS.length)]);

    // Fill remaining positions
    while (chars.length < length) {
      chars.push(ALL_CHARS[getRandomIndex(ALL_CHARS.length)]);
    }

    // Fisher-Yates shuffle using cryptographically secure values
    for (let i = chars.length - 1; i > 0; i--) {
      const j = getRandomIndex(i + 1);
      const temp = chars[i];
      chars[i] = chars[j];
      chars[j] = temp;
    }

    const candidate = chars.join("");

    // Validate that candidate satisfies every single condition
    const validation = validateAdminPassword(candidate, identity);
    if (validation.valid) {
      return candidate;
    }
  }

  throw new Error("Unable to generate a secure password satisfying all constraints. Please try again.");
}

/**
 * Formats a clean, confidential credential sharing message for copy to clipboard.
 *
 * Includes administrator name, login email, temporary password, and a clear security notice
 * warning that credentials must only be transmitted via private, encrypted communication channels.
 *
 * @param adminName - The display name of the new administrator.
 * @param adminEmail - The login email address for the account.
 * @param temporaryPassword - The generated temporary password.
 * @returns A formatted multi-line plain text message suitable for clipboard copy.
 */
export function formatCredentialSharingMessage(
  adminName: string,
  adminEmail: string,
  temporaryPassword: string
): string {
  return [
    `E-Wakku Administrator Account`,
    ``,
    `Your administrator account has been created successfully.`,
    ``,
    `Login email: ${adminEmail}`,
    `Temporary password: ${temporaryPassword}`,
    ``,
    `Security Notice: These credentials are confidential. Share this message only with the intended administrator through a private communication channel. Do not share it publicly or forward it to anyone else.`,
  ].join("\n");
}
